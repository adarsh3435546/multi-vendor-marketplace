package com.marketplace.backend.dto.pricing;

import com.marketplace.backend.enums.UrgencyLevel;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record PricingQuoteRequest(
        @NotNull(message = "serviceId is required")
        Long serviceId,

        @NotNull(message = "scheduledAt is required")
        @Future(message = "scheduledAt must be in the future")
        LocalDateTime scheduledAt,

        @NotNull(message = "urgency is required")
        UrgencyLevel urgency
) {
}
