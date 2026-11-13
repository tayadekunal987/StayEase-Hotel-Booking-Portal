package com.stayease.repository;

import com.stayease.entity.Room;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access layer for the Room entity.
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    /** Returns all rooms belonging to a specific hotel. */
    List<Room> findByHotelId(Long hotelId);

    /**
     * Acquires a PESSIMISTIC_WRITE lock (SELECT ... FOR UPDATE) on the room row.
     *
     * This is the core of the overbooking-prevention strategy.
     * When BookingService calls this method, the database holds an exclusive row-level
     * lock on the room until the surrounding @Transactional method completes.
     * Any other concurrent transaction trying to book or cancel the same room must
     * wait, ensuring the availability check and the booking insert are atomic.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdWithLock(@Param("id") Long id);
}

