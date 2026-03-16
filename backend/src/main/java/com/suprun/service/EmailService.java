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
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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

    private enum Provider { AUTO, SMTP, RESEND, LOG }

    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String[] to;
    private final String from;
    private final boolean failFast;
    private final Duration cooldown;
    private final Provider provider;
    private final RestClient resendClient;
    private final String smtpHost;
    private final int smtpPort;
    private final String smtpUsernameMasked;
    private final boolean assumeSmtpBlocked;
    private final AtomicLong disabledUntil = new AtomicLong();

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
            @Value("${spring.mail.password:}") String smtpPassword,
            @Value("${app.email.smtp.assume-blocked:false}") boolean assumeSmtpBlocked
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.smtpHost = trimOrEmpty(smtpHost);
        this.smtpPort = smtpPort;
        this.smtpUsernameMasked = maskEmail(smtpUsername);
        this.assumeSmtpBlocked = assumeSmtpBlocked;
        this.from = normalizeAddressHeader(from);
        this.to = normalizeAddressList(to.length() > 0 ? to : this.from);
        this.failFast = failFast;
        this.cooldown = Duration.ofSeconds(Math.max(0, cooldownSeconds));

        Provider requested = parseProvider(provider);
        boolean smtpConfigured = smtpHost != null && !smtpHost.isBlank() && smtpPort > 0 && smtpUsername != null && !smtpUsername.isBlank() && smtpPassword != null && !smtpPassword.isBlank();
        this.provider = resolveProvider(requested, resendApiKey, smtpConfigured, assumeSmtpBlocked || likelySmtpBlocked());
        this.resendClient = this.provider == Provider.RESEND
                ? restClientBuilder
                .baseUrl(trimOrEmpty(resendBaseUrl, "https://api.resend.com"))
                .defaultHeader("Authorization", "Bearer " + trimOrEmpty(resendApiKey))
                .build()
                : null;

        log.info("Email config: enabled={}, provider={}, toCount={}, hasFrom={}", this.enabled, this.provider, this.to.length, !this.from.isBlank());
    }

    @Async
    public void sendContactEmail(ContactRequest req) {
        if (!enabled || to.length == 0) return;

        if (provider == Provider.SMTP && disabledUntil.get() > System.currentTimeMillis()) return;

        String safeName = HtmlUtils.htmlEscape(trimOrEmpty(req.getName()));
        String safeEmail = HtmlUtils.htmlEscape(trimOrEmpty(req.getEmail()));
        String safeMessage = HtmlUtils.htmlEscape(trimOrEmpty(req.getMessage())).replace("\n", "<br/>");
        String subject = "Portfolio Contact: " + safeName;
        String html = "<h2>New Contact Message</h2><p><b>Name:</b> " + safeName + "</p><p><b>Email:</b> " + safeEmail + "</p><p><b>Message:</b></p><p>" + safeMessage + "</p>";

        try {
            switch (provider) {
                case SMTP -> sendSmtp(req, subject, html);
                case RESEND -> sendResend(req, subject, html);
                case LOG -> log.info("Email provider=LOG; contact message received (nameLen={}, emailDomain={}, messageLen={})", safeName.length(), emailDomain(req.getEmail()), safeMessage.length());
            }
        } catch (Exception e) {
            handleSendException(e);
        }
    }

    private void sendSmtp(ContactRequest req, String subject, String html) throws Exception {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
        helper.setTo(to);
        if (!from.isBlank()) helper.setFrom(from);
        if (req.getEmail() != null && !req.getEmail().isBlank()) helper.setReplyTo(req.getEmail().trim());
        helper.setSubject(subject);
        helper.setText(html, true);
        mailSender.send(msg);
        log.info("Contact email sent to {} recipient(s) (provider=SMTP)", to.length);
    }

    private void sendResend(ContactRequest req, String subject, String html) {
        if (resendClient == null) throw new IllegalStateException("Resend client not configured");
        String effectiveFrom = from.isBlank() ? "Portfolio <onboarding@resend.dev>" : from;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("from", effectiveFrom);
        payload.put("to", to);
        payload.put("subject", subject);
        payload.put("html", html);
        if (req.getEmail() != null && !req.getEmail().isBlank()) payload.put("reply_to", req.getEmail().trim());

        Map<?, ?> resp = resendClient.post().uri("/emails").contentType(MediaType.APPLICATION_JSON).body(payload).retrieve().body(Map.class);
        Object id = resp != null ? resp.get("id") : null;
        log.info("Contact email sent to {} recipient(s) (provider=RESEND{})", to.length, id != null ? ", id=" + id : "");
    }

    private void handleSendException(Exception e) {
        if (isConnectivityFailure(e)) tripCooldown(System.currentTimeMillis(), e);
        log.error("Failed to send contact email.", e);
        if (failFast) throw new RuntimeException(e);
    }

    // --- Utilities ---
    private static String trimOrEmpty(String s) { return s == null ? "" : s.trim(); }
    private static String trimOrEmpty(String s, String fallback) { return s == null || s.isBlank() ? fallback : s.trim(); }

    private static Provider parseProvider(String s) {
        if (s == null || s.isBlank()) return Provider.AUTO;
        try { return Provider.valueOf(s.trim().toUpperCase()); }
        catch (IllegalArgumentException e) { log.warn("Unknown provider '{}', defaulting to AUTO", s); return Provider.AUTO; }
    }

    private static Provider resolveProvider(Provider requested, String resendApiKey, boolean smtpConfigured, boolean smtpBlocked) {
        if (requested != Provider.AUTO) return requested;
        if (resendApiKey != null && !resendApiKey.isBlank()) return Provider.RESEND;
        if (smtpBlocked) return Provider.LOG;
        return smtpConfigured ? Provider.SMTP : Provider.LOG;
    }

    private boolean likelySmtpBlocked() { return System.getenv("RENDER") != null || System.getenv("VERCEL") != null; }

    private static String normalizeAddressHeader(String s) {
        try {
            InternetAddress[] parsed = InternetAddress.parse(s == null ? "" : s.trim(), false);
            return parsed.length > 0 ? parsed[0].toUnicodeString() : "";
        } catch (AddressException e) { return trimOrEmpty(s); }
    }

    private static String[] normalizeAddressList(String raw) {
        try {
            InternetAddress[] parsed = InternetAddress.parse(trimOrEmpty(raw), false);
            return parsed.length == 0 ? new String[0] : java.util.Arrays.stream(parsed).map(a -> trimOrEmpty(a.getAddress())).filter(a -> !a.isBlank()).toArray(String[]::new);
        } catch (AddressException e) { return java.util.Arrays.stream(trimOrEmpty(raw).split(",")).map(String::trim).filter(a -> !a.isBlank()).toArray(String[]::new); }
    }

    private void tripCooldown(long now, Throwable e) {
        long until = now + cooldown.toMillis();
        disabledUntil.updateAndGet(prev -> Math.max(prev, until));
        log.warn("SMTP connectivity failure; email sending disabled for {}s. Root cause: {}", cooldown.toSeconds(), e.getMessage());
    }

    private static boolean isConnectivityFailure(Throwable t) {
        while (t != null) {
            if (t instanceof SocketTimeoutException || t instanceof ConnectException || "org.eclipse.angus.mail.util.MailConnectException".equals(t.getClass().getName())) return true;
            t = t.getCause();
        }
        return false;
    }

    private static String emailDomain(String email) {
        if (email == null || email.isBlank()) return "<null>";
        int at = email.indexOf('@');
        if (at < 0 || at == email.length() - 1) return "<invalid>";
        return email.substring(at + 1);
    }

    private static String maskEmail(String email) {
        if (email == null) return "<null>";
        String e = email.trim();
        if (e.isEmpty()) return "<empty>";
        int at = e.indexOf('@');
        if (at <= 0 || at == e.length() - 1) return "<invalid>";
        String local = e.substring(0, at), domain = e.substring(at + 1);
        return switch (local.length()) {
            case 1 -> "*@" + domain;
            case 2 -> local.charAt(0) + "*@" + domain;
            default -> local.charAt(0) + "***" + local.charAt(local.length() - 1) + "@" + domain;
        };
    }
}