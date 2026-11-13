import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { lookupBooking, cancelBooking } from '../api/bookingApi.js';
import BookingSummary from '../components/booking/BookingSummary.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function ManageBookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [referenceInput, setReferenceInput] = useState(searchParams.get('ref') || '');
  const [emailInput, setEmailInput] = useState(searchParams.get('email') || '');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [searched, setSearched] = useState(false);

  const performLookup = async (ref, email) => {
    if (!ref.trim() || !email.trim()) {
      toast.error('Please enter both booking reference and email.');
      return;
    }

    setLoading(true);
    setBooking(null);
    setSearched(true);

    try {
      const res = await lookupBooking(ref.trim(), email.trim());
      setBooking(res.data);
      // Keep URL search params in sync
      setSearchParams({ ref: ref.trim(), email: email.trim() });
    } catch (err) {
      console.error('Error looking up booking:', err);
      if (err.response?.status === 404) {
        toast.error('No booking found matching this reference and email.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to retrieve booking.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlRef = searchParams.get('ref');
    const urlEmail = searchParams.get('email');
    if (urlRef && urlEmail) {
      performLookup(urlRef, urlEmail);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performLookup(referenceInput, emailInput);
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    setCancelling(true);
    try {
      const res = await cancelBooking(booking.bookingReference, booking.guestEmail);
      setBooking(res.data);
      setShowCancelModal(false);
      toast.success('Your booking has been cancelled successfully. Room availability is now released.');
    } catch (err) {
      console.error('Cancellation error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="section-container py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Manage Your Reservation</h1>
        <p className="text-sm text-slate-500">
          Enter your unique booking reference code and the email address used during booking to view or cancel your stay.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="card p-6 sm:p-8 mb-8">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Booking Reference <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SE-A3F9B2"
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value.toUpperCase())}
                className="input-field text-sm font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. guest@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Retrieve Reservation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading state */}
      {loading && <LoadingSpinner message="Searching for your booking record..." />}

      {/* Booking Record Display */}
      {!loading && booking && (
        <div className="space-y-6">
          <BookingSummary booking={booking} />

          {/* Cancellation section */}
          {booking.status === 'CONFIRMED' ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Need to cancel your reservation?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cancellation releases room availability immediately. This action cannot be reversed.
                </p>
              </div>
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn-danger text-sm py-2 px-5 whitespace-nowrap self-end sm:self-auto"
              >
                Cancel Booking
              </button>
            </div>
          ) : (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-200 text-red-800 text-sm">
              <p className="font-semibold flex items-center gap-2">
                <span>ℹ️</span>
                <span>This booking was cancelled.</span>
              </p>
              <p className="text-xs text-red-600 mt-1">
                The room has been released back into available inventory. No further actions can be taken on this booking.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Not found state */}
      {!loading && searched && !booking && (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <div className="text-4xl mb-3">❓</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Reservation Not Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            We couldn't locate any booking matching reference{' '}
            <span className="font-mono font-semibold text-slate-700">{referenceInput}</span> and email{' '}
            <span className="font-semibold text-slate-700">{emailInput}</span>.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Please verify the exact characters in your booking reference and the email address used when reserving.
          </p>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="text-red-600 text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Cancellation</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to cancel booking{' '}
              <span className="font-mono font-bold text-slate-800">{booking.bookingReference}</span> at{' '}
              <span className="font-semibold text-slate-800">{booking.hotelName}</span>?
            </p>
            <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Once cancelled, the room slot will be released for other guests immediately.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelBooking}
                className="btn-danger text-sm py-2 px-5 flex items-center gap-2"
              >
                {cancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Booking</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

