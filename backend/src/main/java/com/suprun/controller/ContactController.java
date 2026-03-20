package com.suprun.controller;

import com.suprun.dto.ContactRequest;
import com.suprun.service.ContactService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final ContactService contactService;

    private static final Map<String, Object> SUCCESS_BODY = Map.of("success", true);
    private static final String ERROR_ALL_FIELDS_REQUIRED = "All fields required";
    private static final String ERROR_INVALID_REQUEST = "Invalid request data";
    private static final String ERROR_SERVER = "Server error";

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping
    public ResponseEntity<Map<String, ?>> sendContact(@Valid @RequestBody ContactRequest request, BindingResult bindingResult) {

        if (StringUtils.hasText(request.getWebsite())) {
            return ResponseEntity.ok().build();
        }

        if (bindingResult.hasErrors()) {
            String message = hasNotBlankViolations(bindingResult) ? ERROR_ALL_FIELDS_REQUIRED : ERROR_INVALID_REQUEST;
            return ResponseEntity.badRequest().body(Map.of("error", message));
        }

        try {

            contactService.processContact(request);

            return ResponseEntity.ok(SUCCESS_BODY);

        } catch (Exception e) {
            log.error("Failed to process contact message.", e);

            return ResponseEntity.status(500)
                    .body(Map.of("error", ERROR_SERVER));
        }
    }

    private static boolean hasNotBlankViolations(BindingResult bindingResult) {
        return bindingResult.getFieldErrors().stream()
                .anyMatch(error -> "NotBlank".equals(error.getCode()));
    }
}
