# API Isolation Architecture

## Purpose

This document describes the **API Facade Layer** - an architectural boundary that separates frontend API contracts from backend implementation details. It prevents tight coupling between frontend pages and backend routers.

## Problem Statement

**Before**: Each frontend page directly imported and called specific routers:
```typescript
// pages/Shop.tsx
import { revenueRouter } from '@server/routers/revenueRouter';
import { productRouter } from '@server/routers/productRouter';

export function Shop() {
  // Direct dependency on implementation
  const { data } = trpc.products.list.useQuery();
}
```

This creates:
- **Cross-community dependencies**: Frontend tightly coupled to router structure
- **Brittle APIs**: Renaming/moving routers breaks frontend
- **No API versioning**: Can't evolve backend without breaking frontend
- **Unclear contracts**: Hard to see what data flows frontend→backend

## Solution: API Facade

The facade layer (`api-facade.ts`) groups routers into **business domains** and exports only type definitions, not implementations.

### Domain Organization

Routers are grouped by business function, not technical layer:

```typescript
ContentRouters          // Blog, FAQ, Podcasts, Clips, Highlights, Playlists
CommerceRouters         // Products, Purchases, Merch
EngagementRouters       // Profile, Community, Messages, Comments
StreamingRouters        // Live, Simulcast, Streaming, Track Requests
EventsRouters           // UK Events, Bookings, Shows
MusicRouters            // Soundcloud, Spotify
MonetizationRouters     // Donations, Subscriptions, Premium, Revenue, Sponsorships
SystemRouters           // Admin, Analytics, Moderation, Safety, Support
AIRouters               // AI features, Recommendations, Summarization
AuthRouters             // Authentication
AdminRouters            // Partners, Brands, Inner Circle, Empire, GenZ
SocialRouters           // Social proof, Listeners, Feeds
```

## Architectural Boundaries

### What CAN Cross This Boundary

✅ **Router re-exports** (tRPC router objects)
```typescript
// Allowed: importing from facade
import type { ContentRouters } from '@server/_core';
```

✅ **Domain type definitions**
```typescript
// Allowed: type-safe domain interfaces
function handleBlogContent(api: ContentRouters) { }
```

✅ **Logical groupings by business function**
```typescript
// Allowed: grouping related routers
const {
  products,
  purchases,
  merch,
} = commerceAPI;
```

### What CANNOT Cross This Boundary

❌ **Direct imports of router internals**
```typescript
// BAD: importing implementation details
import { productRouterInternal } from '@server/routers/productRouter';
import { validateProduct } from '@server/routers/productRouter';
```

❌ **Implementation utilities**
```typescript
// BAD: importing backend helpers
import { db } from '@server/db';
import { sendEmail } from '@server/_core/email';
```

❌ **Private/internal service APIs**
```typescript
// BAD: importing internal services
import { autonomousEngine } from '@server/_core/autonomousEngine';
import { llmClient } from '@server/_core/llm';
```

❌ **Backend-only authentication contexts**
```typescript
// BAD: accessing admin context directly
import { adminAuthMiddleware } from '@server/_core/adminAuth';
const secret = await getAdminSecret();  // Only accessible via tRPC
```

## Implementation Pattern

### For Frontend Components

**Old way (tight coupling):**
```typescript
// pages/Merch.tsx
import { TRPCRouter } from '@server/routers';

export function Merch() {
  // Direct dependency on router structure
  const { data } = trpc.merch.getProducts.useQuery();
}
```

**New way (via facade):**
```typescript
// pages/Merch.tsx
import type { CommerceRouters } from '@server/_core';

export function Merch() {
  // Via tRPC client - knows only that commerce.merch exists
  const { data } = trpc.merch.getProducts.useQuery();
}
```

### For Backend Services

**Old way (cross-router dependencies):**
```typescript
// server/routers/revenueRouter.ts
import { productRouter } from './productRouter';
import { subscriptionRouter } from './subscriptionRouter';

export const revenueRouter = router({
  calculate: publicProcedure.query(async () => {
    // Directly coupling to other routers
  }),
});
```

**New way (via domain boundaries):**
```typescript
// server/routers/revenueRouter.ts
// Depends on commerce domain through type contract
import type { CommerceRouters } from '../_core/api-facade';

// Implementation still uses internal APIs, but type signature is clear
export const revenueRouter = router({
  calculate: publicProcedure.query(async () => {
    // Implementation can use internal utilities
    // But the router signature is typed against the facade
  }),
});
```

## Benefits

### 1. **Clear Contracts**
   - Explicit API surface between frontend and backend
   - Easy to understand what data flows between systems
   - Type-safe domain boundaries

### 2. **Decoupled Development**
   - Frontend team can develop against stable domain APIs
   - Backend team can refactor routers without breaking frontend
   - Enables parallel development

### 3. **Easier Testing**
   - Mock specific domains instead of entire router tree
   - Test frontend in isolation using facade types
   - Better error isolation

### 4. **Future API Versioning**
   - Can create v2/ domains without affecting v1/
   - Gradual migration paths for deprecated APIs
   - A/B test different API structures

### 5. **Scalability**
   - As team grows, clear ownership boundaries
   - Easy to identify cross-domain dependencies
   - Reduces unexpected coupling

## Migration Guide

### Step 1: Use Domain Types

Replace generic router typing with specific domains:

```typescript
// Before
async function processContent(api: any) { }

// After
import type { ContentRouters } from '@server/_core';
async function processContent(api: ContentRouters) { }
```

### Step 2: Organize Imports

Group imports by domain:

```typescript
// Before
import { blogRouter } from './routers/blogRouter';
import { faqRouter } from './routers/faqRouter';
import { podcastRouter } from './routers/podcastRouter';

// After
import type { ContentRouters } from '@server/_core';
// Routers available via appRouter.blog, appRouter.faq, appRouter.podcasts
```

### Step 3: Monitor Cross-Domain Calls

Look for operations that span multiple domains (and document them):

```typescript
// OK: Merch (commerce) calls notifications (system)
// This crosses a boundary - should be documented
async function notifyMerchPurchase(purchase: Purchase) {
  await api.notifications.send.mutate({ /* ... */ });
}
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Frontend Tier                      │
│  (Pages, Components, Hooks)                          │
└────────────────────┬────────────────────────────────┘
                     │
                     │ tRPC Client Calls
                     ↓
┌─────────────────────────────────────────────────────┐
│     API FACADE LAYER (Isolation Boundary)            │
│  - APIFacade (complete surface)                      │
│  - DomainBoundary (typed domains)                    │
│  - Type definitions only, NO implementations         │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ Type-safe routing
                      ↓
┌─────────────────────────────────────────────────────┐
│                  appRouter                            │
│  ├─ Content Domain                                   │
│  │  ├─ blog                                          │
│  │  ├─ faq                                           │
│  │  ├─ podcasts                                      │
│  │  ├─ clips                                         │
│  │  ├─ highlights                                    │
│  │  └─ playlists                                     │
│  ├─ Commerce Domain                                  │
│  │  ├─ products                                      │
│  │  ├─ purchases                                     │
│  │  └─ merch                                         │
│  ├─ [7 more domains]...                              │
│  └─ [Private implementation utilities]               │
└─────────────────────────────────────────────────────┘
                      │
                      │ Implementation
                      ↓
┌─────────────────────────────────────────────────────┐
│        Backend Implementation (Hidden)                │
│  - Router internals                                  │
│  - Database layer                                    │
│  - Service utilities                                 │
│  - Authentication context                           │
└─────────────────────────────────────────────────────┘
```

## Related Files

- **api-facade.ts** - Domain type definitions and boundaries
- **routers.ts** - Actual appRouter implementation
- **routers/** - Individual router implementations
- **_core/** - Core services (not exposed via facade)

## Frequently Asked Questions

**Q: Do I need to use the facade for all API calls?**
A: Not immediately - it's optional for existing code. New code should prefer domain types.

**Q: Can I still import routers directly?**
A: Yes, but try to avoid it. Use the facade and let TypeScript guide you to proper boundaries.

**Q: What if I need access to something not in the facade?**
A: That's a sign the facade is incomplete. Propose adding it to the appropriate domain interface.

**Q: How do I add a new router?**
A1. Create the router in `server/routers/`
A2. Export it in `appRouter` definition (server/routers.ts)
A3. Add it to the appropriate domain interface in `api-facade.ts`
A4. Export updated types from `server/_core/index.ts`

**Q: Can routers call other routers?**
A: Yes, via `appRouter.domain.procedure()` - they're tRPC routers, so they can call each other's procedures. But document cross-domain calls clearly.

## Monitoring & Observability

To track cross-domain dependencies, you can add:

```typescript
// In api-facade.ts
export const DOMAIN_DEPENDENCIES = {
  merch: ['notifications', 'analytics'],  // Merch calls these domains
  revenue: ['donations', 'subscriptions'],
  // etc...
};
```

Then use TypeScript to enforce these declared dependencies:

```typescript
// If merch calls a procedure outside its dependencies,
// it should be explicitly documented
```

## Version History

- **2026-05-05** - Initial API Facade Layer created
  - 12 business domains defined
  - Type-safe boundary enforcement
  - No router implementations changed
