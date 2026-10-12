package com.marketplace.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VerifyPaymentRequest(
        @NotNull(message = "bookingId is required")
        Long bookingId,

        @NotBlank(message = "razorpayOrderId is required")
        String razorpayOrderId,

        @NotBlank(message = "razorpayPaymentId is required")
        String razorpayPaymentId,

        @NotBlank(message = "razorpaySignature is required")
        String razorpaySignature
) {
}
