package com.suprun.controller;

import com.suprun.dto.ContactRequest;
import com.suprun.service.ContactService;
import com.suprun.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:3000", "https://yuriisuprun.vercel.app"})
public class ContactController {

    private final ContactService contactService;
    private final RateLimitService rateLimitService;

    public ContactController(
            ContactService contactService,
            RateLimitService rateLimitService
    ) {
        this.contactService = contactService;
        this.rateLimitService = rateLimitService;
    }

    @PostMapping
    public ResponseEntity<?> sendContact(
            @Valid @RequestBody ContactRequest request,
            HttpServletRequest httpRequest
    ) {

        // Honeypot check
        if (request.getWebsite() != null && !request.getWebsite().isBlank()) {
            return ResponseEntity.status(400).body("Bot detected");
        }

        // Rate limit by IP
        String ip = httpRequest.getRemoteAddr();
        if (!rateLimitService.allow(ip)) {
            return ResponseEntity.status(429).body("Too many requests");
        }

        contactService.processContact(request);

        return ResponseEntity.ok().build();
    }
}
