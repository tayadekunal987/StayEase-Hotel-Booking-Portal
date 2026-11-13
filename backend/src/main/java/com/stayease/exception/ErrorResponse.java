package com.stayease.exception;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response returned by the GlobalExceptionHandler.
 * All API errors share this consistent structure.
 *
 * @param status     HTTP status code (e.g. 400, 404, 409)
 * @param error      Short error label (e.g. "Not Found", "Room Not Available")
 * @param message    Human-readable description of the error
 * @param fieldErrors Field-level validation messages (null for non-validation errors)
 * @param timestamp  When the error occurred
 */
public record ErrorResponse(
        int status,
        String error,
        String message,
        Map<String, String> fieldErrors,
        LocalDateTime timestamp
) {
    /** Convenience constructor for simple, non-validation errors. */
    public ErrorResponse(int status, String error, String message) {
        this(status, error, message, null, LocalDateTime.now());
    }

    /** Convenience constructor for validation errors with per-field messages. */
    public ErrorResponse(int status, String error, Map<String, String> fieldErrors) {
        this(status, error, "Validation failed. Please correct the errors and try again.", fieldErrors, LocalDateTime.now());
    }
}

