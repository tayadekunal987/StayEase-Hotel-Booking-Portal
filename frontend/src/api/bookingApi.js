import axiosInstance from './axiosInstance.js';

/**
 * API functions for booking-related endpoints.
 */

/**
 * Create a new booking.
 * @param {Object} bookingData - { guestName, guestEmail, roomId, checkInDate, checkOutDate }
 */
export const createBooking = (bookingData) =>
  axiosInstance.post('/api/bookings', bookingData);

/**
 * Retrieve a booking by reference and email (two-factor lookup).
 * @param {string} ref   - Booking reference (e.g. "SE-A3F9B2")
 * @param {string} email - Email used at booking time
 */
export const lookupBooking = (ref, email) =>
  axiosInstance.get('/api/bookings/lookup', { params: { ref, email } });

/**
 * Cancel a booking.
 * @param {string} reference - Booking reference
 * @param {string} email     - Email used at booking time (required for identity confirmation)
 */
export const cancelBooking = (reference, email) =>
  axiosInstance.delete(`/api/bookings/${reference}`, {
    data: { email },
  });

