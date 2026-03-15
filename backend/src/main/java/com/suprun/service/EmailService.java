package com.suprun.service;

import com.suprun.dto.ContactRequest;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
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
    private final String[] to;
    private final String from;
    private final boolean failFast;
    private final Duration cooldown;

    private final Provider provider;
    private final RestClient resendClient; // null unless provider=RESEND
    private final String smtpHost;
    private final int smtpPort;
    private final String smtpUsernameMasked;

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
            @Value("${app.email.resend.base-url:https://api.resend.com}") String resendBaseUrl,
            @Value("${spring.mail.host:}") String smtpHost,
            @Value("${spring.mail.port:0}") int smtpPort,
            @Value("${spring.mail.username:}") String smtpUsername,
            @Value("${spring.mail.password:}") String smtpPassword
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.smtpHost = nullToEmpty(smtpHost).trim();
        this.smtpPort = smtpPort;
        this.smtpUsernameMasked = maskEmail(smtpUsername);

        String fromNorm = normalizeAddressHeader(from);
        String[] toNorm = normalizeAddressList(to);
        if (toNorm.length == 0) {
            // Common prod misconfig: MAIL_FROM is set but MAIL_TO is missing. Default to FROM so the contact form
            // still works out-of-the-box (can be overridden by MAIL_TO/app.email.to).
            String[] fallback = normalizeAddressList(fromNorm);
            if (fallback.length > 0) {
                toNorm = fallback;
                log.warn("app.email.to is empty; defaulting recipient to app.email.from. Set MAIL_TO/app.email.to to override.");
            }
        }

        this.to = toNorm;
        this.from = fromNorm;
        this.failFast = failFast;
        this.cooldown = Duration.ofSeconds(Math.max(0L, cooldownSeconds));

        Provider requested = parseProvider(provider);
        SmtpConfigStatus smtpStatus = smtpConfigStatus(smtpHost, smtpPort, smtpUsername, smtpPassword);
        if (this.enabled && requested == Provider.AUTO && smtpStatus.misconfigured()) {
            log.warn("SMTP looks misconfigured (host='{}', port={}, usernameSet={}, passwordSet={}). " +
                            "Fix spring.mail.* / MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASSWORD, or set RESEND_API_KEY + MAIL_PROVIDER=auto.",
                    nullToEmpty(smtpHost).trim(), smtpPort, hasText(smtpUsername), hasText(smtpPassword));
        }
        this.provider = resolveProvider(requested, resendApiKey, smtpStatus.configured());
        this.resendClient = (this.provider == Provider.RESEND)
                ? restClientBuilder
                .baseUrl((resendBaseUrl == null || resendBaseUrl.isBlank()) ? "https://api.resend.com" : resendBaseUrl.trim())
                .defaultHeader("Authorization", "Bearer " + nullToEmpty(resendApiKey).trim())
                .build()
                : null;

        log.info("Email config: enabled={}, provider={}, toCount={}, hasFrom={}", this.enabled, this.provider, this.to.length, !this.from.isBlank());
        if (this.enabled && (this.provider == Provider.SMTP || requested == Provider.SMTP || requested == Provider.AUTO)) {
            log.info("SMTP target: {} (username={})", smtpTarget(), smtpUsernameMasked);
            if (this.smtpPort == 25) {
                log.warn("SMTP port 25 is commonly blocked by cloud providers/hosting networks. Prefer port 587 (STARTTLS) or 465 (SMTPS) if your provider supports it.");
            }
            String preferIpv4 = System.getProperty("java.net.preferIPv4Stack");
            if (preferIpv4 == null || preferIpv4.isBlank()) {
                // If the host has broken IPv6, Java may attempt IPv6 first and time out.
                log.info("Tip: if SMTP connect works locally but times out on the host, try setting JAVA_OPTS=-Djava.net.preferIPv4Stack=true on the remote runtime.");
            }
        }
        if (this.enabled && requested == Provider.AUTO && this.provider == Provider.LOG) {
            if (isLikelySmtpBlockedEnv()) {
                log.warn("MAIL_PROVIDER=auto resolved to LOG. This environment often blocks outbound SMTP and no HTTP provider is configured. " +
                        "Set RESEND_API_KEY + MAIL_PROVIDER=auto (recommended), or configure SMTP via MAIL_USER/MAIL_PASSWORD (and optionally set MAIL_PROVIDER=smtp).");
            } else {
                log.warn("MAIL_PROVIDER=auto resolved to LOG because no email provider is configured. " +
                        "Set RESEND_API_KEY (recommended) or configure SMTP via MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASSWORD.");
            }
        }
        if (this.enabled && this.provider == Provider.SMTP && isLikelySmtpBlockedEnv()) {
            if (requested == Provider.SMTP) {
                log.info("MAIL_PROVIDER=smtp selected. Note: this platform often blocks outbound SMTP; if emails do not arrive, switch to RESEND_API_KEY + MAIL_PROVIDER=auto (or MAIL_PROVIDER=resend).");
            } else {
                log.warn("MAIL_PROVIDER=auto resolved to SMTP. This platform often blocks outbound SMTP; if emails do not arrive, set RESEND_API_KEY (recommended) or set MAIL_PROVIDER=resend.");
            }
        }
    }

    @Async
    public void sendContactEmail(ContactRequest req) {

        if (!enabled) {
            log.info("Email sending disabled (app.email.enabled=false)");
            return;
        }
        if (to.length == 0) {
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
                case LOG -> log.info("Email provider=LOG; contact message received (nameLen={}, emailDomain={}, messageLen={})",
                        lengthOrZero(req.getName()), emailDomain(req.getEmail()), lengthOrZero(req.getMessage()));
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

    private static String emailDomain(String email) {
        if (email == null) {
            return "<null>";
        }
        String e = email.trim();
        if (e.isEmpty()) {
            return "<empty>";
        }
        int at = e.indexOf('@');
        if (at < 0 || at == e.length() - 1) {
            return "<invalid>";
        }
        String domain = e.substring(at + 1).trim();
        return domain.isEmpty() ? "<invalid>" : domain;
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
        log.info("Contact email sent to {} recipient(s) (provider=SMTP)", to.length);
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
        payload.put("to", to);
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
            log.info("Contact email sent to {} recipient(s) (provider=RESEND, id={})", to.length, id);
        } else {
            log.info("Contact email sent to {} recipient(s) (provider=RESEND)", to.length);
        }
    }

    private void tripCooldown(long nowEpochMs, Throwable e) {
        if (cooldown.isZero() || cooldown.isNegative()) {
            log.warn("SMTP connectivity failure connecting to {} (cooldown disabled). Root cause: {}", smtpTarget(), rootCauseMessage(e));
            return;
        }

        long until = nowEpochMs + cooldown.toMillis();
        disabledUntilEpochMs.updateAndGet(prev -> Math.max(prev, until));
        log.warn("SMTP connectivity failure connecting to {}; disabling email sending for {}s. Root cause: {}",
                smtpTarget(), cooldown.toSeconds(), rootCauseMessage(e));
        log.warn("Verify outbound connectivity from the host: it must be able to reach {}. If your hosting provider blocks SMTP egress, switch to an HTTP provider (set RESEND_API_KEY + MAIL_PROVIDER=auto or MAIL_PROVIDER=resend).",
                smtpTarget());
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

    private String smtpTarget() {
        String host = (smtpHost == null || smtpHost.isBlank()) ? "<unset>" : smtpHost;
        int port = smtpPort <= 0 ? -1 : smtpPort;
        return host + ":" + port;
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

    private static Provider resolveProvider(Provider requested, String resendApiKey, boolean smtpConfigured) {
        if (requested != Provider.AUTO) {
            return requested;
        }

        // Prefer HTTP providers when configured.
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            return Provider.RESEND;
        }

        // If SMTP is configured, prefer trying it. If the hosting platform blocks SMTP egress, the send path
        // will log a connectivity failure and trip a cooldown to avoid repeated timeouts.
        if (smtpConfigured) {
            return Provider.SMTP;
        }

        // Otherwise, still default to LOG; without SMTP config we have nothing reliable to send with.
        return Provider.LOG;
    }

    private record SmtpConfigStatus(boolean configured, boolean misconfigured) {
    }

    private static SmtpConfigStatus smtpConfigStatus(String host, int port, String username, String password) {
        boolean hostOk = hasText(host) && port > 0;
        boolean userSet = hasText(username);
        boolean passSet = hasText(password);
        boolean misconfigured = hostOk && (userSet ^ passSet);
        // For AUTO we only consider SMTP "configured" when creds are present; host/port defaults alone are not enough.
        boolean configured = hostOk && userSet && passSet;
        return new SmtpConfigStatus(configured, misconfigured);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static boolean isLikelySmtpBlockedEnv() {
        // Heuristic only: used to decide whether AUTO should default to LOG when neither SMTP nor HTTP providers
        // are configured, and to emit startup hints.
        String render = System.getenv("RENDER");
        String renderServiceId = System.getenv("RENDER_SERVICE_ID");
        if ((render != null && !render.isBlank()) || (renderServiceId != null && !renderServiceId.isBlank())) {
            return true;
        }
        String vercel = System.getenv("VERCEL");
        if (vercel != null && !vercel.isBlank()) {
            return true;
        }
        return false;
    }

    private static String normalizeAddressHeader(String raw) {
        String s = (raw == null) ? "" : raw.trim();
        if (s.isEmpty()) {
            return "";
        }
        try {
            InternetAddress[] parsed = InternetAddress.parse(s, false);
            if (parsed.length == 0) {
                return "";
            }
            // Preserve display name if present; it is useful for Resend, and SMTP can handle it as well.
            return parsed[0].toUnicodeString();
        } catch (AddressException ignored) {
            // Keep the original (best-effort) rather than failing startup.
            return s;
        }
    }

    private static String[] normalizeAddressList(String raw) {
        String s = (raw == null) ? "" : raw.trim();
        if (s.isEmpty()) {
            return new String[0];
        }
        try {
            InternetAddress[] parsed = InternetAddress.parse(s, false);
            if (parsed.length == 0) {
                return new String[0];
            }
            String[] out = new String[parsed.length];
            for (int i = 0; i < parsed.length; i++) {
                // For recipients, send only the mailbox address (avoid "Name <addr>" for providers that dislike it).
                String addr = parsed[i].getAddress();
                out[i] = (addr == null) ? "" : addr.trim();
            }
            int n = 0;
            for (String v : out) {
                if (v != null && !v.isBlank()) {
                    out[n++] = v;
                }
            }
            if (n == out.length) {
                return out;
            }
            String[] trimmed = new String[n];
            System.arraycopy(out, 0, trimmed, 0, n);
            return trimmed;
        } catch (AddressException ignored) {
            // Accept comma-separated values as-is.
            String[] parts = s.split(",");
            int n = 0;
            for (String p : parts) {
                String v = (p == null) ? "" : p.trim();
                if (!v.isBlank()) {
                    parts[n++] = v;
                }
            }
            if (n == 0) {
                return new String[0];
            }
            if (n == parts.length) {
                return parts;
            }
            String[] trimmed = new String[n];
            System.arraycopy(parts, 0, trimmed, 0, n);
            return trimmed;
        }
    }
}
