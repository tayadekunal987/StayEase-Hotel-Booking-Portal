import { useLocation, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookingSummary from '../components/booking/BookingSummary.jsx';

export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const copyToClipboard = () => {
    if (booking?.bookingReference) {
      navigator.clipboard.writeText(booking.bookingReference);
      toast.success('Booking reference copied to clipboard!');
    }
  };

  if (!booking) {
    return (
      <div className="section-container py-16 text-center">
        <div className="card p-10 max-w-md mx-auto">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Active Booking Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            If you already have a reservation, you can look it up using your booking reference and email address.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/booking/manage" className="btn-primary text-sm py-2.5">
              Look Up Existing Booking
            </Link>
            <Link to="/" className="btn-secondary text-sm py-2.5">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-12 max-w-3xl">
      {/* Success Banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
          ✓
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Booking Confirmed!
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-lg mx-auto">
          Thank you for choosing StayEase, <span className="font-semibold text-slate-700">{booking.guestName}</span>.
          Your reservation is confirmed and guaranteed.
        </p>
      </div>

      {/* Booking Reference Notice Card */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-primary-800 uppercase tracking-wider mb-1">
            Your Booking Reference
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-primary-900 tracking-wider">
            {booking.bookingReference}
          </p>
          <p className="text-xs text-primary-700 mt-1">
            Keep this reference code and your email address handy to manage or cancel this booking.
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className="btn-secondary text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5 whitespace-nowrap bg-white"
        >
          <span>📋</span>
          <span>Copy Reference</span>
        </button>
      </div>

      {/* Booking Details Card */}
      <div className="mb-8">
        <BookingSummary booking={booking} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm py-2.5 px-6 w-full sm:w-auto"
        >
          🖨️ Print Confirmation
        </button>
        <button
          onClick={() =>
            navigate(`/booking/manage?ref=${booking.bookingReference}&email=${encodeURIComponent(booking.guestEmail)}`)
          }
          className="btn-primary text-sm py-2.5 px-6 w-full sm:w-auto"
        >
          Manage Booking &rarr;
        </button>
        <Link to="/" className="btn-secondary text-sm py-2.5 px-6 w-full sm:w-auto text-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

