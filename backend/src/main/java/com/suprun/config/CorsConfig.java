package com.suprun.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow local dev and production origins
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "https://yuriisuprun.vercel.app",
                "https://*.onrender.com"
        ));

        config.setAllowCredentials(true);       // Allow cookies/auth headers
        config.addAllowedHeader("*");           // Allow all headers
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allowed HTTP methods

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config); // Apply to all API paths

        return new CorsFilter(source);
    }
}
