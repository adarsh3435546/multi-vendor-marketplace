package com.marketplace.backend.service;

import com.marketplace.backend.dto.payment.CreatePaymentOrderRequest;
import com.marketplace.backend.dto.payment.PaymentOrderResponse;
import com.marketplace.backend.dto.payment.PaymentResponse;
import com.marketplace.backend.dto.payment.VerifyPaymentRequest;
import com.marketplace.backend.entity.Booking;
import com.marketplace.backend.entity.PaymentTransaction;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.enums.BookingStatus;
import com.marketplace.backend.enums.PaymentStatus;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.PaymentTransactionRepository;
import com.marketplace.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private UserRepository userRepository;

    private PaymentService paymentService;

    private User customer;
    private Booking booking;
    private Authentication customerAuth;
    private final String testKeySecret = "test_razorpay_secret_key_12345";
    private final String testKeyId = "rzp_test_12345";

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(
                bookingRepository,
                paymentTransactionRepository,
                userRepository,
                testKeyId,
                testKeySecret
        );

        customer = new User("Alice", "alice@example.com", "pass", "123", UserRole.CUSTOMER);
        customer.setId(1L);

        User vendorUser = new User("Bob", "bob@example.com", "pass", "456", UserRole.VENDOR);
        vendorUser.setId(2L);
        Vendor vendor = new Vendor(vendorUser, "Bob Plumbing", 12.0, 77.0);
        vendor.setId(10L);

        Service service = new Service(vendor, "Plumbing", "Fix leaks", new BigDecimal("1000.00"));
        service.setId(100L);

        booking = new Booking(customer, vendor, service, LocalDateTime.now().plusDays(1), new BigDecimal("1000.00"), new BigDecimal("1000.00"));
        booking.setId(500L);
        booking.setStatus(BookingStatus.CONFIRMED);

        customerAuth = new UsernamePasswordAuthenticationToken(customer, null, List.of());
    }

    @Test
    void shouldCreatePaymentOrderSuccessfully() {
        CreatePaymentOrderRequest request = new CreatePaymentOrderRequest(500L);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(paymentTransactionRepository.findByBookingIdAndStatus(500L, PaymentStatus.CAPTURED)).thenReturn(Optional.empty());

        PaymentOrderResponse response = paymentService.createPaymentOrder(request, customerAuth);

        assertNotNull(response);
        assertEquals(500L, response.bookingId());
        assertEquals(100000L, response.amount());
        assertEquals(new BigDecimal("1000.00"), response.formattedAmount());
        assertEquals("INR", response.currency());
        assertEquals(testKeyId, response.keyId());
        verify(paymentTransactionRepository, times(1)).save(any(PaymentTransaction.class));
    }

    @Test
    void shouldRejectCreatePaymentOrderWhenAlreadyPaid() {
        CreatePaymentOrderRequest request = new CreatePaymentOrderRequest(500L);
        PaymentTransaction existing = new PaymentTransaction(booking, new BigDecimal("1000.00"), new BigDecimal("100.00"), new BigDecimal("900.00"));
        existing.setStatus(PaymentStatus.CAPTURED);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(paymentTransactionRepository.findByBookingIdAndStatus(500L, PaymentStatus.CAPTURED)).thenReturn(Optional.of(existing));

        assertThrows(IllegalStateException.class, () -> paymentService.createPaymentOrder(request, customerAuth));
    }

    @Test
    void shouldVerifyValidPaymentSignature() throws Exception {
        String orderId = "order_test_123";
        String paymentId = "pay_test_456";

        // Generate valid signature
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(testKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String validSignature = HexFormat.of().formatHex(mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8)));

        VerifyPaymentRequest request = new VerifyPaymentRequest(500L, orderId, paymentId, validSignature);

        PaymentTransaction transaction = new PaymentTransaction(booking, new BigDecimal("1000.00"), new BigDecimal("100.00"), new BigDecimal("900.00"));
        transaction.setRazorpayOrderId(orderId);
        transaction.setStatus(PaymentStatus.CREATED);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(paymentTransactionRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(transaction));
        when(paymentTransactionRepository.save(any(PaymentTransaction.class))).thenAnswer(i -> i.getArgument(0));

        PaymentResponse response = paymentService.verifyPayment(request, customerAuth);

        assertNotNull(response);
        assertEquals(PaymentStatus.CAPTURED, response.status());
        assertEquals(paymentId, response.razorpayPaymentId());
    }

    @Test
    void shouldRejectInvalidPaymentSignature() {
        String orderId = "order_test_123";
        String paymentId = "pay_test_456";
        String invalidSignature = "invalid_signature_hex";

        VerifyPaymentRequest request = new VerifyPaymentRequest(500L, orderId, paymentId, invalidSignature);

        PaymentTransaction transaction = new PaymentTransaction(booking, new BigDecimal("1000.00"), new BigDecimal("100.00"), new BigDecimal("900.00"));
        transaction.setRazorpayOrderId(orderId);
        transaction.setStatus(PaymentStatus.CREATED);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(paymentTransactionRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(transaction));

        assertThrows(IllegalArgumentException.class, () -> paymentService.verifyPayment(request, customerAuth));
        assertEquals(PaymentStatus.FAILED, transaction.getStatus());
        verify(paymentTransactionRepository, times(1)).save(transaction);
    }
}
