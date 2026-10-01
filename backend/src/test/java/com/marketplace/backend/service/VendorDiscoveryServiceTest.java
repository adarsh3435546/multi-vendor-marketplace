package com.marketplace.backend.service;

import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.dto.vendor.VendorDetailResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VendorDiscoveryServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private VendorDiscoveryService vendorDiscoveryService;

    private Vendor availableVendor;
    private Service activeService;

    @BeforeEach
    void setUp() {
        User user = new User("Jane Vendor", "jane@example.com", "hash", "123456", UserRole.VENDOR);
        user.setId(5L);

        availableVendor = new Vendor(user, "Jane's Auto Repair", 34.0522, -118.2437);
        availableVendor.setId(10L);
        availableVendor.setRating(4.8);
        availableVendor.setAvailable(true);

        activeService = new Service(availableVendor, "Brake Inspection", "Full brake check", new BigDecimal("49.99"));
        activeService.setId(101L);
    }

    @Test
    void shouldReturnPagedAvailableVendors() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Vendor> vendorPage = new PageImpl<>(List.of(availableVendor), pageable, 1);

        when(vendorRepository.findByAvailableTrue(any(Pageable.class))).thenReturn(vendorPage);

        Page<VendorResponse> result = vendorDiscoveryService.getAvailableVendors(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Jane's Auto Repair", result.getContent().get(0).businessName());
        assertEquals(4.8, result.getContent().get(0).rating());
    }

    @Test
    void shouldReturnVendorDetailById() {
        when(vendorRepository.findByIdAndAvailableTrue(10L)).thenReturn(Optional.of(availableVendor));
        when(serviceRepository.findByVendorIdAndActiveTrue(10L)).thenReturn(List.of(activeService));

        VendorDetailResponse response = vendorDiscoveryService.getVendorById(10L);

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals("Jane's Auto Repair", response.businessName());
        assertEquals(1, response.services().size());
        assertEquals("Brake Inspection", response.services().get(0).name());
    }

    @Test
    void shouldThrowNotFoundWhenVendorDoesNotExistOrIsUnavailable() {
        when(vendorRepository.findByIdAndAvailableTrue(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vendorDiscoveryService.getVendorById(999L));
    }

    @Test
    void shouldReturnActiveServicesForVendor() {
        when(vendorRepository.findByIdAndAvailableTrue(10L)).thenReturn(Optional.of(availableVendor));
        when(serviceRepository.findByVendorIdAndActiveTrue(10L)).thenReturn(List.of(activeService));

        List<ServiceResponse> services = vendorDiscoveryService.getVendorActiveServices(10L);

        assertEquals(1, services.size());
        assertEquals("Brake Inspection", services.get(0).name());
    }
}
