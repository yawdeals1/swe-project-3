package com.carvo.api.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record UpdateStaffRequest(@NotBlank(message = "Name is required") String name, String phone, Long branchId) {
}
