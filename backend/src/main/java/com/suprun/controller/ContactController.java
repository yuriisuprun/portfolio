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

        // Honeypot check to block bots
        if (request.getWebsite() != null && !request.getWebsite().isEmpty()) {
            return ResponseEntity.ok().build();
        }

        // Validate required fields
        if (request.getName() == null || request.getName().isEmpty() ||
                request.getEmail() == null || request.getEmail().isEmpty() ||
                request.getMessage() == null || request.getMessage().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", "All fields required"));
        }

        try {
            // Send the email
            contactService.processContact(request);

            // Respond success
            return ResponseEntity.ok(java.util.Map.of("success", true));
        } catch (Exception e) {
            // Log and respond with error
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Map.of("error", "Server error"));
        }
    }
}
