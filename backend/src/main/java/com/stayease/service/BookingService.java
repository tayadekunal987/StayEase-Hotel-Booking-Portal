package com.stayease.service;

import com.stayease.dto.request.BookingRequest;
import com.stayease.dto.response.BookingResponse;
import com.stayease.entity.Booking;
import com.stayease.entity.BookingStatus;
import com.stayease.entity.Hotel;
import com.stayease.entity.Room;
import com.stayease.exception.BookingAlreadyCancelledException;
import com.stayease.exception.ResourceNotFoundException;
import com.stayease.exception.RoomNotAvailableException;
import com.stayease.repository.BookingRepository;
import com.stayease.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Core service for all booking operations with strict concurrency control.
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public BookingService(BookingRepository bookingRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request) {
        validateDates(request.checkInDate(), request.checkOutDate());

        Room room = roomRepository.findByIdWithLock(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Room not found with id: " + request.roomId()));

        Hotel hotel = room.getHotel();

        long overlappingCount = bookingRepository.countOverlappingBookingsByStatus(
                room.getId(),
                request.checkInDate(),
                request.checkOutDate(),
                BookingStatus.CONFIRMED
        );

        if (overlappingCount >= room.getTotalCapacity()) {
            throw new RoomNotAvailableException(
                    "No rooms available in the '" + room.getRoomCategory() +
                    "' category for the selected dates. Please choose different dates or another room type.");
        }

        long nights = ChronoUnit.DAYS.between(request.checkInDate(), request.checkOutDate());
        BigDecimal totalAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking();
        booking.setBookingReference(generateBookingReference());
        booking.setHotel(hotel);
        booking.setRoom(room);
        booking.setGuestName(request.guestName().trim());
        booking.setGuestEmail(request.guestEmail().trim().toLowerCase());
        booking.setCheckInDate(request.checkInDate());
        booking.setCheckOutDate(request.checkOutDate());
        booking.setNumberOfNights((int) nights);
        booking.setPricePerNight(room.getPricePerNight());
        booking.setTotalAmount(totalAmount);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponse lookupBooking(String bookingReference, String email) {
        Booking booking = bookingRepository
                .findByBookingReferenceAndGuestEmail(
                        bookingReference, email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No booking found for the provided reference and email. " +
                        "Please check your details and try again."));
        return toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(String bookingReference, String email) {
        Booking booking = bookingRepository
                .findByBookingReferenceAndGuestEmail(
                        bookingReference, email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No booking found for the provided reference and email. " +
                        "Please check your details and try again."));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingAlreadyCancelledException(
                    "Booking " + bookingReference + " has already been cancelled.");
        }

        roomRepository.findByIdWithLock(booking.getRoom().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Associated room not found. Please contact support."));

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return toBookingResponse(saved);
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Check-in date cannot be in the past.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException(
                    "Check-out date must be after check-in date.");
        }
    }

    private String generateBookingReference() {
        String uid = UUID.randomUUID().toString().replace("-", "").toUpperCase();
        return "SE-" + uid.substring(0, 6);
    }

    private BookingResponse toBookingResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getBookingReference(),
                b.getHotel().getName(),
                b.getHotel().getCity(),
                b.getRoom().getRoomCategory(),
                b.getGuestName(),
                b.getGuestEmail(),
                b.getCheckInDate(),
                b.getCheckOutDate(),
                b.getNumberOfNights(),
                b.getPricePerNight(),
                b.getTotalAmount(),
                b.getStatus(),
                b.getCreatedAt()
        );
    }
}
