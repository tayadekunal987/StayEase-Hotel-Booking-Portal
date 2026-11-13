import { Link } from 'react-router-dom';

/**
 * Card for a single room category on the Hotel Detail page.
 *
 * @param {Object} room       - Room response from the API
 * @param {number} hotelId    - Parent hotel ID (needed for the booking URL)
 * @param {string} checkIn    - ISO date string, passed through to booking form
 * @param {string} checkOut   - ISO date string, passed through to booking form
 */
export default function RoomCard({ room, hotelId, checkIn, checkOut }) {
  const isAvailable = room.availableRooms > 0;

  // Build booking URL with pre-filled dates
  const params = new URLSearchParams();
  if (checkIn)  params.set('checkIn',  checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  const bookUrl = `/hotels/${hotelId}/book/${room.id}${params.toString() ? `?${params}` : ''}`;

  return (
    <div className={`card p-5 flex flex-col sm:flex-row sm:items-center gap-5
      ${!isAvailable ? 'opacity-60' : ''}`}>

      {/* Room icon */}
      <div className="flex-shrink-0 w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-3xl">
        🛏️
      </div>

      {/* Room info */}
      <div className="flex-grow">
        <h3 className="font-bold text-lg text-slate-800 mb-1">{room.roomCategory}</h3>
        <p className="text-sm text-slate-500">
          Total capacity: <span className="font-medium text-slate-700">{room.totalCapacity} room{room.totalCapacity !== 1 ? 's' : ''}</span>
        </p>

        {/* Availability badge */}
        {checkIn && checkOut ? (
          isAvailable ? (
            <p className="text-sm mt-1">
              <span className="text-green-600 font-semibold">✓ {room.availableRooms} available</span>
              <span className="text-slate-400"> for selected dates</span>
            </p>
          ) : (
            <p className="text-sm text-red-500 font-semibold mt-1">✗ Fully booked for selected dates</p>
          )
        ) : (
          <p className="text-sm text-slate-400 mt-1">Select dates to check availability</p>
        )}
      </div>

      {/* Price + Book button */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-700">
            ₹{Number(room.pricePerNight).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-400">per night</p>
        </div>

        {isAvailable ? (
          <Link to={bookUrl} className="btn-primary text-sm py-2 px-5 whitespace-nowrap">
            Book Now
          </Link>
        ) : (
          <button disabled className="btn-primary text-sm py-2 px-5 whitespace-nowrap">
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
}

