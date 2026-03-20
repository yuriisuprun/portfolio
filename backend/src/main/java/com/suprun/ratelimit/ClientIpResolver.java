package com.suprun.ratelimit;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

final class ClientIpResolver {

    private static final String UNKNOWN = "<unknown>";
    private static final String X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String X_REAL_IP = "X-Real-IP";

    private ClientIpResolver() {
    }

    static String resolve(HttpServletRequest request) {
        if (request == null) {
            return UNKNOWN;
        }

        String remoteIp = normalizeIp(request.getRemoteAddr());

        if (isEmptyOrUnknown(remoteIp)) {
            return UNKNOWN;
        }

        if (isLikelyProxyAddress(remoteIp)) {
            return extractFromHeaders(request)
                    .orElse(remoteIp);
        }

        return remoteIp;
    }

    private static Optional<String> extractFromHeaders(HttpServletRequest request) {
        return firstNonEmpty(
                () -> extractFirstIp(header(request, X_FORWARDED_FOR)),
                () -> normalizeIp(header(request, X_REAL_IP))
        );
    }

    private static Optional<String> firstNonEmpty(SupplierWithValue... suppliers) {
        for (SupplierWithValue supplier : suppliers) {
            String value = supplier.get();
            if (!isEmptyOrUnknown(value)) {
                return Optional.of(value);
            }
        }
        return Optional.empty();
    }

    @FunctionalInterface
    private interface SupplierWithValue {
        String get();
    }

    private static String extractFirstIp(String headerValue) {
        if (isBlank(headerValue)) {
            return "";
        }
        String first = headerValue.split(",")[0].trim();
        return normalizeIp(first);
    }

    private static String header(HttpServletRequest request, String name) {
        String value = request.getHeader(name);
        return value == null ? "" : value.trim();
    }

    private static String normalizeIp(String raw) {
        if (isBlank(raw)) {
            return UNKNOWN;
        }

        String s = stripQuotes(raw.trim());

        // IPv6 with brackets: [::1]:1234
        if (s.startsWith("[")) {
            int end = s.indexOf(']');
            if (end > 0) {
                return s.substring(1, end).trim();
            }
        }

        // IPv4 with port
        if (s.contains(".")) {
            int colon = s.lastIndexOf(':');
            if (colon > 0 && isAllDigits(s.substring(colon + 1))) {
                return s.substring(0, colon).trim();
            }
        }

        return s;
    }

    private static String stripQuotes(String s) {
        if (s.length() >= 2 && s.startsWith("\"") && s.endsWith("\"")) {
            return s.substring(1, s.length() - 1).trim();
        }
        return s;
    }

    private static boolean isLikelyProxyAddress(String ip) {
        String lower = ip.toLowerCase();

        // IPv6
        if (lower.equals("::1") ||
                lower.startsWith("fc") ||
                lower.startsWith("fd") ||
                lower.startsWith("fe80:")) {
            return true;
        }

        // IPv4
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return false;
        }

        int a = parseByte(parts[0]);
        int b = parseByte(parts[1]);

        if (a < 0 || b < 0) return false;

        return a == 10 ||
                a == 127 ||
                (a == 192 && b == 168) ||
                (a == 172 && b >= 16 && b <= 31);
    }

    private static int parseByte(String s) {
        if (!isAllDigits(s)) return -1;

        try {
            int value = Integer.parseInt(s);
            return (value >= 0 && value <= 255) ? value : -1;
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    private static boolean isAllDigits(String s) {
        if (isBlank(s)) return false;

        for (int i = 0; i < s.length(); i++) {
            if (!Character.isDigit(s.charAt(i))) {
                return false;
            }
        }
        return true;
    }

    private static boolean isEmptyOrUnknown(String s) {
        return isBlank(s) || UNKNOWN.equals(s);
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}