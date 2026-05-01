import { Alert } from '@/hooks/useAlertQueue';

interface FollowAlertProps {
  alert: Alert;
  onDismiss: () => void;
}

export default function FollowAlert({ alert, onDismiss }: FollowAlertProps) {
  const { username } = alert.data || {};

  return (
    <div
      className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white shadow-lg w-80 mobile:w-auto"
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
        <span className="text-2xl flex-shrink-0">⭐</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-1">NEW FOLLOWER!</h3>
          <p className="text-sm text-blue-100">
            <strong>{username}</strong> followed the stream
          </p>
        </div>
      </div>
    </div>
  );
}
