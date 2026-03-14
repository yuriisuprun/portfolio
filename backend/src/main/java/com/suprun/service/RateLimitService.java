package com.suprun.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final int LIMIT = 5;
    private static final long WINDOW = 60; // seconds

    private final Map<String, RequestCounter> requests = new ConcurrentHashMap<>();

    public boolean allow(String ip) {

        RequestCounter counter = requests.computeIfAbsent(ip, k -> new RequestCounter());

        synchronized (counter) {
            long now = Instant.now().getEpochSecond();
            if (now - counter.timestamp > WINDOW) {
                counter.timestamp = now;
                counter.count = 0;
            }

            if (counter.count >= LIMIT) return false;

            counter.count++;
            return true;
        }
    }

    static class RequestCounter {
        int count = 0;
        long timestamp = Instant.now().getEpochSecond();
    }
}