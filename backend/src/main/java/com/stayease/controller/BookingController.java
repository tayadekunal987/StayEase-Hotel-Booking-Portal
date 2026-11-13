package com.stayease.controller;

import com.stayease.dto.request.BookingRequest;
import com.stayease.dto.request.CancelBookingRequest;
import com.stayease.dto.response.BookingResponse;
import com.stayease.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for booking operations.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/lookup")
    public ResponseEntity<BookingResponse> lookupBooking(
            @RequestParam String ref,
            @RequestParam String email) {
        return ResponseEntity.ok(bookingService.lookupBooking(ref, email));
    }

    @DeleteMapping("/{reference}")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String reference,
            @Valid @RequestBody CancelBookingRequest request) {
        return ResponseEntity.ok(bookingService.cancelBooking(reference, request.email()));
    }
}
