package com.carvo.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carvo.api.dto.auth.AuthResponse;
import com.carvo.api.dto.auth.LoginRequest;
import com.carvo.api.dto.auth.RegisterRequest;
import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.UserStatus;
import com.carvo.api.exception.ConflictException;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.security.DeploroAuthClient;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DeploroAuthClient deploroAuthClient;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, deploroAuthClient);
    }

    @Test
    void register_newEmail_createsLocalCustomerAndReturnsPending() {
        RegisterRequest request = new RegisterRequest("Ama Owusu", "ama@example.com", "0555", "password123");
        when(userRepository.existsByEmail("ama@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.status()).isEqualTo("PENDING_VERIFICATION");
        assertThat(response.token()).isNull();
        assertThat(response.user()).isNull();

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertThat(savedUser.getValue().getRole()).isEqualTo(Role.CUSTOMER);
        assertThat(savedUser.getValue().getEmail()).isEqualTo("ama@example.com");
        verify(deploroAuthClient).signup("ama@example.com", "password123", "Ama Owusu");
    }

    @Test
    void register_existingEmail_throwsAndNeverCallsDeploro() {
        RegisterRequest request = new RegisterRequest("Ama Owusu", "ama@example.com", "0555", "password123");
        when(userRepository.existsByEmail("ama@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request)).isInstanceOf(ConflictException.class);

        verify(deploroAuthClient, never()).signup(any(), any(), any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_unknownAccount_createsNewCustomerLinkedToDeploro() {
        LoginRequest request = new LoginRequest("new@example.com", "password123");
        when(deploroAuthClient.login("new@example.com", "password123"))
                .thenReturn(new DeploroAuthClient.LoginResult("deploro-acct-1", "deploro-acct-1", "new@example.com", "New Person"));
        when(userRepository.findByDeploroAccountId("deploro-acct-1")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.login(request);

        assertThat(response.status()).isEqualTo("AUTHENTICATED");
        assertThat(response.token()).isEqualTo("deploro-acct-1");
        assertThat(response.user().role()).isEqualTo("CUSTOMER");

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertThat(savedUser.getValue().getDeploroAccountId()).isEqualTo("deploro-acct-1");
    }

    @Test
    void login_matchesExistingUserByDeploroAccountId_withoutCreatingDuplicate() {
        LoginRequest request = new LoginRequest("staff@example.com", "password123");
        User existing = existingUser("staff@example.com", Role.STAFF, "deploro-acct-7");
        when(deploroAuthClient.login("staff@example.com", "password123"))
                .thenReturn(new DeploroAuthClient.LoginResult("deploro-acct-7", "deploro-acct-7", "staff@example.com", "Staff Person"));
        when(userRepository.findByDeploroAccountId("deploro-acct-7")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.login(request);

        assertThat(response.user().role()).isEqualTo("STAFF");
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void login_backfillsDeploroAccountIdForAdminCreatedUser() {
        LoginRequest request = new LoginRequest("staff@example.com", "password123");
        User existing = existingUser("staff@example.com", Role.STAFF, null);
        when(deploroAuthClient.login("staff@example.com", "password123"))
                .thenReturn(new DeploroAuthClient.LoginResult("deploro-acct-9", "deploro-acct-9", "staff@example.com", "Staff Person"));
        when(userRepository.findByDeploroAccountId("deploro-acct-9")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("staff@example.com")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.login(request);

        ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(savedUser.capture());
        assertThat(savedUser.getValue().getDeploroAccountId()).isEqualTo("deploro-acct-9");
        assertThat(response.user().role()).isEqualTo("STAFF");
    }

    private User existingUser(String email, Role role, String deploroAccountId) {
        User user = new User();
        user.setEmail(email);
        user.setName("Existing");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setDeploroAccountId(deploroAccountId);
        return user;
    }
}
