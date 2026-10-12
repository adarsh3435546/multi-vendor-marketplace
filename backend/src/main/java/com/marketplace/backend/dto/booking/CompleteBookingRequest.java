package com.marketplace.backend.dto.booking;

import jakarta.validation.constraints.NotBlank;

public record CompleteBookingRequest(
        @NotBlank(message = "OTP is required")
        String otp
) {
}
