package com.marketplace.backend.service;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String VALID_SECRET = "my-super-secret-key-that-is-at-least-32-bytes-long-for-testing!";
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(VALID_SECRET, 3600000L);
    }

    @Test
    void shouldThrowExceptionWhenSecretIsMissingOrBlank() {
        assertThrows(IllegalStateException.class, () -> new JwtService(null, 3600000L));
        assertThrows(IllegalStateException.class, () -> new JwtService("   ", 3600000L));
    }

    @Test
    void shouldThrowExceptionWhenSecretIsTooShort() {
        assertThrows(IllegalStateException.class, () -> new JwtService("too-short-secret", 3600000L));
    }

    @Test
    void shouldGenerateAndValidateTokenSuccessfully() {
        String token = jwtService.generateToken("test@example.com", 1L, "CUSTOMER");
        assertNotNull(token);
        assertTrue(jwtService.validateToken(token));

        String subject = jwtService.extractSubject(token);
        assertEquals("test@example.com", subject);

        Claims claims = jwtService.extractAllClaims(token);
        assertNotNull(claims);
        assertEquals(1, ((Number) claims.get("userId")).longValue());
        assertEquals("CUSTOMER", claims.get("role"));
    }

    @Test
    void shouldReturnFalseForInvalidOrMalformedToken() {
        assertFalse(jwtService.validateToken("invalid.token.structure"));
        assertNull(jwtService.extractSubject("invalid.token.structure"));
        assertNull(jwtService.extractAllClaims("invalid.token.structure"));
    }

    @Test
    void shouldHandleExpiredTokenSafely() {
        JwtService expiredJwtService = new JwtService(VALID_SECRET, -1000L);
        String expiredToken = expiredJwtService.generateToken("expired@example.com", 2L, "VENDOR");

        assertFalse(jwtService.validateToken(expiredToken));
        assertNull(jwtService.extractAllClaims(expiredToken));
    }
}
