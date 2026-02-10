# Product Decisions Required: Router Drift Resolution

## Acknowledgment

This is **product leadership**, not TypeScript cleanup.

The 177 router drift violations represent a fundamental architectural issue: **the client product surface is larger than the server API**, and many live, routed pages are calling routers that don't exist.

TypeScript is correctly screaming because **the architecture is currently lying**.

---

## Current Reality (No Sugar-Coating)

**177 router drift violations across 59 routed pages**

This means:
- The client product surface is larger than the server API
- Many live, routed pages are calling routers that do not exist
- TypeScript is correctly screaming because the architecture is currently lying
- Adding features now would multiply the damage

This is exactly how large systems rot.

---

## Hard Rule (Phase 0 - NOW)

### 🚫 NO NEW FEATURES

Until these criteria are met:
- ✅ `pnpm check` → 0 errors
- ✅ Router drift → 0 violations
- ✅ CI → green without guardrails

**This includes:**
- 🚫 No blog/news categories
- 🚫 No AI-managed content
- 🚫 No new routers
- 🚫 No new features

**This is non-negotiable if you want a real platform.**

---

## Decision Framework (Phase 1)

For every routed page using a missing router, choose ONE:

### Option A: Core Product → IMPLEMENT ROUTER

**If the page is:**
- Linked in navigation
- Part of homepage / bookings / events / social
- Revenue or engagement critical
- Actively used by real users

**Then:**
- Implement the router for real
- Minimal, correct, typed procedures
- No mocks, no `any`, no placeholders
- Proper zod schemas and return types

### Option B: Not Core → REMOVE ROUTE

**If the page is:**
- Experimental
- Future idea
- "We'll build this later"
- Not actively used

**Then:**
- Remove route from `App.tsx`
- Remove nav links
- Delete the page
- Clean architecture

---

## Decision Tracker (59 Pages)

### Obvious Core Product (IMPLEMENT)

**Homepage Features:**
- `Home.tsx` → uses `trpc.streams`, `trpc.events`
- Decision: IMPLEMENT streams and events routers

**Events:**
- `Events.tsx` → uses `trpc.eventsPhase7`
- `EventsPage.tsx` → uses `trpc.eventsPhase7`
- Decision: Implement events router or rewire to existing

**Bookings:**
- `Bookings.tsx` → uses `trpc.bookings`
- `BookingQuote.tsx` → uses `trpc.bookings`
- Decision: IMPLEMENT bookings router

**Social:**
- `SocialFeed.tsx` → uses `trpc.socialFeed`
- Decision: IMPLEMENT socialFeed router

**Live/Streams:**
- `Live.tsx` → uses `trpc.streams`
- Decision: IMPLEMENT streams router

---

### Likely Experimental (Consider DELETE)

**Admin Experimental:**
- `AdminMedia.tsx` → uses `trpc.media`
- `AdminPartners.tsx` → uses `trpc.partners`
- `AdminProducts.tsx` → uses `trpc.products`
- `AdminEconomy.tsx` → uses `trpc.economy`
- Decision: DELETE if not actively used

**Future/Aspirational:**
- `AIDanny.tsx` → uses `trpc.genz`, `trpc.danny`
- `Vault.tsx` → uses `trpc.genz`
- `AIStudio.tsx` → uses `trpc.aiStudio`
- Decision: DELETE until ready to implement properly

---

### Needs Product Decision

For each of the remaining ~40 pages, you must decide:

1. **Is this page part of the core product?**
   - Is it linked in nav?
   - Is it revenue/engagement critical?
   - Do real users actively use it?

2. **Based on that:**
   - Core → Implement router properly
   - Not core → Delete page and route

---

## Systematic Execution Plan

### Step 1: Make Decisions (Product Leadership)

Review each of the 59 pages and make clear decisions:
- Which are core product?
- Which are experimental/future?

### Step 2: Implement Core Routers

For pages decided as core product:

1. Create router in `server/routers.ts`:
```typescript
import { myNewRouter } from './lib/my-new-router';

export const appRouter = router({
  // ... existing
  myNew: myNewRouter,  // ADD
});
```

2. Implement router with proper types:
```typescript
// server/lib/my-new-router.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const myNewRouter = router({
  list: publicProcedure.query(async () => {
    // Real implementation
    return [];
  }),
});
```

3. No mocks, no `any`, no placeholders

### Step 3: Delete Non-Core Pages

For pages decided as not core:

1. Remove route from `client/src/App.tsx`
2. Remove nav links from navigation components
3. Delete the page file
4. Verify no broken imports

### Step 4: Verify

After each batch of changes:
```bash
pnpm check  # Must be 0 errors
pnpm build  # Must succeed
bash scripts/check-router-drift.sh  # Must be 0 violations
```

---

## Success Criteria

**Must achieve:**
- ✅ `pnpm check` exits 0 (zero TypeScript errors)
- ✅ `pnpm build` exits 0
- ✅ Router drift = 0 violations
- ✅ CI green without continue-on-error

**No workarounds:**
- ❌ No continue-on-error
- ❌ No error budgets
- ❌ No hiding errors
- ❌ No fake routers
- ❌ No `any` types

---

## Why Sequencing Matters

### If You Add Features Now

Adding blog/news/AI content before resolving router drift:
- More pages calling non-existent routers
- More TypeScript errors
- More architectural debt
- Longer recovery time
- Higher risk of system rot

### If You Fix Drift First

Resolving router drift before adding features:
- Clean architectural foundation
- TypeScript as safety net
- Confidence in changes
- Fast, safe feature development
- Sustainable platform growth

---

## Phase 2: After Router Drift = 0

**Once TypeScript is green and router drift is resolved**, THEN:

1. Add blog/news routers properly
2. Add content categories with types
3. Add AI editorial workflow
4. Add SEO/structured data
5. Ship features safely

**With confidence because:**
- Architecture is honest
- TypeScript catches errors
- CI enforces quality
- No hidden debt

---

## The Make-or-Break Moment

This is not about TypeScript. This is about **whether the platform has architectural integrity**.

**Choose:**
- A) Fix drift now → Clean foundation → Fast safe growth
- B) Add features now → Multiply debt → Slow painful recovery

**Senior engineering choice:** A

---

## Summary

1. **Stop** adding features
2. **Make** product decisions for 59 pages
3. **Implement** core routers properly
4. **Delete** non-core pages
5. **Verify** TypeScript green
6. **Then** add features safely

**This is product leadership, not TypeScript whack-a-mole.**

---

_Framework ready. Execution required._
