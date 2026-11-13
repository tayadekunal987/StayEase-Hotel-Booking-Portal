import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHotels } from '../api/hotelApi.js';
import HotelCard from '../components/hotel/HotelCard.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function HotelListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCity = searchParams.get('city') || '';
  const initialCheckIn = searchParams.get('checkIn') || '';
  const initialCheckOut = searchParams.get('checkOut') || '';

  const [cityInput, setCityInput] = useState(initialCity);
  const [checkInInput, setCheckInInput] = useState(initialCheckIn);
  const [checkOutInput, setCheckOutInput] = useState(initialCheckOut);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchHotels = (cityQuery) => {
    setLoading(true);
    setError(null);
    getHotels(cityQuery)
      .then((res) => {
        setHotels(res.data);
      })
      .catch((err) => {
        console.error('Error loading hotels:', err);
        setError('Failed to load hotels. Please check your network or backend server.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const activeCity = searchParams.get('city') || '';
    setCityInput(activeCity);
    setCheckInInput(searchParams.get('checkIn') || '');
    setCheckOutInput(searchParams.get('checkOut') || '');
    fetchHotels(activeCity);
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (cityInput.trim()) newParams.set('city', cityInput.trim());
    if (checkInInput) newParams.set('checkIn', checkInInput);
    if (checkOutInput) newParams.set('checkOut', checkOutInput);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setCityInput('');
    setCheckInInput('');
    setCheckOutInput('');
    setSearchParams({});
  };

  return (
    <div className="section-container py-10">
      {/* Header and Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Browse Hotels</h1>
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              City / Destination
            </label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Goa"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Check-In Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={checkInInput}
              onChange={(e) => {
                setCheckInInput(e.target.value);
                if (checkOutInput && e.target.value >= checkOutInput) {
                  setCheckOutInput('');
                }
              }}
              className="input-field text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Check-Out Date
            </label>
            <input
              type="date"
              min={checkInInput || todayStr}
              value={checkOutInput}
              onChange={(e) => setCheckOutInput(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1 text-sm py-2.5">
              Filter
            </button>
            {(searchParams.get('city') || searchParams.get('checkIn') || searchParams.get('checkOut')) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary text-sm py-2.5 px-3"
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-600 text-sm">
          Showing <span className="font-semibold text-slate-900">{hotels.length}</span> hotel{hotels.length !== 1 ? 's' : ''}
          {searchParams.get('city') ? ` in "${searchParams.get('city')}"` : ''}
        </p>
      </div>

      {/* Hotel Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Searching hotels..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchHotels(searchParams.get('city') || '')} />
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="text-4xl mb-3">🏨</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No hotels found</h3>
          <p className="text-slate-500 text-sm mb-4">
            We couldn't find any hotels matching your search criteria.
          </p>
          <button onClick={clearFilters} className="btn-secondary text-sm">
            View All Hotels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              checkIn={searchParams.get('checkIn') || ''}
              checkOut={searchParams.get('checkOut') || ''}
            />
          ))}
        </div>
      )}
    </div>
  );
}

