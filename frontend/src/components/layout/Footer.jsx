import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="section-container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <span className="text-2xl">🏨</span>
              <span>StayEase</span>
            </div>
            <p className="text-sm text-slate-400">
              Find and book the perfect hotel room across India.
              No account needed — just your name and email.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/"               className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/hotels"          className="hover:text-white transition-colors">Browse Hotels</Link></li>
              <li><Link to="/booking/manage"  className="hover:text-white transition-colors">Manage Booking</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-3">Need Help?</h3>
            <p className="text-sm text-slate-400">
              To retrieve or cancel your booking, visit the{' '}
              <Link to="/booking/manage" className="text-primary-300 hover:text-white underline">
                Manage Booking
              </Link>{' '}
              page and enter your booking reference along with the email you used when booking.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} StayEase. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

