package com.suprun.service;

import com.suprun.dto.ContactRequest;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendContactEmail(ContactRequest req) {

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo("your@email.com");
            helper.setSubject("Portfolio Contact: " + req.getName());

            String html = """
                    <h2>New Contact Message</h2>
                    <p><b>Name:</b> %s</p>
                    <p><b>Email:</b> %s</p>
                    <p><b>Message:</b></p>
                    <p>%s</p>
                    """.formatted(req.getName(), req.getEmail(), req.getMessage());

            helper.setText(html, true);

            mailSender.send(message);

        } catch (Exception e) {
            throw new RuntimeException("Email failed", e);
        }
    }
}