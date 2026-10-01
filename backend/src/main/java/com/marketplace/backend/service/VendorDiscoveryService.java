package com.marketplace.backend.service;

import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.dto.vendor.VendorDetailResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.ServiceRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendorDiscoveryService {

    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int MAX_PAGE_SIZE = 50;

    private final VendorRepository vendorRepository;
    private final ServiceRepository serviceRepository;

    public VendorDiscoveryService(VendorRepository vendorRepository, ServiceRepository serviceRepository) {
        this.vendorRepository = vendorRepository;
        this.serviceRepository = serviceRepository;
    }

    @Transactional(readOnly = true)
    public Page<VendorResponse> getAvailableVendors(Pageable pageable) {
        int pageSize = pageable.isPaged() ? Math.min(pageable.getPageSize(), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
        int pageNumber = pageable.isPaged() ? Math.max(pageable.getPageNumber(), 0) : 0;

        Pageable boundedPageable = PageRequest.of(pageNumber, pageSize, pageable.getSort());
        return vendorRepository.findByAvailableTrue(boundedPageable)
                .map(VendorResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public VendorDetailResponse getVendorById(Long id) {
        Vendor vendor = vendorRepository.findByIdAndAvailableTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Available vendor not found with ID: " + id));

        List<ServiceResponse> activeServices = serviceRepository.findByVendorIdAndActiveTrue(id)
                .stream()
                .map(ServiceResponse::fromEntity)
                .toList();

        return VendorDetailResponse.fromEntity(vendor, activeServices);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getVendorActiveServices(Long id) {
        // Ensure vendor exists and is available
        if (vendorRepository.findByIdAndAvailableTrue(id).isEmpty()) {
            throw new ResourceNotFoundException("Available vendor not found with ID: " + id);
        }

        return serviceRepository.findByVendorIdAndActiveTrue(id)
                .stream()
                .map(ServiceResponse::fromEntity)
                .toList();
    }
}
