package com.suprun.service;

import com.suprun.dto.ContactRequest;
import jakarta.mail.BodyPart;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.Properties;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private RestClient.Builder restBuilder;

    @Test
    void sendContactEmail_whenDisabled_doesNothing() {
        EmailService service = newService(
                false,
                "to@example.com",
                "from@example.com",
                false,
                900,
                "smtp",
                "",
                "smtp.example.com",
                25
        );

        service.sendContactEmail(contactRequest("Yurii", "yurii@example.com", "Hello"));

        verifyNoInteractions(mailSender);
    }

    @Test
    void sendContactEmail_whenNoRecipientsConfigured_doesNothing() {
        EmailService service = newService(
                true,
                "",
                "",
                false,
                900,
                "smtp",
                "",
                "smtp.example.com",
                25
        );

        service.sendContactEmail(contactRequest("Yurii", "yurii@example.com", "Hello"));

        verifyNoInteractions(mailSender);
    }

    @Test
    void sendContactEmail_whenProviderIsLog_doesNotTouchSmtp() {
        EmailService service = newService(
                true,
                "to@example.com",
                "",
                false,
                900,
                "auto",
                "",
                "",
                0
        );

        service.sendContactEmail(contactRequest("Yurii", "yurii@example.com", "Hello"));

        verifyNoInteractions(mailSender);
    }

    @Test
    void sendContactEmail_smtp_buildsEscapedHtmlAndHeaders() throws Exception {
        MimeMessage msg = mimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(msg);

        // Intentionally leave app.email.to blank: it should default to app.email.from.
        EmailService service = newService(
                true,
                "",
                "from@example.com",
                false,
                900,
                "smtp",
                "",
                "smtp.example.com",
                25
        );

        ContactRequest req = contactRequest("<Yurii>", "yu&rii@example.com", "Hello <b>\nWorld");
        service.sendContactEmail(req);

        ArgumentCaptor<MimeMessage> sent = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(sent.capture());

        MimeMessage sentMsg = sent.getValue();
        sentMsg.saveChanges(); // materialize headers/body for assertions
        assertThat(sentMsg.getSubject()).isEqualTo("Portfolio Contact: &lt;Yurii&gt;");

        InternetAddress to = (InternetAddress) sentMsg.getRecipients(Message.RecipientType.TO)[0];
        assertThat(to.getAddress()).isEqualTo("from@example.com");

        InternetAddress from = (InternetAddress) sentMsg.getFrom()[0];
        assertThat(from.getAddress()).isEqualTo("from@example.com");

        InternetAddress replyTo = (InternetAddress) sentMsg.getReplyTo()[0];
        assertThat(replyTo.getAddress()).isEqualTo("yu&rii@example.com");

        String body = extractBodyText(sentMsg);
        assertThat(body).contains("<p><b>Name:</b> &lt;Yurii&gt;</p>");
        assertThat(body).contains("<p><b>Email:</b> yu&amp;rii@example.com</p>");
        assertThat(body).contains("Hello &lt;b&gt;<br/>World");
    }

    @Test
    void sendContactEmail_smtpConnectivityError_tripsCooldown_andSkipsSubsequentSends() {
        MimeMessage msg = mimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(msg);
        SocketTimeoutException timeout = new SocketTimeoutException("timeout") {
            @Override
            public synchronized Throwable fillInStackTrace() {
                return this;
            }
        };
        ResourceAccessException io = new ResourceAccessException("io", timeout) {
            @Override
            public synchronized Throwable fillInStackTrace() {
                return this;
            }
        };
        doThrow(io).when(mailSender).send(any(MimeMessage.class));

        EmailService service = newService(
                true,
                "to@example.com",
                "from@example.com",
                false,
                900,
                "smtp",
                "",
                "smtp.example.com",
                25
        );

        ContactRequest req = contactRequest("Yurii", "yurii@example.com", "Hello");

        assertThatNoException().isThrownBy(() -> service.sendContactEmail(req));

        // If cooldown was tripped, EmailService should short-circuit before even creating a new message.
        service.sendContactEmail(req);

        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendContactEmail_whenFailFastEnabled_wrapsAndThrows() {
        MimeMessage msg = mimeMessage();
        when(mailSender.createMimeMessage()).thenReturn(msg);
        RuntimeException boom = new RuntimeException("boom") {
            @Override
            public synchronized Throwable fillInStackTrace() {
                return this;
            }
        };
        doThrow(boom).when(mailSender).send(any(MimeMessage.class));

        EmailService service = newService(
                true,
                "to@example.com",
                "from@example.com",
                true,
                900,
                "smtp",
                "",
                "smtp.example.com",
                25
        );

        assertThatThrownBy(() -> service.sendContactEmail(contactRequest("Yurii", "yurii@example.com", "Hello")))
                .isInstanceOf(RuntimeException.class)
                .hasCause(boom);
    }

    @ParameterizedTest(name = "resolve({0}, resendKey={1}, smtpReady={2}) -> {3}")
    @MethodSource("resolveCases")
    void resolve_selectsExpectedProvider(String requested, String resendKey, boolean smtpReady, String expected) {
        Object provider = ReflectionTestUtils.invokeMethod(
                EmailService.class,
                "resolve",
                requested,
                resendKey,
                smtpReady
        );

        assertThat(provider).isNotNull();
        assertThat(provider.toString()).isEqualTo(expected);
    }

    private static Stream<Arguments> resolveCases() {
        return Stream.of(
                Arguments.of("resend", "rk_test", true, "RESEND"),
                Arguments.of("resend", "", true, "SMTP"),
                Arguments.of("smtp", "rk_test", true, "SMTP"),
                Arguments.of("smtp", "rk_test", false, "RESEND"),
                Arguments.of("auto", "rk_test", false, "RESEND"),
                Arguments.of("auto", "", false, "LOG")
        );
    }

    @ParameterizedTest(name = "isConnectivityError({0}) -> {1}")
    @MethodSource("connectivityCases")
    void isConnectivityError_detectsExpected(Throwable throwable, boolean expected) {
        Boolean actual = ReflectionTestUtils.invokeMethod(EmailService.class, "isConnectivityError", throwable);
        assertThat(actual).isEqualTo(expected);
    }

    private static Stream<Arguments> connectivityCases() {
        return Stream.of(
                Arguments.of(new SocketTimeoutException("timeout"), true),
                Arguments.of(new SocketException("reset"), true),
                Arguments.of(new ResourceAccessException("io"), true),
                Arguments.of(new RuntimeException(new RuntimeException(new SocketTimeoutException("timeout"))), true),
                Arguments.of(new IllegalArgumentException("nope"), false)
        );
    }

    private EmailService newService(
            boolean enabled,
            String to,
            String from,
            boolean failFast,
            long cooldownSeconds,
            String provider,
            String resendKey,
            String smtpHost,
            int smtpPort
    ) {
        return new EmailService(
                mailSender,
                restBuilder,
                enabled,
                to,
                from,
                failFast,
                cooldownSeconds,
                provider,
                resendKey,
                smtpHost,
                smtpPort
        );
    }

    private static ContactRequest contactRequest(String name, String email, String message) {
        ContactRequest req = new ContactRequest();
        req.setName(name);
        req.setEmail(email);
        req.setMessage(message);
        return req;
    }

    private static MimeMessage mimeMessage() {
        return new MimeMessage(Session.getDefaultInstance(new Properties()));
    }

    private static String extractBodyText(MimeMessage message) throws Exception {
        Object content = message.getContent();
        String extracted = extractBodyText(content);
        if (extracted != null) return extracted;
        throw new IllegalStateException("Unable to extract body text from MimeMessage. contentType=" + message.getContentType());
    }

    private static String extractBodyText(Object content) throws Exception {
        if (content instanceof String text) return text;
        if (content instanceof InputStream is) return readAllUtf8(is);
        if (content instanceof Multipart multipart) return extractBodyText(multipart);
        return null;
    }

    private static String extractBodyText(Multipart multipart) throws Exception {
        String fallbackText = null;

        for (int i = 0; i < multipart.getCount(); i++) {
            BodyPart part = multipart.getBodyPart(i);
            if (part.isMimeType("multipart/*")) {
                Object nested = part.getContent();
                String found = extractBodyText(nested);
                if (found != null) return found;
                continue;
            }

            if (part.isMimeType("text/html")) {
                Object content = part.getContent();
                if (content instanceof String html) return html; // preferred
            }

            Object partContent = part.getContent();
            if (fallbackText == null && partContent instanceof String text) {
                fallbackText = text;
            }
        }

        return fallbackText;
    }

    private static String readAllUtf8(InputStream inputStream) throws Exception {
        try (inputStream) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            inputStream.transferTo(out);
            return out.toString(StandardCharsets.UTF_8);
        }
    }

}
