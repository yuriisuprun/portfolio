package com.suprun.service;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimitService {

    private static final int DEFAULT_LIMIT = 5;
    private static final long DEFAULT_WINDOW_SECONDS = 60;
    private static final long DEFAULT_MAX_KEYS = 10_000;

    private final int limit;
    private final long windowSeconds;
    private final Cache<String, AtomicInteger> counters;

    @Autowired
    public RateLimitService(
            @Value("${app.rate-limit.contact.limit:" + DEFAULT_LIMIT + "}") int limit,
            @Value("${app.rate-limit.contact.window-seconds:" + DEFAULT_WINDOW_SECONDS + "}") long windowSeconds,
            @Value("${app.rate-limit.contact.max-keys:" + DEFAULT_MAX_KEYS + "}") long maxKeys
    ) {
        if (limit <= 0) {
            throw new IllegalArgumentException("limit must be > 0");
        }
        if (windowSeconds <= 0) {
            throw new IllegalArgumentException("windowSeconds must be > 0");
        }
        if (maxKeys <= 0) {
            throw new IllegalArgumentException("maxKeys must be > 0");
        }

        this.limit = limit;
        this.windowSeconds = windowSeconds;

        this.counters = Caffeine.newBuilder()
                .expireAfterWrite(windowSeconds * 2, TimeUnit.SECONDS)
                .maximumSize(maxKeys)
                .build();
    }

    public Decision check(String key) {
        String normalized = (key == null) ? "" : key.trim();
        if (normalized.isEmpty()) {
            normalized = "<unknown>";
        }

        long now = Instant.now().getEpochSecond();
        long windowStart = (now / windowSeconds) * windowSeconds;
        long resetEpochSecond = windowStart + windowSeconds;

        String counterKey = normalized + "|" + windowStart;
        AtomicInteger counter = counters.get(counterKey, k -> new AtomicInteger(0));
        int used = counter.incrementAndGet();

        boolean allowed = used <= limit;
        int remaining = Math.max(0, limit - used);
        long retryAfterSeconds = Math.max(0L, resetEpochSecond - now);

        return new Decision(allowed, limit, remaining, resetEpochSecond, retryAfterSeconds);
    }

    public record Decision(
            boolean allowed,
            int limit,
            int remaining,
            long resetEpochSecond,
            long retryAfterSeconds
    ) {}
}
