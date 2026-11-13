package com.stayease.service;

import com.stayease.dto.request.BookingRequest;
import com.stayease.dto.response.BookingResponse;
import com.stayease.entity.Booking;
import com.stayease.entity.BookingStatus;
import com.stayease.entity.Hotel;
import com.stayease.entity.Room;
import com.stayease.exception.BookingAlreadyCancelledException;
import com.stayease.exception.RoomNotAvailableException;
import com.stayease.repository.BookingRepository;
import com.stayease.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BookingService.
 *
 * Uses Mockito to mock all repository calls so these tests run without
 * a database — fast and isolated. Each test covers one specific scenario.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private BookingService bookingService;

    // ── Shared test fixtures ─────────────────────────────────────────────────

    private Hotel testHotel;
    private Room testRoom;

    @BeforeEach
    void setUp() {
        testHotel = new Hotel();
        testHotel.setId(1L);
        testHotel.setName("Test Hotel");
        testHotel.setCity("Test City");

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setHotel(testHotel);
        testRoom.setRoomCategory("Deluxe");
        testRoom.setPricePerNight(new BigDecimal("5000.00"));
        testRoom.setTotalCapacity(5);
    }

    // ── Test 1: Correct price calculation ────────────────────────────────────

    @Test
    @DisplayName("1. Successful booking — price calculated correctly (3 nights × ₹5000 = ₹15000)")
    void createBooking_shouldCalculateCorrectTotalAmount() {
        // Given: check-in tomorrow, check-out in 4 days → 3 nights
        LocalDate checkIn  = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(4);

        when(roomRepository.findByIdWithLock(1L))
                .thenReturn(Optional.of(testRoom));
        when(bookingRepository.countOverlappingBookingsByStatus(
                eq(1L), eq(checkIn), eq(checkOut), eq(BookingStatus.CONFIRMED)))
                .thenReturn(0L); // no existing bookings
        when(bookingRepository.save(any(Booking.class)))
                .thenAnswer(inv -> {
                    Booking b = inv.getArgument(0);
                    b.setId(1L);
                    return b;
                });

        BookingRequest request = new BookingRequest(
                "Alice Smith", "alice@example.com", 1L, checkIn, checkOut);

        // When
        BookingResponse response = bookingService.createBooking(request);

        // Then
        assertThat(response.numberOfNights()).isEqualTo(3);
        assertThat(response.pricePerNight()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(response.totalAmount()).isEqualByComparingTo(new BigDecimal("15000.00"));
        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.bookingReference()).startsWith("SE-");
        assertThat(response.bookingReference()).hasSize(9); // "SE-" + 6 chars
    }

    // ── Test 2: Check-in date in the past ────────────────────────────────────

    @Test
    @DisplayName("2. Check-in date in the past — throws IllegalArgumentException")
    void createBooking_withPastCheckIn_shouldThrowIllegalArgumentException() {
        // Given: check-in was yesterday
        LocalDate pastDate = LocalDate.now().minusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(2);
        BookingRequest request = new BookingRequest(
                "Bob", "bob@example.com", 1L, pastDate, checkOut);

        // Then: should reject before even touching the database
        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("past");

        // Repository should NOT be called
        verify(roomRepository, never()).findByIdWithLock(any());
    }

    // ── Test 3: Check-out before check-in ────────────────────────────────────

    @Test
    @DisplayName("3. Check-out is before check-in — throws IllegalArgumentException")
    void createBooking_withCheckOutBeforeCheckIn_shouldThrowIllegalArgumentException() {
        // Given: check-out is earlier than check-in
        LocalDate checkIn  = LocalDate.now().plusDays(5);
        LocalDate checkOut = LocalDate.now().plusDays(3);
        BookingRequest request = new BookingRequest(
                "Carol", "carol@example.com", 1L, checkIn, checkOut);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("after");

        verify(roomRepository, never()).findByIdWithLock(any());
    }

    // ── Test 4: Overlapping dates — room fully booked ────────────────────────

    @Test
    @DisplayName("4. Requested dates overlap with existing bookings at full capacity — throws RoomNotAvailableException")
    void createBooking_withOverlappingDatesAtCapacity_shouldThrowRoomNotAvailableException() {
        // Given: room has capacity 5, and all 5 are booked for the requested dates
        LocalDate checkIn  = LocalDate.now().plusDays(10);
        LocalDate checkOut = LocalDate.now().plusDays(13);

        when(roomRepository.findByIdWithLock(1L))
                .thenReturn(Optional.of(testRoom));
        when(bookingRepository.countOverlappingBookingsByStatus(
                eq(1L), eq(checkIn), eq(checkOut), eq(BookingStatus.CONFIRMED)))
                .thenReturn(5L); // 5 existing = full capacity

        BookingRequest request = new BookingRequest(
                "Dave", "dave@example.com", 1L, checkIn, checkOut);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(RoomNotAvailableException.class);

        verify(bookingRepository, never()).save(any());
    }

    // ── Test 5: Last room fully occupied ─────────────────────────────────────

    @Test
    @DisplayName("5. Room with capacity 1 is fully occupied — throws RoomNotAvailableException")
    void createBooking_whenLastRoomAlreadyTaken_shouldThrowRoomNotAvailableException() {
        // Given: a room with only 1 unit, already occupied
        testRoom.setTotalCapacity(1);
        LocalDate checkIn  = LocalDate.now().plusDays(7);
        LocalDate checkOut = LocalDate.now().plusDays(9);

        when(roomRepository.findByIdWithLock(1L))
                .thenReturn(Optional.of(testRoom));
        when(bookingRepository.countOverlappingBookingsByStatus(
                eq(1L), eq(checkIn), eq(checkOut), eq(BookingStatus.CONFIRMED)))
                .thenReturn(1L); // 1 existing = at capacity

        BookingRequest request = new BookingRequest(
                "Eve", "eve@example.com", 1L, checkIn, checkOut);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(RoomNotAvailableException.class);
    }

    // ── Test 6: Successful cancellation ──────────────────────────────────────

    @Test
    @DisplayName("6. Cancel a confirmed booking — status becomes CANCELLED")
    void cancelBooking_shouldSetStatusToCancelled() {
        // Given: an existing confirmed booking
        Booking existing = buildConfirmedBooking("SE-ABC123", "john@example.com");

        when(bookingRepository.findByBookingReferenceAndGuestEmail("SE-ABC123", "john@example.com"))
                .thenReturn(Optional.of(existing));
        when(roomRepository.findByIdWithLock(1L))
                .thenReturn(Optional.of(testRoom));
        when(bookingRepository.save(any(Booking.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // When
        BookingResponse response = bookingService.cancelBooking("SE-ABC123", "john@example.com");

        // Then
        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(response.bookingReference()).isEqualTo("SE-ABC123");
    }

    // ── Test 7: Cancel an already-cancelled booking ───────────────────────────

    @Test
    @DisplayName("7. Cancel a booking that is already CANCELLED — throws BookingAlreadyCancelledException")
    void cancelBooking_whenAlreadyCancelled_shouldThrowException() {
        // Given: a booking that was previously cancelled
        Booking cancelled = buildConfirmedBooking("SE-XYZ789", "jane@example.com");
        cancelled.setStatus(BookingStatus.CANCELLED);

        when(bookingRepository.findByBookingReferenceAndGuestEmail("SE-XYZ789", "jane@example.com"))
                .thenReturn(Optional.of(cancelled));

        // Then: should refuse to cancel again
        assertThatThrownBy(() -> bookingService.cancelBooking("SE-XYZ789", "jane@example.com"))
                .isInstanceOf(BookingAlreadyCancelledException.class);

        verify(bookingRepository, never()).save(any());
    }

    // ── Test 8: New booking succeeds after cancellation ───────────────────────

    @Test
    @DisplayName("8. After a cancellation, overlapping count drops — a new booking succeeds")
    void createBooking_afterCancellation_shouldSucceedWhenSlotIsFreed() {
        // Given: the slot is now free (overlapping count = 0 after cancellation)
        LocalDate checkIn  = LocalDate.now().plusDays(1);
        LocalDate checkOut = LocalDate.now().plusDays(3);

        when(roomRepository.findByIdWithLock(1L))
                .thenReturn(Optional.of(testRoom));
        when(bookingRepository.countOverlappingBookingsByStatus(
                eq(1L), eq(checkIn), eq(checkOut), eq(BookingStatus.CONFIRMED)))
                .thenReturn(0L); // slot is free
        when(bookingRepository.save(any(Booking.class)))
                .thenAnswer(inv -> {
                    Booking b = inv.getArgument(0);
                    b.setId(2L);
                    return b;
                });

        BookingRequest request = new BookingRequest(
                "New Guest", "newguest@example.com", 1L, checkIn, checkOut);

        // When
        BookingResponse response = bookingService.createBooking(request);

        // Then: booking is confirmed, new reference generated
        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(response.bookingReference()).startsWith("SE-");
        assertThat(response.totalAmount()).isEqualByComparingTo(new BigDecimal("10000.00")); // 2 nights × 5000
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Builds a minimal confirmed Booking for use in cancel-related tests. */
    private Booking buildConfirmedBooking(String ref, String email) {
        Booking b = new Booking();
        b.setId(1L);
        b.setBookingReference(ref);
        b.setGuestName("Test Guest");
        b.setGuestEmail(email);
        b.setHotel(testHotel);
        b.setRoom(testRoom);
        b.setCheckInDate(LocalDate.now().plusDays(5));
        b.setCheckOutDate(LocalDate.now().plusDays(8));
        b.setNumberOfNights(3);
        b.setPricePerNight(new BigDecimal("5000.00"));
        b.setTotalAmount(new BigDecimal("15000.00"));
        b.setStatus(BookingStatus.CONFIRMED);
        b.setCreatedAt(LocalDateTime.now());
        return b;
    }
}

