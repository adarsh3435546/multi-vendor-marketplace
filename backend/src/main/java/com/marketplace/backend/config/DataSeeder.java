package com.marketplace.backend.config;

import com.marketplace.backend.entity.User;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@org.springframework.context.annotation.Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.seed.name:Marketplace Admin}")
    private String adminName;

    @Value("${admin.seed.email:admin@marketplace.com}")
    private String adminEmail;

    @Value("${admin.seed.password:admin123}")
    private String adminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(user -> user.getRole() == UserRole.ADMIN);

        if (!adminExists) {
            User admin = new User(
                    adminName,
                    adminEmail.toLowerCase(),
                    passwordEncoder.encode(adminPassword),
                    null,
                    UserRole.ADMIN
            );
            userRepository.save(admin);
        }
    }
}
