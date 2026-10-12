package com.marketplace.backend.controller;

import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.dto.booking.CompleteBookingRequest;
import com.marketplace.backend.dto.booking.CreateBookingRequest;
import com.marketplace.backend.dto.booking.OtpResponse;
import com.marketplace.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.createBooking(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Authentication authentication) {
        List<BookingResponse> responses = bookingService.getMyBookings(authentication);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.getBookingById(id, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/otp")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OtpResponse> getBookingOtp(
            @PathVariable Long id,
            Authentication authentication
    ) {
        OtpResponse response = bookingService.getBookingOtp(id, authentication);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<BookingResponse> confirmBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.confirmBooking(id, authentication);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.cancelBooking(id, authentication);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<BookingResponse> completeBookingPost(
            @PathVariable Long id,
            @Valid @RequestBody CompleteBookingRequest request,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.completeBooking(id, request.otp(), authentication);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<BookingResponse> completeBookingPatch(
            @PathVariable Long id,
            @Valid @RequestBody CompleteBookingRequest request,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.completeBooking(id, request.otp(), authentication);
        return ResponseEntity.ok(response);
    }
}
