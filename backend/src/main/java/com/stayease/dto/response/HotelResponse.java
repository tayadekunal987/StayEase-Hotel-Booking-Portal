package com.stayease.dto.response;

import java.math.BigDecimal;
import java.util.List;

/**
 * Response DTO for hotel data.
 * Never exposes the internal Hotel entity directly.
 *
 * @param lowestPricePerNight The minimum price across all room categories
 *                            (shown as "From ₹X/night" on the listing page).
 */
public record HotelResponse(
        Long id,
        String name,
        String city,
        String address,
        String description,
        String imageUrl,
        BigDecimal starRating,
        List<String> amenities,
        BigDecimal lowestPricePerNight
) {}

