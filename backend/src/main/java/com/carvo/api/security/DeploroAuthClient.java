package com.carvo.api.security;

import com.carvo.api.exception.BadRequestException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Thin client for Deploro's Auth-as-a-Service endpoints (`/auth/carvo/*` on the Deploro worker).
 * These are public, unauthenticated endpoints — the project is resolved from the URL's slug, not
 * an API key — so this holds no credential of its own. Ground truth for the request/response
 * shapes below came from reading Deploro's own worker source (project-auth.ts), not the (partial)
 * public docs: signup/login never return the session token in the JSON body, only via Set-Cookie.
 */
@Component
public class DeploroAuthClient {

    private static final String SLUG = "carvo";
    private static final String SESSION_COOKIE_NAME = "gallium_project_session_" + SLUG;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public DeploroAuthClient(
            ObjectMapper objectMapper,
            @Value("${carvo.deploro.auth-base-url}") String baseUrl) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
    }

    /** Always a no-op success from the caller's point of view — Deploro's signup endpoint
     *  deliberately returns {@code {ok:true}} whether the email is new, pending, or already
     *  confirmed (anti-enumeration), and always emails a confirmation link before this identity
     *  can sign in. */
    public void signup(String email, String password, String name) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("email", email);
        body.put("password", password);
        if (name != null) {
            body.put("name", name);
        }
        send("POST", "/auth/" + SLUG + "/email-password/signup", body);
    }

    public record LoginResult(String token, String accountId, String email, String name) {
    }

    public LoginResult login(String email, String password) {
        HttpResponse<String> response =
                send("POST", "/auth/" + SLUG + "/email-password/login", Map.of("email", email, "password", password));
        int status = response.statusCode();
        if (status == 403) {
            throw new BadRequestException("Please confirm your email using the link we sent you before signing in.");
        }
        if (status == 429) {
            throw new BadRequestException("Too many attempts. Try again later.");
        }
        if (status != 200) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        String token = extractSessionToken(response)
                .orElseThrow(() -> new IllegalStateException("Deploro login succeeded but returned no session cookie"));
        JsonNode user = parse(response.body()).path("user");
        return new LoginResult(token, user.path("id").asText(), user.path("email").asText(), user.path("name").asText(null));
    }

    public record SessionUser(String accountId, String email) {
    }

    /** Empty on any non-200 (expired/unknown token) — callers treat that as unauthenticated. */
    public Optional<SessionUser> validateSession(String token) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/auth/" + SLUG + "/session"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();
        HttpResponse<String> response = execute(request);
        if (response.statusCode() != 200) {
            return Optional.empty();
        }
        JsonNode user = parse(response.body()).path("user");
        return Optional.of(new SessionUser(user.path("id").asText(), user.path("email").asText()));
    }

    /** Best-effort: invalidates the session token server-side (FR-1.4) so it can't be replayed
     *  after logout, but a failure here must never block the caller from completing logout
     *  locally — any non-200 or network error is swallowed rather than surfaced, since the
     *  client-side cookie clear proceeds either way. */
    public void logout(String token) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + "/auth/" + SLUG + "/logout"))
                .header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();
        try {
            execute(request);
        } catch (IllegalStateException e) {
            // Deploro unreachable — nothing more we can do; the token will simply expire on its
            // own, and the local session is being cleared regardless.
        }
    }

    private Optional<String> extractSessionToken(HttpResponse<String> response) {
        String prefix = SESSION_COOKIE_NAME + "=";
        return response.headers().allValues("set-cookie").stream()
                .filter(v -> v.startsWith(prefix))
                .findFirst()
                .map(v -> {
                    String rest = v.substring(prefix.length());
                    int semicolon = rest.indexOf(';');
                    return semicolon >= 0 ? rest.substring(0, semicolon) : rest;
                });
    }

    private HttpResponse<String> send(String method, String path, Map<String, Object> jsonBody) {
        String json;
        try {
            json = objectMapper.writeValueAsString(jsonBody);
        } catch (JacksonException e) {
            throw new IllegalStateException("Failed to serialize Deploro auth request body", e);
        }
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path))
                .header("Content-Type", "application/json")
                .method(method, HttpRequest.BodyPublishers.ofString(json))
                .build();
        return execute(request);
    }

    private HttpResponse<String> execute(HttpRequest request) {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("Failed to reach Deploro Auth-as-a-Service", e);
        }
    }

    private JsonNode parse(String body) {
        try {
            return objectMapper.readTree(body);
        } catch (JacksonException e) {
            throw new IllegalStateException("Deploro auth response was not valid JSON", e);
        }
    }
}
