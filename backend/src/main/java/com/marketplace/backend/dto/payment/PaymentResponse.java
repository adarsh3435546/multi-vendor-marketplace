package com.marketplace.backend.dto.payment;

import com.marketplace.backend.entity.PaymentTransaction;
import com.marketplace.backend.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long bookingId,
        BigDecimal amount,
        BigDecimal commission,
        BigDecimal vendorAmount,
        String razorpayOrderId,
        String razorpayPaymentId,
        PaymentStatus status,
        LocalDateTime createdAt
) {
    public static PaymentResponse fromEntity(PaymentTransaction transaction) {
        return new PaymentResponse(
                transaction.getId(),
                transaction.getBooking() != null ? transaction.getBooking().getId() : null,
                transaction.getAmount(),
                transaction.getCommission(),
                transaction.getVendorAmount(),
                transaction.getRazorpayOrderId(),
                transaction.getRazorpayPaymentId(),
                transaction.getStatus(),
                transaction.getCreatedAt()
        );
    }
}
