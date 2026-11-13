import { Link } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext.jsx';

/** Renders star icons (★) based on a numeric rating. */
function StarRating({ rating }) {
  const full    = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const empty   = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="text-accent-500 text-sm" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(full)}
      {hasHalf ? '½' : ''}
      <span className="text-slate-300">{'★'.repeat(empty)}</span>
    </span>
  );
}

/**
 * Hotel card shown on the home page and hotel list page.
 *
 * @param {Object} hotel - Hotel response from the API
 * @param {string} checkIn  - Optional ISO date string passed through to the detail page
 * @param {string} checkOut - Optional ISO date string passed through to the detail page
 */
export default function HotelCard({ hotel, checkIn, checkOut }) {
  const { addToCompare, isInCompare } = useCompare();
  const isCompared = isInCompare(hotel.id);

  // Build the link to the hotel detail page, preserving any search dates
  const params = new URLSearchParams();
  if (checkIn)  params.set('checkIn',  checkIn);
  if (checkOut) params.set('checkOut', checkOut);
  const detailUrl = `/hotels/${hotel.id}${params.toString() ? `?${params}` : ''}`;

  const topAmenities = hotel.amenities?.slice(0, 3) ?? [];

  return (
    <div className={`card flex flex-col hover:shadow-md transition-all duration-200 ${isCompared ? 'ring-2 ring-primary-500' : ''}`}>
      {/* Hotel image */}
      <div className="relative h-48 overflow-hidden block group">
        <Link to={detailUrl}>
          <img
            src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
            }}
          />
        </Link>
        {/* Star rating badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-slate-700">
          ⭐ {Number(hotel.starRating).toFixed(1)}
        </div>

        {/* Quick Compare Button on Image */}
        <button
          type="button"
          onClick={() => addToCompare(hotel.id)}
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm transition flex items-center gap-1 ${
            isCompared
              ? 'bg-primary-700 text-white'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-primary-700'
          }`}
          title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
        >
          <span>{isCompared ? '✓' : '⚖️'}</span>
          <span>{isCompared ? 'Comparing' : 'Compare'}</span>
        </button>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={detailUrl} className="hover:text-primary-700 transition-colors">
            <h3 className="font-bold text-lg text-slate-800 leading-tight">{hotel.name}</h3>
          </Link>
        </div>

        <p className="text-sm text-slate-500 mb-2 flex items-center gap-1">
          <span>📍</span> {hotel.city}
        </p>

        <StarRating rating={Number(hotel.starRating)} />

        <p className="text-sm text-slate-600 mt-2 mb-3 line-clamp-2 flex-grow">
          {hotel.description}
        </p>

        {/* Amenity chips */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {topAmenities.map((a) => (
              <span key={a} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {a}
              </span>
            ))}
            {hotel.amenities?.length > 3 && (
              <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 gap-2">
          <div>
            {hotel.lowestPricePerNight && (
              <p className="text-slate-500 text-xs">From</p>
            )}
            <p className="text-primary-700 font-bold text-base sm:text-lg">
              {hotel.lowestPricePerNight
                ? `₹${Number(hotel.lowestPricePerNight).toLocaleString('en-IN')}/night`
                : 'View rooms'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => addToCompare(hotel.id)}
              className={`text-xs py-2 px-3 rounded-lg border font-medium transition ${
                isCompared
                  ? 'bg-primary-50 text-primary-700 border-primary-300 hover:bg-primary-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isCompared ? '✓ Added' : '+ Compare'}
            </button>

            <Link to={detailUrl} className="btn-primary text-xs sm:text-sm py-2 px-3.5 whitespace-nowrap">
              View Hotel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

