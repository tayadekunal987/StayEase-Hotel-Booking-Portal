package com.stayease.exception;

/**
 * Thrown when a requested resource (hotel, room, or booking) cannot be found.
 * Maps to HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}

