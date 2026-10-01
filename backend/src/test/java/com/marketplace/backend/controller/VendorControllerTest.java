package com.marketplace.backend.controller;

import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.dto.vendor.VendorDetailResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
import com.marketplace.backend.exception.ResourceNotFoundException;
import com.marketplace.backend.service.VendorDiscoveryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class VendorControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private VendorDiscoveryService vendorDiscoveryService;

    private MockMvc getMockMvc() {
        return MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void publicCanListAvailableVendorsPaged() throws Exception {
        VendorResponse vendorResponse = new VendorResponse(
                1L, "Jane's Auto Repair", 34.0522, -118.2437, 4.8, true, LocalDateTime.now()
        );
        when(vendorDiscoveryService.getAvailableVendors(any())).thenReturn(
                new PageImpl<>(List.of(vendorResponse), PageRequest.of(0, 10), 1)
        );

        getMockMvc().perform(get("/api/vendors?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].businessName").value("Jane's Auto Repair"))
                .andExpect(jsonPath("$.content[0].rating").value(4.8));
    }

    @Test
    void publicCanGetVendorById() throws Exception {
        VendorDetailResponse detailResponse = new VendorDetailResponse(
                1L, "Jane's Auto Repair", 34.0522, -118.2437, 4.8, true, LocalDateTime.now(), List.of()
        );
        when(vendorDiscoveryService.getVendorById(1L)).thenReturn(detailResponse);

        getMockMvc().perform(get("/api/vendors/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.businessName").value("Jane's Auto Repair"));
    }

    @Test
    void shouldReturn404WhenVendorNotFound() throws Exception {
        when(vendorDiscoveryService.getVendorById(999L))
                .thenThrow(new ResourceNotFoundException("Available vendor not found with ID: 999"));

        getMockMvc().perform(get("/api/vendors/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void publicCanGetVendorActiveServices() throws Exception {
        ServiceResponse serviceResponse = new ServiceResponse(
                101L, 1L, "Jane's Auto Repair", "Brake Inspection", "Full brake check", new BigDecimal("49.99"), true, LocalDateTime.now()
        );
        when(vendorDiscoveryService.getVendorActiveServices(1L)).thenReturn(List.of(serviceResponse));

        getMockMvc().perform(get("/api/vendors/1/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Brake Inspection"));
    }
}
