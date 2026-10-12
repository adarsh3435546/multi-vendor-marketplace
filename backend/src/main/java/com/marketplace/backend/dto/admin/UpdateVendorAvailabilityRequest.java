package com.marketplace.backend.dto.admin;

import jakarta.validation.constraints.NotNull;

public record UpdateVendorAvailabilityRequest(
        @NotNull(message = "available status is required")
        Boolean available
) {
}
