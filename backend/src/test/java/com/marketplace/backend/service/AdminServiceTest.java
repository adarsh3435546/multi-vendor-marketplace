package com.marketplace.backend.service;

import com.marketplace.backend.dto.admin.AdminUserResponse;
import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.dto.payment.PaymentResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
import com.marketplace.backend.entity.Booking;
import com.marketplace.backend.entity.PaymentTransaction;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.PaymentTransactionRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @InjectMocks
    private AdminService adminService;

    private User admin;
    private Vendor vendor;

    @BeforeEach
    void setUp() {
        admin = new User("Admin", "admin@example.com", "pass", "999", UserRole.ADMIN);
        admin.setId(1L);

        User vendorUser = new User("Vendor1", "vendor1@example.com", "pass", "888", UserRole.VENDOR);
        vendorUser.setId(2L);
        vendor = new Vendor(vendorUser, "Test Vendor Business", 12.0, 77.0);
        vendor.setId(10L);
    }

    @Test
    void shouldGetAllUsers() {
        when(userRepository.findAll(any(Sort.class))).thenReturn(List.of(admin));

        List<AdminUserResponse> users = adminService.getAllUsers();
        assertEquals(1, users.size());
        assertEquals("admin@example.com", users.getFirst().email());
    }

    @Test
    void shouldGetAllVendors() {
        when(vendorRepository.findAll(any(Sort.class))).thenReturn(List.of(vendor));

        List<VendorResponse> vendors = adminService.getAllVendors();
        assertEquals(1, vendors.size());
        assertEquals("Test Vendor Business", vendors.getFirst().businessName());
    }

    @Test
    void shouldUpdateVendorAvailability() {
        when(vendorRepository.findById(10L)).thenReturn(Optional.of(vendor));
        when(vendorRepository.save(any(Vendor.class))).thenAnswer(i -> i.getArgument(0));

        VendorResponse response = adminService.updateVendorAvailability(10L, false);

        assertNotNull(response);
        assertFalse(response.available());
    }
}
