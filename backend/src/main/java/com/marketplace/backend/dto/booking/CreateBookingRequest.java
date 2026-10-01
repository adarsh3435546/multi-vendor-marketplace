package com.marketplace.backend.dto.booking;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull(message = "quoteId is required")
        UUID quoteId
) {
}
