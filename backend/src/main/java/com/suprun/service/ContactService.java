package com.suprun.service;

import com.suprun.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class ContactService {

    private static final Logger log =
            LoggerFactory.getLogger(ContactService.class);

    private static final String MASKED_NULL = "<null>";
    private static final String MASKED_EMPTY = "<empty>";
    private static final String MASKED_INVALID = "<invalid>";

    private final EmailService emailService;

    public ContactService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void processContact(ContactRequest request) {
        Objects.requireNonNull(request, "request");

        // Avoid PII in INFO logs (Render logs are often treated as semi-public). Keep details behind DEBUG.
        log.info("Contact message received");
        if (log.isDebugEnabled()) {
            log.debug("Contact message received from {}", maskEmail(request.getEmail()));
        }
        emailService.sendContactEmail(request);
    }

    private static String maskEmail(String email) {
        if (email == null) {
            return MASKED_NULL;
        }

        String trimmed = email.trim();
        if (trimmed.isEmpty()) {
            return MASKED_EMPTY;
        }

        int at = trimmed.indexOf('@');
        if (at <= 0 || at == trimmed.length() - 1) {
            return MASKED_INVALID;
        }

        String local = trimmed.substring(0, at);
        String domain = trimmed.substring(at + 1);
        if (domain.isEmpty()) {
            return MASKED_INVALID;
        }

        if (local.length() == 1) {
            return "*@" + domain;
        }
        if (local.length() == 2) {
            return local.charAt(0) + "*@" + domain;
        }
        return "" + local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
    }
}
