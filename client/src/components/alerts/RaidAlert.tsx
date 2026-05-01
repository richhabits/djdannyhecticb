import { Alert } from '@/hooks/useAlertQueue';

interface RaidAlertProps {
  alert: Alert;
  onDismiss: () => void;
}

export default function RaidAlert({ alert, onDismiss }: RaidAlertProps) {
  const { username, raidCount } = alert.data || {};

  return (
    <div
      className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 text-white shadow-lg w-80 mobile:w-auto"
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

      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🚀</span>
        <div className="flex-1 pr-6">
          <h3 className="font-bold text-sm mb-1">RAID INCOMING!</h3>
          <p className="text-sm text-purple-100">
            <strong>{username}</strong> raided with <strong>{(raidCount ?? 0).toLocaleString()}</strong> viewer{raidCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
