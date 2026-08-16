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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        saveImages(vehicle, request.imageUrls());
        return toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse update(Long id, VehicleRequest request) {
        Vehicle vehicle = findEntity(id);
        applyRequest(vehicle, request);
        vehicle = vehicleRepository.save(vehicle);
        vehicleImageRepository.findByVehicleId(id).forEach(vehicleImageRepository::delete);
        saveImages(vehicle, request.imageUrls());
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

    private void saveImages(Vehicle vehicle, List<String> imageUrls) {
        if (imageUrls == null) {
            return;
        }
        for (String url : imageUrls) {
            VehicleImage image = new VehicleImage();
            image.setVehicle(vehicle);
            image.setImageUrl(url);
            vehicleImageRepository.save(image);
        }
    }

    private Vehicle findEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found"));
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        List<String> imageUrls = vehicleImageRepository.findByVehicleId(vehicle.getId()).stream()
                .map(VehicleImage::getImageUrl)
                .toList();
        return VehicleResponse.from(vehicle, imageUrls);
    }
}
