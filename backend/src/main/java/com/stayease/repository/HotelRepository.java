package com.stayease.repository;

import com.stayease.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Data access layer for the Hotel entity.
 */
@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    /**
     * Fetches all hotels with their amenities in a single JOIN FETCH query,
     * avoiding the N+1 problem for amenities.
     * Note: rooms are still lazy-loaded per hotel (acceptable for small datasets).
     */
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.amenities")
    List<Hotel> findAllWithAmenities();

    /**
     * Fetches hotels filtered by city (case-insensitive) with amenities eager-loaded.
     */
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.amenities WHERE LOWER(h.city) = LOWER(:city)")
    List<Hotel> findByCityWithAmenities(@Param("city") String city);

    /**
     * Fetches a single hotel with its amenities eager-loaded.
     * Rooms are loaded lazily within the transaction to avoid Hibernate's MultipleBagFetchException.
     */
    @Query("SELECT DISTINCT h FROM Hotel h LEFT JOIN FETCH h.amenities WHERE h.id = :id")
    Optional<Hotel> findByIdWithAmenities(@Param("id") Long id);
}

