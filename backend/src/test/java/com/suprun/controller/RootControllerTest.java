package com.suprun.controller;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.head;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RootControllerTest {

    @Test
    void getRootReturnsOk() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new RootController()).build();
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void headRootReturnsOk() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new RootController()).build();
        mockMvc.perform(head("/"))
                .andExpect(status().isOk());
    }
}
