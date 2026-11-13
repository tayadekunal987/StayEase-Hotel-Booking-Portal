package com.stayease.dto.response;

import com.stayease.entity.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Response DTO for a booking.
 * Returned on create, lookup, and cancel operations.
 */
public record BookingResponse(
        Long id,
        String bookingReference,
        String hotelName,
        String hotelCity,
        String roomCategory,
        String guestName,
        String guestEmail,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        Integer numberOfNights,
        BigDecimal pricePerNight,
        BigDecimal totalAmount,
        BookingStatus status,
        LocalDateTime createdAt
) {}

