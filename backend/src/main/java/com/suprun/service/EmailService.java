package com.suprun.service;

import com.suprun.dto.ContactRequest;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.HtmlUtils;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private enum Provider {
        AUTO, SMTP, RESEND, LOG
    }

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String to;
    private final String from;
    private final boolean failFast;
    private final Duration cooldown;

    private final Provider provider;
    private final RestClient resendClient; // null unless provider=RESEND

    // When SMTP is blocked by the hosting provider, avoid burning threads/time on repeated 10s connect timeouts.
    private final AtomicLong disabledUntilEpochMs = new AtomicLong(0L);

    public EmailService(
            JavaMailSender mailSender,
            RestClient.Builder restClientBuilder,
            @Value("${app.email.enabled:true}") boolean enabled,
            @Value("${app.email.to:}") String to,
            @Value("${app.email.from:}") String from,
            @Value("${app.email.fail-fast:false}") boolean failFast,
            @Value("${app.email.cooldown-seconds:900}") long cooldownSeconds,
            @Value("${app.email.provider:auto}") String provider,
            @Value("${app.email.resend.api-key:}") String resendApiKey,
            @Value("${app.email.resend.base-url:https://api.resend.com}") String resendBaseUrl
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.to = (to == null) ? "" : to.trim();
        this.from = (from == null) ? "" : from.trim();
        this.failFast = failFast;
        this.cooldown = Duration.ofSeconds(Math.max(0L, cooldownSeconds));

        Provider requested = parseProvider(provider);
        this.provider = resolveProvider(requested, resendApiKey);
        this.resendClient = (this.provider == Provider.RESEND)
                ? restClientBuilder
                .baseUrl((resendBaseUrl == null || resendBaseUrl.isBlank()) ? "https://api.resend.com" : resendBaseUrl.trim())
                .defaultHeader("Authorization", "Bearer " + nullToEmpty(resendApiKey).trim())
                .build()
                : null;
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
        // Cooldown only applies to SMTP connectivity failures; don't block non-SMTP providers.
        if (provider == Provider.SMTP) {
            long disabledUntil = disabledUntilEpochMs.get();
            if (disabledUntil > now) {
                log.warn("Email sending temporarily disabled for {}s (last SMTP connectivity failure).",
                        Math.max(0, (disabledUntil - now) / 1000));
                return;
            }
        }

        String safeName = HtmlUtils.htmlEscape(nullToEmpty(req.getName()));
        String safeEmail = HtmlUtils.htmlEscape(nullToEmpty(req.getEmail()));
        String safeMessage = HtmlUtils.htmlEscape(nullToEmpty(req.getMessage())).replace("\n", "<br/>");
        String subject = "Portfolio Contact: " + safeName;
        String html = """
                <h2>New Contact Message</h2>
                <p><b>Name:</b> %s</p>
                <p><b>Email:</b> %s</p>
                <p><b>Message:</b></p>
                <p>%s</p>
                """.formatted(safeName, safeEmail, safeMessage);

        try {
            switch (provider) {
                case SMTP -> sendViaSmtp(req, subject, html);
                case RESEND -> sendViaResend(req, subject, html);
                case LOG -> log.info("Email provider=LOG; contact message suppressed (nameLen={}, from={}, messageLen={})",
                        lengthOrZero(req.getName()), maskEmail(req.getEmail()), lengthOrZero(req.getMessage()));
                default -> log.warn("Email provider resolved to unexpected value {}; skipping send.", provider);
            }
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
        } catch (RestClientException e) {
            // HTTP provider failures: log and optionally fail-fast.
            log.error("Failed to send contact email (Resend).", e);
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

    private static int lengthOrZero(String s) {
        return (s == null) ? 0 : s.length();
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

    private void sendViaSmtp(ContactRequest req, String subject, String html) throws Exception {
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

        helper.setSubject(subject);
        helper.setText(html, true);

        mailSender.send(message);
        log.info("Contact email sent to {} (provider=SMTP)", to);
    }

    private void sendViaResend(ContactRequest req, String subject, String html) {
        if (resendClient == null) {
            throw new IllegalStateException("Resend client not configured");
        }

        // Resend requires a valid `from`. If the user didn't configure one, default to the sandbox sender
        // so setting only RESEND_API_KEY + MAIL_TO still works out-of-the-box.
        String effectiveFrom = from;
        if (effectiveFrom.isBlank()) {
            effectiveFrom = "Portfolio <onboarding@resend.dev>";
            log.warn("app.email.from is empty; defaulting to '{}' for provider=RESEND. Set MAIL_FROM/app.email.from to override.",
                    effectiveFrom);
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", effectiveFrom);
        payload.put("to", new String[]{to});
        payload.put("subject", subject);
        payload.put("html", html);

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            // Resend API parameter name is `reply_to` (SDK uses replyTo).
            payload.put("reply_to", req.getEmail().trim());
        }

        // Resend: POST https://api.resend.com/emails with Authorization: Bearer ...
        Map<?, ?> resp = resendClient.post()
                .uri("/emails")
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .body(Map.class);

        Object id = (resp == null) ? null : resp.get("id");
        if (id != null) {
            log.info("Contact email sent to {} (provider=RESEND, id={})", to, id);
        } else {
            log.info("Contact email sent to {} (provider=RESEND)", to);
        }
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

    private static Provider parseProvider(String raw) {
        if (raw == null || raw.isBlank()) {
            return Provider.AUTO;
        }
        try {
            return Provider.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown app.email.provider='{}'; falling back to AUTO", raw);
            return Provider.AUTO;
        }
    }

    private static Provider resolveProvider(Provider requested, String resendApiKey) {
        if (requested != Provider.AUTO) {
            return requested;
        }

        // Prefer HTTP providers when configured.
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            return Provider.RESEND;
        }

        // Render (and many PaaS) block outbound SMTP ports; avoid repeated connect timeouts by default.
        String render = System.getenv("RENDER");
        String renderServiceId = System.getenv("RENDER_SERVICE_ID");
        if ((render != null && !render.isBlank()) || (renderServiceId != null && !renderServiceId.isBlank())) {
            log.warn("Detected Render environment; defaulting app.email.provider=LOG (SMTP is often blocked). " +
                    "To send emails, set RESEND_API_KEY (recommended) or set MAIL_PROVIDER=smtp to attempt SMTP.");
            return Provider.LOG;
        }

        return Provider.SMTP;
    }
}
