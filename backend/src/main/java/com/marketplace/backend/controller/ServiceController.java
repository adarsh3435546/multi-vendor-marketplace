package com.marketplace.backend.controller;

import com.marketplace.backend.dto.service.CreateServiceRequest;
import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.dto.service.UpdateServiceRequest;
import com.marketplace.backend.service.ServiceCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceCatalogService serviceCatalogService;

    public ServiceController(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ServiceResponse> createService(
            @Valid @RequestBody CreateServiceRequest request,
            Authentication authentication
    ) {
        ServiceResponse response = serviceCatalogService.createService(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getActiveServices() {
        List<ServiceResponse> services = serviceCatalogService.getActiveServices();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<ServiceResponse>> getMyServices(Authentication authentication) {
        List<ServiceResponse> services = serviceCatalogService.getMyServices(authentication);
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getActiveServiceById(@PathVariable Long id) {
        ServiceResponse service = serviceCatalogService.getActiveServiceById(id);
        return ResponseEntity.ok(service);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceRequest request,
            Authentication authentication
    ) {
        ServiceResponse response = serviceCatalogService.updateService(id, request, authentication);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ServiceResponse> deactivateService(
            @PathVariable Long id,
            Authentication authentication
    ) {
        ServiceResponse response = serviceCatalogService.deactivateService(id, authentication);
        return ResponseEntity.ok(response);
    }
}
