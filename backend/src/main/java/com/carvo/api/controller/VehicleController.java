package com.carvo.api.controller;

import com.carvo.api.dto.vehicle.VehicleRequest;
import com.carvo.api.dto.vehicle.VehicleResponse;
import com.carvo.api.dto.vehicle.VehicleStatusUpdateRequest;
import com.carvo.api.entity.VehicleImage;
import com.carvo.api.service.VehicleService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<VehicleResponse> search(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return vehicleService.search(category, minPrice, maxPrice, startDate, endDate);
    }

    @GetMapping("/{id}")
    public VehicleResponse getById(@PathVariable Long id) {
        return vehicleService.getById(id);
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> create(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    public VehicleResponse update(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        return vehicleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public VehicleResponse updateStatus(@PathVariable Long id, @Valid @RequestBody VehicleStatusUpdateRequest request) {
        return vehicleService.updateStatus(id, request.status());
    }

    @PostMapping("/{id}/images")
    public VehicleResponse addImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return vehicleService.addImage(id, file);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public VehicleResponse deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        return vehicleService.deleteImage(id, imageId);
    }

    /**
     * Points callers at the image's real home in Deploro R2 rather than streaming it. Vehicle
     * photos are no longer served from this API — {@code imageUrls} in every vehicle response now
     * carries the absolute R2 URL, so the browser fetches it straight off the CDN and this route
     * only exists for links minted before that change (and for the blob fallback below).
     *
     * <p>Redirecting instead of proxying is the point: proxying the bytes would put every image
     * back on this server's bandwidth and throw away the hour of CDN caching the public URL gets
     * for free.
     */
    @GetMapping("/images/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) {
        VehicleImage image = vehicleService.getImage(imageId);
        String url = image.getImageUrl();
        if (url != null && !url.isBlank()) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, url)
                    // Short, unlike the immutable blob response below: the redirect target is a
                    // property of the row, so a corrected URL must be able to take effect.
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=300")
                    .build();
        }
        // Rollback path only — no row should reach this after V5's backfill. Kept until the
        // follow-up migration drops image_data.
        if (image.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = image.getContentType() != null
                ? MediaType.parseMediaType(image.getContentType())
                : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                .body(image.getImageData());
    }
}
