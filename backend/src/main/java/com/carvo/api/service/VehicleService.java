package com.carvo.api.service;

import com.carvo.api.dto.vehicle.VehicleRequest;
import com.carvo.api.dto.vehicle.VehicleResponse;
import com.carvo.api.entity.Branch;
import com.carvo.api.entity.Vehicle;
import com.carvo.api.entity.VehicleImage;
import com.carvo.api.entity.enums.VehicleStatus;
import com.carvo.api.exception.BadRequestException;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.BranchRepository;
import com.carvo.api.repository.VehicleImageRepository;
import com.carvo.api.repository.VehicleRepository;
import com.carvo.api.storage.DeploroStorageClient;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleImageRepository vehicleImageRepository;
    private final BranchRepository branchRepository;
    private final DeploroStorageClient storageClient;

    public VehicleService(
            VehicleRepository vehicleRepository,
            VehicleImageRepository vehicleImageRepository,
            BranchRepository branchRepository,
            DeploroStorageClient storageClient) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleImageRepository = vehicleImageRepository;
        this.branchRepository = branchRepository;
        this.storageClient = storageClient;
    }

    public List<VehicleResponse> search(String category, BigDecimal minPrice, BigDecimal maxPrice,
            LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate == null) {
            endDate = startDate;
        } else if (startDate == null && endDate != null) {
            startDate = endDate;
        }
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("End date must not be before start date.");
        }
        List<Vehicle> vehicles = startDate == null
                ? vehicleRepository.searchWithoutDateRange(category, minPrice, maxPrice)
                : vehicleRepository.searchWithDateRange(category, minPrice, maxPrice, startDate, endDate);
        return vehicles.stream()
                .map(v -> toResponse(v))
                .toList();
    }

    public List<VehicleResponse> findAll() {
        return vehicleRepository.findAll().stream().map(this::toResponse).toList();
    }

    public VehicleResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public VehicleResponse create(VehicleRequest request) {
        if (vehicleRepository.existsByPlateNumber(request.plateNumber())) {
            throw new ConflictException("A vehicle with this plate number already exists.");
        }
        Vehicle vehicle = new Vehicle();
        applyRequest(vehicle, request);
        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse update(Long id, VehicleRequest request) {
        Vehicle vehicle = findEntity(id);
        applyRequest(vehicle, request);
        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    public void delete(Long id) {
        Vehicle vehicle = findEntity(id);
        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public VehicleResponse updateStatus(Long id, String status) {
        Vehicle vehicle = findEntity(id);
        vehicle.setStatus(parseStatus(status));
        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    private void applyRequest(Vehicle vehicle, VehicleRequest request) {
        vehicle.setMake(request.make());
        vehicle.setModel(request.model());
        vehicle.setYear(request.year());
        vehicle.setCategory(request.category());
        vehicle.setPlateNumber(request.plateNumber());
        vehicle.setDailyRate(request.dailyRate());
        if (request.branchId() != null) {
            Branch branch = branchRepository.findById(request.branchId())
                    .orElseThrow(() -> new NotFoundException("Branch not found"));
            vehicle.setBranch(branch);
        } else {
            vehicle.setBranch(null);
        }
        if (request.status() != null && !request.status().isBlank()) {
            vehicle.setStatus(parseStatus(request.status()));
        }
    }

    private static VehicleStatus parseStatus(String status) {
        try {
            return VehicleStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid vehicle status: " + status);
        }
    }

    @Transactional
    public VehicleResponse addImage(Long vehicleId, MultipartFile file) {
        Vehicle vehicle = findEntity(vehicleId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No image file was provided.");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read the uploaded image.", e);
        }
        // The client-declared Content-Type header is attacker-controlled (any file can claim to
        // be "image/png"); the stored/served type must instead be derived from the file's own
        // magic bytes, not trusted from the request.
        String contentType = sniffImageContentType(bytes);
        if (contentType == null) {
            throw new BadRequestException("Photos must be JPEG, PNG, WEBP, or GIF.");
        }

        // The row is saved first purely to get its generated id, which is part of the storage key
        // (vehicle-images/<vehicle_id>/<image_id>.<ext>) — the same layout the existing 46 objects
        // use. saveAndFlush forces the INSERT now rather than at commit, so the id is available for
        // the upload that follows. Nothing is ever written to image_data: that column exists only
        // to hold the pre-migration blobs until a later change drops it.
        VehicleImage image = new VehicleImage();
        image.setVehicle(vehicle);
        image.setContentType(contentType);
        image = vehicleImageRepository.saveAndFlush(image);

        // An upload failure propagates and rolls the transaction back, taking the row above with
        // it — better than committing a photo record whose bytes were never stored anywhere.
        String key = "vehicle-images/" + vehicle.getId() + "/" + image.getId() + extensionFor(contentType);
        DeploroStorageClient.StoredFile stored = storageClient.upload(key, bytes, contentType);

        image.setImageUrl(stored.publicUrl());
        vehicleImageRepository.save(image);
        return toResponse(vehicle);
    }

    /**
     * The file extension for a stored image. Deliberately an explicit mapping rather than the
     * content type's own suffix: the pre-migration rows stored {@code image/jpeg} as ".jpg", so
     * deriving ".jpeg" from the subtype would put new JPEGs on a different convention than the
     * backfilled ones and break the one existing row if it were ever re-derived.
     */
    private static String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/gif" -> ".gif";
            case "image/webp" -> ".webp";
            default -> throw new BadRequestException("Photos must be JPEG, PNG, WEBP, or GIF.");
        };
    }

    @Transactional
    public VehicleResponse deleteImage(Long vehicleId, Long imageId) {
        Vehicle vehicle = findEntity(vehicleId);
        VehicleImage image = vehicleImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Image not found"));
        if (!image.getVehicle().getId().equals(vehicleId)) {
            throw new NotFoundException("Image not found");
        }
        String storedUrl = image.getImageUrl();
        vehicleImageRepository.delete(image);
        // Deleting the row used to delete the bytes with it. Now that they live in R2 — publicly
        // readable by anyone holding the key — the object has to be removed too, or a photo an
        // admin took down stays reachable forever. Best-effort: a storage hiccup must not fail the
        // delete the admin actually asked for.
        storageClient.deleteQuietly(storedUrl);
        return toResponse(vehicle);
    }

    public VehicleImage getImage(Long imageId) {
        return vehicleImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Image not found"));
    }

    /** Identifies an image's real type from its magic bytes rather than trusting the client's
     *  declared Content-Type header. Returns {@code null} if the bytes don't match a supported
     *  signature. JDK's own {@code URLConnection.guessContentTypeFromStream} isn't relied on here
     *  since its WEBP detection is inconsistent across versions. */
    private static String sniffImageContentType(byte[] bytes) {
        if (startsWith(bytes, 0xFF, 0xD8, 0xFF)) {
            return "image/jpeg";
        }
        if (startsWith(bytes, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return "image/png";
        }
        if (startsWith(bytes, 'G', 'I', 'F', '8')) {
            return "image/gif";
        }
        if (bytes.length >= 12
                && startsWith(bytes, 'R', 'I', 'F', 'F')
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') {
            return "image/webp";
        }
        return null;
    }

    private static boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((bytes[i] & 0xFF) != (signature[i] & 0xFF)) {
                return false;
            }
        }
        return true;
    }

    private Vehicle findEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        List<String> imageUrls = vehicleImageRepository.findByVehicleId(vehicle.getId()).stream()
                .map(VehicleService::imageUrl)
                .filter(Objects::nonNull)
                .toList();
        return VehicleResponse.from(vehicle, imageUrls);
    }

    /** Images are served straight from Deploro's R2 bucket: {@code image_url} holds an absolute,
     *  unauthenticated, inline-serving URL that the browser fetches directly, so the photo comes off
     *  a CDN with a cache lifetime instead of streaming through this API on every render.
     *
     *  <p>The blob fallback below is the rollback path, not a live code path — every row was
     *  backfilled with a URL in V5, and new uploads set one at insert time. It stays until the
     *  follow-up migration drops {@code image_data}, so that a key discovered to be wrong can be
     *  served from Postgres again by reverting this method alone. */
    private static String imageUrl(VehicleImage image) {
        String url = image.getImageUrl();
        if (url != null && !url.isBlank()) {
            return url;
        }
        return image.getImageData() != null ? "/api/vehicle-images/" + image.getId() : null;
    }
}
