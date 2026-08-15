package com.carvo.api.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record BranchRequest(@NotBlank(message = "Name is required") String name, String address, String phone) {
}
