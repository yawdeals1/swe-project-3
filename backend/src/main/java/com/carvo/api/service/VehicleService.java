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
import java.util.Set;
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
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new BadRequestException("End date must not be before start date.");
        }
        return vehicleRepository.search(category, minPrice, maxPrice, startDate, endDate).stream()
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

    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    @Transactional
    public VehicleResponse addImage(Long vehicleId, MultipartFile file) {
        Vehicle vehicle = findEntity(vehicleId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No image file was provided.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new BadRequestException("Photos must be JPEG, PNG, WEBP, or GIF.");
        }
        VehicleImage image = new VehicleImage();
        image.setVehicle(vehicle);
        image.setContentType(contentType);
        try {
            image.setImageData(file.getBytes());
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read the uploaded image.", e);
        }
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
