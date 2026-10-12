package com.marketplace.backend.dto.admin;

import com.marketplace.backend.entity.User;
import com.marketplace.backend.enums.UserRole;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String name,
        String email,
        String phone,
        UserRole role,
        LocalDateTime createdAt
) {
    public static AdminUserResponse fromEntity(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
