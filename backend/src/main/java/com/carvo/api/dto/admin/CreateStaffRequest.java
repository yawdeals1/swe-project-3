package com.carvo.api.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CreateStaffRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,
        @NotBlank(message = "Role is required") @Pattern(regexp = "STAFF|ADMIN", message = "Role must be STAFF or ADMIN")
                String role,
        Long branchId) {
}
