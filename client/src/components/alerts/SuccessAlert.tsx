import { Alert } from '@/hooks/useAlertQueue';

interface SuccessAlertProps {
  alert: Alert;
  onDismiss: () => void;
}

export default function SuccessAlert({ alert, onDismiss }: SuccessAlertProps) {
  const { details } = alert.data || {};

  return (
    <div
      className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white shadow-lg w-80 mobile:w-auto"
      role="status"
      aria-live="polite"
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors duration-200"
        aria-label="Dismiss alert"
      >
        ✕
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="text-2xl flex-shrink-0">✓</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-1">{alert.title}</h3>
          <p className="text-sm text-green-100">
            {alert.message}
          </p>
          {details && <p className="text-xs text-green-200 mt-2">{details}</p>}
        </div>
      </div>
    </div>
  );
}
