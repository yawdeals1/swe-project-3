package com.carvo.api.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

/**
 * Deploro's VPS Postgres provisioning sets DATABASE_URL_INTERNAL / DATABASE_URL as
 * postgres://user:pass@host:port/db?params — a connection-string convention, not a JDBC URL.
 * Spring's datasource needs jdbc:postgresql://host:port/db and separate username/password. This
 * runs before the application context is created (no DI available here) and rewrites the three
 * spring.datasource.* properties from whichever of those two env vars is present, preferring the
 * internal one so the app never leaves the VPS's private network to reach its own database.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = environment.getProperty("DATABASE_URL_INTERNAL");
        if (raw == null || raw.isBlank()) {
            raw = environment.getProperty("DATABASE_URL");
        }
        if (raw == null || !(raw.startsWith("postgres://") || raw.startsWith("postgresql://"))) {
            return;
        }

        URI uri = URI.create(raw);
        String userInfo = uri.getUserInfo();
        String username = null;
        String password = null;
        if (userInfo != null) {
            String[] parts = userInfo.split(":", 2);
            username = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            password = parts.length > 1 ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8) : "";
        }
        String jdbcUrl = "jdbc:postgresql://" + uri.getHost() + ":" + uri.getPort() + uri.getPath()
                + (uri.getQuery() != null ? "?" + uri.getQuery() : "");

        Map<String, Object> props = new LinkedHashMap<>();
        props.put("spring.datasource.url", jdbcUrl);
        if (username != null) {
            props.put("spring.datasource.username", username);
            props.put("spring.datasource.password", password);
        }
        environment.getPropertySources().addFirst(new MapPropertySource("carvoDatabaseUrlTranslation", props));
    }
}
