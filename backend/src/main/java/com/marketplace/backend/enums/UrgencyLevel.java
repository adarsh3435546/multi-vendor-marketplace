package com.marketplace.backend.enums;

import java.math.BigDecimal;

public enum UrgencyLevel {
    NORMAL(new BigDecimal("1.00")),
    STANDARD(new BigDecimal("1.00")),
    URGENT(new BigDecimal("1.25")),
    SAME_DAY(new BigDecimal("1.25")),
    EMERGENCY(new BigDecimal("1.50"));

    private final BigDecimal multiplier;

    UrgencyLevel(BigDecimal multiplier) {
        this.multiplier = multiplier;
    }

    public BigDecimal getMultiplier() {
        return multiplier;
    }
}
