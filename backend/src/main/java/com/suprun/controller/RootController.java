package com.suprun.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
class RootController {

    /**
     * Render (and some uptime monitors) probe the service with GET/HEAD "/".
     * Provide a cheap 200 response to avoid noisy 500s from the global exception handler.
     */
    @GetMapping(value = {"/", "/health"}, produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}

