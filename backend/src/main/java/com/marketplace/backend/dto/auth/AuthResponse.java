package com.marketplace.backend.dto.auth;

import com.marketplace.backend.enums.UserRole;

public record AuthResponse(
        String token,
        Long userId,
        String name,
        String email,
        UserRole role
) {
}
