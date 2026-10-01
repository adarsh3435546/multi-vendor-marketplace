package com.marketplace.backend.service;

import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.dto.booking.CreateBookingRequest;
import com.marketplace.backend.dto.pricing.StoredQuote;
import com.marketplace.backend.entity.Booking;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.ServiceRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ServiceRepository serviceRepository;
    private final PricingService pricingService;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            VendorRepository vendorRepository,
            ServiceRepository serviceRepository,
            PricingService pricingService
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.serviceRepository = serviceRepository;
        this.pricingService = pricingService;
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication is required to create a booking.");
        }

        String customerEmail;
        if (authentication.getPrincipal() instanceof User user) {
            customerEmail = user.getEmail();
        } else {
            customerEmail = authentication.getName();
        }

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new AccessDeniedException("Customer profile not found for email: " + customerEmail));

        // Atomically validate and consume the quote
        StoredQuote quote = pricingService.consumeQuote(request.quoteId(), customerEmail);

        // Revalidate service and vendor availability
        Service service = serviceRepository.findByIdAndActiveTrue(quote.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("The requested service is no longer active."));

        Vendor vendor = vendorRepository.findByIdAndAvailableTrue(quote.vendorId())
                .orElseThrow(() -> new ResourceNotFoundException("The assigned vendor is no longer available."));

        Booking booking = new Booking(
                customer,
                vendor,
                service,
                quote.scheduledAt(),
                quote.basePrice(),
                quote.finalPrice()
        );

        Booking savedBooking = bookingRepository.save(booking);

        return BookingResponse.fromEntity(savedBooking);
    }
}
