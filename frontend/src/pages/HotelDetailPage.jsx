import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext.jsx';
import { getHotelById, getRoomsForHotel } from '../api/hotelApi.js';
import RoomCard from '../components/hotel/RoomCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCompare, isInCompare } = useCompare();

  const isCompared = isInCompare(id);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadHotelAndRooms = async () => {
    setLoading(true);
    setError(null);

    try {
      const hotelRes = await getHotelById(id);
      setHotel(hotelRes.data);

      try {
        const roomsRes = await getRoomsForHotel(id, initialCheckIn, initialCheckOut);
        setRooms(roomsRes.data || []);
      } catch (roomErr) {
        console.warn('Could not load room availability:', roomErr);
        setRooms([]);
      }
    } catch (err) {
      console.error('Error fetching hotel details:', err);
      const msg = err.response?.data?.message || err.message || 'Hotel details could not be loaded.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotelAndRooms();
  }, [id, initialCheckIn, initialCheckOut]);

  const handleDateUpdate = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (checkIn) newParams.set('checkIn', checkIn);
    else newParams.delete('checkIn');

    if (checkOut) newParams.set('checkOut', checkOut);
    else newParams.delete('checkOut');

    setSearchParams(newParams);
  };

  if (loading) return <LoadingSpinner message="Loading hotel details..." />;
  if (error || !hotel) return <ErrorMessage message={error} onRetry={loadHotelAndRooms} />;

  return (
    <div className="section-container py-10">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary-700">Home</Link>
        <span>/</span>
        <Link to="/hotels" className="hover:text-primary-700">Hotels</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate">{hotel.name}</span>
      </nav>

      {/* Hotel Header Section */}
      <div className="card mb-8">
        <div className="relative h-64 sm:h-96 w-full overflow-hidden">
          <img
            src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'}
            alt={hotel.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
            <div className="p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-accent-500 text-slate-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  ★ {Number(hotel.starRating).toFixed(1)} Stars
                </span>
                <span className="text-slate-200 text-sm">📍 {hotel.city}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold">{hotel.name}</h1>
                  <p className="text-sm sm:text-base text-slate-200 mt-1">{hotel.address}</p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCompare(hotel.id)}
                  className={`self-start sm:self-auto text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl shadow-lg transition flex items-center gap-1.5 backdrop-blur-md ${
                    isCompared
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-white/90 text-slate-800 hover:bg-white'
                  }`}
                >
                  <span>{isCompared ? '✓' : '⚖️'}</span>
                  <span>{isCompared ? 'Added to Compare' : 'Add to Compare'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Details Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">About This Property</h2>
              <p className="text-slate-600 leading-relaxed">{hotel.description}</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">Amenities &amp; Features</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities && hotel.amenities.length > 0 ? (
                  hotel.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="bg-primary-50 text-primary-800 border border-primary-100 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                      <span>✨</span>
                      <span>{amenity}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">Standard hotel amenities available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Date Selector Box */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>📅</span>
              <span>Check Room Availability</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your travel dates to see available rooms and lock in your price.
            </p>
            <form onSubmit={handleDateUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Check-in</label>
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
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Check-out</label>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              <button type="submit" className="btn-primary w-full text-sm py-2">
                Update Availability
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Available Rooms Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Available Rooms</h2>
          {initialCheckIn && initialCheckOut && (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Showing availability for {initialCheckIn} to {initialCheckOut}
            </span>
          )}
        </div>

        {rooms.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            No room categories configured for this hotel yet.
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                hotelId={hotel.id}
                checkIn={initialCheckIn}
                checkOut={initialCheckOut}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

