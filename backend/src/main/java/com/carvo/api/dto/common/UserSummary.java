package com.carvo.api.dto.common;

import com.carvo.api.entity.User;

public record UserSummary(
        Long id,
        String name,
        String email,
        String phone,
        String role,
        String status,
        Long branchId) {

    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getBranch() != null ? user.getBranch().getId() : null);
    }
}
