import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useCompare } from '../../context/CompareContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { compareIds, maxLimit } = useCompare();

  const links = [
    { to: '/',                label: 'Home' },
    { to: '/hotels',          label: 'Hotels' },
    {
      to: '/compare',
      label: 'Compare Hotels',
      badge: compareIds.length > 0 ? `${compareIds.length}/${maxLimit}` : null,
    },
    { to: '/booking/manage',  label: 'Manage Booking' },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="bg-primary-800 shadow-md sticky top-0 z-50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl">
            <span className="text-2xl">🏨</span>
            <span>StayEase</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-1.5
                  ${isActive(link.to)
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-accent-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 rounded-lg hover:bg-primary-700 transition"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-3 border-t border-primary-700 mt-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg mt-1 transition-colors
                  ${isActive(link.to)
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                  }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-accent-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

