package com.carvo.api.dto.vehicle;

import jakarta.validation.constraints.NotBlank;

public record VehicleStatusUpdateRequest(@NotBlank(message = "Status is required") String status) {
}
