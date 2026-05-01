# Professional Streaming Components Guide

## Overview

Enhanced live streaming components that bring professional streaming platform features (Twitch, Kick, YouTube Live) to DJ Danny Hectic B's live page.

## New Components

### 1. **StreamHealthIndicator** 📊
Displays real-time stream health metrics.

```tsx
import { StreamHealthIndicator } from "@/components/StreamHealthIndicator";

<StreamHealthIndicator
  bitrate={5000}        // kbps
  fps={60}
  resolution="1080p"
  isHealthy={true}      // Shows HEALTHY or WARNING
/>
```

**Features:**
- Bitrate display (kbps)
- FPS counter
- Resolution indicator
- Health status (green/red)
- CPU usage indicator

**Props:**
- `bitrate` - Stream bitrate in kbps
- `fps` - Frames per second
- `resolution` - Display resolution (1080p, 720p, etc.)
- `isHealthy` - Health status (true = green, false = red)

---

### 2. **RaidAlert** 🚀
Animated alert for when another streamer raids your channel.

```tsx
import { RaidAlert } from "@/components/RaidAlert";

<RaidAlert
  raiderName="PopularStreamer"
  raidCount={500}
  onDismiss={() => console.log("Dismissed")}
  autoClose={8000}      // ms
/>
```

**Features:**
- Purple gradient background
- Animated entrance (slide down)
- Custom raid count display
- Auto-dismiss after 8 seconds
- Manual dismiss button

**Props:**
- `raiderName` - Name of the streamer raiding
- `raidCount` - Number of viewers in raid
- `onDismiss` - Callback when alert closes
- `autoClose` - Auto-dismiss timeout in ms

---

### 3. **SubscriberAlert** 🎁
Animated alert for new subscribers with tier system.

```tsx
import { SubscriberAlert } from "@/components/SubscriberAlert";

<SubscriberAlert
  subscriberName="VibeLover"
  tier="gold"           // bronze | silver | gold | platinum
  months={3}
  message="Love your streams!"
  onDismiss={() => {}}
  autoClose={7000}
/>
```

**Tier System:**
- 🥉 Bronze - Entry tier
- 🥈 Silver - Standard subscription
- 🥇 Gold - Premium subscription (yellow/gold gradient)
- 👑 Platinum - VIP subscription (cyan/blue gradient)

**Features:**
- Tier-based color gradient
- Subscription duration display
- Custom message support
- Emoji tier indicators
- Auto-dismiss

**Props:**
- `subscriberName` - Username
- `tier` - Subscription tier
- `months` - Subscription months
- `message` - Custom subscribe message
- `onDismiss` - Dismiss callback
- `autoClose` - Timeout in ms

---

### 4. **StreamEventLog** 📋
Real-time activity feed showing follows, subscriptions, donations, raids.

```tsx
import { StreamEventLog } from "@/components/StreamEventLog";

const events = [
  { 
    id: "1", 
    type: "follow", 
    username: "CoolDude42", 
    timestamp: new Date() 
  },
  { 
    id: "2", 
    type: "donation", 
    username: "TopSupporter", 
    amount: 25,
    timestamp: new Date() 
  },
];

<StreamEventLog
  events={events}
  maxVisible={5}
/>
```

**Event Types:**
- `follow` - New follower (blue)
- `subscribe` - New subscriber (yellow)
- `donation` - Donation received (red)
- `raid` - Raid received (purple)

**Features:**
- Scrollable activity feed
- Color-coded by event type
- Relative time display ("5m ago")
- Amount display for donations
- Icon indicators

---

### 5. **ProductPanel** 🛍️
Promote tracks, merchandise, or links.

```tsx
import { ProductPanel } from "@/components/ProductPanel";

<ProductPanel
  title="NOW PLAYING"
  products={[
    {
      id: "1",
      name: "Morning Vibes Mix",
      type: "track",
      url: "https://spotify.com/...",
      description: "Full 45-min exclusive mix"
    },
    {
      id: "2",
      name: "Hectic Radio Hoodie",
      type: "merchandise",
      price: 49.99,
      url: "https://shop.example.com"
    },
  ]}
  onProductClick={(product) => window.open(product.url)}
/>
```

**Product Types:**
- `track` - Music track (Spotify/YouTube)
- `merchandise` - Physical/digital products
- `link` - External links (Discord, socials, etc.)

**Features:**
- Icon-based product types
- Price display for merchandise
- Hover animations
- Click handlers
- View All Products button

---

### 6. **QualitySelector** 📺
Let viewers choose their preferred stream quality.

```tsx
import { QualitySelector } from "@/components/QualitySelector";

<QualitySelector
  currentQuality="auto"
  onQualityChange={(quality) => {
    // Handle quality change
    // Update stream URL, bitrate, etc.
  }}
  qualities={[
    { label: "Auto", value: "auto", bitrate: "Adaptive", fps: "60" },
    { label: "1080p60", value: "1080p60", bitrate: "5000-8000", fps: "60" },
    { label: "720p60", value: "720p60", bitrate: "2500-4000", fps: "60" },
    // ...more qualities
  ]}
/>
```

**Default Qualities:**
- Auto (adaptive bitrate)
- 1080p60 (highest quality)
- 1080p30
- 720p60
- 720p30
- 480p30
- Audio only

**Features:**
- Dropdown menu
- Settings icon
- Bitrate/FPS display
- Checkmark for current
- Keyboard accessible

---

### 7. **StreamAnalytics** 📈
Display stream statistics and geography data.

```tsx
import { StreamAnalytics } from "@/components/StreamAnalytics";

<StreamAnalytics
  peakViewers={5200}
  avgViewers={3847}
  streamDuration="2:15:30"
  topCountries={[
    { code: "US", viewers: 1850 },
    { code: "UK", viewers: 890 },
    { code: "CA", viewers: 650 },
  ]}
/>
```

**Features:**
- Peak viewer count
- Average viewer count
- Stream duration
- Top viewer countries
- Animated progress bars
- Viewer distribution chart

**Props:**
- `peakViewers` - Highest concurrent viewer count
- `avgViewers` - Average viewers over time
- `streamDuration` - How long stream has been live
- `topCountries` - Array of country codes and viewer counts

---

## Integration Examples

### Full Live Page Setup

```tsx
import { StreamerLiveLayout } from "@/components/StreamerLiveLayout";
import { useState, useEffect } from "react";

export default function Live() {
  const [activeStream] = useState({
    name: "Morning Vibes Mix",
    category: "Electronic / House",
  });

  return (
    <StreamerLiveLayout
      streamerName="DJ Danny Hectic B"
      streamTitle={activeStream.name}
      category={activeStream.category}
      onFollowClick={() => {
        // Open follow modal
      }}
      onSubscribeClick={() => {
        // Open subscribe modal
      }}
      onDonateClick={() => {
        // Open donation modal
      }}
    />
  );
}
```

### Handling Events (WebSocket)

```tsx
const handleStreamEvent = (event) => {
  switch (event.type) {
    case 'donation':
      showDonationAlert(event.donor, event.amount);
      break;
    case 'raid':
      showRaidAlert(event.raiderName, event.raidCount);
      break;
    case 'subscribe':
      showSubscriberAlert(event.username, event.tier);
      break;
  }
};
```

---

## Styling & Customization

### Color Scheme

All components use a consistent color palette:

```css
--primary: #FF4444          /* Red alerts */
--primary-light: #FF5555
--success: #4CAF50          /* Green */
--warning: #FFC107          /* Yellow */
--danger: #F44336           /* Red */
--purple: #9C27B0           /* Raids */
--background: #0A0A0A       /* Main bg */
--panel-bg: #1F1F1F         /* Card bg */
--text-primary: #FFFFFF
--text-secondary: #999999
```

### Animations

All alerts use smooth animations:
- **Entrance**: Slide down + fade in (400ms)
- **Exit**: Slide out + fade out (300ms)
- **Hover**: Scale + color transition (200ms)

Animations respect `prefers-reduced-motion`.

---

## Backend Integration

### Event Sources

Components expect events from:
1. **WebSocket** - Real-time events
2. **Polling** - Fallback REST API
3. **Server-sent Events (SSE)** - Alternative to WebSocket

### Required Event Schema

```typescript
type StreamEvent = {
  id: string;
  type: 'follow' | 'subscribe' | 'donation' | 'raid';
  username: string;
  timestamp: Date;
  // Optional fields per type
  amount?: number;           // donation
  tier?: string;             // subscribe
  months?: number;           // subscribe
  message?: string;          // subscribe, donation
  raiderCount?: number;      // raid
};
```

---

## Performance Tips

1. **Limit visible alerts**: Max 3-4 concurrent alerts
2. **Auto-dismiss**: Remove alerts after 5-8 seconds
3. **Debounce updates**: Batch event updates (100ms)
4. **Virtualize long lists**: Stream event log >50 items
5. **Lazy load**: Load analytics on demand

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari 14+, Chrome Android)

---

## Accessibility

All components include:
- ✅ Keyboard navigation
- ✅ Screen reader announcements
- ✅ Color contrast (WCAG AA)
- ✅ Touch targets (44x44px min)
- ✅ Reduced motion support

---

## Troubleshooting

### Alerts Not Showing

1. Check alert state management
2. Ensure z-index is high enough (z-50)
3. Verify event is being dispatched
4. Check console for errors

### Quality Selector Not Working

1. Verify qualities array is passed
2. Check onQualityChange callback
3. Ensure backend supports quality change
4. Test with different video sources

### Analytics Not Updating

1. Check data source (API/WebSocket)
2. Verify polling interval
3. Look for network errors
4. Check data format matches schema

---

## Future Enhancements

- [ ] Prediction system (community voting)
- [ ] Hype Train (escalating donations)
- [ ] Super Chat (highlighted donations)
- [ ] Emote walls (spam emotes on alert)
- [ ] Custom alerts (user-configurable)
- [ ] Moderation dashboard
- [ ] Advanced analytics (graphs, trends)
- [ ] VOD/clip buttons

---

**Last Updated:** 2026-05-01  
**Version:** 1.0.0  
**Status:** Production Ready
