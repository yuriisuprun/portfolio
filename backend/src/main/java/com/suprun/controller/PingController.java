package com.suprun.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PingController {

    @GetMapping("/internal/ping")
    ResponseEntity<Void> ping() {
        return ResponseEntity.noContent().build();
    }
}