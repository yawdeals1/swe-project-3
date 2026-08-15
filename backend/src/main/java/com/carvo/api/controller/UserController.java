package com.carvo.api.controller;

import com.carvo.api.dto.auth.UpdateProfileRequest;
import com.carvo.api.dto.common.UserSummary;
import com.carvo.api.entity.User;
import com.carvo.api.exception.NotFoundException;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.security.CarvoUserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public UserSummary me(@AuthenticationPrincipal CarvoUserPrincipal principal) {
        return UserSummary.from(principal.getUser());
    }

    @PutMapping("/me")
    public UserSummary updateMe(
            @AuthenticationPrincipal CarvoUserPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setName(request.name());
        user.setPhone(request.phone());
        return UserSummary.from(userRepository.save(user));
    }
}
