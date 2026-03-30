package com.suprun.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    private static final String ALL_PATHS_PATTERN = "/**";
    private static final long DEFAULT_MAX_AGE_SECONDS = 3600L;
    private static final List<String> ALLOWED_METHODS = List.of("GET", "POST", "PUT", "DELETE", "OPTIONS");
    private static final List<String> ALLOWED_HEADERS = List.of("*");
    private static final List<String> EXPOSED_HEADERS = List.of(
            "X-Correlation-Id",
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset",
            "Retry-After"
    );

    private static final String ALLOWED_ORIGIN_PATTERNS_PROPERTY =
            "${app.cors.allowed-origin-patterns:http://localhost:3000,https://yuriisuprun.vercel.app,https://*.vercel.app}";

    private final List<String> allowedOriginPatterns;

    public CorsConfig(@Value(ALLOWED_ORIGIN_PATTERNS_PROPERTY) String patterns) {
        this.allowedOriginPatterns = parseAllowedOriginPatterns(patterns);
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = buildCorsConfiguration();

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration(ALL_PATHS_PATTERN, config);
        return new CorsFilter(source);
    }

    private CorsConfiguration buildCorsConfiguration() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(allowedOriginPatterns);
        config.setAllowedMethods(ALLOWED_METHODS);
        config.setAllowedHeaders(ALLOWED_HEADERS);
        config.setExposedHeaders(EXPOSED_HEADERS);
        config.setMaxAge(DEFAULT_MAX_AGE_SECONDS);
        return config;
    }

    private static List<String> parseAllowedOriginPatterns(String patternsCsv) {
        if (patternsCsv == null || patternsCsv.isBlank()) {
            return List.of();
        }

        return Arrays.stream(patternsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();
    }
}
