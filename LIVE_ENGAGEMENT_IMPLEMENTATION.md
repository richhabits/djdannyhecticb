# DJ Danny Live Streaming Engagement Features - Implementation Guide

## Overview
Complete production-ready implementation of advanced engagement features for live streaming platform with real-time capabilities, payment integration, and gamification.

## Project Structure

### Database Schema (`drizzle/engagement-schema.ts`)
Comprehensive PostgreSQL schema with the following tables:

#### Core Tables
- **live_sessions** - Stream sessions with metadata
- **chat_messages** - Real-time chat with moderation support
- **user_badges** - Subscriber, moderator, founder, achievement badges
- **donations** - Stripe-integrated donation tracking
- **reactions** - Real-time emoji reactions with combo tracking
- **polls** - Interactive polls with real-time voting
- **poll_votes** - Vote tracking with duplicate prevention
- **leaderboards** - Top donors and chatters rankings
- **notifications** - Stream-wide and user-specific notifications
- **streamer_stats** - Cached streamer statistics
- **custom_emotes** - Tier-based custom emotes
- **raids** - Streamer raid/host tracking
- **social_links** - Social media and affiliate link management

### API Router (`server/routers/liveRouter.ts`)

#### Chat Procedures
```typescript
live.chat.send(message)        // Send chat message
live.chat.messages(limit)      // Fetch recent messages
live.chat.delete(messageId)    // Admin: Delete message
live.chat.pinMessage()         // Admin: Pin message
live.chat.unpinMessage()       // Admin: Unpin message
live.chat.pinnedMessages()     // Get pinned messages
```

#### Donation Procedures
```typescript
live.donations.create()        // Create donation with Stripe
live.donations.confirm()       // Confirm completed payment
live.donations.history()       // User's donation history
live.donations.sessionTop()    // Top donors in current stream
```

#### Reaction Procedures
```typescript
live.reactions.add()           // Add emoji reaction (with combo tracking)
live.reactions.counts()        // Get reaction counts (10s window)
live.reactions.topCombos()     // Get top combo streaks
```

#### Poll Procedures
```typescript
live.polls.create()            // Admin: Create poll
live.polls.vote()              // Vote on active poll
live.polls.getActive()         // Get current poll
live.polls.close()             // Admin: Close poll
```

#### Leaderboard Procedures
```typescript
live.leaderboard.topDonors()   // Top donors (24h, 7d, all-time)
live.leaderboard.topChatters() // Top message senders
live.leaderboard.sync()        // Admin: Sync leaderboard cache
```

#### Stats & Notifications
```typescript
live.stats.get()               // Get streamer statistics
live.stats.update()            // Update streamer stats
live.notifications.getUnread() // Get unread notifications
live.notifications.markRead()  // Mark notification as read
```

#### Social Features
```typescript
live.social.getLinks()         // Get user social links
live.social.updateLinks()      // Update social links
live.social.raid()             // Initiate raid to another streamer
```

### Stripe Integration (`server/_core/stripeWebhook.ts`)

- Payment intent creation and confirmation
- Webhook event handling (payment_intent.succeeded, payment_intent.payment_failed, charge.refunded)
- Automatic badge awarding on donation milestones
- Chargeback/dispute tracking
- Donation status lifecycle management

### Real-time Features

#### WebSocket Handler (`server/routers/liveWebSocket.ts`)
- Real-time message broadcasting
- Connection pooling per session
- Automatic reconnection with exponential backoff
- Session-scoped broadcasting
- Keep-alive pinging

#### Client Hook (`client/src/lib/useRealtime.ts`)
```typescript
const { isConnected, send, subscribe, disconnect } = useRealtime({
  liveSessionId: 123,
  userId: 456,
});

// Subscribe to real-time messages
const unsubscribe = subscribe((message) => {
  console.log("Received:", message);
});
```

### React Components

#### LiveChat (`client/src/components/live/LiveChat.tsx`)
- Real-time message display with auto-scroll
- User badges (Subscriber, Mod, Founder)
- Custom username colors
- Message moderation (delete, pin)
- Pinned messages section
- Rate limiting (500ms between messages)

#### DonationPanel (`client/src/components/live/DonationPanel.tsx`)
- Stripe card integration via `@stripe/react-stripe-js`
- Quick donation tiers ($5, $10, $25, $50, $100+)
- Custom amount input
- Optional anonymous donations
- Donation message support (max 500 chars)
- Top donors display
- User donation history
- Receipt confirmation

#### ReactionButtons (`client/src/components/live/ReactionButtons.tsx`)
- 7 reaction types: 🔥 🎉 ❤️ 😂 😢 😠 🤔
- Combo tracking (3x, 5x, 10x milestones)
- Real-time reaction counts (10s sliding window)
- Per-user 500ms cooldown
- Visual animations with Framer Motion
- Mobile touch-friendly

#### LiveLeaderboard (`client/src/components/live/LiveLeaderboard.tsx`)
- Tabbed interface: Top Donors / Top Chatters
- Medal rankings (🥇🥈🥉)
- Donation milestone badges
- Real-time updates (15s refresh)
- Support tiers displayed ($100+, $500+, $1000+)
- Animated entry transitions

#### PollWidget (`client/src/components/live/PollWidget.tsx`)
- Live active poll display
- Real-time vote counting
- Countdown timer with color change at <10s
- Vote confirmation UI
- Progress bars per option
- Prevents duplicate voting
- Auto-close on expiration

## Installation & Setup

### 1. Database Migration
```bash
# Generate migration
drizzle-kit generate

# Apply migration
pnpm db:push
```

Or manually:
```bash
psql -d your_database -f drizzle/migrations/001_engagement_features.sql
```

### 2. Stripe Configuration
```bash
# Add to .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Install Dependencies
All required packages are already in `package.json`:
- `@stripe/react-stripe-js` - ^5.4.1
- `@stripe/stripe-js` - ^4.10.0
- `stripe` - ^17.4.0
- `framer-motion` - ^12.23.22 (animations)
- `ws` - ^8.19.0 (WebSocket)

### 4. API Route Setup
Add to `server/routers.ts`:
```typescript
import { liveRouter } from "./routers/liveRouter";

export const appRouter = router({
  // ... existing routers
  live: liveRouter,
});
```

### 5. WebSocket Setup
In your Express server (`server/_core/index.ts`):
```typescript
import WebSocket from "ws";
import { initializeLiveWebSocket } from "./routers/liveWebSocket";

const wss = new WebSocket.Server({ noServer: true });
initializeLiveWebSocket(wss);

server.on("upgrade", (request, socket, head) => {
  if (request.url?.startsWith("/api/live/ws")) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  }
});
```

### 6. Stripe Webhook Endpoint
Add to your API routes:
```typescript
import { handleStripeWebhook, verifyWebhookSignature } from "./stripeWebhook";

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(req.body);
  const result = await handleStripeWebhook(event);
  res.json(result);
});
```

## Component Usage Examples

### Full Live Stream Page
```tsx
import { LiveChat } from "@/components/live/LiveChat";
import { DonationPanel } from "@/components/live/DonationPanel";
import { ReactionButtons } from "@/components/live/ReactionButtons";
import { LiveLeaderboard } from "@/components/live/LiveLeaderboard";
import { PollWidget } from "@/components/live/PollWidget";

export function LiveStreamPage({ liveSessionId }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left: Video */}
      <div className="col-span-2">
        <VideoPlayer sessionId={liveSessionId} />
        
        {/* Reactions & Poll */}
        <div className="mt-4 space-y-4">
          <ReactionButtons liveSessionId={liveSessionId} />
          <PollWidget liveSessionId={liveSessionId} />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-4">
        <DonationPanel liveSessionId={liveSessionId} />
        <LiveChat liveSessionId={liveSessionId} isAdmin={isAdmin} />
        <LiveLeaderboard liveSessionId={liveSessionId} />
      </div>
    </div>
  );
}
```

### With Stripe Elements
```tsx
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY!);

export function App() {
  return (
    <Elements stripe={stripePromise}>
      <LiveStreamPage />
    </Elements>
  );
}
```

## Performance Optimizations

### Database
- Indexed all foreign keys and frequently queried columns
- Composite indexes for common filter combinations
- Leaderboard caching to prevent expensive aggregations
- Time-windowed queries (10s for reactions, 15s for leaderboard)

### Frontend
- React Query with 2s chat refresh, 500ms reaction updates
- Auto-scroll only when at bottom (conserves DOM operations)
- Message pagination (50 latest messages loaded)
- Donation tier quick-select to avoid custom input delays
- Reaction cooldown (500ms) to throttle rapid clicks

### Real-time
- WebSocket connection pooling per session
- Broadcast-scoped to single session
- Keep-alive pinging every 30s
- Exponential backoff reconnection (max 30s)

## Security Considerations

### Authentication & Authorization
- Protected procedures require valid user context
- Admin procedures check for admin role
- User can only access their own donation history
- Donations are confirmed only by original payer

### Rate Limiting
- 500ms cooldown on chat messages per user
- 500ms cooldown on reactions per type per user
- Stripe payment intents with idempotency
- Database constraints prevent duplicate votes

### Data Validation
- All inputs validated with Zod schemas
- Message length limit: 500 characters
- Donation amount: $5-$10,000
- Poll option count: 2-10 options
- Color validation for usernames (hex regex)

### Webhook Security
- Stripe signature verification (HMAC-SHA256)
- Event version checking
- Idempotent webhook handling
- Payment intent matching before confirmation

## Monitoring & Analytics

### Key Metrics
```typescript
// Get streamer stats
const stats = await trpc.live.stats.get.query({ streamerId: 123 });

// Returns:
// - totalViewers: Current/peak viewers
// - totalTips24h / totalTipsAllTime: Revenue tracking
// - totalFollowers / totalSubscribers
// - level / experience: Engagement score
// - streakDays: Consecutive stream days
```

### Real-time Dashboards
Monitor via leaderboards:
- Top donors (24h, 7d, all-time)
- Top chatters (real-time)
- Reaction trends
- Poll participation
- Notification volume

## Error Handling

### Client-side
- Toast notifications for all mutations
- User-friendly error messages
- Graceful fallbacks (e.g., chat still loads if reactions fail)
- Connection status indicator

### Server-side
- Try-catch in WebSocket handlers
- Database error logging
- Stripe error handling with retry logic
- Webhook event idempotency

## Future Enhancements

1. **Tipping Animations**
   - Floating donation alerts
   - Sound notifications
   - Chat highlight for large tips

2. **Subscriber Features**
   - Emote-only messages
   - Message cooldown reduction
   - Custom colors for subscribers

3. **Moderation Tools**
   - Spam detection with ML
   - Auto-timeout for violators
   - Keyword filtering

4. **Analytics Dashboard**
   - Viewer retention graphs
   - Revenue trends
   - Engagement metrics
   - Content performance

5. **Mobile Optimization**
   - Touch gestures for reactions
   - Swipeable leaderboard
   - Bottom sheet chat
   - Adaptive layout

## Troubleshooting

### WebSocket not connecting
- Check CORS settings
- Verify WebSocket URL path
- Check network tab for upgrade failures

### Donations not processing
- Verify Stripe keys in environment
- Check webhook endpoint is public
- Ensure payment intent secret matches

### Leaderboard not updating
- Run sync mutation: `live.leaderboard.sync()`
- Check database indices are created
- Verify user IDs in donations table

### Reactions not showing counts
- Verify reaction table indices
- Check time window setting (default 10s)
- Ensure query refetch interval is active

---

**Last Updated:** 2024-04-30  
**Status:** Production Ready  
**Test Coverage:** Unit tests included, integration tests recommended
