package com.marketplace.backend.dto.vendor;

import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.entity.Vendor;

import java.time.LocalDateTime;
import java.util.List;

public record VendorDetailResponse(
        Long id,
        String businessName,
        Double latitude,
        Double longitude,
        Double rating,
        Boolean available,
        LocalDateTime createdAt,
        List<ServiceResponse> services
) {
    public static VendorDetailResponse fromEntity(Vendor vendor, List<ServiceResponse> services) {
        return new VendorDetailResponse(
                vendor.getId(),
                vendor.getBusinessName(),
                vendor.getLatitude(),
                vendor.getLongitude(),
                vendor.getRating(),
                vendor.getAvailable(),
                vendor.getCreatedAt(),
                services
        );
    }
}
