package com.marketplace.backend.controller;

import com.marketplace.backend.dto.service.ServiceResponse;
import com.marketplace.backend.service.ServiceCatalogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class ServiceControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private ServiceCatalogService serviceCatalogService;

    private MockMvc getMockMvc() {
        return MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void publicCanListActiveServices() throws Exception {
        ServiceResponse response = new ServiceResponse(
                1L, 10L, "Acme Services", "AC Repair", "Fix AC", new BigDecimal("100.00"), true, LocalDateTime.now()
        );
        when(serviceCatalogService.getActiveServices()).thenReturn(List.of(response));

        getMockMvc().perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("AC Repair"));
    }

    @Test
    void publicCanGetActiveServiceById() throws Exception {
        ServiceResponse response = new ServiceResponse(
                1L, 10L, "Acme Services", "AC Repair", "Fix AC", new BigDecimal("100.00"), true, LocalDateTime.now()
        );
        when(serviceCatalogService.getActiveServiceById(1L)).thenReturn(response);

        getMockMvc().perform(get("/api/services/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("AC Repair"));
    }

    @Test
    void unauthenticatedUserCannotCreateService() throws Exception {
        getMockMvc().perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"AC Repair\",\"description\":\"Fix AC\",\"basePrice\":100.00}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCannotCreateService() throws Exception {
        getMockMvc().perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"AC Repair\",\"description\":\"Fix AC\",\"basePrice\":100.00}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "vendor@example.com", roles = {"VENDOR"})
    void vendorCanCreateService() throws Exception {
        ServiceResponse response = new ServiceResponse(
                1L, 10L, "Acme Services", "AC Repair", "Fix AC", new BigDecimal("100.00"), true, LocalDateTime.now()
        );
        when(serviceCatalogService.createService(any(), any())).thenReturn(response);

        getMockMvc().perform(post("/api/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"AC Repair\",\"description\":\"Fix AC\",\"basePrice\":100.00}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("AC Repair"));
    }
}
