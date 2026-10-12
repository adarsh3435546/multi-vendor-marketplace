package com.marketplace.backend.repository;

import com.marketplace.backend.entity.PaymentTransaction;
import com.marketplace.backend.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    List<PaymentTransaction> findByBookingId(Long bookingId);

    Optional<PaymentTransaction> findByRazorpayOrderId(String razorpayOrderId);

    Optional<PaymentTransaction> findByBookingIdAndStatus(Long bookingId, PaymentStatus status);

    List<PaymentTransaction> findAllByOrderByCreatedAtDesc();
}

