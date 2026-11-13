/**
 * Displays an API error or general error message.
 *
 * @param {string} message - Main error message
 * @param {Function} onRetry - Optional retry callback; shows a Retry button if provided
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
      <div className="text-5xl">⚠️</div>
      <p className="text-slate-600 max-w-sm">
        {message || 'Something went wrong. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try Again
        </button>
      )}
    </div>
  );
}

