package com.suprun.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> validationError() {
        return ResponseEntity.badRequest().body("Invalid request data");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> genericError() {
        return ResponseEntity.status(500).body("Server error");
    }
}