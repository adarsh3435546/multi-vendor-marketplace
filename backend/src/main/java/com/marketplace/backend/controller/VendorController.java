package com.marketplace.backend.controller;

import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.dto.vendor.VendorDetailResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
import com.marketplace.backend.service.VendorDiscoveryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorDiscoveryService vendorDiscoveryService;

    public VendorController(VendorDiscoveryService vendorDiscoveryService) {
        this.vendorDiscoveryService = vendorDiscoveryService;
    }

    @GetMapping
    public ResponseEntity<Page<VendorResponse>> getAvailableVendors(
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<VendorResponse> vendors = vendorDiscoveryService.getAvailableVendors(pageable);
        return ResponseEntity.ok(vendors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorDetailResponse> getVendorById(@PathVariable Long id) {
        VendorDetailResponse vendor = vendorDiscoveryService.getVendorById(id);
        return ResponseEntity.ok(vendor);
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<List<ServiceResponse>> getVendorServices(@PathVariable Long id) {
        List<ServiceResponse> services = vendorDiscoveryService.getVendorActiveServices(id);
        return ResponseEntity.ok(services);
    }
}
