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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("John Doe", "john@example.com", "encodedPassword123", "1234567890", UserRole.CUSTOMER);
        sampleUser.setId(10L);
    }

    @Test
    void shouldRegisterCustomerSuccessfully() {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "plainPass", "1234567890", UserRole.CUSTOMER);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plainPass")).thenReturn("encodedPassword123");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(10L, response.userId());
        assertEquals("John Doe", response.name());
        assertEquals("john@example.com", response.email());
        assertEquals(UserRole.CUSTOMER, response.role());
        assertNull(response.token());
        verify(vendorRepository, never()).save(any());
    }

    @Test
    void shouldRegisterVendorAndCreateVendorEntity() {
        User vendorUser = new User("Vendor Shop", "vendor@example.com", "encodedPass", "1234567890", UserRole.VENDOR);
        vendorUser.setId(20L);
        RegisterRequest request = new RegisterRequest("Vendor Shop", "vendor@example.com", "plainPass", "1234567890", UserRole.VENDOR);

        when(userRepository.existsByEmail("vendor@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plainPass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(vendorUser);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(20L, response.userId());
        assertEquals(UserRole.VENDOR, response.role());
        verify(vendorRepository, times(1)).save(any(Vendor.class));
    }

    @Test
    void shouldRejectAdminRegistration() {
        RegisterRequest request = new RegisterRequest("Admin User", "admin@example.com", "plainPass", "1234567890", UserRole.ADMIN);
        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    }

    @Test
    void shouldRejectDuplicateEmailRegistration() {
        RegisterRequest request = new RegisterRequest("John Doe", "john@example.com", "plainPass", "1234567890", UserRole.CUSTOMER);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> authService.register(request));
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() {
        LoginRequest request = new LoginRequest("john@example.com", "correctPassword");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("correctPassword", "encodedPassword123")).thenReturn(true);
        when(jwtService.generateToken("john@example.com", 10L, "CUSTOMER")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
        assertEquals(10L, response.userId());
        assertEquals("John Doe", response.name());
        assertEquals("john@example.com", response.email());
        assertEquals(UserRole.CUSTOMER, response.role());
    }

    @Test
    void shouldThrowInvalidCredentialsExceptionWhenUserNotFound() {
        LoginRequest request = new LoginRequest("unknown@example.com", "password");
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void shouldThrowInvalidCredentialsExceptionWhenPasswordMismatch() {
        LoginRequest request = new LoginRequest("john@example.com", "wrongPassword");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword123")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }
}
