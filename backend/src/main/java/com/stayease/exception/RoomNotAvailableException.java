package com.stayease.exception;

/**
 * Thrown when a room has no availability for the requested date range.
 * Maps to HTTP 409 Conflict.
 */
public class RoomNotAvailableException extends RuntimeException {

    public RoomNotAvailableException(String message) {
        super(message);
    }
}

