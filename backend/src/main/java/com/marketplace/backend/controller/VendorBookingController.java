package com.marketplace.backend.controller;

import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/bookings")
public class VendorBookingController {

    private final BookingService bookingService;

    public VendorBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<BookingResponse>> getVendorBookings(Authentication authentication) {
        List<BookingResponse> bookings = bookingService.getVendorBookings(authentication);
        return ResponseEntity.ok(bookings);
    }
}
