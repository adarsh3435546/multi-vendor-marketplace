package com.marketplace.backend.dto.pricing;

import com.marketplace.backend.enums.UrgencyLevel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

public record StoredQuote(
        UUID quoteId,
        String customerEmail,
        Long serviceId,
        Long vendorId,
        BigDecimal basePrice,
        BigDecimal demandMultiplier,
        BigDecimal urgencyMultiplier,
        BigDecimal finalPrice,
        String currency,
        LocalDateTime scheduledAt,
        UrgencyLevel urgency,
        LocalDateTime quotedAt,
        LocalDateTime expiresAt,
        AtomicBoolean consumed
) {
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean tryConsume() {
        return consumed.compareAndSet(false, true);
    }
}
