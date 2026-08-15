package com.carvo.api.dto.vehicle;

import com.carvo.api.entity.Vehicle;
import java.math.BigDecimal;
import java.util.List;

public record VehicleResponse(
        Long id,
        String make,
        String model,
        Integer year,
        String category,
        String plateNumber,
        BigDecimal dailyRate,
        Long branchId,
        String status,
        List<String> imageUrls) {

    public static VehicleResponse from(Vehicle vehicle, List<String> imageUrls) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getYear(),
                vehicle.getCategory(),
                vehicle.getPlateNumber(),
                vehicle.getDailyRate(),
                vehicle.getBranch() != null ? vehicle.getBranch().getId() : null,
                vehicle.getStatus().name(),
                imageUrls);
    }
}
