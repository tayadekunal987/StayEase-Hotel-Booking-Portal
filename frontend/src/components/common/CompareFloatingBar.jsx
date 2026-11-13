import { Link, useLocation } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext.jsx';

/**
 * Floating bar that appears at the bottom of the screen when
 * 1 or more hotels are selected for comparison.
 */
export default function CompareFloatingBar() {
  const { compareIds, clearCompare, maxLimit } = useCompare();
  const location = useLocation();

  // Hide on the compare page itself
  if (compareIds.length === 0 || location.pathname === '/compare') {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl animate-in slide-in-from-bottom-5">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl shadow-2xl p-3.5 sm:p-4 border border-slate-700/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">⚖️</span>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white">
              {compareIds.length} of {maxLimit} hotels selected
            </p>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {compareIds.length < maxLimit
                ? `You can select up to ${maxLimit - compareIds.length} more`
                : 'Maximum limit reached'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            Clear
          </button>
          <Link
            to="/compare"
            className="btn-primary text-xs sm:text-sm py-2 px-4 whitespace-nowrap bg-accent-500 hover:bg-accent-600 text-slate-950 font-bold"
          >
            Compare Now &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

