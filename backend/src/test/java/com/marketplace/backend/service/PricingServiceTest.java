package com.marketplace.backend.service;

import com.marketplace.backend.dto.pricing.PricingQuoteRequest;
import com.marketplace.backend.dto.pricing.PricingQuoteResponse;
import com.marketplace.backend.dto.pricing.StoredQuote;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.enums.UrgencyLevel;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.ServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private PricingService pricingService;

    private Vendor availableVendor;
    private Service activeService;

    @BeforeEach
    void setUp() {
        User user = new User("Plumber Bob", "bob@example.com", "hash", "123456", UserRole.VENDOR);
        user.setId(1L);

        availableVendor = new Vendor(user, "Bob's Plumbing", 12.9716, 77.5946);
        availableVendor.setId(10L);
        availableVendor.setAvailable(true);

        activeService = new Service(availableVendor, "Pipe Replacement", "Replace cracked pipe", new BigDecimal("500.00"));
        activeService.setId(100L);
    }

    @Test
    void shouldCalculateStandardPriceQuote() {
        LocalDateTime futureTime = LocalDateTime.now().plusDays(2);
        PricingQuoteRequest request = new PricingQuoteRequest(100L, futureTime, UrgencyLevel.STANDARD);

        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(activeService));

        PricingQuoteResponse response = pricingService.calculateQuote(request, "customer@example.com");

        assertNotNull(response);
        assertNotNull(response.quoteId());
        assertEquals(new BigDecimal("500.00"), response.basePrice());
        assertEquals(new BigDecimal("1.00"), response.demandMultiplier());
        assertEquals(new BigDecimal("1.00"), response.urgencyMultiplier());
        assertEquals(new BigDecimal("500.00"), response.finalPrice());
        assertEquals("INR", response.currency());
        assertTrue(response.expiresAt().isAfter(response.quotedAt()));
    }

    @Test
    void shouldCalculateSameDayPriceQuoteWithSimplePrice() {
        LocalDateTime futureTime = LocalDateTime.now().plusHours(4);
        PricingQuoteRequest request = new PricingQuoteRequest(100L, futureTime, UrgencyLevel.SAME_DAY);

        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(activeService));

        PricingQuoteResponse response = pricingService.calculateQuote(request, "customer@example.com");

        assertNotNull(response);
        assertNotNull(response.quoteId());
        assertEquals(new BigDecimal("500.00"), response.basePrice());
        assertEquals(new BigDecimal("1.00"), response.urgencyMultiplier());
        assertEquals(new BigDecimal("500.00"), response.finalPrice());
    }

    @Test
    void shouldCalculateEmergencyPriceQuoteWithSimplePrice() {
        LocalDateTime futureTime = LocalDateTime.now().plusHours(1);
        PricingQuoteRequest request = new PricingQuoteRequest(100L, futureTime, UrgencyLevel.EMERGENCY);

        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(activeService));

        PricingQuoteResponse response = pricingService.calculateQuote(request, "customer@example.com");

        assertNotNull(response);
        assertNotNull(response.quoteId());
        assertEquals(new BigDecimal("500.00"), response.basePrice());
        assertEquals(new BigDecimal("1.00"), response.urgencyMultiplier());
        assertEquals(new BigDecimal("500.00"), response.finalPrice());
    }

    @Test
    void shouldConsumeQuoteSuccessfullyAndPreventDuplicateConsumption() {
        LocalDateTime futureTime = LocalDateTime.now().plusDays(1);
        PricingQuoteRequest request = new PricingQuoteRequest(100L, futureTime, UrgencyLevel.STANDARD);

        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(activeService));

        PricingQuoteResponse response = pricingService.calculateQuote(request, "customer@example.com");
        UUID quoteId = response.quoteId();

        StoredQuote consumedQuote = pricingService.consumeQuote(quoteId, "customer@example.com");
        assertNotNull(consumedQuote);
        assertEquals(new BigDecimal("500.00"), consumedQuote.finalPrice());

        // Duplicate consumption must fail
        assertThrows(IllegalArgumentException.class, () -> pricingService.consumeQuote(quoteId, "customer@example.com"));
    }

    @Test
    void shouldRejectQuoteConsumptionByDifferentCustomer() {
        LocalDateTime futureTime = LocalDateTime.now().plusDays(1);
        PricingQuoteRequest request = new PricingQuoteRequest(100L, futureTime, UrgencyLevel.STANDARD);

        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(activeService));

        PricingQuoteResponse response = pricingService.calculateQuote(request, "customer1@example.com");
        UUID quoteId = response.quoteId();

        assertThrows(AccessDeniedException.class, () -> pricingService.consumeQuote(quoteId, "customer2@example.com"));
    }

    @Test
    void shouldThrowNotFoundWhenServiceDoesNotExistOrIsInactive() {
        PricingQuoteRequest request = new PricingQuoteRequest(999L, LocalDateTime.now().plusDays(1), UrgencyLevel.STANDARD);

        when(serviceRepository.findByIdAndActiveTrue(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> pricingService.calculateQuote(request));
    }

    @Test
    void shouldThrowNotFoundWhenVendorIsUnavailable() {
        availableVendor.setAvailable(false);
        PricingQuoteRequest request = new PricingQuoteRequest(100L, LocalDateTime.now().plusDays(1), UrgencyLevel.STANDARD);

        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(activeService));

        assertThrows(ResourceNotFoundException.class, () -> pricingService.calculateQuote(request));
    }
}
