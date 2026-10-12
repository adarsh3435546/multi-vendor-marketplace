package com.marketplace.backend.dto.payment;

import java.math.BigDecimal;

public record PaymentOrderResponse(
        String orderId,
        Long amount,
        BigDecimal formattedAmount,
        String currency,
        String keyId,
        Long bookingId,
        String businessName,
        String serviceName,
        String customerName,
        String customerEmail,
        String customerPhone
) {
}
