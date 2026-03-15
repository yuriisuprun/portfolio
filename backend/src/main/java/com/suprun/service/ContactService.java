package com.suprun.service;

import com.suprun.dto.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ContactService {

    private static final Logger log =
            LoggerFactory.getLogger(ContactService.class);

    private final EmailService emailService;

    public ContactService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void processContact(ContactRequest request) {
        log.info("Contact message received from {}", maskEmail(request.getEmail()));
        emailService.sendContactEmail(request);
    }

    private static String maskEmail(String email) {
        if (email == null) {
            return "<null>";
        }
        String e = email.trim();
        if (e.isEmpty()) {
            return "<empty>";
        }
        int at = e.indexOf('@');
        if (at <= 0) {
            return "<invalid>";
        }
        String local = e.substring(0, at);
        String domain = e.substring(at + 1);
        if (domain.isEmpty()) {
            return "<invalid>";
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
