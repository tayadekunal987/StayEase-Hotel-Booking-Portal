package com.stayease.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stayease.dto.request.BookingRequest;
import com.stayease.dto.response.BookingResponse;
import com.stayease.entity.Booking;
import com.stayease.entity.BookingStatus;
import com.stayease.entity.Hotel;
import com.stayease.entity.Room;
import com.stayease.exception.RoomNotAvailableException;
import com.stayease.repository.BookingRepository;
import com.stayease.repository.HotelRepository;
import com.stayease.repository.RoomRepository;
import com.stayease.service.BookingService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the booking API.
 *
 * Uses @SpringBootTest (full Spring context) + H2 in-memory database.
 * No external MySQL required. Each test resets the database via @BeforeEach / @AfterEach.
 *
 * Test cases covered:
 *  1.  POST /api/bookings          → 201 Created
 *  2.  POST /api/bookings          → 409 when room fully booked
 *  3.  GET  /api/bookings/lookup   → 200 with booking details
 *  4.  GET  /api/bookings/lookup   → 404 for wrong reference/email
 *  5.  DELETE /api/bookings/{ref}  → 200 Cancelled
 *  6.  DELETE /api/bookings/{ref}  → 409 if already cancelled
 *  7.  Concurrent POST             → only 1 of N requests succeeds (overbooking prevention)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("BookingController Integration Tests")
class BookingControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private HotelRepository hotelRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private BookingService bookingService;

    private Hotel testHotel;
    private Room testRoom;   // capacity = 5

    @BeforeEach
    void setUp() {
        // Clean slate for every test
        bookingRepository.deleteAll();
        roomRepository.deleteAll();
        hotelRepository.deleteAll();

        testHotel = new Hotel();
        testHotel.setName("Integration Test Hotel");
        testHotel.setCity("Test City");
        testHotel.setAddress("1 Test Street");
        testHotel.setDescription("Used in integration tests");
        testHotel.setStarRating(new BigDecimal("4.0"));
        testHotel = hotelRepository.save(testHotel);

        testRoom = new Room();
        testRoom.setHotel(testHotel);
        testRoom.setRoomCategory("Standard");
        testRoom.setPricePerNight(new BigDecimal("3000.00"));
        testRoom.setTotalCapacity(5);
        testRoom = roomRepository.save(testRoom);
    }

    @AfterEach
    void tearDown() {
        bookingRepository.deleteAll();
        roomRepository.deleteAll();
        hotelRepository.deleteAll();
    }

    // ── Test 1: Create booking — 201 Created ─────────────────────────────────

    @Test
    @DisplayName("1. POST /api/bookings — returns 201 with booking reference and correct total")
    void createBooking_shouldReturn201WithCorrectDetails() throws Exception {
        // 3 nights × ₹3000 = ₹9000
        BookingRequest request = new BookingRequest(
                "Alice Smith", "alice@example.com", testRoom.getId(),
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(8)
        );

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingReference").value(org.hamcrest.Matchers.startsWith("SE-")))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.numberOfNights").value(3))
                .andExpect(jsonPath("$.totalAmount").value(9000.0))
                .andExpect(jsonPath("$.guestName").value("Alice Smith"));
    }

    // ── Test 2: Create booking — 409 Conflict (room fully booked) ────────────

    @Test
    @DisplayName("2. POST /api/bookings — returns 409 when room is at full capacity")
    void createBooking_whenRoomFullyBooked_shouldReturn409() throws Exception {
        LocalDate checkIn  = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(12);

        // Fill all 5 slots
        for (int i = 0; i < 5; i++) {
            bookingService.createBooking(new BookingRequest(
                    "Guest " + i, "guest" + i + "@test.com",
                    testRoom.getId(), checkIn, checkOut));
        }

        // 6th booking should be rejected
        BookingRequest overflowRequest = new BookingRequest(
                "Overflow Guest", "overflow@test.com",
                testRoom.getId(), checkIn, checkOut);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(overflowRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Room Not Available"));
    }

    // ── Test 3: Lookup booking — 200 OK ──────────────────────────────────────

    @Test
    @DisplayName("3. GET /api/bookings/lookup — returns 200 with booking details for valid ref+email")
    void lookupBooking_shouldReturn200WithBookingDetails() throws Exception {
        // Create a booking first
        BookingResponse created = bookingService.createBooking(new BookingRequest(
                "Bob Jones", "bob@example.com", testRoom.getId(),
                LocalDate.now().plusDays(2),
                LocalDate.now().plusDays(5)));

        mockMvc.perform(get("/api/bookings/lookup")
                        .param("ref", created.bookingReference())
                        .param("email", "bob@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingReference").value(created.bookingReference()))
                .andExpect(jsonPath("$.guestName").value("Bob Jones"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    // ── Test 4: Lookup booking — 404 wrong ref/email ─────────────────────────

    @Test
    @DisplayName("4. GET /api/bookings/lookup — returns 404 for unmatched reference or email")
    void lookupBooking_withWrongEmail_shouldReturn404() throws Exception {
        mockMvc.perform(get("/api/bookings/lookup")
                        .param("ref", "SE-INVALID")
                        .param("email", "nobody@example.com"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    // ── Test 5: Cancel booking — 200 Cancelled ───────────────────────────────

    @Test
    @DisplayName("5. DELETE /api/bookings/{ref} — returns 200 with CANCELLED status")
    void cancelBooking_shouldReturn200WithCancelledStatus() throws Exception {
        BookingResponse created = bookingService.createBooking(new BookingRequest(
                "Carol White", "carol@example.com", testRoom.getId(),
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(10)));

        Map<String, String> cancelBody = Map.of("email", "carol@example.com");

        mockMvc.perform(delete("/api/bookings/" + created.bookingReference())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.bookingReference").value(created.bookingReference()));
    }

    // ── Test 6: Cancel already-cancelled booking — 409 Conflict ──────────────

    @Test
    @DisplayName("6. DELETE /api/bookings/{ref} — returns 409 if booking is already CANCELLED")
    void cancelBooking_whenAlreadyCancelled_shouldReturn409() throws Exception {
        BookingResponse created = bookingService.createBooking(new BookingRequest(
                "Dave Brown", "dave@example.com", testRoom.getId(),
                LocalDate.now().plusDays(14),
                LocalDate.now().plusDays(16)));

        // First cancellation — should succeed
        bookingService.cancelBooking(created.bookingReference(), "dave@example.com");

        // Second cancellation — should fail
        Map<String, String> cancelBody = Map.of("email", "dave@example.com");

        mockMvc.perform(delete("/api/bookings/" + created.bookingReference())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cancelBody)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Booking Already Cancelled"));
    }

    // ── Test 7: Availability restored after cancellation ─────────────────────

    @Test
    @DisplayName("7. After cancellation, the freed slot can be booked by another guest")
    void createBooking_afterCancellation_shouldSucceedForNewGuest() throws Exception {
        // Create a room with capacity = 1
        Room singleRoom = new Room();
        singleRoom.setHotel(testHotel);
        singleRoom.setRoomCategory("Last Room");
        singleRoom.setPricePerNight(new BigDecimal("5000.00"));
        singleRoom.setTotalCapacity(1);
        singleRoom = roomRepository.save(singleRoom);

        LocalDate checkIn  = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(7);

        // Guest A books the only room
        BookingResponse guestA = bookingService.createBooking(new BookingRequest(
                "Guest A", "guesta@example.com", singleRoom.getId(), checkIn, checkOut));

        // Guest A cancels — slot is freed
        bookingService.cancelBooking(guestA.bookingReference(), "guesta@example.com");

        // Guest B should now succeed
        BookingRequest guestBRequest = new BookingRequest(
                "Guest B", "guestb@example.com", singleRoom.getId(), checkIn, checkOut);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(guestBRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    // ── Test 8: Concurrent booking — overbooking prevention ──────────────────

    @Test
    @DisplayName("8. Concurrent booking requests on the last room — only 1 succeeds, others get 409")
    void createBooking_concurrently_shouldPreventOverbooking() throws InterruptedException {
        // Create a room with capacity = 1 (the "last room")
        Room lastRoom = new Room();
        lastRoom.setHotel(testHotel);
        lastRoom.setRoomCategory("Single Room");
        lastRoom.setPricePerNight(new BigDecimal("4000.00"));
        lastRoom.setTotalCapacity(1);
        lastRoom = roomRepository.save(lastRoom);
        final Long roomId = lastRoom.getId();

        LocalDate checkIn  = LocalDate.now().plusDays(20);
        LocalDate checkOut = LocalDate.now().plusDays(22);

        // Launch 3 threads that all try to book the same room simultaneously
        int threadCount = 3;
        ExecutorService executor     = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch    = new CountDownLatch(1);  // used to fire all threads at once
        CountDownLatch doneLatch     = new CountDownLatch(threadCount);
        AtomicInteger successCount   = new AtomicInteger(0);
        AtomicInteger notAvailCount  = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            final int idx = i;
            executor.submit(() -> {
                try {
                    startLatch.await(); // block until all threads are ready
                    BookingRequest req = new BookingRequest(
                            "Concurrent Guest " + idx,
                            "concurrent" + idx + "@test.com",
                            roomId, checkIn, checkOut
                    );
                    bookingService.createBooking(req);
                    successCount.incrementAndGet();
                } catch (RoomNotAvailableException e) {
                    notAvailCount.incrementAndGet();
                } catch (Exception e) {
                    // Any other unexpected exception also counts as a failure
                    notAvailCount.incrementAndGet();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // release all threads simultaneously
        assertTrue(doneLatch.await(15, TimeUnit.SECONDS), "Threads did not finish in time");
        executor.shutdown();

        // Exactly 1 thread should have succeeded; the rest should have been rejected
        assertThat(successCount.get()).isEqualTo(1);
        assertThat(notAvailCount.get()).isEqualTo(2);

        // Verify exactly 1 CONFIRMED booking in the database
        long confirmedCount = bookingRepository.countOverlappingBookingsByStatus(
                roomId, checkIn, checkOut, BookingStatus.CONFIRMED);
        assertThat(confirmedCount).isEqualTo(1);
    }
}

