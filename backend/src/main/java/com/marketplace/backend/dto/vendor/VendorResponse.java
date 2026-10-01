package com.marketplace.backend.dto.vendor;

import com.marketplace.backend.entity.Vendor;

import java.time.LocalDateTime;

public record VendorResponse(
        Long id,
        String businessName,
        Double latitude,
        Double longitude,
        Double rating,
        Boolean available,
        LocalDateTime createdAt
) {
    public static VendorResponse fromEntity(Vendor vendor) {
        return new VendorResponse(
                vendor.getId(),
                vendor.getBusinessName(),
                vendor.getLatitude(),
                vendor.getLongitude(),
                vendor.getRating(),
                vendor.getAvailable(),
                vendor.getCreatedAt()
        );
    }
}
