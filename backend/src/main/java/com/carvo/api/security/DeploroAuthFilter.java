package com.carvo.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Replaces the old JwtAuthFilter: instead of verifying a locally-signed JWT, every protected
 * request's bearer token is validated against Deploro's own GET /auth/carvo/session endpoint —
 * that live check is the actual security boundary now (Deploro never hands out a verifiable
 * signature we could check locally, only opaque session tokens). The Deploro account id it
 * returns is then matched to a local app_user row to resolve Carvo's own role.
 */
@Component
public class DeploroAuthFilter extends OncePerRequestFilter {

    private final DeploroAuthClient deploroAuthClient;
    private final UserDetailsServiceImpl userDetailsService;

    public DeploroAuthFilter(DeploroAuthClient deploroAuthClient, UserDetailsServiceImpl userDetailsService) {
        this.deploroAuthClient = deploroAuthClient;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            Optional<DeploroAuthClient.SessionUser> sessionUser = deploroAuthClient.validateSession(token);
            if (sessionUser.isPresent() && SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(sessionUser.get().accountId());
                    // Deploro's session check has no notion of Carvo's own account status, so a
                    // suspended/deleted customer's still-valid Deploro token would otherwise keep
                    // authenticating here forever — this is the actual enforcement point for
                    // AdminService.suspendCustomer/deleteCustomer (FR-4.4), since nothing routes
                    // this manually-built token through an AuthenticationManager that would
                    // otherwise check isEnabled()/isAccountNonLocked() for us.
                    if (userDetails.isEnabled() && userDetails.isAccountNonLocked()) {
                        var authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } catch (UsernameNotFoundException e) {
                    // Valid Deploro session, but no local app_user linked to it yet (e.g. session
                    // predates login()'s backfill) — leave the request unauthenticated rather than
                    // failing the whole chain; protected endpoints reject it downstream as usual.
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
