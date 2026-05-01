# Alert System Quick Reference

## Import
```tsx
import { useAlertQueue } from '@/hooks/useAlertQueue';
import { AlertContainer } from '@/components/AlertContainer';
```

## Basic Usage
```tsx
const { alerts, add: addAlert, dismiss: dismissAlert } = useAlertQueue();

// Add alert
addAlert({
  type: 'raid',
  title: 'RAID INCOMING!',
  message: 'Raider raided with 250 viewers',
  data: { username: 'Raider', raidCount: 250 },
});

// Dismiss alert
dismissAlert(alertId);

// Render
<AlertContainer alerts={alerts} onDismiss={dismissAlert} />
```

## Alert Types

### Raid
```tsx
addAlert({
  type: 'raid',
  title: 'RAID INCOMING!',
  message: 'message',
  data: { username: 'string', raidCount: number },
  // duration: 8000, priority: 3 (auto)
});
```

### Subscribe
```tsx
addAlert({
  type: 'subscribe',
  title: 'NEW SUBSCRIBER!',
  message: 'message',
  data: {
    username: 'string',
    tier: 'bronze'|'silver'|'gold'|'platinum',
    months: number,
    message?: 'string',
  },
  // duration: 7000, priority: 2 (auto)
});
```

### Donation
```tsx
addAlert({
  type: 'donation',
  title: 'Donation Received',
  message: 'message',
  data: {
    username: 'string',
    amount: number,
    message?: 'string',
  },
  // duration: 6000, priority: 2 (auto)
});
```

### Follow
```tsx
addAlert({
  type: 'follow',
  title: 'NEW FOLLOWER!',
  message: 'message',
  data: { username: 'string' },
  // duration: 5000, priority: 1 (auto)
});
```

### Error
```tsx
addAlert({
  type: 'error',
  title: 'Title',
  message: 'message',
  data: { details?: 'string' },
  // duration: 8000, priority: 4 (auto - highest)
});
```

### Success
```tsx
addAlert({
  type: 'success',
  title: 'Title',
  message: 'message',
  data: { details?: 'string' },
  // duration: 4000, priority: 0 (auto - lowest)
});
```

## Default Durations & Priorities

| Type | Duration | Priority |
|------|----------|----------|
| error | 8000ms | 4 (highest) |
| raid | 8000ms | 3 |
| subscribe | 7000ms | 2 |
| donation | 6000ms | 2 |
| follow | 5000ms | 1 |
| success | 4000ms | 0 (lowest) |

## Hook API

```tsx
const {
  alerts,                    // Alert[] - current queue
  add,                       // (alert) => string - add alert, returns ID
  dismiss,                   // (id: string) => void - remove alert
  dismissAll,                // () => void - clear all
} = useAlertQueue();
```

## Testing

```tsx
import { AlertQueueDemo } from '@/components/AlertQueueDemo';

// Add to page
<AlertQueueDemo />
```

## Files

| File | Purpose |
|------|---------|
| `/hooks/useAlertQueue.ts` | State manager |
| `/components/AlertContainer.tsx` | Display renderer |
| `/components/alerts/RaidAlert.tsx` | Raid display |
| `/components/alerts/SubscriberAlert.tsx` | Sub display |
| `/components/alerts/DonationAlert.tsx` | Donation display |
| `/components/alerts/FollowAlert.tsx` | Follow display |
| `/components/alerts/ErrorAlert.tsx` | Error display |
| `/components/alerts/SuccessAlert.tsx` | Success display |
| `/components/AlertQueueDemo.tsx` | Test component |
| `/src/components/alerts/README.md` | Full docs |

## Features

- Single queue management
- Automatic priority sorting (error > raid > donate/sub > follow)
- Max 3 visible alerts
- Auto-dismiss by type
- Manual close button
- Responsive (desktop top-right, mobile top-center)
- WCAG 2.1 AA accessible
- Smooth animations
- No external dependencies

## Common Patterns

### In event handler
```tsx
onDonation: (donor, amount, msg) => {
  addAlert({
    type: 'donation',
    title: 'Donation Received',
    message: `${donor} donated $${amount}`,
    data: { username: donor, amount, message: msg },
  });
}
```

### Custom duration
```tsx
addAlert({
  type: 'success',
  title: 'Hello',
  message: 'World',
  duration: 12000, // override default 4000ms
});
```

### Custom priority
```tsx
addAlert({
  type: 'follow',
  title: 'VIP Follow',
  message: 'Special user followed',
  priority: 3, // bump up from default 1
  data: { username: 'VIP_User' },
});
```

### Future: Action button (coming soon)
```tsx
addAlert({
  type: 'error',
  title: 'Retry?',
  message: 'Connection failed',
  action: {
    label: 'Retry',
    onClick: () => reconnect(),
  },
});
```

---

**Full documentation**: `/src/components/alerts/README.md`
