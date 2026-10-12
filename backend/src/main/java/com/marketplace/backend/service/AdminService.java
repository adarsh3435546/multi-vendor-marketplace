package com.marketplace.backend.service;

import com.marketplace.backend.dto.admin.AdminUserResponse;
import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.dto.payment.PaymentResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.PaymentTransactionRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    public AdminService(
            UserRepository userRepository,
            VendorRepository vendorRepository,
            BookingRepository bookingRepository,
            PaymentTransactionRepository paymentTransactionRepository
    ) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.bookingRepository = bookingRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(AdminUserResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VendorResponse> getAllVendors() {
        return vendorRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(VendorResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentTransactionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(PaymentResponse::fromEntity)
                .toList();
    }

    @Transactional
    public VendorResponse updateVendorAvailability(Long vendorId, Boolean available) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + vendorId));

        vendor.setAvailable(Boolean.TRUE.equals(available));
        Vendor saved = vendorRepository.save(vendor);
        return VendorResponse.fromEntity(saved);
    }
}
