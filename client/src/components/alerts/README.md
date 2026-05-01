# Unified Alert System

A centralized, extensible alert management system for djdannyhecticb with priority-based queuing, automatic dismissal, and consistent positioning.

## Features

- **Single Alert Queue**: Centralized state management with `useAlertQueue` hook
- **Priority System**: Automatic sorting (errors > raids/subs > donations > follows)
- **Queue Management**: Display max 3 alerts with queue indicator
- **Auto-Dismiss**: Configurable timers per alert type
- **Responsive**: Top-right desktop, top-center mobile
- **Accessibility**: ARIA labels, role="status"
- **Extensible**: Support for raid, subscribe, donation, follow, error, success alerts

## Usage

### Hook: `useAlertQueue`

Located at: `/src/hooks/useAlertQueue.ts`

```tsx
import { useAlertQueue } from '@/hooks/useAlertQueue';

const { alerts, add: addAlert, dismiss: dismissAlert, dismissAll } = useAlertQueue();

// Add an alert
addAlert({
  type: 'raid',
  title: 'RAID INCOMING!',
  message: 'Streamer raided with 250 viewers',
  data: {
    username: 'Streamer',
    raidCount: 250,
  },
});

// Dismiss a specific alert
dismissAlert(alertId);

// Dismiss all alerts
dismissAll();
```

### Component: `AlertContainer`

Located at: `/src/components/AlertContainer.tsx`

Handles rendering of queued alerts with proper positioning and animations.

```tsx
import { AlertContainer } from '@/components/AlertContainer';

export function MyComponent() {
  const { alerts, dismiss } = useAlertQueue();

  return (
    <AlertContainer alerts={alerts} onDismiss={dismiss} />
  );
}
```

### Individual Alert Components

All alert components located in `/src/components/alerts/`:

- **RaidAlert.tsx** - Purple gradient, 8s duration, priority 3
- **SubscriberAlert.tsx** - Colored by tier (bronze/silver/gold/platinum), 7s, priority 2
- **DonationAlert.tsx** - Green gradient, 6s, priority 2
- **FollowAlert.tsx** - Blue gradient, 5s, priority 1
- **ErrorAlert.tsx** - Red gradient, 8s, priority 4
- **SuccessAlert.tsx** - Green gradient, 4s, priority 0

## Integration Example

In `StreamerLiveLayout.tsx`:

```tsx
import { useAlertQueue } from '@/hooks/useAlertQueue';
import { AlertContainer } from './AlertContainer';

export function StreamerLiveLayout() {
  const { alerts, add: addAlert, dismiss: dismissAlert } = useAlertQueue();

  useStreamEvents({
    onDonation: (donor, amount, message) => {
      // ... existing code ...
      addAlert({
        type: 'donation',
        title: 'Donation Received',
        message: `${donor} donated $${amount}`,
        data: { username: donor, amount, message },
      });
    },
    onRaid: (raiderName, raidCount) => {
      // ... existing code ...
      addAlert({
        type: 'raid',
        title: 'RAID INCOMING!',
        message: `${raiderName} raided with ${raidCount} viewers`,
        data: { username: raiderName, raidCount },
      });
    },
    // ... other event handlers ...
  });

  return (
    <div>
      <AlertContainer alerts={alerts} onDismiss={dismissAlert} />
      {/* Rest of layout */}
    </div>
  );
}
```

## Alert Types & Configuration

### Raid Alert
```typescript
addAlert({
  type: 'raid',
  title: 'RAID INCOMING!',
  message: 'raider raided with count viewers',
  data: {
    username: 'raider_name',
    raidCount: 250,
  },
  // duration: 8000 (auto)
  // priority: 3 (auto)
});
```

### Subscribe Alert
```typescript
addAlert({
  type: 'subscribe',
  title: 'NEW SUBSCRIBER!',
  message: 'username subscribed for months',
  data: {
    username: 'subscriber_name',
    tier: 'gold', // bronze, silver, gold, platinum
    months: 1,
    message: 'optional subscriber message',
  },
  // duration: 7000 (auto)
  // priority: 2 (auto)
});
```

### Donation Alert
```typescript
addAlert({
  type: 'donation',
  title: 'Donation Received',
  message: 'donor donated $amount',
  data: {
    username: 'donor_name',
    amount: 50,
    message: 'optional donor message',
  },
  // duration: 6000 (auto)
  // priority: 2 (auto)
});
```

### Follow Alert
```typescript
addAlert({
  type: 'follow',
  title: 'NEW FOLLOWER!',
  message: 'username followed',
  data: {
    username: 'follower_name',
  },
  // duration: 5000 (auto)
  // priority: 1 (auto)
});
```

### Error Alert
```typescript
addAlert({
  type: 'error',
  title: 'Connection Error',
  message: 'Stream quality dropped',
  data: {
    details: 'Additional error info',
  },
  // duration: 8000 (auto)
  // priority: 4 (auto - highest)
});
```

### Success Alert
```typescript
addAlert({
  type: 'success',
  title: 'Stream Started',
  message: 'Stream is now live',
  data: {
    details: 'Additional success info',
  },
  // duration: 4000 (auto)
  // priority: 0 (auto - lowest)
});
```

## Default Durations & Priorities

```typescript
DISMISS_DURATIONS = {
  raid: 8000,
  subscribe: 7000,
  donation: 6000,
  follow: 5000,
  error: 8000,
  success: 4000,
}

PRIORITY_LEVELS = {
  raid: 3,
  subscribe: 2,
  donation: 2,
  follow: 1,
  error: 4,
  success: 0,
}
```

### Queue Behavior

- **Max visible**: 3 alerts
- **Sorting**: By priority (highest first)
- **Queue indicator**: Shows "+N more alerts queued" if > 3
- **Auto-dismiss**: When duration expires
- **Manual dismiss**: Close button on each alert

## Testing

Use the demo component: `/src/components/AlertQueueDemo.tsx`

```tsx
import { AlertQueueDemo } from '@/components/AlertQueueDemo';

export function TestPage() {
  return <AlertQueueDemo />;
}
```

**Demo Features**:
- Individual alert type buttons
- 10-alert sequence test
- Queue status display
- Dismiss all functionality

## Accessibility

- **ARIA Live Region**: `aria-live="polite"` for dynamic updates
- **Role**: `role="status"` for alert notifications
- **Close Button**: Labeled with `aria-label="Dismiss alert"`
- **Keyboard**: Close buttons fully accessible
- **Screen Reader**: Alerts announced automatically

## Animation Details

Alerts use `animate-slide-in-top` from `/styles/animations.css`:

```css
@keyframes slideInFromTop {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

Staggered entrance with 100ms delay per alert for smooth visual flow.

## Responsive Design

### Desktop (1024px+)
- Position: `top-4 right-4`
- Width: Fixed `w-80` (320px)

### Mobile (<1024px)
- Position: `top-2 left-2 right-2`
- Width: Full with side margins

## Migration from Old System

### Before (Old System)
```tsx
// Separate containers scattered across layout
<div className="fixed top-4 left-1/2">
  {raids.map(raid => <RaidAlert {...} />)}
</div>
<div className="fixed top-32 left-1/2">
  {subscribers.map(sub => <SubscriberAlert {...} />)}
</div>
<div className="fixed bottom-4 right-4">
  {donations.map(donation => <DonationAlert {...} />)}
</div>
```

### After (New System)
```tsx
// Single unified container
<AlertContainer alerts={alerts} onDismiss={dismissAlert} />
```

## Future Enhancements

- [ ] Custom action buttons per alert
- [ ] Sound effects per alert type
- [ ] Local storage persistence
- [ ] Alert history/log
- [ ] Grouping duplicate alerts
- [ ] Custom animations per type
