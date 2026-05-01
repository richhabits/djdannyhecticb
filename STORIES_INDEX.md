# Storybook Stories Index

Complete listing of all 105+ stories organized by component category.

**Generated:** 2026-05-01  
**Total Stories:** 105+ across 22 files  
**Status:** Ready for development

---

## Alert Components (22 stories)

### RaidAlert.stories.tsx
- `SmallRaid` - Small raid (50 viewers)
- `MediumRaid` - Medium raid (500 viewers)
- `MassiveRaid` - Massive raid (5000 viewers)
- `SingleViewer` - Edge case: Single viewer raid
- `LongUsername` - Edge case: Very long username

### SubscriberAlert.stories.tsx
- `BronzeTier` - Bronze tier subscriber
- `SilverTier` - Silver tier subscriber
- `GoldTier` - Gold tier subscriber
- `PlatinumTier` - Platinum tier subscriber
- `WithoutMessage` - No subscriber message
- `MultiMonthSubscriber` - 24-month subscription

### DonationAlert.stories.tsx
- `SmallDonation` - $5 donation
- `MediumDonation` - $50 donation
- `LargeDonation` - $500 donation
- `MassiveDonation` - $1000 donation
- `WithoutMessage` - No donor message
- `DecimalAmount` - $33.33 donation

### FollowAlert.stories.tsx
- `NewFollower` - New follower notification
- `PopularUser` - Popular user follows
- `LongUsername` - Very long username
- `SimpleUsername` - Single-word username
- `WithSpecialChars` - Username with special chars

### AlertContainer.stories.tsx
- `SingleAlert` - One alert displayed
- `TwoAlerts` - Two stacked alerts
- `ThreeAlerts` - Three stacked alerts
- `QueuedAlerts` - Queue indicator (4+ alerts)
- `ManyQueuedAlerts` - 8 queued alerts
- `AllAlertTypes` - Mixed alert types
- `ErrorAndSuccess` - Error + success pair

---

## Streaming Components (38 stories)

### StreamHealthIndicator.stories.tsx
- `Healthy` - Optimal stream quality (5.2 Mbps, 60 FPS, 1080p)
- `HealthyHighBitrate` - High bitrate (8.5 Mbps, 1440p)
- `Caution` - Warning state (1.5 Mbps, 30 FPS, 720p)
- `Critical` - Critical state (0.5 Mbps, 15 FPS, 480p)
- `LowBitrate` - Low bitrate scenario
- `MidrangeStream` - Mid-range quality
- `HighEndStream` - High-end streaming (10 Mbps, 4K)
- `VariableFPS` - Variable frame rate (48 FPS)

### QualitySelector.stories.tsx
- `Default` - Auto quality selected
- `Auto` - Auto mode
- `High1080p60` - 1080p 60fps selected
- `Medium720p` - 720p selected
- `Low480p` - 480p selected
- `AudioOnly` - Audio-only mode
- `WithCustomQualities` - Custom quality options
- `AllOptions` - All 8 quality options
- `WithInteraction` - Interactive example

### ProductPanel.stories.tsx
- `Default` - Mixed products (tracks, merch, links)
- `TracksOnly` - Only music tracks
- `MerchandiseOnly` - Only merchandise
- `LinksOnly` - Only social links
- `Mixed` - Complex mixed layout
- `Empty` - No products
- `SingleProduct` - Single product

### StreamEventLog.stories.tsx
- `Default` - Mixed recent events
- `RecentActivity` - Very recent events
- `HighActivity` - High event volume
- `DonationsOnly` - Only donation events
- `RaidsOnly` - Only raid events
- `MixedActivities` - Balanced event mix
- `Empty` - No events
- `SingleEvent` - Single event

### StreamAnalytics.stories.tsx
- `Default` - Standard stream stats
- `HighViewership` - 15K peak viewers
- `LowViewership` - 250 peak viewers
- `MediumStream` - 2.5K peak viewers
- `IntlAudience` - International audience
- `LongStream` - 12+ hour stream
- `SingleCountry` - Single country audience
- `USFocused` - US-dominant audience

### ViewerStats.stories.tsx
- `Default` - Normal display (3.5K viewers)
- `Compact` - Compact mode
- `HighViewership` - 15K viewers
- `CompactHighViewership` - Compact high viewers
- `LowViewership` - 150 viewers
- `CompactLowViewership` - Compact low viewers
- `LargeNumbers` - 2.5M viewers (K/M formatting)
- `CompactLargeNumbers` - Compact large numbers
- `ShortStream` - 5-minute stream
- `LongStream` - 10+ hour stream
- `NoDonations` - Zero donations
- `NoDonationsCompact` - Compact zero donations
- `ZeroViewers` - No viewers (startup)

---

## UI Components (45 stories)

### Button.stories.tsx
- `Default` - Default button
- `Destructive` - Destructive variant
- `Outline` - Outline variant
- `Secondary` - Secondary variant
- `Ghost` - Ghost variant
- `Link` - Link variant
- `Small` - Small size
- `Large` - Large size
- `Disabled` - Disabled state
- `Loading` - Loading state
- `AllSizes` - Size comparison
- `AllVariants` - Variant comparison
- `WithIcon` - Icon button

### Input.stories.tsx
- `Default` - Default text input
- `WithValue` - With default value
- `Email` - Email type
- `Password` - Password type
- `Search` - Search type
- `Number` - Number type
- `Disabled` - Disabled state
- `ReadOnly` - Read-only state
- `WithLabel` - Labeled input
- `WithError` - Error state
- `WithSuccess` - Success state
- `Large` - Large size
- `Compact` - Compact size

### Card.stories.tsx
- `Default` - Basic card
- `WithTitle` - Card with title
- `WithDescription` - Card with description
- `Complex` - Complex multi-section card
- `Interactive` - Interactive card grid

### Badge.stories.tsx
- `Default` - Default badge
- `Secondary` - Secondary variant
- `Destructive` - Destructive variant
- `Outline` - Outline variant
- `Live` - LIVE badge
- `Featured` - Featured badge
- `AllVariants` - Variant comparison
- `WithEmojis` - Emoji badges
- `StreamStatus` - Stream status badges

### Alert.stories.tsx
- `Default` - Default alert
- `Destructive` - Error alert
- `Success` - Success alert
- `Warning` - Warning alert
- `Info` - Info alert
- `ConnectionError` - Connection error
- `StreamHealthWarning` - Stream quality warning
- `MultipleAlerts` - Multiple alerts

---

## Form Components (6 files)

Located in `client/src/components/forms/`:

- `ContactForm.stories.tsx` - Contact form variations
- `DonationForm.stories.tsx` - Donation form variants
- `FormField.stories.tsx` - Form field states
- `FormMessage.stories.tsx` - Message displays
- `SubscribeForm.stories.tsx` - Subscribe form
- `TextAreaField.stories.tsx` - Text area variations

---

## Navigation

### By Category
- **[Alert Components](#alert-components-22-stories)** - 5 files, 22 stories
- **[Streaming Components](#streaming-components-38-stories)** - 6 files, 38 stories
- **[UI Components](#ui-components-45-stories)** - 5 files, 45 stories
- **[Form Components](#form-components-6-files)** - 6 files (pre-existing)

### By Complexity Level
**Basic (single variant)**
- Badge, Alert variants
- Input types
- Button variants

**Intermediate (multiple states)**
- StreamHealthIndicator states
- ViewerStats variations
- ProductPanel types

**Advanced (complex interactions)**
- AlertContainer with queue
- StreamAnalytics with tabs
- QualitySelector with groups

### By Use Case
**Real-time Metrics**
- StreamHealthIndicator
- ViewerStats
- StreamAnalytics

**User Interactions**
- RaidAlert, SubscriberAlert, DonationAlert
- AlertContainer, FollowAlert

**UI Building Blocks**
- Button, Input, Card, Badge, Alert

**Streaming Features**
- QualitySelector
- ProductPanel
- StreamEventLog

---

## Accessing Stories

### From CLI
```bash
# Start Storybook
pnpm storybook

# Opens http://localhost:6006
```

### Story Search
Inside Storybook UI:
1. Click search icon (top-left)
2. Type component name
3. Press Enter

### Example Search Queries
- "raid" → Find all raid-related stories
- "healthy" → Find health indicator variants
- "button" → Find button stories
- "donation" → Find donation-related stories

---

## Story Structure Reference

Each story follows this pattern:
```typescript
export const StoryName: Story = {
  args: {
    prop1: 'value',
    prop2: 123,
  },
  parameters: {
    docs: {
      description: {
        story: 'Explanation of this story...',
      },
    },
  },
};
```

---

## Testing Checklist

When reviewing stories:

- [ ] All variants are represented
- [ ] Edge cases are covered
- [ ] Responsive layouts work (mobile/tablet/desktop)
- [ ] Accessibility audit passes (A11y tab)
- [ ] Colors have sufficient contrast
- [ ] Text is readable at all sizes
- [ ] Interactions are intuitive
- [ ] Documentation is clear

---

## Adding New Stories

### Naming Convention
- Use descriptive names (e.g., `HealthyStream`, not `Story1`)
- Group related stories (e.g., `Small`, `Medium`, `Large`)
- Use action names (e.g., `WithMessage`, `WithError`)

### File Location
```
ComponentName.tsx
ComponentName.stories.tsx  ← Next to component
```

### Minimal Story Template
```typescript
import { Meta, StoryObj } from '@storybook/react';
import { Component } from './Component';

const meta: Meta<typeof Component> = {
  title: 'Category/ComponentName',
  component: Component,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    prop: 'value',
  },
};
```

---

## Performance Tips

- Stories load on-demand (lazy loading)
- First story takes ~3-5 seconds to load
- Subsequent stories load in <1 second
- Build time: ~30-60 seconds

---

## Maintenance

### Keep Stories Updated
- When props change → Update argTypes
- When variants change → Update stories
- When removing features → Remove stories
- When adding features → Add stories

### Documentation Updates
- Update descriptions when functionality changes
- Add stories before marking features as complete
- Review stories in code review

---

## Resources

- Full Guide: `/STORYBOOK_GUIDE.md`
- Setup Status: `/STORYBOOK_SETUP_COMPLETE.md`
- Storybook Docs: https://storybook.js.org/

---

**Last Updated:** 2026-05-01
