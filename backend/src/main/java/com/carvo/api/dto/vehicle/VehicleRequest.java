package com.carvo.api.dto.vehicle;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record VehicleRequest(
        @NotBlank(message = "Make is required") String make,
        @NotBlank(message = "Model is required") String model,
        @NotNull(message = "Year is required") Integer year,
        @NotBlank(message = "Category is required") String category,
        @NotBlank(message = "Plate number is required") String plateNumber,
        @NotNull(message = "Daily rate is required") @DecimalMin(value = "0", message = "Daily rate must be non-negative")
                BigDecimal dailyRate,
        Long branchId,
        List<String> imageUrls,
        String status) {
}
