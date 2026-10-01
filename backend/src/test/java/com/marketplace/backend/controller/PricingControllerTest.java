package com.marketplace.backend.controller;

import com.marketplace.backend.dto.pricing.PricingQuoteResponse;
import com.marketplace.backend.enums.UrgencyLevel;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.service.PricingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class PricingControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private PricingService pricingService;

    private MockMvc getMockMvc() {
        return MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void unauthenticatedRequestShouldReturn401() throws Exception {
        getMockMvc().perform(post("/api/pricing/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serviceId\":1,\"scheduledAt\":\"2026-12-01T10:00:00\",\"urgency\":\"STANDARD\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "vendor@example.com", roles = {"VENDOR"})
    void vendorCannotRequestPriceQuote() throws Exception {
        getMockMvc().perform(post("/api/pricing/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serviceId\":1,\"scheduledAt\":\"2026-12-01T10:00:00\",\"urgency\":\"STANDARD\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCanRequestPriceQuote() throws Exception {
        UUID quoteId = UUID.randomUUID();
        PricingQuoteResponse quoteResponse = new PricingQuoteResponse(
                quoteId, 1L, "Pipe Replacement", 10L, "Bob's Plumbing",
                new BigDecimal("500.00"), new BigDecimal("1.00"), new BigDecimal("1.50"),
                new BigDecimal("750.00"), "INR",
                LocalDateTime.parse("2026-12-01T10:00:00"),
                UrgencyLevel.EMERGENCY,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(15)
        );

        when(pricingService.calculateQuote(any(), any())).thenReturn(quoteResponse);

        getMockMvc().perform(post("/api/pricing/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serviceId\":1,\"scheduledAt\":\"2026-12-01T10:00:00\",\"urgency\":\"EMERGENCY\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quoteId").value(quoteId.toString()))
                .andExpect(jsonPath("$.basePrice").value(500.00))
                .andExpect(jsonPath("$.finalPrice").value(750.00))
                .andExpect(jsonPath("$.urgency").value("EMERGENCY"))
                .andExpect(jsonPath("$.currency").value("INR"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void shouldReturn404WhenServiceNotFoundForQuote() throws Exception {
        when(pricingService.calculateQuote(any(), any()))
                .thenThrow(new ResourceNotFoundException("Active service not found with ID: 999"));

        getMockMvc().perform(post("/api/pricing/quote")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"serviceId\":999,\"scheduledAt\":\"2026-12-01T10:00:00\",\"urgency\":\"STANDARD\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
