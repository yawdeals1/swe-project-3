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
import java.io.IOException;
import java.io.UncheckedIOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleImageRepository vehicleImageRepository;
    private final BranchRepository branchRepository;

    public VehicleService(
            VehicleRepository vehicleRepository,
            VehicleImageRepository vehicleImageRepository,
            BranchRepository branchRepository) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleImageRepository = vehicleImageRepository;
        this.branchRepository = branchRepository;
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
        VehicleImage image = new VehicleImage();
        image.setVehicle(vehicle);
        image.setContentType(contentType);
        image.setImageData(bytes);
        vehicleImageRepository.save(image);
        return toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse deleteImage(Long vehicleId, Long imageId) {
        Vehicle vehicle = findEntity(vehicleId);
        VehicleImage image = vehicleImageRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Image not found"));
        if (!image.getVehicle().getId().equals(vehicleId)) {
            throw new NotFoundException("Image not found");
        }
        vehicleImageRepository.delete(image);
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
                .toList();
        return VehicleResponse.from(vehicle, imageUrls);
    }

    /** Uploaded images are served through the frontend's `/api/vehicle-images/{id}` proxy route
     *  (the backend has no public route of its own in production); rows from before the upload
     *  feature existed still carry their original external {@code image_url} and are passed
     *  through as-is. */
    private static String imageUrl(VehicleImage image) {
        if (image.getImageData() != null) {
            return "/api/vehicle-images/" + image.getId();
        }
        return image.getImageUrl();
    }
}
