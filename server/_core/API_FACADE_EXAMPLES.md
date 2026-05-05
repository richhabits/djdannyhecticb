# API Facade Usage Examples

Quick reference guide for using the API Facade layer in new code.

## Basic Usage

### Importing Domain Types

```typescript
// server/routers/subscriptionRouter.ts
import type { CommerceRouters, MonetizationRouters } from '../_core/api-facade';

// Define what data this router depends on
export const subscriptionRouter = router({
  create: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Implementation uses internal utilities (allowed)
      // But type signature declares dependencies clearly
    }),
});
```

### Component-Level Usage (Frontend)

```typescript
// pages/Shop.tsx
import type { CommerceRouters } from '@server/_core';
import { trpc } from '@/lib/trpc';

interface ShopProps {
  // Accept facade type - decouples from implementation
  api?: CommerceRouters;
}

export function Shop({ api }: ShopProps) {
  // In practice, uses tRPC client which always has full appRouter
  const products = trpc.products.list.useQuery();
  const merch = trpc.merch.list.useQuery();
  
  return (
    <div>
      {/* Use commerce API */}
    </div>
  );
}
```

## Cross-Domain Scenarios

### Scenario 1: Merch Purchases Trigger Notifications

```typescript
// server/routers/merchRouter.ts
import type { SystemRouters } from '../_core/api-facade';

// Document that merch depends on system domain
interface MerchDependencies {
  notifications: SystemRouters['notifications'];
  analytics: SystemRouters['analytics'];
}

export const merchRouter = router({
  purchaseItem: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Implementation can call other router procedures
      // Just document that this crosses domain boundaries
      
      // CROSS-DOMAIN: merch (commerce) → notifications (system)
      await ctx.api.notifications.send.mutate({
        userId: ctx.user.id,
        message: 'Your merch order confirmed!',
      });
      
      // CROSS-DOMAIN: merch (commerce) → analytics (system)
      await ctx.api.analytics.track.mutate({
        event: 'merch_purchase',
        value: input.itemId,
      });
    }),
});
```

### Scenario 2: Revenue Reporting Spans Multiple Domains

```typescript
// server/routers/revenueRouter.ts
import type {
  MonetizationRouters,
  CommerceRouters,
  SystemRouters,
} from '../_core/api-facade';

interface RevenueDependencies {
  donations: MonetizationRouters['donations'];
  subscriptions: MonetizationRouters['subscriptions'];
  premium: MonetizationRouters['premium'];
  products: CommerceRouters['products'];
  analytics: SystemRouters['analytics'];
}

export const revenueRouter = router({
  getDashboard: adminProcedure.query(async ({ ctx }) => {
    // Multiple domain dependencies documented here
    
    // CROSS-DOMAIN: revenue (monetization) → multiple domains
    const [donations, subs, premium, products] = await Promise.all([
      getDonationRevenue(),  // from donations router
      getSubscriptionRevenue(),  // from subscriptions router
      getPremiumRevenue(),  // from premium router
      getProductRevenue(),  // from products router
    ]);
    
    return {
      donations,
      subscriptions: subs,
      premium,
      products,
      total: donations + subs + premium + products,
    };
  }),
});
```

## Testing with the Facade

### Unit Test Example

```typescript
// server/routers/__tests__/subscriptionRouter.test.ts
import type { MonetizationRouters } from '../../_core/api-facade';
import { subscriptionRouter } from '../subscriptionRouter';

describe('subscriptionRouter', () => {
  // Create a mock implementing MonetizationRouters interface
  const mockAPI: MonetizationRouters = {
    donations: createMockRouter(),
    subscriptions: createMockRouter(),
    premium: createMockRouter(),
    revenue: createMockRouter(),
    sponsorships: createMockRouter(),
    affiliates: createMockRouter(),
  };

  it('should create subscription', async () => {
    const result = await subscriptionRouter.createSubscription({
      input: { productId: 1 },
      ctx: { user: { id: 1 }, api: mockAPI },
    });
    
    expect(result).toBeDefined();
  });
});
```

## When NOT to Use the Facade

### Case 1: Internal Router Utilities

```typescript
// server/routers/productRouter.ts
// DO NOT use facade inside router implementation
// Just use direct imports of what you need

import { db } from '../db';
import { validateProduct } from './product-validation';

// These are internal to the router - no facade needed
const products = await db.query('SELECT * FROM products');
```

### Case 2: Core Service Initialization

```typescript
// server/_core/autonomousEngine.ts
// Core services don't need facade - they're infrastructure

import { db } from '../db';
import { llmClient } from './llm';
import { logger } from './logger';

// These services are not facades - they're backend infrastructure
```

## Migration Checklist

If you're refactoring existing code to use the facade:

- [ ] Identify which domains the code depends on
- [ ] Replace generic `AppRouter` types with specific domain types
- [ ] Document any cross-domain dependencies with `// CROSS-DOMAIN:` comment
- [ ] Update tests to mock only required domains
- [ ] Verify TypeScript compilation passes
- [ ] Run relevant test suites

## Common Patterns

### Pattern 1: Domain-Specific Service Factory

```typescript
// server/_core/services/merchService.ts
import type { CommerceRouters, SystemRouters } from '../api-facade';

export function createMerchService(
  commerce: CommerceRouters,
  system: SystemRouters,
) {
  return {
    async purchaseItem(itemId: number) {
      // Service receives only what it needs
      const item = await commerce.products.getById({ id: itemId });
      await system.notifications.send({ message: 'Purchased!' });
    },
  };
}
```

### Pattern 2: Middleware with Domain Access

```typescript
// server/_core/middleware/commerceAnalytics.ts
import type { CommerceRouters, SystemRouters } from '../api-facade';

export function commerceAnalyticsMiddleware(
  commerce: CommerceRouters,
  analytics: SystemRouters['analytics'],
) {
  return async (call: any) => {
    const start = Date.now();
    const result = await call();
    
    // Track commerce operations
    await analytics.track({
      event: call.path,
      duration: Date.now() - start,
    });
    
    return result;
  };
}
```

### Pattern 3: Feature Flags by Domain

```typescript
// server/_core/features.ts
import type { APIFacade } from './api-facade';

export interface FeatureFlagContext {
  availableDomains: APIFacade;
  enabledFeatures: string[];
}

export function checkFeatureAccess(
  domain: keyof APIFacade,
  context: FeatureFlagContext,
): boolean {
  return context.enabledFeatures.includes(domain);
}
```

## Troubleshooting

### Q: TypeScript says router is missing from domain interface?

**A**: Add it to the appropriate domain interface in `api-facade.ts`. Example:

```typescript
// In api-facade.ts, add to ContentRouters:
export interface ContentRouters {
  blog: Router;
  faq: Router;
  podcasts: Router;
  clips: Router;
  highlights: Router;
  playlists: Router;
  // ADD HERE:
  newRouter: Router;  // ← newly added router
}
```

### Q: Should I update the facade when refactoring routers?

**A**: Only if you're changing the public API contract. Internal refactoring (moving code around, renaming internal functions) doesn't require facade updates. The facade protects against breaking the contract, not internal implementation.

### Q: Can I have router-to-router dependencies?

**A**: Yes, routers can call other routers via tRPC context or direct imports of internals. Just document cross-domain calls so future developers understand the architecture.

## Guidelines Summary

| Scenario | Use Facade? | Example |
|----------|------------|---------|
| Frontend component receiving router reference | ✅ Yes | `function Shop(api: CommerceRouters)` |
| Type-safe domain dependency injection | ✅ Yes | `services: MonetizationRouters` |
| Testing - mock specific domains | ✅ Yes | `const mock: ContentRouters = {...}` |
| Internal router implementation | ❌ No | `import { db } from '../db'` |
| Core service initialization | ❌ No | `import { llmClient } from './llm'` |
| Direct database access | ❌ No | `await getDb().query(...)` |
| Authentication context | ⚠️ Limited | Only via tRPC ctx, not direct imports |
