package com.marketplace.backend.service;

import com.marketplace.backend.dto.service.CreateServiceRequest;
import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.dto.service.UpdateServiceRequest;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.ServiceRepository;
import com.marketplace.backend.repository.VendorRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
public class ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final VendorRepository vendorRepository;

    public ServiceCatalogService(ServiceRepository serviceRepository, VendorRepository vendorRepository) {
        this.serviceRepository = serviceRepository;
        this.vendorRepository = vendorRepository;
    }

    public Vendor resolveVendor(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required.");
        }
        String email;
        if (authentication.getPrincipal() instanceof User user) {
            email = user.getEmail();
        } else {
            email = authentication.getName();
        }
        return vendorRepository.findByUserEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user is not registered as a vendor."));
    }

    @Transactional
    public ServiceResponse createService(CreateServiceRequest request, Authentication authentication) {
        Vendor vendor = resolveVendor(authentication);

        String trimmedName = request.name().trim();
        String description = request.description() != null ? request.description().trim() : null;

        Service service = new Service(vendor, trimmedName, description, request.basePrice());
        Service saved = serviceRepository.save(service);

        return ServiceResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getActiveServices() {
        return serviceRepository.findByActiveTrue()
                .stream()
                .map(ServiceResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getActiveServiceById(Long id) {
        Service service = serviceRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Active service not found with ID: " + id));
        return ServiceResponse.fromEntity(service);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> getMyServices(Authentication authentication) {
        Vendor vendor = resolveVendor(authentication);
        return serviceRepository.findByVendorId(vendor.getId())
                .stream()
                .map(ServiceResponse::fromEntity)
                .toList();
    }

    @Transactional
    public ServiceResponse updateService(Long id, UpdateServiceRequest request, Authentication authentication) {
        Vendor vendor = resolveVendor(authentication);

        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));

        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this service.");
        }

        service.setName(request.name().trim());
        if (request.description() != null) {
            service.setDescription(request.description().trim());
        }
        service.setBasePrice(request.basePrice());
        if (request.active() != null) {
            service.setActive(request.active());
        }

        Service updated = serviceRepository.save(service);
        return ServiceResponse.fromEntity(updated);
    }

    @Transactional
    public ServiceResponse deactivateService(Long id, Authentication authentication) {
        Vendor vendor = resolveVendor(authentication);

        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));

        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new AccessDeniedException("You do not have permission to modify this service.");
        }

        service.setActive(false);
        Service updated = serviceRepository.save(service);
        return ServiceResponse.fromEntity(updated);
    }
}
