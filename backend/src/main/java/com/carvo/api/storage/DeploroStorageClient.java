package com.carvo.api.storage;

import com.carvo.api.exception.BadRequestException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Uploads vehicle photos to the project's Deploro R2 bucket instead of a Postgres {@code bytea}
 * column. Storage is the platform default for uploaded files; keeping bytes in the database bloated
 * {@code vehicle_image} to ~22MB, kept the files invisible to Deploro's Storage tab, and made every
 * image render a round trip through this API rather than a cached CDN fetch.
 *
 * <p>Upload and delete both require a <strong>project-admin</strong> token (list and download accept
 * any project member), so this reuses the same project-scoped PAT as {@code DeploroAuthClient} —
 * {@code DEPLORO_ADMIN_API_TOKEN}. Unlike that client's best-effort account cleanup, an upload
 * failure here is deliberately not swallowed: if the object never reaches R2 there is nothing to
 * serve, so the caller's transaction must roll back rather than commit a row pointing at a key that
 * was never written.
 */
@Component
public class DeploroStorageClient {

    private static final String SLUG = "carvo";

    /** Deploro's documented per-file ceiling. The servlet's own 8MB multipart limit trips first. */
    private static final long MAX_FILE_BYTES = 100L * 1024 * 1024;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;
    private final String apiBaseUrl;
    private final String projectId;
    private final String adminApiToken;

    public DeploroStorageClient(
            ObjectMapper objectMapper,
            @Value("${carvo.deploro.api-base-url}") String apiBaseUrl,
            @Value("${carvo.deploro.project-id}") String projectId,
            @Value("${carvo.deploro.admin-api-token:}") String adminApiToken) {
        this.objectMapper = objectMapper;
        this.apiBaseUrl = stripTrailingSlash(apiBaseUrl);
        this.projectId = projectId;
        this.adminApiToken = adminApiToken;
    }

    /** False when no admin token is configured, in which case an upload could only ever 401. */
    public boolean isConfigured() {
        return adminApiToken != null && !adminApiToken.isBlank();
    }

    public record StoredFile(String key, String fullKey, String publicUrl, String contentType) {
    }

    /**
     * Uploads {@code bytes} under {@code key} and reports where it now lives. The multipart
     * filename is what Deploro turns into the storage key, and it may contain slashes — that is how
     * the existing {@code vehicle-images/<vehicle_id>/<image_id>.<ext>} layout is preserved.
     *
     * @throws BadRequestException when the file is too large, or Deploro refuses it — it sniffs the
     *     leading bytes and rejects anything resembling HTML, SVG, or script
     */
    public StoredFile upload(String key, byte[] bytes, String contentType) {
        if (!isConfigured()) {
            throw new IllegalStateException(
                    "DEPLORO_ADMIN_API_TOKEN is not configured - vehicle photos cannot be uploaded to storage.");
        }
        if (bytes.length > MAX_FILE_BYTES) {
            throw new BadRequestException("Photos must be smaller than 100MB.");
        }

        String boundary = "----carvo" + UUID.randomUUID().toString().replace("-", "");
        byte[] body = multipartBody(boundary, key, bytes, contentType);

        HttpRequest request = HttpRequest
                .newBuilder(URI.create(apiBaseUrl + "/api/projects/" + projectId + "/storage/upload"))
                .header("Authorization", "Bearer " + adminApiToken)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();

        HttpResponse<String> response = execute(request);
        int status = response.statusCode();
        if (status == 400) {
            throw new BadRequestException("That file was rejected by storage. Upload a real JPEG, PNG, WEBP, or GIF.");
        }
        if (status == 401 || status == 403) {
            throw new IllegalStateException(
                    "Deploro rejected the storage upload (" + status + ") - DEPLORO_ADMIN_API_TOKEN must be a "
                            + "project-admin token; member-scoped tokens can list and download but not upload.");
        }
        if (status != 200 && status != 201) {
            throw new IllegalStateException("Deploro storage upload failed with HTTP " + status);
        }

        JsonNode json = parse(response.body());
        // fullKey already carries the project slug ("carvo/vehicle-images/..."), which is exactly
        // the path the public /files/ route expects, so the URL is derived from the response rather
        // than re-assembled from the slug and key by hand.
        String fullKey = json.path("fullKey").asText(SLUG + "/" + key);
        return new StoredFile(
                json.path("key").asText(key),
                fullKey,
                publicUrl(fullKey),
                json.path("contentType").asText(contentType));
    }

    /**
     * Best-effort removal of a previously uploaded object. Deleting the database row is what
     * actually takes a photo out of the app and a storage hiccup must not block that — but the
     * object stays publicly readable by key, so orphaning it is not the harmless outcome it was back
     * when the bytes lived in a column that got deleted along with the row.
     */
    public void deleteQuietly(String publicUrl) {
        if (!isConfigured() || publicUrl == null) {
            return;
        }
        String prefix = publicUrl(SLUG + "/");
        if (!publicUrl.startsWith(prefix)) {
            // A legacy external URL from before uploads existed - not ours to delete.
            return;
        }
        String key = publicUrl.substring(prefix.length());
        try {
            HttpRequest request = HttpRequest
                    .newBuilder(URI.create(apiBaseUrl + "/api/projects/" + projectId + "/storage?key="
                            + URLEncoder.encode(key, StandardCharsets.UTF_8)))
                    .header("Authorization", "Bearer " + adminApiToken)
                    .DELETE()
                    .build();
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            // Best-effort - the row is going away regardless.
        }
    }

    /** The unauthenticated, inline-serving read path: {@code {api}/files/{slug}/{key}}. */
    public String publicUrl(String fullKey) {
        return apiBaseUrl + "/files/" + fullKey;
    }

    private static byte[] multipartBody(String boundary, String filename, byte[] bytes, String contentType) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            out.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
            out.write(("Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n")
                    .getBytes(StandardCharsets.UTF_8));
            out.write(("Content-Type: " + contentType + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
            out.write(bytes);
            out.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to assemble the storage upload body", e);
        }
        return out.toByteArray();
    }

    private HttpResponse<String> execute(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("Failed to reach Deploro storage", e);
        }
    }

    private JsonNode parse(String body) {
        try {
            return objectMapper.readTree(body);
        } catch (JacksonException e) {
            throw new IllegalStateException("Deploro storage response was not valid JSON", e);
        }
    }

    private static String stripTrailingSlash(String url) {
        return url != null && url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
