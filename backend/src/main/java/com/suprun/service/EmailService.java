package com.suprun.service;

import com.suprun.dto.ContactRequest;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.HtmlUtils;

import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private enum Provider {SMTP, RESEND, LOG}

    private final JavaMailSender mailSender;
    private final RestClient resendClient;
    private final Provider provider;

    private final boolean enabled;
    private final boolean failFast;
    private final String[] to;
    private final String from;
    private final Duration cooldown;

    private final AtomicLong disabledUntil = new AtomicLong();

    public EmailService(
            JavaMailSender mailSender,
            RestClient.Builder rest,
            @Value("${app.email.enabled:true}") boolean enabled,
            @Value("${app.email.to:}") String to,
            @Value("${app.email.from:}") String from,
            @Value("${app.email.fail-fast:false}") boolean failFast,
            @Value("${app.email.cooldown-seconds:900}") long cooldownSeconds,
            @Value("${app.email.provider:auto}") String provider,
            @Value("${app.email.resend.api-key:}") String resendKey,
            @Value("${spring.mail.host:}") String smtpHost,
            @Value("${spring.mail.port:0}") int smtpPort
    ) {
        this.mailSender = mailSender;
        this.enabled = enabled;
        this.failFast = failFast;
        this.cooldown = Duration.ofSeconds(cooldownSeconds);

        this.from = normalize(from);
        this.to = normalizeList(to.isBlank() ? this.from : to);

        boolean smtpReady = !smtpHost.isBlank() && smtpPort > 0;
        this.provider = resolve(provider, resendKey, smtpReady);

        this.resendClient = this.provider == Provider.RESEND
                ? rest
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + resendKey)
                .requestFactory(new JdkClientHttpRequestFactory(
                        HttpClient.newBuilder()
                                .connectTimeout(Duration.ofSeconds(10))
                                .version(HttpClient.Version.HTTP_1_1)
                                .build()
                ))
                .build()
                : null;

        log.info("Email provider={}, enabled={}", this.provider, enabled);
    }

    @Async
    public void sendContactEmail(ContactRequest contactRequest) {
        if (!enabled || to.length == 0) return;
        if (provider == Provider.SMTP && isCoolingDown()) return;

        var content = buildContent(contactRequest);

        try {
            send(content, contactRequest);
        } catch (Exception e) {
            handleError(e);
        }
    }

    private void send(Content c, ContactRequest contactRequest) throws Exception {
        switch (provider) {
            case SMTP -> sendSmtp(c, contactRequest);
            case RESEND -> sendResendWithRetry(c, contactRequest);
            case LOG -> log.info("Email LOG: {}", c.subject);
        }
    }

    private void sendSmtp(Content c, ContactRequest contactRequest) throws Exception {
        MimeMessage msg = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(msg, true, "UTF-8");

        helper.setTo(to);
        if (!from.isBlank()) helper.setFrom(from);
        if (hasText(contactRequest.getEmail())) helper.setReplyTo(contactRequest.getEmail());

        helper.setSubject(c.subject);
        helper.setText(c.html, true);

        mailSender.send(msg);
    }

    private void sendResendWithRetry(Content content, ContactRequest contactRequest) {
        int attempts = 0;

        while (true) {
            try {
                sendResend(content, contactRequest);
                return;

            } catch (Exception e) {
                attempts++;

                if (attempts >= 3 || !isConnectivityError(e)) {
                    throw e;
                }

                if (log.isDebugEnabled()) {
                    log.warn("Resend attempt {} failed, retrying...", attempts, e);
                } else {
                    log.warn("Resend attempt {} failed, retrying... ({})", attempts, e.toString());
                }

                try {
                    Thread.sleep(1000L * attempts); // simple backoff
                } catch (InterruptedException ignored) {
                }
            }
        }
    }

    private void sendResend(Content content, ContactRequest contactRequest) {
        resendClient.post()
                .uri("/emails")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "from", from.isBlank() ? "Portfolio <onboarding@resend.dev>" : from,
                        "to", to,
                        "subject", content.subject,
                        "html", content.html,
                        "reply_to", contactRequest.getEmail()
                ))
                .retrieve()
                .body(Map.class);
    }

    private Content buildContent(ContactRequest contactRequest) {
        String name = esc(contactRequest.getName());
        String email = esc(contactRequest.getEmail());
        String msg = esc(contactRequest.getMessage()).replace("\n", "<br/>");

        return new Content(
                "Portfolio Contact: " + name,
                "<h2>New Contact</h2>" +
                        "<p><b>Name:</b> " + name + "</p>" +
                        "<p><b>Email:</b> " + email + "</p>" +
                        "<p>" + msg + "</p>"
        );
    }

    private void handleError(Exception e) {
        if (isConnectivityError(e)) {
            tripCooldown();
            log.warn("Email disabled temporarily due to connectivity issues");
        }

        log.error("Email failed", e);

        if (failFast) throw new RuntimeException(e);
    }

    private boolean isCoolingDown() {
        return disabledUntil.get() > System.currentTimeMillis();
    }

    private void tripCooldown() {
        disabledUntil.set(System.currentTimeMillis() + cooldown.toMillis());
    }

    private static Provider resolve(String requested, String resendKey, boolean smtpReady) {
        if ("resend".equalsIgnoreCase(requested) && !resendKey.isBlank()) return Provider.RESEND;
        if ("smtp".equalsIgnoreCase(requested) && smtpReady) return Provider.SMTP;
        return !resendKey.isBlank() ? Provider.RESEND : smtpReady ? Provider.SMTP : Provider.LOG;
    }

    private static boolean isConnectivityError(Throwable throwable) {
        while (throwable != null) {
            if (throwable instanceof SocketTimeoutException ||
                    throwable instanceof SocketException ||
                    throwable instanceof ResourceAccessException) {
                return true;
            }
            throwable = throwable.getCause();
        }
        return false;
    }

    private static boolean hasText(String text) {
        return text != null && !text.isBlank();
    }

    private static String esc(String str) {
        return HtmlUtils.htmlEscape(str == null ? "" : str.trim());
    }

    private static String normalize(String str) {
        return str == null ? "" : str.trim();
    }

    private static String[] normalizeList(String raw) {
        return raw == null || raw.isBlank()
                ? new String[0]
                : java.util.Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toArray(String[]::new);
    }

    private record Content(String subject, String html) {
    }
}