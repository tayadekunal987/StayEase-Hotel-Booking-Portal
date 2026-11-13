package com.stayease.controller;

import com.stayease.dto.response.HotelResponse;
import com.stayease.dto.response.RoomResponse;
import com.stayease.service.HotelService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for hotel search and room availability endpoints.
 */
@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @GetMapping
    public ResponseEntity<List<HotelResponse>> getHotels(
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(hotelService.searchHotels(city));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }

    @GetMapping("/{id}/rooms")
    public ResponseEntity<List<RoomResponse>> getRoomsForHotel(
            @PathVariable Long id,
            @RequestParam(required = false) String checkIn,
            @RequestParam(required = false) String checkOut) {
        LocalDate parsedIn = parseLocalDateSafely(checkIn);
        LocalDate parsedOut = parseLocalDateSafely(checkOut);
        return ResponseEntity.ok(hotelService.getRoomsForHotel(id, parsedIn, parsedOut));
    }

    @GetMapping("/{hotelId}/rooms/{roomId}")
    public ResponseEntity<RoomResponse> getRoomById(
            @PathVariable Long hotelId,
            @PathVariable Long roomId,
            @RequestParam(required = false) String checkIn,
            @RequestParam(required = false) String checkOut) {
        LocalDate parsedIn = parseLocalDateSafely(checkIn);
        LocalDate parsedOut = parseLocalDateSafely(checkOut);
        return ResponseEntity.ok(hotelService.getRoomById(hotelId, roomId, parsedIn, parsedOut));
    }

    private LocalDate parseLocalDateSafely(String dateStr) {
        if (dateStr == null || dateStr.isBlank() || "undefined".equalsIgnoreCase(dateStr) || "null".equalsIgnoreCase(dateStr)) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
