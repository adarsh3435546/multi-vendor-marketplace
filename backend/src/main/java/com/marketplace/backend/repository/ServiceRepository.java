package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByVendorIdAndActiveTrue(Long vendorId);

    List<Service> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}
