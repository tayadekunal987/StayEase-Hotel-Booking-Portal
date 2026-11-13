package com.stayease.dto.response;

import java.math.BigDecimal;

/**
 * Response DTO for a room category.
 *
 * @param availableRooms Number of rooms still free for the requested dates.
 *                       This is null when no dates were provided in the request,
 *                       in which case the frontend should show totalCapacity.
 */
public record RoomResponse(
        Long id,
        Long hotelId,
        String roomCategory,
        BigDecimal pricePerNight,
        Integer totalCapacity,
        Integer availableRooms
) {}

