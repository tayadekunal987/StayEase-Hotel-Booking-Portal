/**
 * Full-page centered loading spinner.
 * @param {string} message - Optional message to display below the spinner.
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-700 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  );
}

