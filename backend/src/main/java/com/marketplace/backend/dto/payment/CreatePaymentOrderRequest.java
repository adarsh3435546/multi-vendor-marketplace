package com.marketplace.backend.dto.payment;

import jakarta.validation.constraints.NotNull;

public record CreatePaymentOrderRequest(
        @NotNull(message = "bookingId is required")
        Long bookingId
) {
}
