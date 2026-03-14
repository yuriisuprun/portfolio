package com.suprun.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @PostMapping
    public ResponseEntity<?> sendContact(@RequestBody Map<String, String> body) {

        String name = body.get("name");
        String email = body.get("email");
        String message = body.get("message");
        String website = body.get("website"); // Honeypot

        // Honeypot check: ignore bots
        if (website != null && !website.isEmpty()) {
            return ResponseEntity.ok().build();
        }

        // Validate required fields
        if (name == null || name.isEmpty() ||
                email == null || email.isEmpty() ||
                message == null || message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields required"));
        }

        // Log message (replace with email or DB logic)
        System.out.println("Contact submission: " + name + ", " + email + ", " + message);

        return ResponseEntity.ok(Map.of("success", true));
    }
}
