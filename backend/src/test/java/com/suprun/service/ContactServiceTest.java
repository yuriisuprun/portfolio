package com.suprun.service;

import com.suprun.dto.ContactRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ContactService contactService;

    @Test
    void processContact_nullRequest_throwsWithClearMessage() {
        assertThatThrownBy(() -> contactService.processContact(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("request");
    }

    @Test
    void processContact_validRequest_delegatesToEmailService() {
        ContactRequest req = contactRequest("Yurii", "yurii@example.com", "Hello");

        contactService.processContact(req);

        verify(emailService).sendContactEmail(req);
    }

    @Test
    void processContact_whenEmailServiceThrows_propagatesException() {
        ContactRequest req = contactRequest("Yurii", "yurii@example.com", "Hello");
        RuntimeException boom = new RuntimeException("boom");
        doThrow(boom).when(emailService).sendContactEmail(req);

        assertThatThrownBy(() -> contactService.processContact(req))
                .isSameAs(boom);
    }

    @ParameterizedTest(name = "maskEmail({0}) -> {1}")
    @MethodSource("maskEmailCases")
    void maskEmail_masksAsExpected(String input, String expected) {
        String masked = ReflectionTestUtils.invokeMethod(ContactService.class, "maskEmail", input);
        assertThat(masked).isEqualTo(expected);
    }

    private static Stream<Arguments> maskEmailCases() {
        return Stream.of(
                Arguments.of(null, "<null>"),
                Arguments.of("", "<empty>"),
                Arguments.of("   ", "<empty>"),
                Arguments.of("no-at-sign", "<invalid>"),
                Arguments.of("@example.com", "<invalid>"),
                Arguments.of("local@", "<invalid>"),
                Arguments.of("a@example.com", "*@example.com"),
                Arguments.of("ab@example.com", "a*@example.com"),
                Arguments.of("abc@example.com", "a***c@example.com"),
                Arguments.of("  abcd@example.com  ", "a***d@example.com")
        );
    }

    private static ContactRequest contactRequest(String name, String email, String message) {
        ContactRequest req = new ContactRequest();
        req.setName(name);
        req.setEmail(email);
        req.setMessage(message);
        return req;
    }
}
