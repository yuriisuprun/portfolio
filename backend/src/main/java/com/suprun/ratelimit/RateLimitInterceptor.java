package com.suprun.ratelimit;

import com.suprun.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final String CONTACT_PATH = "/api/contact";

    private final RateLimitService rateLimitService;
    private final boolean enabled;

    public RateLimitInterceptor(
            RateLimitService rateLimitService,
            @Value("${app.rate-limit.contact.enabled:true}") boolean enabled
    ) {
        this.rateLimitService = rateLimitService;
        this.enabled = enabled;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        if (!enabled) {
            return true;
        }
        if (request == null) {
            return true;
        }
        String method = request.getMethod();
        if (method == null || method.equalsIgnoreCase("OPTIONS")) {
            return true;
        }
        if (!method.equalsIgnoreCase("POST")) {
            return true;
        }

        String uri = request.getRequestURI();
        if (uri == null || !uri.endsWith(CONTACT_PATH)) {
            return true;
        }

        String ip = ClientIpResolver.resolve(request);
        RateLimitService.Decision decision = rateLimitService.check("contact:" + ip);
        if (decision.allowed()) {
            response.setHeader("X-RateLimit-Limit", Integer.toString(decision.limit()));
            response.setHeader("X-RateLimit-Remaining", Integer.toString(decision.remaining()));
            response.setHeader("X-RateLimit-Reset", Long.toString(decision.resetEpochSecond()));
            return true;
        }

        response.setStatus(429);
        response.setHeader("Retry-After", Long.toString(decision.retryAfterSeconds()));
        response.setHeader("X-RateLimit-Limit", Integer.toString(decision.limit()));
        response.setHeader("X-RateLimit-Remaining", "0");
        response.setHeader("X-RateLimit-Reset", Long.toString(decision.resetEpochSecond()));

        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"Too many requests\",\"retryAfterSeconds\":" + decision.retryAfterSeconds() + "}");
        return false;
    }
}

