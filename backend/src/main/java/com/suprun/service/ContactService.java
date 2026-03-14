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
        log.info("Contact message received from {}", request.getEmail());
        emailService.sendContactEmail(request);
    }
}