package com.carvo.api.dto.auth;

import com.carvo.api.dto.common.UserSummary;

/**
 * status is "AUTHENTICATED" (token/user set) or "PENDING_VERIFICATION" (token/user null) —
 * registration under Deploro Auth-as-a-Service never signs the caller in immediately, since every
 * new identity is gated behind a confirmation-link email. Login always returns AUTHENTICATED or
 * throws.
 */
public record AuthResponse(String status, String token, UserSummary user) {

    public static AuthResponse authenticated(String token, UserSummary user) {
        return new AuthResponse("AUTHENTICATED", token, user);
    }

    public static AuthResponse pendingVerification() {
        return new AuthResponse("PENDING_VERIFICATION", null, null);
    }
}
