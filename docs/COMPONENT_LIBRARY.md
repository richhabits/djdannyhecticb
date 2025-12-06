# Component Library

A comprehensive guide to the UI components in the DJ Danny Hectic B website.

## Table of Contents

1. [Design System](#design-system)
2. [Core Components](#core-components)
3. [Feature Components](#feature-components)
4. [Utility Components](#utility-components)

---

## Design System

### Colors

The design uses a dark theme with accent colors:

- **Primary/Accent**: Orange (`#f97316` / `orange-500`)
- **Background**: Dark slate (`#0f172a`)
- **Card Background**: Slightly lighter (`#1e293b`)
- **Text**: White/gray scale
- **Success**: Green (`#22c55e`)
- **Error**: Red (`#ef4444`)

### Typography

- **Headings**: SF Pro Display / system fonts
- **Body**: Inter / system fonts
- **Monospace**: JetBrains Mono / system fonts

---

## Core Components

### AdvancedSearch

A command palette-style search component with fuzzy search.

```tsx
import { AdvancedSearch } from "@/components/AdvancedSearch";

<AdvancedSearch className="w-full" />
```

**Features:**
- Keyboard shortcut (Cmd/Ctrl+K)
- Fuzzy search across all content
- Type filtering (mixes, events, podcasts, etc.)
- Recent searches saved to localStorage
- Popular searches suggestions

### BookingCalendar

An interactive calendar for checking DJ availability.

```tsx
import { BookingCalendar, exportToGoogleCalendar } from "@/components/BookingCalendar";

<BookingCalendar onDateSelect={(date) => console.log(date)} />

// Export to calendar
exportToGoogleCalendar({
  title: "DJ Set",
  date: new Date("2024-02-15T20:00:00"),
  location: "London Club",
});
```

### AnalyticsTracker

Automatic tracking of page views and user behavior.

```tsx
import { AnalyticsTracker, HeatmapTracker, useAnalytics } from "@/components/AnalyticsTracker";

// Add to App.tsx
<AnalyticsTracker />
<HeatmapTracker />

// Use in components
const { trackPageView, trackEvent } = useAnalytics();
trackEvent({ type: "mix_played", data: { mixId: "123" } });
```

---

## Feature Components

### SpotifyIntegration

Components for Spotify music playback and playlists.

```tsx
import { 
  SpotifyPlayer,
  SpotifySearch,
  SpotifyPlaylists,
  SpotifyConnectButton 
} from "@/components/SpotifyIntegration";

<SpotifyPlayer />
<SpotifySearch onTrackSelect={(track) => console.log(track)} />
<SpotifyPlaylists />
<SpotifyConnectButton />
```

### YouTubeIntegration

Components for YouTube video embedding and feeds.

```tsx
import { 
  YouTubeFeed,
  YouTubeEmbed,
  YouTubeVideoPlayer,
  LiveStreamWidget 
} from "@/components/YouTubeIntegration";

<YouTubeFeed channelId="UCxxxxxxx" />
<YouTubeEmbed videoId="dQw4w9WgXcQ" />
<LiveStreamWidget />
```

### DJTools

Professional DJ tools and equipment management.

```tsx
import { 
  TechnicalRider,
  SetlistBuilder,
  AudioWaveform,
  MediaKit 
} from "@/components/DJTools";

<TechnicalRider />
<SetlistBuilder />
<MediaKit />
```

### SocialFeed

Aggregated social media feeds.

```tsx
import { SocialFeed, SocialLinksWidget } from "@/components/SocialFeed";

<SocialFeed platforms={["instagram", "twitter", "tiktok"]} />
<SocialLinksWidget />
```

### EnhancedSocialShare

Advanced sharing with viral features.

```tsx
import { 
  EnhancedSocialShare,
  ShareableEventCard,
  ContestWidget 
} from "@/components/EnhancedSocialShare";

<EnhancedSocialShare
  url="https://djdannyhecticb.com/mixes/123"
  title="Summer Vibes Mix"
/>
<ContestWidget />
```

### StripePayment

Payment processing components.

```tsx
import { 
  StripePaymentForm,
  QuickPayButton,
  PricingTable 
} from "@/components/StripePayment";

<StripePaymentForm
  amount={2500} // £25.00
  onSuccess={() => console.log("Payment successful")}
/>
<PricingTable />
```

### S3Download

Secure file downloads from S3.

```tsx
import { 
  S3DownloadButton,
  MixDownloadCard,
  DownloadManager 
} from "@/components/S3Download";

<S3DownloadButton mixId="123" format="mp3" />
<MixDownloadCard mix={mixData} />
<DownloadManager />
```

### PodcastPlayer

Full-featured podcast player.

```tsx
import { PodcastPlayer } from "@/components/PodcastPlayer";

<PodcastPlayer episodes={episodes} />
```

**Features:**
- Play/pause, skip, volume control
- Speed adjustment (0.5x - 2x)
- Shuffle and repeat modes
- Episode list navigation

### VideoTestimonials

Video testimonial showcase.

```tsx
import { 
  VideoTestimonials,
  TestimonialStrip 
} from "@/components/VideoTestimonials";

<VideoTestimonials view="carousel" />
<VideoTestimonials view="grid" />
<TestimonialStrip />
```

---

## Utility Components

### Design Polish Components

Visual enhancement components for a premium look.

```tsx
import {
  // Skeletons
  CardSkeleton,
  ListItemSkeleton,
  GridSkeleton,
  
  // Loading states
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  
  // Backgrounds
  AnimatedGradientBg,
  ParticleBackground,
  
  // Cards
  GlassCard,
  GradientCard,
  
  // Buttons
  ShimmerButton,
  PulseButton,
  
  // Animations
  FadeInOnScroll,
  TiltCard,
  
  // Typography
  GradientText,
  AnimatedText,
  
  // Dividers
  GlowDivider,
  WaveDivider,
} from "@/components/DesignPolish";

// Examples
<CardSkeleton />
<LoadingSpinner size="lg" />
<GlassCard>Content</GlassCard>
<ShimmerButton>Click Me</ShimmerButton>
<FadeInOnScroll delay={0.2}>
  <div>Animates in on scroll</div>
</FadeInOnScroll>
<GradientText>Gradient Title</GradientText>
```

---

## Hooks

### useDebounce

Debounces a value by specified delay.

```tsx
import { useDebounce } from "@/hooks/usePersistFn";

const debouncedSearch = useDebounce(searchQuery, 300);
```

### useDebouncedCallback

Creates a debounced callback function.

```tsx
import { useDebouncedCallback } from "@/hooks/usePersistFn";

const handleSearch = useDebouncedCallback((query) => {
  // Search logic
}, 300);
```

### useThrottledCallback

Creates a throttled callback function.

```tsx
import { useThrottledCallback } from "@/hooks/usePersistFn";

const handleScroll = useThrottledCallback(() => {
  // Scroll logic
}, 100);
```

### useAnalytics

Access analytics tracking functions.

```tsx
import { useAnalytics } from "@/components/AnalyticsTracker";

const { trackPageView, trackEvent } = useAnalytics();
```

### useFormAnalytics

Track form interactions.

```tsx
import { useFormAnalytics } from "@/components/AnalyticsTracker";

const { trackFocus, trackBlur, trackSubmit } = useFormAnalytics("booking-form");
```

### useABTest

A/B testing hook.

```tsx
import { useABTest } from "@/components/AnalyticsTracker";

const variant = useABTest("button-color"); // Returns "A" or "B"
```

---

## Best Practices

1. **Use skeleton screens** for loading states
2. **Implement error boundaries** around feature components
3. **Use lazy loading** for heavy components
4. **Wrap mutations** in try/catch for error handling
5. **Use optimistic updates** for better UX
6. **Cache API responses** where appropriate
7. **Test on mobile** for all new components
