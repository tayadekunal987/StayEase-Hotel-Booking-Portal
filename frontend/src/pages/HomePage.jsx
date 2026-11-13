import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHotels } from '../api/hotelApi.js';
import HotelCard from '../components/hotel/HotelCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

export default function HomePage() {
  const navigate = useNavigate();

  // Search state
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Featured hotels state
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Today's date string YYYY-MM-DD for min date in picker
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getHotels()
      .then((res) => {
        setFeaturedHotels(res.data);
      })
      .catch((err) => {
        console.error('Error fetching featured hotels:', err);
        setError('Unable to load featured hotels at the moment.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-primary-700/50 border border-primary-500/30 text-accent-400 text-xs sm:text-sm font-medium tracking-wide uppercase mb-4">
            Direct &amp; Hassle-Free Bookings
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Find Your Ideal Stay with <span className="text-accent-400">StayEase</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Book premium hotels across India instantly. No account required—reserve securely with just your name and email.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 text-slate-800 text-left">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Destination / City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Goa, Jaipur"
                    className="input-field text-sm pl-9"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400">📍</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Check-in Date
                </label>
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
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input-field text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm"
                >
                  <span>🔍</span>
                  <span>Search Hotels</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Value Proposition Highlights */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-primary-800">
                ⚡
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Instant Reservation</h3>
                <p className="text-sm text-slate-600">
                  No lengthy registration or passwords. Enter your name and email to receive your instant booking reference.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-green-800">
                🛡️
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Anti-Overbooking Guarantee</h3>
                <p className="text-sm text-slate-600">
                  Real-time database transactional locking ensures your reserved room is guaranteed and never double-booked.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 text-amber-800">
                🔄
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Simple Booking Management</h3>
                <p className="text-sm text-slate-600">
                  Lookup, review, or cancel your booking anytime with your booking reference and email address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="py-16 section-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Featured Accommodations</h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked destinations with verified comfort and top-tier amenities
            </p>
          </div>
          <button
            onClick={() => navigate('/hotels')}
            className="btn-secondary text-sm self-start sm:self-auto"
          >
            Explore All Hotels &rarr;
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching featured hotels..." />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredHotels.slice(0, 6).map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                checkIn={checkIn}
                checkOut={checkOut}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

