package com.suprun.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validationError(MethodArgumentNotValidException ex, HttpServletRequest request) {
        // Client errors: keep logs low-noise in prod.
        if (log.isDebugEnabled()) {
            log.debug("Validation failed on {} {}: {} errors",
                    safeMethod(request), safeUri(request),
                    ex.getBindingResult() == null ? 0 : ex.getBindingResult().getErrorCount());
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid request data"));
    }

    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ResponseEntity<?> notFound(Exception ex, HttpServletRequest request) {
        // Not found is not a server error; avoid noisy ERROR logs (Render probes "/" via GET/HEAD).
        if (log.isDebugEnabled()) {
            log.debug("Not found on {} {}: {}", safeMethod(request), safeUri(request), ex.getClass().getSimpleName());
        }
        return ResponseEntity.status(404).body(Map.of("error", "Not found"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> genericError(Exception ex, HttpServletRequest request) {
        // Server errors: always log stack trace (will include correlationId via MDC pattern).
        log.error("Unhandled exception on {} {}", safeMethod(request), safeUri(request), ex);
        return ResponseEntity.status(500).body(Map.of("error", "Server error"));
    }

    private static String safeMethod(HttpServletRequest request) {
        String method = request == null ? null : request.getMethod();
        return method == null ? "<unknown>" : method;
    }

    private static String safeUri(HttpServletRequest request) {
        String uri = request == null ? null : request.getRequestURI();
        return uri == null ? "<unknown>" : uri;
    }
}
