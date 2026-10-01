package com.marketplace.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Temporary test controller for role-based authorization verification.
 * Development only - to be removed before production deployment.
 */
@RestController
@RequestMapping("/api/test")
public class AuthorizationTestController {

    @GetMapping("/authenticated")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> authenticatedEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Access granted to authenticated user."));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, String>> customerEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Access granted to CUSTOMER role."));
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Map<String, String>> vendorEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Access granted to VENDOR role."));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> adminEndpoint() {
        return ResponseEntity.ok(Map.of("message", "Access granted to ADMIN role."));
    }
}
