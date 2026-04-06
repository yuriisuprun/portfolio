package com.suprun.dto;

public record Decision(
        boolean allowed,
        int limit,
        int remaining,
        long resetEpochSecond,
        long retryAfterSeconds
) {
}
