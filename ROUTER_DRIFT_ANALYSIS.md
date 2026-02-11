# Router Drift Analysis

## Overview

Ran `scripts/check-router-drift.sh` and found extensive API mismatches between client pages and server routers.

**Results:**
- ❌ 177 router drift violations
- 📋 59 pages affected
- ✅ 33 routers exist in server/routers.ts
- ❌ 30+ routers referenced but don't exist

---

## Existing Routers (from server/routers.ts)

Top-level routers that DO exist:
- `system`
- `beatport`
- `ukEvents`
- `auth` (with procedures: me, logout, register)
- `mixes` (with procedures: list, free, downloadUrl, admin*)
- Top-level procedures: getAllMixes, getFreeMixes, getMixById

Plus 24 other nested procedures.

---

## Missing Routers

Routers that pages reference but DON'T exist:

**Frequently referenced:**
- `socialFeed` (SocialFeed.tsx)
- `bookings` (BookingQuote, Bookings, AdminBookings, Dashboard, BookDanny)
- `streams` (AdminStreams, Home, Live, LiveStudio)
- `events` (Home, Events)
- `episodes` (ShowEpisodes, ShowPage, ShowEpisodeDetail)
- `aiStudio` (AdminAIStudio, AdminAIVideo, AdminAIScripts, AdminAIVoice, AIShout)
- `podcasts` (AdminPodcasts, Podcasts)
- `shows` (AdminShows, ShowPage)
- `tracks` (AdminTracks, AdminNowPlaying)

**Others:**
- media, genz, danny, eventsPhase7, shouts, trackRequests
- showsPhase9, live, articles, empire, safety
- videoTestimonials, trackIdRequests, integrations, products
- streaming, controlTower, economy, cues, videos
- partners, purchases, innerCircle, listeners, bookingsPhase7
- marketing, support

---

## Sample Violations

**SocialFeed.tsx:**
```typescript
// Line 11
const { data: posts = [], isLoading } = trpc.socialFeed.list.useQuery({
  //                                          ^^^^^^^^^^^ doesn't exist
```

**Home.tsx:**
```typescript
// Line 37-38
const { data: stream } = trpc.streams.getActive.useQuery();
//                            ^^^^^^^ doesn't exist
const { data: events } = trpc.events.getFeatured.useQuery();
//                            ^^^^^^ doesn't exist
```

**AdminStreams.tsx:**
```typescript
// Lines 52-54
const utils = trpc.useUtils();
const { data: streams } = trpc.streams.adminList.useQuery();
//                              ^^^^^^^ doesn't exist
const createStream = trpc.streams.adminCreate.useMutation();
//                         ^^^^^^^ doesn't exist
```

---

## Critical Pages (Routed in App.tsx)

Many pages with router drift ARE actually routed:

**User-facing:**
- `SocialFeed.tsx` → `/social-feed`
- `EventsPage.tsx` → `/events`
- `Bookings.tsx` → `/bookings`
- `Home.tsx` → `/` (homepage!)
- `Live.tsx` → `/live`
- `Podcasts.tsx` → `/podcasts`
- `Shop.tsx` → `/shop`

**Admin:**
- `AdminStreams.tsx` → `/admin/streams`
- `AdminBookings.tsx` → `/admin/bookings`
- `AdminShows.tsx` → `/admin/shows`
- `AdminPodcasts.tsx` → `/admin/podcasts`
- Plus 40+ more admin pages

**Cannot simply delete** - these are part of the product.

---

## Why This Matters

**Router drift = TypeScript errors**

When pages reference non-existent routers:
- TypeScript error TS2339: Property doesn't exist
- Type inference fails
- Build fails (if strict)
- Runtime errors (if routers actually called)

**Must either:**
1. Implement missing routers in server/routers.ts
2. Rewire pages to use existing routers
3. Delete pages (only if not routed/not needed)

---

## Next Steps

**Cannot proceed without actual CI TypeScript output.**

Need to see:
1. Exact error messages
2. File names and line numbers
3. Error types (TS2339, TS2345, etc.)
4. Full error context

**User must provide CI logs using:**
- Option A: GitHub UI → Actions → latest run → typecheck job
- Option B: `gh run view RUN_ID --log-failed`

**Then can:**
- Prioritize critical vs optional fixes
- Determine which routers to implement
- Create surgical fix plan
- Execute fixes in priority order

---

_Analysis complete. Awaiting CI output for surgical fixes._
