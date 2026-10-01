package com.marketplace.backend.dto.pricing;

import com.marketplace.backend.enums.UrgencyLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PricingQuoteResponse(
        UUID quoteId,
        Long serviceId,
        String serviceName,
        Long vendorId,
        String vendorBusinessName,
        BigDecimal basePrice,
        BigDecimal demandMultiplier,
        BigDecimal urgencyMultiplier,
        BigDecimal finalPrice,
        String currency,
        LocalDateTime scheduledAt,
        UrgencyLevel urgency,
        LocalDateTime quotedAt,
        LocalDateTime expiresAt
) {
}
