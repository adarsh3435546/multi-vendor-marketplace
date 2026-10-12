package com.marketplace.backend.service;

import com.marketplace.backend.dto.booking.BookingResponse;
import com.marketplace.backend.dto.booking.CreateBookingRequest;
import com.marketplace.backend.dto.booking.OtpResponse;
import com.marketplace.backend.dto.pricing.StoredQuote;
import com.marketplace.backend.entity.Booking;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.enums.BookingStatus;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.ServiceRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@org.springframework.stereotype.Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ServiceRepository serviceRepository;
    private final PricingService pricingService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentMap<Long, String> otpStore = new ConcurrentHashMap<>();

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            VendorRepository vendorRepository,
            ServiceRepository serviceRepository,
            PricingService pricingService
    ) {
        this(bookingRepository, userRepository, vendorRepository, serviceRepository, pricingService, new BCryptPasswordEncoder());
    }

    @org.springframework.beans.factory.annotation.Autowired
    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            VendorRepository vendorRepository,
            ServiceRepository serviceRepository,
            PricingService pricingService,
            PasswordEncoder passwordEncoder
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.serviceRepository = serviceRepository;
        this.pricingService = pricingService;
        this.passwordEncoder = passwordEncoder != null ? passwordEncoder : new BCryptPasswordEncoder();
    }

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Authentication authentication) {
        String customerEmail = extractEmail(authentication);

        User customer = userRepository.findByEmailAndRole(customerEmail, UserRole.CUSTOMER)
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

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        String email = extractEmail(authentication);
        User customer = userRepository.findByEmailAndRole(email, UserRole.CUSTOMER)
                .orElseThrow(() -> new AccessDeniedException("Customer not found: " + email));

        List<Booking> bookings = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId());
        return bookings.stream()
                .map(b -> {
                    String otp = (b.getStatus() == BookingStatus.CONFIRMED) ? otpStore.get(b.getId()) : null;
                    return BookingResponse.fromEntity(b, otp);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, Authentication authentication) {
        User user = extractUser(authentication);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
        boolean isVendor = booking.getVendor().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isCustomer && !isVendor && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to view this booking.");
        }

        String otp = (isCustomer && booking.getStatus() == BookingStatus.CONFIRMED) ? otpStore.get(booking.getId()) : null;
        return BookingResponse.fromEntity(booking, otp);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getVendorBookings(Authentication authentication) {
        String email = extractEmail(authentication);
        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Vendor profile not found for authenticated user."));

        List<Booking> bookings = bookingRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());
        return bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();
    }

    @Transactional
    public BookingResponse confirmBooking(Long id, Authentication authentication) {
        String email = extractEmail(authentication);
        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Vendor profile not found for authenticated user."));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("You can only confirm bookings assigned to your vendor account.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be confirmed. Current status: " + booking.getStatus());
        }

        // Generate secure 6-digit OTP for completion
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
        String hashedOtp = passwordEncoder.encode(otp);

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCompletionOtpHash(hashedOtp);
        Booking savedBooking = bookingRepository.save(booking);

        // Store plain OTP in memory for customer retrieval
        otpStore.put(savedBooking.getId(), otp);

        return BookingResponse.fromEntity(savedBooking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, Authentication authentication) {
        User user = extractUser(authentication);

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        boolean isCustomer = booking.getCustomer().getId().equals(user.getId());
        boolean isVendor = booking.getVendor().getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isCustomer && !isVendor && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Completed bookings cannot be cancelled.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        otpStore.remove(booking.getId());
        Booking savedBooking = bookingRepository.save(booking);

        return BookingResponse.fromEntity(savedBooking);
    }

    @Transactional
    public BookingResponse completeBooking(Long id, String otp, Authentication authentication) {
        String email = extractEmail(authentication);
        Vendor vendor = vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Vendor profile not found for authenticated user."));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("You can only complete bookings assigned to your vendor account.");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Only CONFIRMED bookings can be completed. Current status: " + booking.getStatus());
        }

        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("Completion OTP is required.");
        }

        String hash = booking.getCompletionOtpHash();
        if (hash == null || !passwordEncoder.matches(otp.trim(), hash)) {
            throw new IllegalArgumentException("Invalid completion OTP provided.");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        otpStore.remove(booking.getId());
        Booking savedBooking = bookingRepository.save(booking);

        return BookingResponse.fromEntity(savedBooking);
    }

    @Transactional(readOnly = true)
    public OtpResponse getBookingOtp(Long id, Authentication authentication) {
        String email = extractEmail(authentication);
        User customer = userRepository.findByEmailAndRole(email, UserRole.CUSTOMER)
                .orElseThrow(() -> new AccessDeniedException("Customer not found: " + email));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new AccessDeniedException("You can only view OTP for your own bookings.");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("OTP is only available for CONFIRMED bookings.");
        }

        String otp = otpStore.get(booking.getId());
        if (otp == null) {
            throw new ResourceNotFoundException("OTP is not available or has expired. Please contact support.");
        }

        return new OtpResponse(booking.getId(), otp, "Share this OTP with the vendor upon service completion.");
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

