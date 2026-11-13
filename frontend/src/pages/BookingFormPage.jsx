import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getHotelById, getRoomById } from '../api/hotelApi.js';
import { createBooking } from '../api/bookingApi.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function BookingFormPage() {
  const { id: hotelId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Form inputs
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkIn') || '');
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOut') || '');

  // Field error state for validation feedback
  const [fieldErrors, setFieldErrors] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getHotelById(hotelId),
      getRoomById(hotelId, roomId, checkInDate, checkOutDate),
    ])
      .then(([hotelRes, roomRes]) => {
        setHotel(hotelRes.data);
        setRoom(roomRes.data);
      })
      .catch((err) => {
        console.error('Error fetching room/hotel for booking:', err);
        setFetchError('Failed to load room details. Please verify your selection.');
      })
      .finally(() => setLoading(false));
  }, [hotelId, roomId]);

  // Calculate nights and estimated total
  let numberOfNights = 0;
  let estimatedTotal = 0;

  if (checkInDate && checkOutDate) {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end - start;
    if (diffTime > 0) {
      numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (room?.pricePerNight) {
        estimatedTotal = numberOfNights * Number(room.pricePerNight);
      }
    }
  }

  const validateClientSide = () => {
    const errors = {};
    if (!guestName.trim()) {
      errors.guestName = 'Please enter your full name';
    }
    if (!guestEmail.trim()) {
      errors.guestEmail = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.guestEmail = 'Please enter a valid email address';
    }
    if (!checkInDate) {
      errors.checkInDate = 'Check-in date is required';
    } else if (checkInDate < todayStr) {
      errors.checkInDate = 'Check-in date cannot be in the past';
    }
    if (!checkOutDate) {
      errors.checkOutDate = 'Check-out date is required';
    } else if (checkOutDate <= checkInDate) {
      errors.checkOutDate = 'Check-out date must be after check-in date';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateClientSide()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const payload = {
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim().toLowerCase(),
        roomId: Number(roomId),
        checkInDate,
        checkOutDate,
      };

      const res = await createBooking(payload);
      toast.success('Booking confirmed successfully!');
      navigate('/booking/confirm', { state: { booking: res.data } });
    } catch (err) {
      console.error('Booking submission error:', err);
      const resData = err.response?.data;

      if (err.response?.status === 409) {
        toast.error(resData?.message || 'Room is no longer available for these dates!');
        setFieldErrors({
          dates: resData?.message || 'Selected dates are fully booked. Please select other dates.',
        });
      } else if (err.response?.status === 400 && resData?.fieldErrors) {
        setFieldErrors(resData.fieldErrors);
        toast.error('Validation failed. Please review your entries.');
      } else {
        toast.error(resData?.message || 'Failed to complete booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing booking details..." />;
  if (fetchError || !room || !hotel) {
    return <ErrorMessage message={fetchError} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="section-container py-10">
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-700">Home</Link>
        <span>/</span>
        <Link to={`/hotels/${hotelId}`} className="hover:text-primary-700">{hotel.name}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Reserve Room</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Guest &amp; Stay Details</h1>
            <p className="text-sm text-slate-500 mb-6">
              Complete your reservation with your contact details. No login or password required.
            </p>

            {fieldErrors.dates && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{fieldErrors.dates}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Sharma"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className={`input-field text-sm ${fieldErrors.guestName ? 'border-red-400 focus:border-red-500' : ''}`}
                  />
                  {fieldErrors.guestName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.guestName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aditi@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={`input-field text-sm ${fieldErrors.guestEmail ? 'border-red-400 focus:border-red-500' : ''}`}
                  />
                  <p className="text-slate-400 text-xs mt-1">Used to send confirmation and manage your booking.</p>
                  {fieldErrors.guestEmail && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.guestEmail}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Check-in Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    required
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      if (checkOutDate && e.target.value >= checkOutDate) {
                        setCheckOutDate('');
                      }
                    }}
                    className={`input-field text-sm ${fieldErrors.checkInDate ? 'border-red-400' : ''}`}
                  />
                  {fieldErrors.checkInDate && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.checkInDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Check-out Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={checkInDate || todayStr}
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className={`input-field text-sm ${fieldErrors.checkOutDate ? 'border-red-400' : ''}`}
                  />
                  {fieldErrors.checkOutDate && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.checkOutDate}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to={`/hotels/${hotelId}`} className="btn-secondary text-sm w-full sm:w-auto text-center">
                  Cancel &amp; Go Back
                </Link>
                <button
                  type="submit"
                  disabled={submitting || numberOfNights <= 0}
                  className="btn-primary text-sm py-3 px-8 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming Reservation...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Book Room</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Reservation Summary</h3>

            <div className="mb-4 pb-4 border-b border-slate-100">
              <p className="font-semibold text-slate-800">{hotel.name}</p>
              <p className="text-xs text-slate-500">📍 {hotel.city}</p>
              <p className="text-sm text-primary-700 font-medium mt-2">
                🛏️ {room.roomCategory}
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-6">
              <div className="flex justify-between">
                <span>Check-in:</span>
                <span className="font-medium text-slate-800">{checkInDate || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-out:</span>
                <span className="font-medium text-slate-800">{checkOutDate || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium text-slate-800">
                  {numberOfNights > 0 ? `${numberOfNights} night${numberOfNights > 1 ? 's' : ''}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price per night:</span>
                <span className="font-medium text-slate-800">
                  ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-4">
              <div className="flex justify-between items-center text-slate-700 text-sm mb-1">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xs text-slate-500">(All taxes included)</span>
              </div>
              <p className="text-2xl font-bold text-primary-700">
                ₹{estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <p>✓ No booking or processing fees</p>
              <p>✓ Instant confirmation reference</p>
              <p>✓ Protected by transactional overbooking guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

