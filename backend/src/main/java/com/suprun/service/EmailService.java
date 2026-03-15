package com.suprun.service;

import com.suprun.dto.ContactRequest;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String to;
    private final String from;
    private final boolean failFast;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.email.enabled:true}") boolean enabled,
            @Value("${app.email.to:}") String to,
            @Value("${app.email.from:}") String from,
            @Value("${app.email.fail-fast:false}") boolean failFast
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.to = (to == null) ? "" : to.trim();
        this.from = (from == null) ? "" : from.trim();
        this.failFast = failFast;
    }

    @Async
    public void sendContactEmail(ContactRequest req) {

        if (!enabled) {
            log.info("Email sending disabled (app.email.enabled=false)");
            return;
        }
        if (to.isBlank()) {
            log.warn("Email not sent because app.email.to is empty. Set MAIL_TO/app.email.to to enable contact emails.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            if (!from.isBlank()) {
                helper.setFrom(from);
            }
            if (req.getEmail() != null && !req.getEmail().isBlank()) {
                // Best-effort: let you hit "Reply" in your inbox to respond to the sender.
                helper.setReplyTo(req.getEmail().trim());
            }

            String safeName = HtmlUtils.htmlEscape(nullToEmpty(req.getName()));
            String safeEmail = HtmlUtils.htmlEscape(nullToEmpty(req.getEmail()));
            String safeMessage = HtmlUtils.htmlEscape(nullToEmpty(req.getMessage())).replace("\n", "<br/>");

            helper.setSubject("Portfolio Contact: " + safeName);

            String html = """
                    <h2>New Contact Message</h2>
                    <p><b>Name:</b> %s</p>
                    <p><b>Email:</b> %s</p>
                    <p><b>Message:</b></p>
                    <p>%s</p>
                    """.formatted(safeName, safeEmail, safeMessage);

            helper.setText(html, true);

            mailSender.send(message);
            log.info("Contact email sent to {}", to);

        } catch (MailException e) {
            // Common on PaaS: outbound SMTP ports can be blocked; don't crash async execution.
            log.error("Failed to send contact email (SMTP).", e);
            if (failFast) {
                throw e;
            }
        } catch (Exception e) {
            log.error("Failed to build/send contact email.", e);
            if (failFast) {
                throw new RuntimeException("Email failed", e);
            }
        }
    }

    private static String nullToEmpty(String s) {
        return (s == null) ? "" : s;
    }
}
