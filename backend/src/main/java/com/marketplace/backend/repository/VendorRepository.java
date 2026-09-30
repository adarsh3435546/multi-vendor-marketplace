package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    List<Vendor> findByAvailableTrue();

    List<Vendor> findByAvailableTrueAndRatingGreaterThanEqual(Double rating);
}
