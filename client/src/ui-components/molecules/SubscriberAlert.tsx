import { Alert } from '@/hooks/useAlertQueue';

const TIER_CONFIG = {
  bronze: { emoji: '🥉', color: '#CD7F32', label: 'Bronze' },
  silver: { emoji: '🥈', color: '#C0C0C0', label: 'Silver' },
  gold: { emoji: '🥇', color: '#D4AF37', label: 'Gold' },
  platinum: { emoji: '👑', color: '#9D4EDD', label: 'Platinum' },
} as const;

interface SubscriberAlertProps {
  alert: Alert;
  onDismiss: () => void;
}

export default function SubscriberAlert({ alert, onDismiss }: SubscriberAlertProps) {
  const { username, tier = 'gold', months = 1, message } = alert.data || {};
  const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.gold;

  const bgGradient = {
    bronze: 'from-orange-900 to-orange-800',
    silver: 'from-gray-700 to-gray-800',
    gold: 'from-yellow-700 to-yellow-800',
    platinum: 'from-purple-900 to-purple-800',
  }[tier] || 'from-yellow-700 to-yellow-800';

  return (
    <div
      className={`bg-gradient-to-r ${bgGradient} rounded-lg p-4 text-white shadow-lg w-80 mobile:w-auto`}
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
        <span className="text-2xl flex-shrink-0">{tierConfig.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm mb-1">NEW SUBSCRIBER!</h3>
          <p className="text-sm mb-1">
            <strong>{username}</strong> subscribed for {months} month{months !== 1 ? 's' : ''} • <strong>{tierConfig.label}</strong> tier
          </p>
          {message && <p className="text-xs text-gray-200 italic">&quot;{message}&quot;</p>}
        </div>
      </div>
    </div>
  );
}
