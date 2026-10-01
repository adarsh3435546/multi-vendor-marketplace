package com.marketplace.backend.controller;

import com.marketplace.backend.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class AuthorizationTestControllerTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc getMockMvc() {
        return MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void unauthenticatedRequestShouldReturn401() throws Exception {
        getMockMvc().perform(get("/api/test/authenticated"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCanAccessCustomerEndpoint() throws Exception {
        getMockMvc().perform(get("/api/test/customer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Access granted to CUSTOMER role."));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCannotAccessVendorEndpoint() throws Exception {
        getMockMvc().perform(get("/api/test/vendor"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @WithMockUser(username = "customer@example.com", roles = {"CUSTOMER"})
    void customerCannotAccessAdminEndpoint() throws Exception {
        getMockMvc().perform(get("/api/test/admin"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    @WithMockUser(username = "vendor@example.com", roles = {"VENDOR"})
    void vendorCanAccessVendorEndpoint() throws Exception {
        getMockMvc().perform(get("/api/test/vendor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Access granted to VENDOR role."));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void adminCanAccessAdminEndpoint() throws Exception {
        getMockMvc().perform(get("/api/test/admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Access granted to ADMIN role."));
    }
}
