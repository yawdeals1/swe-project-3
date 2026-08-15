package com.carvo.api.config;

import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.UserStatus;
import com.carvo.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Bootstraps the very first Admin account on startup, since FR-1.7 blocks Staff/Admin accounts
 * from being created any other way (no self-registration, and creating one normally requires an
 * existing Admin). A no-op once at least one Admin exists.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String seedEmail;
    private final String seedPassword;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${carvo.admin.seed-email:admin@carvo.local}") String seedEmail,
            @Value("${carvo.admin.seed-password:#{null}}") String seedPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEmail = seedEmail;
        this.seedPassword = seedPassword;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.findByRole(Role.ADMIN).isEmpty()) {
            return;
        }
        String password = seedPassword;
        if (password == null || password.isBlank()) {
            password = "changeme123";
            log.warn(
                    "No ADMIN_SEED_PASSWORD set — seeding default Admin {} with a well-known dev-only "
                            + "password. Set ADMIN_SEED_PASSWORD before deploying anywhere real.",
                    seedEmail);
        }
        User admin = new User();
        admin.setName("Carvo Admin");
        admin.setEmail(seedEmail);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
        log.info("Seeded initial Admin account: {}", seedEmail);
    }
}
