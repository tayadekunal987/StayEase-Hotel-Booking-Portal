import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext.jsx';
import { getHotelById, getRoomsForHotel } from '../api/hotelApi.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare, maxLimit } = useCompare();

  const todayStr = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [hotelData, setHotelData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch hotel and room data for all selected hotel IDs
  useEffect(() => {
    if (compareIds.length === 0) {
      setHotelData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const requests = compareIds.map((id) =>
      Promise.all([
        getHotelById(id).catch((err) => ({ data: null })),
        getRoomsForHotel(id, checkIn, checkOut).catch((err) => ({ data: [] })),
      ]).then(([hotelRes, roomsRes]) => ({
        hotel: hotelRes.data,
        rooms: roomsRes.data || [],
      }))
    );

    Promise.all(requests)
      .then((results) => {
        // Filter out any that failed to load
        setHotelData(results.filter((item) => item.hotel !== null));
      })
      .finally(() => setLoading(false));
  }, [compareIds, checkIn, checkOut]);

  // Find the absolute lowest room price among all compared hotels to highlight it
  const allPrices = hotelData.flatMap((item) =>
    item.rooms.map((r) => Number(r.pricePerNight)).filter((p) => !isNaN(p) && p > 0)
  );
  const lowestOverallPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

  if (loading) {
    return <LoadingSpinner message="Loading hotel comparison details..." />;
  }

  if (compareIds.length === 0 || hotelData.length === 0) {
    return (
      <div className="section-container py-16 text-center">
        <div className="card p-10 max-w-lg mx-auto">
          <div className="text-5xl mb-4">⚖️</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Hotels to Compare</h2>
          <p className="text-sm text-slate-500 mb-6">
            You can select up to {maxLimit} hotels from the hotel list to compare prices, amenities, and room availability side by side.
          </p>
          <Link to="/hotels" className="btn-primary text-sm py-2.5 px-6 inline-block">
            Browse Hotels &amp; Add to Compare &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>⚖️</span>
            <span>Compare Hotels</span>
            <span className="text-sm font-semibold bg-primary-100 text-primary-800 px-3 py-0.5 rounded-full">
              {hotelData.length} of {maxLimit} selected
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare features, pricing, and availability side by side to choose the best stay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hotelData.length < maxLimit && (
            <Link to="/hotels" className="btn-secondary text-xs sm:text-sm py-2 px-4 whitespace-nowrap">
              + Add Another Hotel
            </Link>
          )}
          <button
            onClick={clearCompare}
            className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Date Filter Bar for Live Availability Comparison */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span>📅</span>
            <span>Check Room Availability for Your Dates:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Check-in</label>
              <input
                type="date"
                min={todayStr}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) {
                    setCheckOut('');
                  }
                }}
                className="input-field text-xs py-1.5 px-3"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Check-out</label>
              <input
                type="date"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="input-field text-xs py-1.5 px-3"
              />
            </div>
            {(checkIn || checkOut) && (
              <button
                onClick={() => {
                  setCheckIn('');
                  setCheckOut('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 self-end pb-2 underline"
              >
                Reset Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className={`grid grid-cols-1 ${hotelData.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
        {hotelData.map(({ hotel, rooms }) => {
          return (
            <div key={hotel.id} className="card flex flex-col relative border-2 border-slate-100 hover:border-primary-200 transition">
              {/* Remove button */}
              <button
                onClick={() => removeFromCompare(hotel.id)}
                className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-md transition"
                title="Remove from comparison"
              >
                ✕
              </button>

              {/* Hotel Photo */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
                  }}
                />
                <div className="absolute bottom-2 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-800">
                  ★ {Number(hotel.starRating).toFixed(1)} / 5.0
                </div>
              </div>

              {/* Hotel Header Info */}
              <div className="p-5 border-b border-slate-100">
                <h2 className="font-bold text-lg text-slate-900 leading-tight mb-1">{hotel.name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span>📍</span> {hotel.city} — <span className="truncate">{hotel.address}</span>
                </p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                  {hotel.description}
                </p>
              </div>

              {/* Amenities Comparison */}
              <div className="p-5 border-b border-slate-100 flex-grow">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Featured Amenities
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.amenities && hotel.amenities.length > 0 ? (
                    hotel.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                      >
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{amenity}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Standard amenities</span>
                  )}
                </div>
              </div>

              {/* Room Categories, Pricing & Availability */}
              <div className="p-5 bg-slate-50/70 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Room Options &amp; Availability
                </h3>

                {rooms.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No rooms configured.</p>
                ) : (
                  rooms.map((room) => {
                    const priceNum = Number(room.pricePerNight);
                    const isLowest = lowestOverallPrice !== null && priceNum === lowestOverallPrice;
                    const isAvailable = room.availableRooms > 0;

                    // Booking link with dates preserved
                    const bookParams = new URLSearchParams();
                    if (checkIn) bookParams.set('checkIn', checkIn);
                    if (checkOut) bookParams.set('checkOut', checkOut);
                    const bookUrl = `/hotels/${hotel.id}/book/${room.id}${bookParams.toString() ? `?${bookParams}` : ''}`;

                    return (
                      <div
                        key={room.id}
                        className={`p-3.5 rounded-xl border bg-white transition ${
                          isLowest ? 'border-green-400 ring-2 ring-green-100' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-slate-800">{room.roomCategory}</h4>
                          {isLowest && (
                            <span className="bg-green-100 text-green-800 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide">
                              🏆 Lowest Price
                            </span>
                          )}
                        </div>

                        <div className="flex items-baseline gap-1 my-1">
                          <span className="text-lg font-bold text-primary-800">
                            ₹{priceNum.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-400">/ night</span>
                        </div>

                        {/* Availability Status */}
                        <div className="text-xs my-2">
                          {checkIn && checkOut ? (
                            isAvailable ? (
                              <span className="text-green-700 font-semibold flex items-center gap-1">
                                <span>✓</span>
                                <span>{room.availableRooms} room{room.availableRooms !== 1 ? 's' : ''} available</span>
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold flex items-center gap-1">
                                <span>✗</span>
                                <span>Not Available (Sold Out)</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-500">
                              Capacity: {room.totalCapacity} rooms (enter dates to check)
                            </span>
                          )}
                        </div>

                        {/* Action CTA */}
                        {isAvailable ? (
                          <Link
                            to={bookUrl}
                            className="btn-primary text-xs w-full py-1.5 text-center block mt-2"
                          >
                            Book This Room
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="btn-secondary text-xs w-full py-1.5 opacity-50 cursor-not-allowed mt-2"
                          >
                            Sold Out
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

