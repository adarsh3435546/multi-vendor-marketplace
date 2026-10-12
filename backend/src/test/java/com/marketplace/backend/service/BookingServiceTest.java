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
import com.marketplace.backend.enums.UrgencyLevel;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.BookingRepository;
import com.marketplace.backend.repository.ServiceRepository;
import com.marketplace.backend.repository.UserRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private PricingService pricingService;

    @InjectMocks
    private BookingService bookingService;

    private User customer;
    private Vendor vendor;
    private Service service;
    private StoredQuote storedQuote;
    private UUID quoteId;
    private Authentication customerAuth;

    @BeforeEach
    void setUp() {
        customer = new User("Alice", "alice@example.com", "pass", "123", UserRole.CUSTOMER);
        customer.setId(1L);

        User vendorUser = new User("Bob", "bob@example.com", "pass", "456", UserRole.VENDOR);
        vendorUser.setId(2L);
        vendor = new Vendor(vendorUser, "Bob Plumbing", 12.0, 77.0);
        vendor.setId(10L);
        vendor.setAvailable(true);

        service = new Service(vendor, "Plumbing", "Fix leaks", new BigDecimal("500.00"));
        service.setId(100L);

        quoteId = UUID.randomUUID();
        storedQuote = new StoredQuote(
                quoteId,
                "alice@example.com",
                100L,
                10L,
                new BigDecimal("500.00"),
                new BigDecimal("1.00"),
                new BigDecimal("1.25"),
                new BigDecimal("625.00"),
                "INR",
                LocalDateTime.now().plusDays(1),
                UrgencyLevel.SAME_DAY,
                LocalDateTime.now(),
                LocalDateTime.now().plusMinutes(15),
                new AtomicBoolean(false)
        );

        customerAuth = new UsernamePasswordAuthenticationToken(customer, null, List.of());
    }

    @Test
    void shouldCreateBookingWithValidQuote() {
        CreateBookingRequest request = new CreateBookingRequest(quoteId);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(pricingService.consumeQuote(quoteId, "alice@example.com")).thenReturn(storedQuote);
        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(service));
        when(vendorRepository.findByIdAndAvailableTrue(10L)).thenReturn(Optional.of(vendor));

        Booking booking = new Booking(customer, vendor, service, storedQuote.scheduledAt(), storedQuote.basePrice(), storedQuote.finalPrice());
        booking.setId(1001L);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        BookingResponse response = bookingService.createBooking(request, customerAuth);

        assertNotNull(response);
        assertEquals(1001L, response.id());
        assertEquals(1L, response.customerId());
        assertEquals(10L, response.vendorId());
        assertEquals(100L, response.serviceId());
        assertEquals(new BigDecimal("500.00"), response.basePrice());
        assertEquals(new BigDecimal("625.00"), response.finalPrice());
        assertEquals(BookingStatus.PENDING, response.status());
    }

    @Test
    void shouldRejectBookingWhenQuoteIsInvalidOrExpired() {
        CreateBookingRequest request = new CreateBookingRequest(quoteId);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(pricingService.consumeQuote(quoteId, "alice@example.com"))
                .thenThrow(new IllegalArgumentException("Quote has expired."));

        assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(request, customerAuth));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void shouldRejectBookingWhenServiceIsNoLongerActive() {
        CreateBookingRequest request = new CreateBookingRequest(quoteId);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(pricingService.consumeQuote(quoteId, "alice@example.com")).thenReturn(storedQuote);
        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.createBooking(request, customerAuth));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void shouldRejectBookingWhenVendorIsNoLongerAvailable() {
        CreateBookingRequest request = new CreateBookingRequest(quoteId);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(pricingService.consumeQuote(quoteId, "alice@example.com")).thenReturn(storedQuote);
        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(service));
        when(vendorRepository.findByIdAndAvailableTrue(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.createBooking(request, customerAuth));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void shouldGetMyBookings() {
        Booking booking = new Booking(customer, vendor, service, LocalDateTime.now().plusDays(1), new BigDecimal("500.00"), new BigDecimal("500.00"));
        booking.setId(101L);

        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        when(bookingRepository.findByCustomerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(booking));

        List<BookingResponse> responses = bookingService.getMyBookings(customerAuth);

        assertEquals(1, responses.size());
        assertEquals(101L, responses.getFirst().id());
    }

    @Test
    void shouldConfirmBookingAndGenerateOtp() {
        Authentication vendorAuth = new UsernamePasswordAuthenticationToken(vendor.getUser(), null, List.of());
        Booking booking = new Booking(customer, vendor, service, LocalDateTime.now().plusDays(1), new BigDecimal("500.00"), new BigDecimal("500.00"));
        booking.setId(201L);
        booking.setStatus(BookingStatus.PENDING);

        when(vendorRepository.findByUserEmail("bob@example.com")).thenReturn(Optional.of(vendor));
        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.confirmBooking(201L, vendorAuth);

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.status());
        assertNotNull(booking.getCompletionOtpHash());
    }

    @Test
    void shouldCompleteBookingWithValidOtp() {
        Authentication vendorAuth = new UsernamePasswordAuthenticationToken(vendor.getUser(), null, List.of());
        Booking booking = new Booking(customer, vendor, service, LocalDateTime.now().plusDays(1), new BigDecimal("500.00"), new BigDecimal("500.00"));
        booking.setId(201L);
        booking.setStatus(BookingStatus.PENDING);

        when(vendorRepository.findByUserEmail("bob@example.com")).thenReturn(Optional.of(vendor));
        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Confirm to set up OTP
        bookingService.confirmBooking(201L, vendorAuth);

        // Get OTP as customer
        when(userRepository.findByEmailAndRole("alice@example.com", UserRole.CUSTOMER)).thenReturn(Optional.of(customer));
        OtpResponse otpResponse = bookingService.getBookingOtp(201L, customerAuth);
        assertNotNull(otpResponse.otp());

        // Complete as vendor
        BookingResponse completed = bookingService.completeBooking(201L, otpResponse.otp(), vendorAuth);
        assertEquals(BookingStatus.COMPLETED, completed.status());
    }

    @Test
    void shouldRejectCompleteBookingWithInvalidOtp() {
        Authentication vendorAuth = new UsernamePasswordAuthenticationToken(vendor.getUser(), null, List.of());
        Booking booking = new Booking(customer, vendor, service, LocalDateTime.now().plusDays(1), new BigDecimal("500.00"), new BigDecimal("500.00"));
        booking.setId(201L);
        booking.setStatus(BookingStatus.PENDING);

        when(vendorRepository.findByUserEmail("bob@example.com")).thenReturn(Optional.of(vendor));
        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.confirmBooking(201L, vendorAuth);

        assertThrows(IllegalArgumentException.class, () -> bookingService.completeBooking(201L, "999999", vendorAuth));
    }

    @Test
    void shouldCancelBookingSuccessfully() {
        Booking booking = new Booking(customer, vendor, service, LocalDateTime.now().plusDays(1), new BigDecimal("500.00"), new BigDecimal("500.00"));
        booking.setId(201L);
        booking.setStatus(BookingStatus.PENDING);

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(201L, customerAuth);
        assertEquals(BookingStatus.CANCELLED, response.status());
    }

    @Test
    void shouldNotAllowCancellingCompletedBooking() {
        Booking booking = new Booking(customer, vendor, service, LocalDateTime.now().plusDays(1), new BigDecimal("500.00"), new BigDecimal("500.00"));
        booking.setId(201L);
        booking.setStatus(BookingStatus.COMPLETED);

        when(bookingRepository.findById(201L)).thenReturn(Optional.of(booking));

        assertThrows(IllegalStateException.class, () -> bookingService.cancelBooking(201L, customerAuth));
    }
}
