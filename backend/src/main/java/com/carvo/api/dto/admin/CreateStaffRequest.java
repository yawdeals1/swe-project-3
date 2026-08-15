package com.carvo.api.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateStaffRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Email is required") @Email(message = "Email must be valid") String email,
        String phone,
        @NotBlank(message = "Password is required")
                @Size(min = 8, message = "Password must be at least 8 characters")
                String password,
        @NotBlank(message = "Role is required") @Pattern(regexp = "STAFF|ADMIN", message = "Role must be STAFF or ADMIN")
                String role,
        Long branchId) {
}
