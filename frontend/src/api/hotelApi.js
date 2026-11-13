import axiosInstance from './axiosInstance.js';

/**
 * API functions for hotel-related endpoints.
 */

/** Fetch all hotels, optionally filtered by city. */
export const getHotels = (city = '') => {
  const params = city ? { city } : {};
  return axiosInstance.get('/api/hotels', { params });
};

/** Fetch full details of a single hotel. */
export const getHotelById = (id) =>
  axiosInstance.get(`/api/hotels/${id}`);

/**
 * Fetch rooms for a hotel, with optional availability for a date range.
 * @param {number} hotelId
 * @param {string} checkIn  - ISO date string (YYYY-MM-DD), optional
 * @param {string} checkOut - ISO date string (YYYY-MM-DD), optional
 */
export const getRoomsForHotel = (hotelId, checkIn, checkOut) => {
  const params = {};
  if (checkIn)  params.checkIn  = checkIn;
  if (checkOut) params.checkOut = checkOut;
  return axiosInstance.get(`/api/hotels/${hotelId}/rooms`, { params });
};

/**
 * Fetch a single room with availability for a date range.
 * Used by the booking form to show the room price and availability.
 */
export const getRoomById = (hotelId, roomId, checkIn, checkOut) => {
  const params = {};
  if (checkIn)  params.checkIn  = checkIn;
  if (checkOut) params.checkOut = checkOut;
  return axiosInstance.get(`/api/hotels/${hotelId}/rooms/${roomId}`, { params });
};

