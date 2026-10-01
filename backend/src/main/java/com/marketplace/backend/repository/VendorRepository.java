package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByAvailableTrue();

    Page<Vendor> findByAvailableTrue(Pageable pageable);

    Optional<Vendor> findByIdAndAvailableTrue(Long id);

    List<Vendor> findByAvailableTrueAndRatingGreaterThanEqual(Double rating);

    Optional<Vendor> findByUserId(Long userId);

    Optional<Vendor> findByUserEmail(String email);
}
