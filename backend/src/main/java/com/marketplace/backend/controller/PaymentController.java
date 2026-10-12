package com.marketplace.backend.controller;

import com.marketplace.backend.dto.payment.CreatePaymentOrderRequest;
import com.marketplace.backend.dto.payment.PaymentOrderResponse;
import com.marketplace.backend.dto.payment.PaymentResponse;
import com.marketplace.backend.dto.payment.VerifyPaymentRequest;
import com.marketplace.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request,
            Authentication authentication
    ) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            Authentication authentication
    ) {
        PaymentResponse response = paymentService.verifyPayment(request, authentication);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PaymentResponse>> getBookingPayments(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        List<PaymentResponse> responses = paymentService.getBookingPayments(bookingId, authentication);
        return ResponseEntity.ok(responses);
    }
}
