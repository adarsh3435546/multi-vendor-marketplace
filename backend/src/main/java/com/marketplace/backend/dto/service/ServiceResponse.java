package com.marketplace.backend.dto.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServiceResponse(
        Long id,
        Long vendorId,
        String vendorBusinessName,
        String name,
        String description,
        BigDecimal basePrice,
        Boolean active,
        LocalDateTime createdAt
) {
    public static ServiceResponse fromEntity(com.marketplace.backend.entity.Service service) {
        return new ServiceResponse(
                service.getId(),
                service.getVendor() != null ? service.getVendor().getId() : null,
                service.getVendor() != null ? service.getVendor().getBusinessName() : null,
                service.getName(),
                service.getDescription(),
                service.getBasePrice(),
                service.getActive(),
                service.getCreatedAt()
        );
    }
}
