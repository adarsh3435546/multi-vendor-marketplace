package com.marketplace.backend.service;

import com.marketplace.backend.dto.payment.CreatePaymentOrderRequest;
import com.marketplace.backend.dto.payment.PaymentOrderResponse;
import com.marketplace.backend.dto.payment.PaymentResponse;
import com.marketplace.backend.dto.payment.VerifyPaymentRequest;
import com.marketplace.backend.entity.Booking;
import com.marketplace.backend.entity.PaymentTransaction;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.enums.BookingStatus;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.enums.PaymentStatus;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.PaymentTransactionRepository;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final UserRepository userRepository;
    private final String keyId;
    private final String keySecret;

    public PaymentService(
            BookingRepository bookingRepository,
            PaymentTransactionRepository paymentTransactionRepository,
            UserRepository userRepository,
            @Value("${razorpay.key.id:${RAZORPAY_KEY_ID:rzp_test_placeholder}}") String keyId,
            @Value("${razorpay.key.secret:${RAZORPAY_KEY_SECRET:secret_placeholder}}") String keySecret
    ) {
        this.bookingRepository = bookingRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.userRepository = userRepository;
        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(CreatePaymentOrderRequest request, Authentication authentication) {
        String customerEmail = extractEmail(authentication);
        User customer = userRepository.findByEmailAndRole(customerEmail, UserRole.CUSTOMER)
                .orElseThrow(() -> new AccessDeniedException("Customer profile not found for email: " + customerEmail));

        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.bookingId()));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You cannot create a payment order for another customer's booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot create payment order for a cancelled booking.");
        }

        boolean alreadyPaid = paymentTransactionRepository.findByBookingIdAndStatus(booking.getId(), PaymentStatus.CAPTURED).isPresent();
        if (alreadyPaid) {
            throw new IllegalStateException("This booking has already been paid for.");
        }

        BigDecimal amount = booking.getFinalPrice();
        BigDecimal commission = amount.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal vendorAmount = amount.subtract(commission).setScale(2, RoundingMode.HALF_UP);

        String razorpayOrderId = "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        PaymentTransaction transaction = new PaymentTransaction(
                booking,
                amount,
                commission,
                vendorAmount
        );
        transaction.setRazorpayOrderId(razorpayOrderId);
        transaction.setStatus(PaymentStatus.CREATED);

        paymentTransactionRepository.save(transaction);

        long amountInPaise = amount.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValue();

        return new PaymentOrderResponse(
                razorpayOrderId,
                amountInPaise,
                amount,
                "INR",
                keyId,
                booking.getId(),
                booking.getVendor() != null ? booking.getVendor().getBusinessName() : "Marketplace Vendor",
                booking.getService() != null ? booking.getService().getName() : "Marketplace Service",
                customer.getName(),
                customer.getEmail(),
                customer.getPhone()
        );
    }

    @Transactional
    public PaymentResponse verifyPayment(VerifyPaymentRequest request, Authentication authentication) {
        String customerEmail = extractEmail(authentication);
        User customer = userRepository.findByEmailAndRole(customerEmail, UserRole.CUSTOMER)
                .orElseThrow(() -> new AccessDeniedException("Customer profile not found for email: " + customerEmail));

        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.bookingId()));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You cannot verify payment for another customer's booking.");
        }

        PaymentTransaction transaction = paymentTransactionRepository.findByRazorpayOrderId(request.razorpayOrderId())
                .orElseGet(() -> paymentTransactionRepository.findByBookingId(booking.getId())
                        .stream()
                        .filter(t -> request.razorpayOrderId().equals(t.getRazorpayOrderId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for order: " + request.razorpayOrderId())));

        if (transaction.getStatus() == PaymentStatus.CAPTURED) {
            return PaymentResponse.fromEntity(transaction);
        }

        // Verify Razorpay HMAC-SHA256 signature
        boolean isValidSignature = verifySignature(
                request.razorpayOrderId(),
                request.razorpayPaymentId(),
                request.razorpaySignature(),
                this.keySecret
        );

        if (!isValidSignature) {
            transaction.setStatus(PaymentStatus.FAILED);
            paymentTransactionRepository.save(transaction);
            throw new IllegalArgumentException("Invalid Razorpay payment signature.");
        }

        transaction.setStatus(PaymentStatus.CAPTURED);
        transaction.setRazorpayPaymentId(request.razorpayPaymentId());
        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);

        return PaymentResponse.fromEntity(savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getBookingPayments(Long bookingId, Authentication authentication) {
        User user = extractUser(authentication);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
        boolean isVendor = booking.getVendor().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == com.marketplace.backend.enums.UserRole.ADMIN;

        if (!isCustomer && !isVendor && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view payments for this booking.");
        }

        List<PaymentTransaction> transactions = paymentTransactionRepository.findByBookingId(bookingId);
        return transactions.stream().map(PaymentResponse::fromEntity).toList();
    }

    public boolean verifySignature(String orderId, String paymentId, String actualSignature, String secret) {
        if (orderId == null || paymentId == null || actualSignature == null || secret == null) {
            return false;
        }
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = HexFormat.of().formatHex(hash);
            return expectedSignature.equalsIgnoreCase(actualSignature.trim());
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }

    private User extractUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required.");
        }
        if (authentication.getPrincipal() instanceof User user) {
            return user;
        }
        String email = authentication.getName();
        return userRepository.findAllByEmail(email).stream().findFirst()
                .orElseThrow(() -> new AccessDeniedException("User not found: " + email));
    }

    private String extractEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required.");
        }
        if (authentication.getPrincipal() instanceof User user) {
            return user.getEmail();
        }
        return authentication.getName();
    }
}
