package com.carvo.api.dto.auth;

import com.carvo.api.dto.common.UserSummary;

public record AuthResponse(String token, UserSummary user) {
}
