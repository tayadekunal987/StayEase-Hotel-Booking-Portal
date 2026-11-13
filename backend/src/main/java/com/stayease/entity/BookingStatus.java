package com.stayease.entity;

/**
 * Represents the lifecycle status of a booking.
 * Only CONFIRMED bookings count toward room occupancy.
 */
public enum BookingStatus {
    CONFIRMED,
    CANCELLED
}

