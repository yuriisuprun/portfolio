package com.suprun.service;

import com.suprun.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);
    private static final String MASKED_NULL = "<null>";
    private static final String MASKED_EMPTY = "<empty>";
    private static final String MASKED_INVALID = "<invalid>";

    private final EmailService emailService;

    public ContactService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void processContact(ContactRequest req) {
        Objects.requireNonNull(req, "request");
        log.info("Contact message received");
        if (log.isDebugEnabled()) {
            log.debug("Contact message received from {}", maskEmail(req.getEmail()));
        }
        emailService.sendContactEmail(req);
    }

    private static String maskEmail(String email) {
        if (email == null) return MASKED_NULL;
        String e = email.trim();
        if (e.isEmpty()) return MASKED_EMPTY;
        int at = e.indexOf('@');
        if (at <= 0 || at == e.length() - 1) return MASKED_INVALID;

        String local = e.substring(0, at), domain = e.substring(at + 1);
        return switch (local.length()) {
            case 1 -> "*@" + domain;
            case 2 -> local.charAt(0) + "*@" + domain;
            default -> local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
        };
    }
}