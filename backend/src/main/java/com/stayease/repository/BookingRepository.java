package com.stayease.repository;

import com.stayease.entity.Booking;
import com.stayease.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Data access layer for the Booking entity.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Finds a booking by its unique reference AND the guest email.
     * Both must match — this two-factor lookup is how guests access their bookings
     * without requiring an account or login.
     */
    Optional<Booking> findByBookingReferenceAndGuestEmail(String bookingReference, String guestEmail);

    /**
     * Counts how many bookings for a specific room overlap with the requested date range,
     * filtered by status (typically CONFIRMED).
     *
     * Overlap condition (standard interval overlap):
     *   existing.checkInDate  < requestedCheckOut
     *   existing.checkOutDate > requestedCheckIn
     *
     * If this count >= room.totalCapacity, the room is fully booked for those dates.
     *
     * @param roomId    The room to check
     * @param checkIn   Requested check-in date (inclusive)
     * @param checkOut  Requested check-out date (exclusive)
     * @param status    Booking status to filter by (use BookingStatus.CONFIRMED)
     * @return          Number of overlapping bookings with the given status
     */
    @Query("""
            SELECT COUNT(b) FROM Booking b
            WHERE b.room.id = :roomId
              AND b.status  = :status
              AND b.checkInDate  < :checkOut
              AND b.checkOutDate > :checkIn
            """)
    long countOverlappingBookingsByStatus(
            @Param("roomId")   Long roomId,
            @Param("checkIn")  LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("status")   BookingStatus status
    );
}

