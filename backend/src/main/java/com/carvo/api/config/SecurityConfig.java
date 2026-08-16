package com.carvo.api.config;

import com.carvo.api.security.DeploroAuthFilter;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final DeploroAuthFilter deploroAuthFilter;

    // The backend has no public route of its own in production (the "web" service is the sole
    // public origin, proxying to "backend" server-side over the internal docker network — see
    // docker-compose.yml) — but CORS must not rely on that as its only origin control, since a
    // local `mvn spring-boot:run` or a future deploy change could expose this port directly.
    // Comma-separated list so both local dev ports and the deployed {slug}.deploro.app origin
    // can be allowed at once.
    private final List<String> allowedOrigins;

    public SecurityConfig(
            DeploroAuthFilter deploroAuthFilter,
            @Value("${carvo.web.allowed-origins:http://localhost:3000}") String allowedOrigins) {
        this.deploroAuthFilter = deploroAuthFilter;
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/vehicles/**").permitAll()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/vehicles/*/status").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/staff/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers("/api/v1/bookings/**", "/api/v1/payments/**", "/api/v1/users/**")
                        .authenticated()
                        .anyRequest().authenticated())
                .addFilterBefore(deploroAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
