package com.marketplace.backend.controller;

import com.marketplace.backend.dto.admin.AdminUserResponse;
import com.marketplace.backend.dto.vendor.VendorResponse;
import com.marketplace.backend.enums.UserRole;
import com.marketplace.backend.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class AdminControllerTest {

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private AdminService adminService;

    private MockMvc getMockMvc() {
        return MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void adminCanGetAllUsers() throws Exception {
        AdminUserResponse user = new AdminUserResponse(1L, "Test Admin", "admin@example.com", "123", UserRole.ADMIN, LocalDateTime.now());
        when(adminService.getAllUsers()).thenReturn(List.of(user));

        getMockMvc().perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@example.com"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCannotAccessAdminUsers() throws Exception {
        getMockMvc().perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void adminCanUpdateVendorAvailability() throws Exception {
        VendorResponse vendor = new VendorResponse(10L, "Shop", 12.0, 77.0, 4.5, false, LocalDateTime.now());
        when(adminService.updateVendorAvailability(10L, false)).thenReturn(vendor);

        getMockMvc().perform(patch("/api/admin/vendors/10/availability")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"available\": false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }
}
