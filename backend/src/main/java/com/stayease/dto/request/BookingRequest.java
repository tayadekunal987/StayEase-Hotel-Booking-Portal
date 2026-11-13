package com.stayease.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Request body for creating a new booking.
 * Note: totalAmount is intentionally NOT included here — it is always
 * calculated by the backend to prevent client-side tampering.
 *
 * Cross-field validation (checkOut > checkIn) is handled in BookingService
 * since Java records do not easily support class-level constraint annotations.
 */
public record BookingRequest(

        @NotBlank(message = "Guest name is required")
        String guestName,

        @NotBlank(message = "Guest email is required")
        @Email(message = "Please provide a valid email address")
        String guestEmail,

        @NotNull(message = "Room ID is required")
        Long roomId,

        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in date cannot be in the past")
        LocalDate checkInDate,

        @NotNull(message = "Check-out date is required")
        LocalDate checkOutDate

) {}

