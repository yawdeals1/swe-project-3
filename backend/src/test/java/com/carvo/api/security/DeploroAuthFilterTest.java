package com.carvo.api.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.UserStatus;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class DeploroAuthFilterTest {

    @Mock
    private DeploroAuthClient deploroAuthClient;

    @Mock
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private DeploroAuthFilter filter;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private DeploroAuthFilter filter() {
        if (filter == null) {
            filter = new DeploroAuthFilter(deploroAuthClient, userDetailsService);
        }
        return filter;
    }

    @Test
    void noAuthorizationHeader_leavesRequestUnauthenticated() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter().doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
        verify(deploroAuthClient, org.mockito.Mockito.never()).validateSession(any());
    }

    @Test
    void unknownOrExpiredToken_leavesRequestUnauthenticated() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer bad-token");
        when(deploroAuthClient.validateSession("bad-token")).thenReturn(Optional.empty());

        filter().doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void validSessionWithNoLinkedLocalUser_leavesRequestUnauthenticated() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer good-token");
        when(deploroAuthClient.validateSession("good-token"))
                .thenReturn(Optional.of(new DeploroAuthClient.SessionUser("deploro-acct-1", "a@example.com")));
        when(userDetailsService.loadUserByUsername("deploro-acct-1"))
                .thenThrow(new UsernameNotFoundException("no local user"));

        filter().doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void validSessionWithLinkedLocalUser_authenticatesWithLocalRole() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer good-token");
        when(deploroAuthClient.validateSession("good-token"))
                .thenReturn(Optional.of(new DeploroAuthClient.SessionUser("deploro-acct-1", "a@example.com")));
        User user = new User();
        user.setEmail("a@example.com");
        user.setName("A Person");
        user.setRole(Role.STAFF);
        user.setStatus(UserStatus.ACTIVE);
        user.setDeploroAccountId("deploro-acct-1");
        when(userDetailsService.loadUserByUsername("deploro-acct-1")).thenReturn(new CarvoUserPrincipal(user));

        filter().doFilterInternal(request, response, filterChain);

        var auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getAuthorities()).extracting(Object::toString).containsExactly("ROLE_STAFF");
        verify(filterChain).doFilter(request, response);
    }
}
