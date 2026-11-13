import { format } from 'date-fns';

/**
 * Displays a summary of a booking's key details.
 * Used on the Booking Confirm page and the Manage Booking page.
 *
 * @param {Object} booking - BookingResponse object from the API
 */
export default function BookingSummary({ booking }) {
  if (!booking) return null;

  const isConfirmed = booking.status === 'CONFIRMED';

  const formatDate = (dateStr) =>
    dateStr ? format(new Date(dateStr), 'EEE, dd MMM yyyy') : '—';

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">

      {/* Header: booking reference */}
      <div className="bg-primary-800 text-white p-5">
        <p className="text-xs text-primary-200 uppercase tracking-wider mb-1">Booking Reference</p>
        <p className="text-3xl font-mono font-bold tracking-widest">{booking.bookingReference}</p>
        <div className="mt-2">
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 bg-green-400/20 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">
              ✓ Confirmed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-red-400/20 text-red-200 text-xs font-semibold px-3 py-1 rounded-full">
              ✗ Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryRow label="Hotel"        value={booking.hotelName} />
        <SummaryRow label="City"         value={booking.hotelCity} />
        <SummaryRow label="Room Type"    value={booking.roomCategory} />
        <SummaryRow label="Guest Name"   value={booking.guestName} />
        <SummaryRow label="Guest Email"  value={booking.guestEmail} />
        <SummaryRow label="Check-In"     value={formatDate(booking.checkInDate)} />
        <SummaryRow label="Check-Out"    value={formatDate(booking.checkOutDate)} />
        <SummaryRow label="Duration"     value={`${booking.numberOfNights} night${booking.numberOfNights !== 1 ? 's' : ''}`} />
        <SummaryRow label="Price / Night" value={formatCurrency(booking.pricePerNight)} />
      </div>

      {/* Total */}
      <div className="px-5 pb-5">
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex justify-between items-center">
          <span className="font-semibold text-slate-700">Total Amount</span>
          <span className="text-2xl font-bold text-primary-700">{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-medium text-slate-800">{value || '—'}</p>
    </div>
  );
}

