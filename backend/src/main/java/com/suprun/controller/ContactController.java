package com.suprun.controller;

import com.suprun.dto.ContactRequest;
import com.suprun.service.ContactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<?> sendContact(@RequestBody ContactRequest request) {

        // Honeypot bot protection
        if (request.getWebsite() != null && !request.getWebsite().isEmpty()) {
            return ResponseEntity.ok().build();
        }

        // Validate fields
        if (request.getName() == null || request.getName().isEmpty() ||
                request.getEmail() == null || request.getEmail().isEmpty() ||
                request.getMessage() == null || request.getMessage().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "All fields required"));
        }

        try {

            contactService.processContact(request);

            return ResponseEntity.ok(
                    java.util.Map.of("success", true)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Server error"));
        }
    }
}