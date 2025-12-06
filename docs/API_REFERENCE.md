# API Reference

This document provides a comprehensive reference for the DJ Danny Hectic B API.

## Table of Contents

1. [Authentication](#authentication)
2. [Mixes](#mixes)
3. [Events](#events)
4. [Podcasts](#podcasts)
5. [Bookings](#bookings)
6. [Shouts](#shouts)
7. [Shows](#shows)
8. [AI Services](#ai-services)
9. [Economy](#economy)
10. [Email](#email)

---

## Authentication

### `auth.me`
Returns the currently authenticated user.

**Type:** Query (Public)

**Response:**
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
}
```

### `auth.logout`
Logs out the current user by clearing the session cookie.

**Type:** Mutation (Public)

**Response:**
```typescript
{ success: true }
```

---

## Mixes

### `mixes.list`
Returns all mixes.

**Type:** Query (Public)

**Response:**
```typescript
Array<{
  id: number;
  title: string;
  description: string | null;
  audioUrl: string;
  coverImageUrl: string | null;
  duration: number | null;
  genre: string | null;
  isFree: boolean;
  downloadUrl: string | null;
  createdAt: Date;
}>
```

### `mixes.free`
Returns only free mixes.

**Type:** Query (Public)

### `mixes.getDownloadUrl`
Generates a presigned S3 download URL for a mix.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  mixId: string;
  format: "mp3" | "wav" | "flac"; // default: "mp3"
}
```

**Response:**
```typescript
{ url: string }
```

---

## Events

### `events.upcoming`
Returns upcoming events.

**Type:** Query (Public)

### `events.featured`
Returns featured events.

**Type:** Query (Public)

### `events.all`
Returns all events.

**Type:** Query (Public)

---

## Podcasts

### `podcasts.list`
Returns all podcast episodes.

**Type:** Query (Public)

---

## Bookings

### `bookings.create`
Creates a new booking request.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  eventType: "club" | "radio" | "private" | "brand" | "other";
  eventDate: string;
  eventTime: string; // format: "HH:MM"
  location: string;
  budgetRange?: string;
  setLength?: string;
  streamingRequired?: boolean;
  extraNotes?: string;
  marketingConsent?: boolean;
  dataConsent: boolean;
}
```

### `bookings.list`
Lists all bookings (admin only).

**Type:** Query (Admin)

### `bookings.get`
Gets a specific booking by ID (admin only).

**Type:** Query (Admin)

**Input:**
```typescript
{ id: number }
```

---

## Shouts

### `shouts.create`
Creates a new shout or track request.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  name: string;
  location?: string;
  message: string;
  trackRequest?: string;
  isTrackRequest?: boolean;
  trackTitle?: string;
  trackArtist?: string;
  phone?: string;
  email?: string;
  heardFrom?: string;
  genres?: string[];
  whatsappOptIn?: boolean;
  canReadOnAir?: boolean;
}
```

### `shouts.list`
Returns approved shouts.

**Type:** Query (Public)

**Input:**
```typescript
{ limit?: number } // default: 20, max: 50
```

### `shouts.listAll`
Returns all shouts with optional filters (protected).

**Type:** Query (Protected)

**Input:**
```typescript
{
  approved?: boolean;
  readOnAir?: boolean;
  trackRequestsOnly?: boolean;
}
```

### `shouts.updateStatus`
Updates shout approval status (admin only).

**Type:** Mutation (Admin)

**Input:**
```typescript
{
  id: number;
  approved?: boolean;
  readOnAir?: boolean;
}
```

---

## Shows

### `shows.list`
Returns active shows.

**Type:** Query (Public)

### `shows.all`
Returns all shows including inactive (admin only).

**Type:** Query (Admin)

### `shows.create`
Creates a new show (admin only).

**Type:** Mutation (Admin)

**Input:**
```typescript
{
  name: string;
  host?: string;
  description?: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // format: "HH:MM"
  endTime: string; // format: "HH:MM"
  isActive?: boolean;
}
```

---

## AI Services

### `ai.listenerAssistant`
Chat with the AI listener assistant.

**Type:** Mutation (Public)

**Input:**
```typescript
{ message: string } // max 500 characters
```

**Response:**
```typescript
{ response: string }
```

### `ai.bookingAssistant`
Chat with the AI booking assistant.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  message?: string;
  currentStep?: string;
  collectedData?: Record<string, any>;
}
```

### `aiStudio.scripts.create`
Create an AI script generation job.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  type: "intro" | "outro" | "mixStory" | "tiktokClip" | "promo" | "fanShout" | "generic";
  context: Record<string, any>;
}
```

### `aiStudio.voice.create`
Create an AI voice synthesis job.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  scriptJobId?: number;
  rawText?: string;
  voiceProfile?: "hectic_main" | "hectic_soft" | "hectic_shouty";
}
```

---

## Economy

### `economy.wallet.getMyWallet`
Gets the authenticated user's wallet.

**Type:** Query (Protected)

**Response:**
```typescript
{
  id: number;
  userId: number;
  balanceCoins: number;
  totalEarned: number;
  totalSpent: number;
}
```

### `economy.rewards.listActive`
Lists active rewards available for redemption.

**Type:** Query (Public)

### `economy.redemptions.create`
Redeems a reward using coins.

**Type:** Mutation (Protected)

**Input:**
```typescript
{ rewardId: number }
```

### `economy.referrals.applyCode`
Applies a referral code.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  code: string;
  userId: number;
  rewardCoins?: number; // default: 100
}
```

---

## Email

### `email.subscribe`
Subscribe to the newsletter.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  email: string;
  name?: string;
  tags?: string[];
}
```

**Response:**
```typescript
{ success: boolean; error?: string }
```

### `email.contact`
Send a contact form message.

**Type:** Mutation (Public)

**Input:**
```typescript
{
  name: string;
  email: string;
  subject: string;
  message: string;
}
```

**Response:**
```typescript
{ success: boolean; error?: string }
```

---

## Error Handling

All API errors follow a standard format:

```typescript
{
  error: {
    message: string;
    code: string;
  }
}
```

Common error codes:
- `UNAUTHORIZED` - User is not authenticated
- `FORBIDDEN` - User lacks required permissions
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input data
- `INTERNAL_SERVER_ERROR` - Server-side error

---

## Rate Limiting

API requests are rate limited to:
- Public endpoints: 100 requests per minute
- Authenticated endpoints: 200 requests per minute
- AI endpoints: 10 requests per minute

---

## Webhooks

Webhook events are sent to configured endpoints when:
- New shout is submitted
- New episode is published
- New redemption is created
- New follower is added

Webhook payloads include:
```typescript
{
  type: string;
  data: Record<string, any>;
  timestamp: string;
}
```

---

## SDK Usage

### React/TypeScript Client

```typescript
import { trpc } from "@/lib/trpc";

// Query example
const { data: mixes } = trpc.mixes.list.useQuery();

// Mutation example
const subscribe = trpc.email.subscribe.useMutation();
await subscribe.mutateAsync({
  email: "fan@example.com",
  name: "John Doe",
});
```
