import { Alert } from '@/hooks/useAlertQueue';

interface DonationAlertProps {
  alert: Alert;
  onDismiss: () => void;
}

export default function DonationAlert({ alert, onDismiss }: DonationAlertProps) {
  const { username, amount, message } = alert.data || {};

  return (
    <div
      className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-4 text-white shadow-lg w-80 mobile:w-auto"
      role="status"
      aria-live="assertive"
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors duration-200"
        aria-label="Dismiss alert"
      >
        ✕
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="text-2xl flex-shrink-0">❤️</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-1">Donation Received</h3>
          <p className="text-xl font-extrabold text-emerald-200 mb-1">${amount ? (amount).toLocaleString() : '0'}</p>
          <p className="text-sm mb-1">
            Thank you, <strong>{username}</strong>!
          </p>
          {message && <p className="text-xs text-gray-200 italic">&quot;{message}&quot;</p>}
        </div>
      </div>
    </div>
  );
}
