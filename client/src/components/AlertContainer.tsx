import { Alert } from '@/hooks/useAlertQueue';
import RaidAlert from './alerts/RaidAlert';
import SubscriberAlert from './alerts/SubscriberAlert';
import DonationAlert from './alerts/DonationAlert';
import FollowAlert from './alerts/FollowAlert';
import ErrorAlert from './alerts/ErrorAlert';
import SuccessAlert from './alerts/SuccessAlert';

interface AlertContainerProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export function AlertContainer({ alerts, onDismiss }: AlertContainerProps) {
  // Show max 3 alerts stacked
  const displayAlerts = alerts.slice(0, 3);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none lg:top-4 lg:right-4 mobile:top-2 mobile:left-2 mobile:right-2"
      role="region"
      aria-label="Live alerts"
      aria-live="polite"
      aria-atomic="false"
    >
      {displayAlerts.map((alert, index) => (
        <div
          key={alert.id}
          className="pointer-events-auto animate-slide-in-top"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {alert.type === 'raid' && (
            <RaidAlert alert={alert} onDismiss={() => onDismiss(alert.id)} />
          )}
          {alert.type === 'subscribe' && (
            <SubscriberAlert alert={alert} onDismiss={() => onDismiss(alert.id)} />
          )}
          {alert.type === 'donation' && (
            <DonationAlert alert={alert} onDismiss={() => onDismiss(alert.id)} />
          )}
          {alert.type === 'follow' && (
            <FollowAlert alert={alert} onDismiss={() => onDismiss(alert.id)} />
          )}
          {alert.type === 'error' && (
            <ErrorAlert alert={alert} onDismiss={() => onDismiss(alert.id)} />
          )}
          {alert.type === 'success' && (
            <SuccessAlert alert={alert} onDismiss={() => onDismiss(alert.id)} />
          )}
        </div>
      ))}

      {/* Indicator if more alerts queued */}
      {alerts.length > 3 && (
        <div className="text-xs text-gray-400 text-center pointer-events-auto py-2 px-3 rounded bg-gray-900/50 backdrop-blur-sm">
          +{alerts.length - 3} more alert{alerts.length - 3 !== 1 ? 's' : ''} queued
        </div>
      )}
    </div>
  );
}
