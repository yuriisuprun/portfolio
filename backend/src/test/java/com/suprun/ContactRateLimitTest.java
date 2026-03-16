package com.suprun;

import com.suprun.service.ContactService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.rate-limit.contact.enabled=true",
        "app.rate-limit.contact.limit=2",
        "app.rate-limit.contact.window-seconds=60"
})
@AutoConfigureMockMvc
class ContactRateLimitTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ContactService contactService;

    @Test
    void contactEndpointIsRateLimitedPerClientIp() throws Exception {
        String body = "{\"name\":\"Yurii\",\"email\":\"yurii@example.com\",\"message\":\"Hello\",\"website\":\"\"}";

        for (int i = 0; i < 2; i++) {
            mockMvc.perform(post("/api/contact")
                            .contentType(MediaType.APPLICATION_JSON)
                            .header("X-Forwarded-For", "203.0.113.10")
                            .content(body))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Forwarded-For", "203.0.113.10")
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));

        // Different client IP gets its own window/counter.
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Forwarded-For", "203.0.113.11")
                        .content(body))
                .andExpect(status().isOk());
    }
}

