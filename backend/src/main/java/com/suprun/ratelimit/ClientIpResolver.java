package com.suprun.ratelimit;

import jakarta.servlet.http.HttpServletRequest;

final class ClientIpResolver {

    private ClientIpResolver() {
    }

    static String resolve(HttpServletRequest request) {
        if (request == null) {
            return "<unknown>";
        }

        String remoteAddr = request.getRemoteAddr();
        String remoteNorm = (remoteAddr == null || remoteAddr.isBlank()) ? "" : normalizeIp(remoteAddr.trim());
        if (remoteNorm.isEmpty() || "<unknown>".equals(remoteNorm)) {
            remoteNorm = "";
        }

        // Only trust forwarded headers when the direct peer address looks like a local/private proxy.
        // This prevents trivial bypasses where a client sets X-Forwarded-For arbitrarily on a direct connection.
        if (!remoteNorm.isEmpty() && isLikelyProxyAddress(remoteNorm)) {
            String xff = headerValue(request, "X-Forwarded-For");
            if (!xff.isEmpty()) {
                String first = xff.split(",")[0].trim();
                if (!first.isEmpty()) {
                    return normalizeIp(first);
                }
            }

            String xri = headerValue(request, "X-Real-IP");
            if (!xri.isEmpty()) {
                return normalizeIp(xri.trim());
            }
        }

        return remoteNorm.isEmpty() ? "<unknown>" : remoteNorm;
    }

    private static String headerValue(HttpServletRequest request, String name) {
        String v = request.getHeader(name);
        return (v == null) ? "" : v.trim();
    }

    private static String normalizeIp(String raw) {
        String s = raw.trim();
        if (s.isEmpty()) {
            return "<unknown>";
        }

        // Strip quotes.
        if (s.length() >= 2 && s.startsWith("\"") && s.endsWith("\"")) {
            s = s.substring(1, s.length() - 1).trim();
        }

        // Strip IPv6 brackets and optional port: "[2001:db8::1]:1234".
        if (s.startsWith("[")) {
            int close = s.indexOf(']');
            if (close > 0) {
                return s.substring(1, close).trim();
            }
        }

        // Strip IPv4 port: "1.2.3.4:1234".
        if (s.indexOf('.') >= 0) {
            int lastColon = s.lastIndexOf(':');
            if (lastColon > 0) {
                String maybePort = s.substring(lastColon + 1);
                if (isAllDigits(maybePort)) {
                    return s.substring(0, lastColon).trim();
                }
            }
        }

        return s;
    }

    private static boolean isAllDigits(String s) {
        if (s == null || s.isEmpty()) {
            return false;
        }
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c < '0' || c > '9') {
                return false;
            }
        }
        return true;
    }

    private static boolean isLikelyProxyAddress(String ip) {
        // IPv6 loopback/ULA/link-local.
        String lower = ip.toLowerCase();
        if (lower.equals("::1")) {
            return true;
        }
        if (lower.startsWith("fc") || lower.startsWith("fd")) { // fc00::/7 (very rough but fine here)
            return true;
        }
        if (lower.startsWith("fe80:")) { // link-local
            return true;
        }

        // IPv4 RFC1918 + loopback.
        String[] parts = ip.split("\\.");
        if (parts.length != 4) {
            return false;
        }
        int a = parseByte(parts[0]);
        int b = parseByte(parts[1]);
        if (a < 0 || b < 0) {
            return false;
        }
        if (a == 10) {
            return true;
        }
        if (a == 127) {
            return true;
        }
        if (a == 192 && b == 168) {
            return true;
        }
        return a == 172 && b >= 16 && b <= 31;
    }

    private static int parseByte(String s) {
        if (!isAllDigits(s)) {
            return -1;
        }
        try {
            int v = Integer.parseInt(s);
            return (v >= 0 && v <= 255) ? v : -1;
        } catch (NumberFormatException ignored) {
            return -1;
        }
    }
}
