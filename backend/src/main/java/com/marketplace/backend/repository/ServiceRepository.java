package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByActiveTrue();

    Optional<Service> findByIdAndActiveTrue(Long id);

    List<Service> findByVendorId(Long vendorId);

    Optional<Service> findByIdAndVendorId(Long id, Long vendorId);

    List<Service> findByVendorIdAndActiveTrue(Long vendorId);

    List<Service> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}
