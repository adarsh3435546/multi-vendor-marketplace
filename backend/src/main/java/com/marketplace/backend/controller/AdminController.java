package com.marketplace.backend.controller;

import com.marketplace.backend.dto.admin.AdminUserResponse;
import com.marketplace.backend.dto.admin.UpdateVendorAvailabilityRequest;
import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.dto.payment.PaymentResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
import com.marketplace.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<VendorResponse>> getAllVendors() {
        return ResponseEntity.ok(adminService.getAllVendors());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(adminService.getAllPayments());
    }

    @PatchMapping("/vendors/{id}/availability")
    public ResponseEntity<VendorResponse> updateVendorAvailability(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVendorAvailabilityRequest request
    ) {
        VendorResponse response = adminService.updateVendorAvailability(id, request.available());
        return ResponseEntity.ok(response);
    }
}
