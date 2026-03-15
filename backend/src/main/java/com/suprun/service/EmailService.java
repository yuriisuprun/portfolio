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

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String to;
    private final String from;
    private final boolean failFast;
    private final Duration cooldown;

    // When SMTP is blocked by the hosting provider, avoid burning threads/time on repeated 10s connect timeouts.
    private final AtomicLong disabledUntilEpochMs = new AtomicLong(0L);

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.email.enabled:true}") boolean enabled,
            @Value("${app.email.to:}") String to,
            @Value("${app.email.from:}") String from,
            @Value("${app.email.fail-fast:false}") boolean failFast,
            @Value("${app.email.cooldown-seconds:900}") long cooldownSeconds
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.to = (to == null) ? "" : to.trim();
        this.from = (from == null) ? "" : from.trim();
        this.failFast = failFast;
        this.cooldown = Duration.ofSeconds(Math.max(0L, cooldownSeconds));
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

        long now = System.currentTimeMillis();
        long disabledUntil = disabledUntilEpochMs.get();
        if (disabledUntil > now) {
            log.warn("Email sending temporarily disabled for {}s (last SMTP connectivity failure).",
                    Math.max(0, (disabledUntil - now) / 1000));
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
            if (isConnectivityFailure(e)) {
                tripCooldown(now, e);
            } else {
                log.error("Failed to send contact email (SMTP).", e);
            }
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

    private void tripCooldown(long nowEpochMs, Throwable e) {
        if (cooldown.isZero() || cooldown.isNegative()) {
            log.warn("SMTP connectivity failure (cooldown disabled). Root cause: {}", rootCauseMessage(e));
            return;
        }

        long until = nowEpochMs + cooldown.toMillis();
        disabledUntilEpochMs.updateAndGet(prev -> Math.max(prev, until));
        log.warn("SMTP connectivity failure; disabling email sending for {}s. Root cause: {}",
                cooldown.toSeconds(), rootCauseMessage(e));
    }

    private static boolean isConnectivityFailure(Throwable t) {
        Throwable cur = t;
        while (cur != null) {
            if (cur instanceof SocketTimeoutException || cur instanceof ConnectException) {
                return true;
            }
            // Angus Mail/Jakarta Mail connect exceptions are usually nested; match by class name to avoid hard dependency.
            String cn = cur.getClass().getName();
            if ("org.eclipse.angus.mail.util.MailConnectException".equals(cn)) {
                return true;
            }
            cur = cur.getCause();
        }
        return false;
    }

    private static String rootCauseMessage(Throwable t) {
        Throwable cur = t;
        Throwable last = t;
        while (cur != null) {
            last = cur;
            cur = cur.getCause();
        }
        String msg = last.getMessage();
        if (msg == null || msg.isBlank()) {
            return last.getClass().getName();
        }
        return last.getClass().getSimpleName() + ": " + msg;
    }
}
