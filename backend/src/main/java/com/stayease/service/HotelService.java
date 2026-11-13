package com.stayease.service;

import com.stayease.dto.response.HotelResponse;
import com.stayease.dto.response.RoomResponse;
import com.stayease.entity.BookingStatus;
import com.stayease.entity.Hotel;
import com.stayease.entity.Room;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.repository.BookingRepository;
import com.stayease.repository.HotelRepository;
import com.stayease.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * Service for hotel search and room availability queries.
 */
@Service
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public HotelService(
            HotelRepository hotelRepository,
            RoomRepository roomRepository,
            BookingRepository bookingRepository) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<HotelResponse> searchHotels(String city) {
        List<Hotel> hotels = (city != null && !city.isBlank())
                ? hotelRepository.findByCityWithAmenities(city)
                : hotelRepository.findAllWithAmenities();

        return hotels.stream()
                .map(this::toHotelResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findByIdWithAmenities(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Hotel not found with id: " + id));
        return toHotelResponse(hotel);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsForHotel(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        if (!hotelRepository.existsById(hotelId)) {
            throw new ResourceNotFoundException("Hotel not found with id: " + hotelId);
        }
        return roomRepository.findByHotelId(hotelId).stream()
                .map(room -> toRoomResponse(room, checkIn, checkOut))
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long hotelId, Long roomId, LocalDate checkIn, LocalDate checkOut) {
        Room room = roomRepository.findById(roomId)
                .filter(r -> r.getHotel().getId().equals(hotelId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with id: " + roomId + " in hotel: " + hotelId));
        return toRoomResponse(room, checkIn, checkOut);
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private HotelResponse toHotelResponse(Hotel hotel) {
        List<String> amenityNames = hotel.getAmenities().stream()
                .map(a -> a.getAmenityName())
                .toList();

        BigDecimal lowestPrice = hotel.getRooms().stream()
                .map(Room::getPricePerNight)
                .min(Comparator.naturalOrder())
                .orElse(null);

        return new HotelResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getCity(),
                hotel.getAddress(),
                hotel.getDescription(),
                hotel.getImageUrl(),
                hotel.getStarRating(),
                amenityNames,
                lowestPrice
        );
    }

    private RoomResponse toRoomResponse(Room room, LocalDate checkIn, LocalDate checkOut) {
        int availableRooms = room.getTotalCapacity();
        if (checkIn != null && checkOut != null) {
            long occupied = bookingRepository.countOverlappingBookingsByStatus(
                    room.getId(), checkIn, checkOut, BookingStatus.CONFIRMED);
            availableRooms = Math.max(0, (int) (room.getTotalCapacity() - occupied));
        }

        return new RoomResponse(
                room.getId(),
                room.getHotel().getId(),
                room.getRoomCategory(),
                room.getPricePerNight(),
                room.getTotalCapacity(),
                availableRooms
        );
    }
}
