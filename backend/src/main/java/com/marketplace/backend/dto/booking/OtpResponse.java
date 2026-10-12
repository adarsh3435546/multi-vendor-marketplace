package com.marketplace.backend.dto.booking;

public record OtpResponse(
        Long bookingId,
        String otp,
        String message
) {
}
