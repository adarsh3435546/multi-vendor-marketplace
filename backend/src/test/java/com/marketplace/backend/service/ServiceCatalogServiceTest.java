package com.marketplace.backend.service;

import com.marketplace.backend.dto.service.CreateServiceRequest;
import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.dto.service.UpdateServiceRequest;
import com.marketplace.backend.entity.Service;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Vendor;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.repository.ServiceRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceCatalogServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private ServiceCatalogService serviceCatalogService;

    private User vendorUser;
    private Vendor vendor;
    private Service service;
    private Authentication vendorAuth;

    @BeforeEach
    void setUp() {
        vendorUser = new User("Vendor One", "vendor1@example.com", "password", "123456", UserRole.VENDOR);
        vendorUser.setId(10L);

        vendor = new Vendor(vendorUser, "Vendor One Business", 40.7128, -74.0060);
        vendor.setId(1L);

        service = new Service(vendor, "Plumbing Repair", "Fix pipe leaks", new BigDecimal("50.00"));
        service.setId(100L);

        vendorAuth = new UsernamePasswordAuthenticationToken(vendorUser, null, List.of());
    }

    @Test
    void shouldCreateServiceForAuthenticatedVendor() {
        CreateServiceRequest request = new CreateServiceRequest("Plumbing Repair", "Fix pipe leaks", new BigDecimal("50.00"));

        when(vendorRepository.findByUserEmail("vendor1@example.com")).thenReturn(Optional.of(vendor));
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        ServiceResponse response = serviceCatalogService.createService(request, vendorAuth);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("Plumbing Repair", response.name());
        assertEquals(new BigDecimal("50.00"), response.basePrice());
        assertEquals(1L, response.vendorId());
        assertTrue(response.active());
    }

    @Test
    void shouldThrowAccessDeniedWhenNonVendorAttemptsToCreateService() {
        CreateServiceRequest request = new CreateServiceRequest("Cleaning", "Home cleaning", new BigDecimal("30.00"));
        when(vendorRepository.findByUserEmail("vendor1@example.com")).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> serviceCatalogService.createService(request, vendorAuth));
    }

    @Test
    void shouldReturnActiveServicesPublicly() {
        when(serviceRepository.findByActiveTrue()).thenReturn(List.of(service));

        List<ServiceResponse> results = serviceCatalogService.getActiveServices();

        assertEquals(1, results.size());
        assertEquals("Plumbing Repair", results.get(0).name());
    }

    @Test
    void shouldReturnActiveServiceById() {
        when(serviceRepository.findByIdAndActiveTrue(100L)).thenReturn(Optional.of(service));

        ServiceResponse result = serviceCatalogService.getActiveServiceById(100L);

        assertNotNull(result);
        assertEquals(100L, result.id());
    }

    @Test
    void shouldThrowResourceNotFoundWhenActiveServiceMissing() {
        when(serviceRepository.findByIdAndActiveTrue(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> serviceCatalogService.getActiveServiceById(999L));
    }

    @Test
    void shouldReturnServicesOwnedByVendor() {
        when(vendorRepository.findByUserEmail("vendor1@example.com")).thenReturn(Optional.of(vendor));
        when(serviceRepository.findByVendorId(1L)).thenReturn(List.of(service));

        List<ServiceResponse> results = serviceCatalogService.getMyServices(vendorAuth);

        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).id());
    }

    @Test
    void shouldUpdateServiceWhenOwnedByVendor() {
        UpdateServiceRequest updateRequest = new UpdateServiceRequest("Plumbing Repair Pro", "Updated description", new BigDecimal("75.00"), true);

        when(vendorRepository.findByUserEmail("vendor1@example.com")).thenReturn(Optional.of(vendor));
        when(serviceRepository.findById(100L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        ServiceResponse response = serviceCatalogService.updateService(100L, updateRequest, vendorAuth);

        assertNotNull(response);
        verify(serviceRepository, times(1)).save(service);
    }

    @Test
    void shouldRejectUpdateWhenServiceBelongsToAnotherVendor() {
        User otherVendorUser = new User("Vendor Two", "vendor2@example.com", "password", "654321", UserRole.VENDOR);
        otherVendorUser.setId(20L);
        Vendor otherVendor = new Vendor(otherVendorUser, "Vendor Two Business", null, null);
        otherVendor.setId(2L);

        Service otherService = new Service(otherVendor, "Gardening", "Lawn mowing", new BigDecimal("40.00"));
        otherService.setId(200L);

        UpdateServiceRequest updateRequest = new UpdateServiceRequest("Hacked Gardening", "Illegal edit", new BigDecimal("10.00"), true);

        when(vendorRepository.findByUserEmail("vendor1@example.com")).thenReturn(Optional.of(vendor));
        when(serviceRepository.findById(200L)).thenReturn(Optional.of(otherService));

        assertThrows(AccessDeniedException.class, () -> serviceCatalogService.updateService(200L, updateRequest, vendorAuth));
    }

    @Test
    void shouldDeactivateServiceWhenOwnedByVendor() {
        when(vendorRepository.findByUserEmail("vendor1@example.com")).thenReturn(Optional.of(vendor));
        when(serviceRepository.findById(100L)).thenReturn(Optional.of(service));
        when(serviceRepository.save(any(Service.class))).thenReturn(service);

        ServiceResponse response = serviceCatalogService.deactivateService(100L, vendorAuth);

        assertNotNull(response);
        assertFalse(service.getActive());
        verify(serviceRepository, times(1)).save(service);
    }
}
