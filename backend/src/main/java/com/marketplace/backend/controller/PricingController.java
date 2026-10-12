package com.marketplace.backend.controller;

import com.marketplace.backend.dto.pricing.PricingQuoteRequest;
import com.marketplace.backend.dto.pricing.PricingQuoteResponse;
import com.marketplace.backend.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pricing")
public class PricingController {

    private final PricingService pricingService;

    public PricingController(PricingService pricingService) {
        this.pricingService = pricingService;
    }

    @PostMapping("/quote")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PricingQuoteResponse> getPriceQuote(
            @Valid @RequestBody PricingQuoteRequest request,
            Authentication authentication
    ) {
        String customerEmail = authentication != null
                ? (authentication.getPrincipal() instanceof com.marketplace.backend.entity.User user
                    ? user.getEmail()
                    : authentication.getName())
                : null;
        PricingQuoteResponse response = pricingService.calculateQuote(request, customerEmail);
        return ResponseEntity.ok(response);
    }
}
