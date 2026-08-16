package com.carvo.api.service;

import com.carvo.api.dto.auth.AuthResponse;
import com.carvo.api.dto.auth.LoginRequest;
import com.carvo.api.dto.auth.RegisterRequest;
import com.carvo.api.dto.common.UserSummary;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.UserStatus;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.security.DeploroAuthClient;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DeploroAuthClient deploroAuthClient;

    public AuthService(UserRepository userRepository, DeploroAuthClient deploroAuthClient) {
        this.userRepository = userRepository;
        this.deploroAuthClient = deploroAuthClient;
    }

    /**
     * Self-registration always produces a CUSTOMER — this is the only path that can create a
     * brand-new local user from a self-serve signup, which is what keeps FR-1.1 true under
     * Deploro Auth-as-a-Service (Staff/Admin only ever come from AdminService.createStaff or the
     * seeded bootstrap admin). The local row is created now, before Deploro's confirmation-link
     * gate is cleared, so name/phone aren't lost while the identity is pending — login() links it
     * to the Deploro account by email on first sign-in.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists.");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setRole(Role.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        deploroAuthClient.signup(request.email(), request.password(), request.name());
        return AuthResponse.pendingVerification();
    }

    public AuthResponse login(LoginRequest request) {
        DeploroAuthClient.LoginResult result = deploroAuthClient.login(request.email(), request.password());

        User user = userRepository.findByDeploroAccountId(result.accountId())
                .or(() -> userRepository.findByEmail(result.email()))
                .orElseGet(() -> {
                    User created = new User();
                    created.setName(result.name() != null ? result.name() : result.email());
                    created.setEmail(result.email());
                    created.setRole(Role.CUSTOMER);
                    created.setStatus(UserStatus.ACTIVE);
                    return created;
                });
        if (!result.accountId().equals(user.getDeploroAccountId())) {
            user.setDeploroAccountId(result.accountId());
        }
        user = userRepository.save(user);

        return AuthResponse.authenticated(result.token(), UserSummary.from(user));
    }

    /** No-op if there's no bearer token to invalidate — logout is idempotent either way. */
    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            deploroAuthClient.logout(bearerToken.substring(7));
        }
    }
}
