package com.suprun.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.SecureRandom;

/**
 * Adds a lightweight correlation id to every request for log correlation.
 *
 * In production, this lets to stitch together:
 * - controller/service logs
 * - async logs (with MDC propagation)
 * - reverse-proxy / CDN request ids (when forwarded in)
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorrelationIdFilter extends OncePerRequestFilter {

    public static final String HEADER = "X-Correlation-Id";
    public static final String MDC_KEY = "correlationId";

    private static final int GENERATED_ID_BYTES = 12; // 96-bit; short but collision-resistant
    private static final SecureRandom RNG = new SecureRandom();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String incoming = request == null ? null : trimToNull(request.getHeader(HEADER));
        String correlationId = isSafeId(incoming) ? incoming : generateId();

        String previous = MDC.get(MDC_KEY);
        MDC.put(MDC_KEY, correlationId);
        try {
            if (response != null) {
                // Keep existing header if someone already set it explicitly.
                if (!response.containsHeader(HEADER)) {
                    response.setHeader(HEADER, correlationId);
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            if (previous == null) {
                MDC.remove(MDC_KEY);
            } else {
                MDC.put(MDC_KEY, previous);
            }
        }
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    // Prevent log injection and keep ids reasonable for headers/logs.
    private static boolean isSafeId(String s) {
        if (s == null) return false;
        if (s.length() > 128) return false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            boolean ok = (c >= 'a' && c <= 'z')
                    || (c >= 'A' && c <= 'Z')
                    || (c >= '0' && c <= '9')
                    || c == '-' || c == '_' || c == '.';
            if (!ok) return false;
        }
        return true;
    }

    private static String generateId() {
        byte[] bytes = new byte[GENERATED_ID_BYTES];
        RNG.nextBytes(bytes);
        return base16(bytes);
    }

    // hex without allocations beyond StringBuilder
    private static String base16(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            int v = b & 0xFF;
            sb.append(Character.forDigit(v >>> 4, 16));
            sb.append(Character.forDigit(v & 0x0F, 16));
        }
        return sb.toString();
    }
}

