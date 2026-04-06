package com.suprun.service;

import com.suprun.dto.Decision;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

class RateLimitServiceTest {

    @Test
    void check_shouldAllowRequestsWithinLimit() {
        RateLimitService service = new RateLimitService(3, 60, 1000);

        Decision decision1 = service.check("user1");
        Decision decision2 = service.check("user1");
        Decision decision3 = service.check("user1");

        assertThat(decision1.allowed()).isTrue();
        assertThat(decision2.allowed()).isTrue();
        assertThat(decision3.allowed()).isTrue();

        assertThat(decision3.remaining()).isEqualTo(0);
    }

    @Test
    void check_shouldBlockWhenLimitExceeded() {
        RateLimitService service = new RateLimitService(2, 60, 1000);

        service.check("user1");
        service.check("user1");
        Decision decision3 = service.check("user1"); // 3 → exceed

        assertThat(decision3.allowed()).isFalse();
        assertThat(decision3.remaining()).isEqualTo(0);
        assertThat(decision3.retryAfterSeconds()).isGreaterThan(0);
    }

    @Test
    void check_shouldUseSeparateCountersPerKey() {
        RateLimitService service = new RateLimitService(1, 60, 1000);

        Decision decision1 = service.check("user1");
        Decision decision2 = service.check("user2");

        assertThat(decision1.allowed()).isTrue();
        assertThat(decision2.allowed()).isTrue();
    }

    @Test
    void check_shouldNormalizeNullAndEmptyKeys() {
        RateLimitService service = new RateLimitService(1, 60, 1000);

        Decision decision1 = service.check(null);
        Decision decision2 = service.check("   ");

        // both map to "<unknown>" → second call exceeds
        assertThat(decision1.allowed()).isTrue();
        assertThat(decision2.allowed()).isFalse();
    }

    @Test
    void check_shouldResetAfterWindow() throws InterruptedException {
        // small window for testing
        RateLimitService service = new RateLimitService(1, 1, 1000);

        Decision decision1 = service.check("user1");
        assertThat(decision1.allowed()).isTrue();

        Decision decision2 = service.check("user1");
        assertThat(decision2.allowed()).isFalse();

        // wait for next window
        Thread.sleep(1100);

        Decision decision3 = service.check("user1");
        assertThat(decision3.allowed()).isTrue();
    }

    @Test
    void check_shouldReturnCorrectRemainingCount() {
        RateLimitService service = new RateLimitService(3, 60, 1000);

        Decision decision1 = service.check("user1"); // remaining 2
        Decision decision2 = service.check("user1"); // remaining 1

        assertThat(decision1.remaining()).isEqualTo(2);
        assertThat(decision2.remaining()).isEqualTo(1);
    }

    @Test
    void constructor_shouldThrow_whenInvalidLimit() {
        assertThatThrownBy(() -> new RateLimitService(0, 60, 1000))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("limit");
    }

    @Test
    void constructor_shouldThrow_whenInvalidWindow() {
        assertThatThrownBy(() -> new RateLimitService(5, 0, 1000))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("windowSeconds");
    }

    @Test
    void constructor_shouldThrow_whenInvalidMaxKeys() {
        assertThatThrownBy(() -> new RateLimitService(5, 60, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("maxKeys");
    }

    @Test
    void check_shouldReturnRetryAfterWithinWindow() {
        RateLimitService service = new RateLimitService(1, 60, 1000);

        service.check("user1"); // allowed
        Decision decision2 = service.check("user1"); // blocked

        assertThat(decision2.allowed()).isFalse();
        assertThat(decision2.retryAfterSeconds()).isBetween(0L, 60L);
    }
}