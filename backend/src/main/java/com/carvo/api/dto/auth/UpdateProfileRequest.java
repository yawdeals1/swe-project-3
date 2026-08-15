package com.carvo.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(@NotBlank(message = "Name is required") String name, String phone) {
}
