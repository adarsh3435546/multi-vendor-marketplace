package com.marketplace.backend.dto.booking;

import com.marketplace.backend.entity.Booking;
import com.marketplace.backend.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        Long customerId,
        String customerName,
        String customerEmail,
        Long vendorId,
        String vendorBusinessName,
        Long serviceId,
        String serviceName,
        LocalDateTime scheduledAt,
        BookingStatus status,
        BigDecimal basePrice,
        BigDecimal finalPrice,
        String completionOtp,
        LocalDateTime createdAt
) {
    public BookingResponse(
            Long id,
            Long customerId,
            String customerName,
            String customerEmail,
            Long vendorId,
            String vendorBusinessName,
            Long serviceId,
            String serviceName,
            LocalDateTime scheduledAt,
            BookingStatus status,
            BigDecimal basePrice,
            BigDecimal finalPrice,
            LocalDateTime createdAt
    ) {
        this(id, customerId, customerName, customerEmail, vendorId, vendorBusinessName, serviceId, serviceName, scheduledAt, status, basePrice, finalPrice, null, createdAt);
    }
    public static BookingResponse fromEntity(Booking booking) {
        return fromEntity(booking, null);
    }

    public static BookingResponse fromEntity(Booking booking, String completionOtp) {
        return new BookingResponse(
                booking.getId(),
                booking.getCustomer() != null ? booking.getCustomer().getId() : null,
                booking.getCustomer() != null ? booking.getCustomer().getName() : null,
                booking.getCustomer() != null ? booking.getCustomer().getEmail() : null,
                booking.getVendor() != null ? booking.getVendor().getId() : null,
                booking.getVendor() != null ? booking.getVendor().getBusinessName() : null,
                booking.getService() != null ? booking.getService().getId() : null,
                booking.getService() != null ? booking.getService().getName() : null,
                booking.getScheduledAt(),
                booking.getStatus(),
                booking.getBasePrice(),
                booking.getFinalPrice(),
                completionOtp,
                booking.getCreatedAt()
        );
    }
}
