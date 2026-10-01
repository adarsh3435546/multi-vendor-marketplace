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
        LocalDateTime createdAt
) {
    public static BookingResponse fromEntity(Booking booking) {
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
                booking.getCreatedAt()
        );
    }
}
