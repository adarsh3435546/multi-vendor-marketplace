package com.marketplace.backend.controller;

import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.enums.BookingStatus;
import com.marketplace.backend.service.BookingService;
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
class BookingControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private BookingService bookingService;

    private MockMvc getMockMvc() {
        return MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void unauthenticatedRequestShouldReturn401() throws Exception {
        UUID quoteId = UUID.randomUUID();
        getMockMvc().perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quoteId\":\"" + quoteId + "\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "vendor@example.com", roles = {"VENDOR"})
    void vendorCannotCreateBooking() throws Exception {
        UUID quoteId = UUID.randomUUID();
        getMockMvc().perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quoteId\":\"" + quoteId + "\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCanCreateBookingWithQuoteId() throws Exception {
        UUID quoteId = UUID.randomUUID();
        BookingResponse bookingResponse = new BookingResponse(
                1001L, 1L, "Alice Customer", "customer@example.com",
                10L, "Bob Plumbing", 100L, "Pipe Replacement",
                LocalDateTime.now().plusDays(1), BookingStatus.PENDING,
                new BigDecimal("500.00"), new BigDecimal("625.00"),
                LocalDateTime.now()
        );

        when(bookingService.createBooking(any(), any())).thenReturn(bookingResponse);

        getMockMvc().perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quoteId\":\"" + quoteId + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1001))
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.vendorId").value(10))
                .andExpect(jsonPath("$.basePrice").value(500.00))
                .andExpect(jsonPath("$.finalPrice").value(625.00))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
