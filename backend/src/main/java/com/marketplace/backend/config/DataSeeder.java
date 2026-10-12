package com.marketplace.backend.config;

import com.marketplace.backend.entity.User;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@org.springframework.context.annotation.Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.seed.name:Adarsh Srikumar}")
    private String adminName;

    @Value("${admin.seed.email:adarshsrikumar28@gmail.com}")
    private String adminEmail;

    @Value("${admin.seed.password:admin123}")
    private String adminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String normalizedEmail = adminEmail.toLowerCase().trim();

        // Find all users with this email
        List<User> existingUsers = userRepository.findAll().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(normalizedEmail))
                .toList();

        if (!existingUsers.isEmpty()) {
            // Promote existing user(s) to ADMIN
            existingUsers.forEach(u -> {
                if (u.getRole() != UserRole.ADMIN) {
                    u.setRole(UserRole.ADMIN);
                    userRepository.save(u);
                    System.out.println("[DataSeeder] Promoted existing user to ADMIN: " + normalizedEmail);
                } else {
                    System.out.println("[DataSeeder] Admin already exists: " + normalizedEmail);
                }
            });
        } else {
            // Create new admin user
            User admin = new User(
                    adminName,
                    normalizedEmail,
                    passwordEncoder.encode(adminPassword),
                    null,
                    UserRole.ADMIN
            );
            userRepository.save(admin);
            System.out.println("[DataSeeder] Created new ADMIN user: " + normalizedEmail);
        }
    }
}
