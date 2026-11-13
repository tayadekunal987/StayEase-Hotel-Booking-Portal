package com.stayease.exception;

/**
 * Thrown when a guest attempts to cancel a booking that is already CANCELLED.
 * Maps to HTTP 409 Conflict.
 */
public class BookingAlreadyCancelledException extends RuntimeException {

    public BookingAlreadyCancelledException(String message) {
        super(message);
    }
}

