package com.marketplace.backend.controller;

import com.marketplace.backend.dto.payment.CreatePaymentOrderRequest;
import com.marketplace.backend.dto.payment.PaymentOrderResponse;
import com.marketplace.backend.dto.payment.PaymentResponse;
import com.marketplace.backend.dto.payment.VerifyPaymentRequest;
import com.marketplace.backend.enums.PaymentStatus;
import com.marketplace.backend.service.PaymentService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class PaymentControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private PaymentService paymentService;

    private MockMvc getMockMvc() {
        return MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCanCreatePaymentOrder() throws Exception {
        PaymentOrderResponse response = new PaymentOrderResponse(
                "order_123",
                50000L,
                new BigDecimal("500.00"),
                "INR",
                "rzp_test_123",
                1001L,
                "Vendor Shop",
                "Service Name",
                "Customer",
                "customer@example.com",
                "1234567890"
        );

        when(paymentService.createPaymentOrder(any(CreatePaymentOrderRequest.class), any())).thenReturn(response);

        getMockMvc().perform(post("/api/payments/create-order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookingId\": 1001}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value("order_123"))
                .andExpect(jsonPath("$.amount").value(50000))
                .andExpect(jsonPath("$.currency").value("INR"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCanVerifyPayment() throws Exception {
        PaymentResponse response = new PaymentResponse(
                1L,
                1001L,
                new BigDecimal("500.00"),
                new BigDecimal("50.00"),
                new BigDecimal("450.00"),
                "order_123",
                "pay_123",
                PaymentStatus.CAPTURED,
                LocalDateTime.now()
        );

        when(paymentService.verifyPayment(any(VerifyPaymentRequest.class), any())).thenReturn(response);

        getMockMvc().perform(post("/api/payments/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookingId\": 1001, \"razorpayOrderId\": \"order_123\", \"razorpayPaymentId\": \"pay_123\", \"razorpaySignature\": \"sig_123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CAPTURED"))
                .andExpect(jsonPath("$.razorpayPaymentId").value("pay_123"));
    }
}
