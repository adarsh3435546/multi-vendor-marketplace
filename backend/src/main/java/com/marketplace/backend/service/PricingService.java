package com.marketplace.backend.service;

import com.marketplace.backend.dto.pricing.PricingQuoteRequest;
import com.marketplace.backend.dto.pricing.PricingQuoteResponse;
import com.marketplace.backend.dto.pricing.StoredQuote;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.enums.UrgencyLevel;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.ServiceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicBoolean;

@org.springframework.stereotype.Service
public class PricingService {

    public static final String DEFAULT_CURRENCY = "INR";
    public static final BigDecimal NEUTRAL_DEMAND_MULTIPLIER = new BigDecimal("1.00");
    public static final int QUOTE_VALIDITY_MINUTES = 15;

    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;
    private final ConcurrentMap<UUID, StoredQuote> quoteStore = new ConcurrentHashMap<>();

    public PricingService(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
        this.bookingRepository = null;
    }

    @org.springframework.beans.factory.annotation.Autowired
    public PricingService(ServiceRepository serviceRepository, BookingRepository bookingRepository) {
        this.serviceRepository = serviceRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public PricingQuoteResponse calculateQuote(PricingQuoteRequest request) {
        return calculateQuote(request, null);
    }

    @Transactional(readOnly = true)
    public PricingQuoteResponse calculateQuote(PricingQuoteRequest request, String customerEmail) {
        Service service = serviceRepository.findByIdAndActiveTrue(request.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Active service not found with ID: " + request.serviceId()));

        Vendor vendor = service.getVendor();
        if (vendor == null || !Boolean.TRUE.equals(vendor.getAvailable())) {
            throw new ResourceNotFoundException("The vendor for service ID " + request.serviceId() + " is currently unavailable.");
        }

        BigDecimal basePrice = service.getBasePrice();
        BigDecimal demandMultiplier = NEUTRAL_DEMAND_MULTIPLIER; // 1.00 - Simple flat pricing
        UrgencyLevel urgency = request.urgency() != null ? request.urgency() : UrgencyLevel.STANDARD;
        BigDecimal urgencyMultiplier = new BigDecimal("1.00"); // Simple pricing without dynamic surcharge

        BigDecimal finalPrice = basePrice.setScale(2, RoundingMode.HALF_UP);

        LocalDateTime quotedAt = LocalDateTime.now();
        LocalDateTime expiresAt = quotedAt.plusMinutes(QUOTE_VALIDITY_MINUTES);
        UUID quoteId = UUID.randomUUID();

        StoredQuote storedQuote = new StoredQuote(
                quoteId,
                customerEmail,
                service.getId(),
                vendor.getId(),
                basePrice,
                demandMultiplier,
                urgencyMultiplier,
                finalPrice,
                DEFAULT_CURRENCY,
                request.scheduledAt(),
                urgency,
                quotedAt,
                expiresAt,
                new AtomicBoolean(false)
        );

        quoteStore.put(quoteId, storedQuote);

        return new PricingQuoteResponse(
                quoteId,
                service.getId(),
                service.getName(),
                vendor.getId(),
                vendor.getBusinessName(),
                basePrice,
                demandMultiplier,
                urgencyMultiplier,
                finalPrice,
                DEFAULT_CURRENCY,
                request.scheduledAt(),
                urgency,
                quotedAt,
                expiresAt
        );
    }

    public StoredQuote consumeQuote(UUID quoteId, String customerEmail) {
        if (quoteId == null) {
            throw new IllegalArgumentException("quoteId cannot be null.");
        }

        StoredQuote quote = quoteStore.get(quoteId);
        if (quote == null) {
            throw new IllegalArgumentException("Quote not found or invalid: " + quoteId);
        }

        if (quote.isExpired()) {
            quoteStore.remove(quoteId);
            throw new IllegalArgumentException("Quote has expired. Please request a fresh quote.");
        }

        if (customerEmail != null && quote.customerEmail() != null && !quote.customerEmail().equalsIgnoreCase(customerEmail)) {
            throw new AccessDeniedException("This pricing quote belongs to a different customer.");
        }

        if (!quote.tryConsume()) {
            throw new IllegalArgumentException("Quote has already been consumed for another booking.");
        }

        return quote;
    }

    private BigDecimal calculateDemandMultiplier(Long serviceId) {
        if (bookingRepository == null || serviceId == null) {
            return NEUTRAL_DEMAND_MULTIPLIER;
        }
        try {
            long activeBookingsCount = bookingRepository.countByServiceIdAndStatusNot(
                    serviceId,
                    com.marketplace.backend.enums.BookingStatus.CANCELLED
            );
            if (activeBookingsCount >= 5) {
                return new BigDecimal("1.30");
            } else if (activeBookingsCount >= 3) {
                return new BigDecimal("1.15");
            }
        } catch (Exception ignored) {
            // Fallback safely to neutral multiplier
        }
        return NEUTRAL_DEMAND_MULTIPLIER;
    }
}
