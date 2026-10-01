package com.marketplace.backend.service;

import com.marketplace.backend.dto.auth.AuthResponse;
import com.marketplace.backend.dto.auth.LoginRequest;
import com.marketplace.backend.dto.auth.RegisterRequest;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.exception.DuplicateEmailException;
import com.marketplace.backend.exception.InvalidCredentialsException;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       VendorRepository vendorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.role() == null || request.role() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Registration is only allowed for CUSTOMER and VENDOR roles.");
        }

        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : null;
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("Email is already registered: " + normalizedEmail);
        }

        String trimmedName = request.name() != null ? request.name().trim() : null;
        if (trimmedName == null || trimmedName.isBlank()) {
            throw new IllegalArgumentException("Name cannot be empty.");
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        String phone = request.phone() != null ? request.phone().trim() : null;

        User user = new User(trimmedName, normalizedEmail, encodedPassword, phone, request.role());
        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == UserRole.VENDOR) {
            Vendor vendor = new Vendor(savedUser, savedUser.getName(), null, null);
            vendorRepository.save(vendor);
        }

        return new AuthResponse(
                null,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : "";

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
