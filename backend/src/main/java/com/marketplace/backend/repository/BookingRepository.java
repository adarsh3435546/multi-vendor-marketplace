package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Booking;
import com.marketplace.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Booking> findByVendorId(Long vendorId);

    List<Booking> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    List<Booking> findByStatus(BookingStatus status);

    long countByServiceIdAndStatusNot(Long serviceId, BookingStatus status);

    long countByServiceIdAndStatusIn(Long serviceId, List<BookingStatus> statuses);
}

