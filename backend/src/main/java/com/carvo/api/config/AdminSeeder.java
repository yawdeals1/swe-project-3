package com.carvo.api.config;

import com.carvo.api.entity.User;
import com.carvo.api.entity.enums.Role;
import com.carvo.api.entity.enums.UserStatus;
import com.carvo.api.repository.UserRepository;
import com.carvo.api.security.DeploroAuthClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Bootstraps the very first Admin account on startup, since FR-1.7 blocks Staff/Admin accounts
 * from being created any other way (no self-registration, and creating one normally requires an
 * existing Admin). A no-op once at least one Admin exists.
 *
 * Under Deploro Auth-as-a-Service, this seeded Admin is NOT immediately usable: every new Deploro
 * identity (this one included) is gated behind a confirmation-link email with no bypass, even for
 * admin-created accounts. ADMIN_SEED_EMAIL must therefore be a real, reachable inbox — the old
 * admin@carvo.local default can never receive that email, which would silently produce an Admin
 * that can never sign in. There is no dev-only fallback that avoids this; it's an inherent
 * consequence of the switch away from local BCrypt auth.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);
    private static final String UNDELIVERABLE_DEFAULT_EMAIL = "admin@carvo.local";

    private final UserRepository userRepository;
    private final DeploroAuthClient deploroAuthClient;
    private final String seedEmail;
    private final String seedPassword;

    public AdminSeeder(
            UserRepository userRepository,
            DeploroAuthClient deploroAuthClient,
            @Value("${carvo.admin.seed-email:" + UNDELIVERABLE_DEFAULT_EMAIL + "}") String seedEmail,
            @Value("${carvo.admin.seed-password:#{null}}") String seedPassword) {
        this.userRepository = userRepository;
        this.deploroAuthClient = deploroAuthClient;
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
        if (UNDELIVERABLE_DEFAULT_EMAIL.equalsIgnoreCase(seedEmail)) {
            log.warn(
                    "ADMIN_SEED_EMAIL is unset and defaulting to {}, which cannot receive real email. "
                            + "Deploro Auth-as-a-Service requires clicking a confirmation link before ANY "
                            + "identity — including this seeded Admin — can sign in. This account will be "
                            + "created but permanently unable to log in until you set ADMIN_SEED_EMAIL to a "
                            + "real inbox you control and re-run with a fresh database (or register a "
                            + "different Admin by hand).",
                    UNDELIVERABLE_DEFAULT_EMAIL);
        } else {
            log.warn(
                    "Seeding initial Admin {} — a confirmation email from Deploro Auth must be clicked "
                            + "before this account can sign in for the first time.",
                    seedEmail);
        }
        User admin = new User();
        admin.setName("Carvo Admin");
        admin.setEmail(seedEmail);
        admin.setRole(Role.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        userRepository.save(admin);
        deploroAuthClient.signup(seedEmail, password, "Carvo Admin");
        log.info("Seeded initial Admin account: {}", seedEmail);
    }
}
