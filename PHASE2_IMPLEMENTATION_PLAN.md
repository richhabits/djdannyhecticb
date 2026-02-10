# Phase 2 Implementation Plan

## Overview

This document outlines the work needed to re-enable the 7 pages that were temporarily disabled in Phase 1 to achieve green CI.

## Phase 1 Complete ✅

The following was accomplished to achieve green CI:

1. **Fixed Zod Record Schema** - Corrected `z.record(z.unknown())` to `z.record(z.string(), z.unknown())` in analytics.ts
2. **Verified No Governance Duplicates** - Confirmed via grep that no duplicate actorType keys exist
3. **Verified React Player Types** - Confirmed all pages use correct imports and react-player ships with its own types
4. **Disabled 7 Pages with Missing Routers** - Cleanly replaced with TemporarilyDisabled component

## Phase 2: Router Implementation & Page Re-enabling

### Required Routers

The following routers need to be implemented in `server/routers.ts` and added to the `appRouter`:

#### 1. Rave Intel System (`raveIntel`, `lanes`, `users`, `signals`)

**Router:** `raveIntel`
- `list` - Query to fetch intel items by city/genre

**Router:** `lanes`  
- `list` - Query to fetch available lanes (categories)

**Router:** `users`
- `me` - Query to get current user info

**Router:** `signals`
- `save` - Mutation to save a signal
- `trackInterest` - Mutation to track user interest
- `list` - Query to get saved signals by entity type

**Re-enable:** `client/src/pages/RaveIntel.tsx`

---

#### 2. Pricing Engine (`pricing`)

**Router:** `pricing`
- `getRules` - Query to fetch pricing rules
- `createRule` - Mutation to create new pricing rule  
- `deleteRule` - Mutation to delete pricing rule

**Re-enable:** `client/src/pages/AdminPricing.tsx`

---

#### 3. Admin Connectors (`admin.ingestion`)

**Router:** `admin.ingestion`
- `connectors` - Query to list connectors
- `syncLogs` - Query to fetch sync logs
- `runSync` - Mutation to trigger sync
- `setKey` - Mutation to set API key

**Re-enable:** `client/src/pages/AdminConnectors.tsx`

---

#### 4. Admin Supporters (`admin.supporters`)

**Router:** `admin.supporters`
- `list` - Query to list supporters
- `promote` - Mutation to promote user
- `demote` - Mutation to demote user

**Re-enable:** `client/src/pages/AdminSupporters.tsx`

---

#### 5. Admin Analytics (`admin.analytics`)

**Router:** `admin.analytics`
- `heatmap` - Query to get analytics heatmap data

**Re-enable:** `client/src/pages/AdminHeatmap.tsx`

---

#### 6. Outbound Leads (`outbound`)

**Router:** `outbound`
- `listLeads` - Query to list leads
- `getLead` - Query to get single lead
- `generateOutreach` - Mutation to generate outreach
- `createLead` - Mutation to create new lead

**Re-enable:** `client/src/pages/AdminOutbound.tsx`

---

#### 7. UK Events (Wire Existing Router)

**Router:** `ukEvents` (already exists in `server/ukEventsRouter.ts`)

**Action Required:**
1. Import `ukEventsRouter` in `server/routers.ts`
2. Add to `appRouter`: `ukEvents: ukEventsRouter`

**Re-enable:** `client/src/pages/UKEventsPage.tsx`

---

#### 8. Invites System (`invites`)

**Router:** `invites`
- `redeem` - Mutation to redeem invite code

**Re-enable in:** `client/src/pages/Signup.tsx` (uncomment the invite redemption logic)

---

## Implementation Priority

### High Priority (Core Features)
1. UK Events - Router exists, just needs wiring
2. Invites - Simple feature, important for onboarding

### Medium Priority (Admin Features)
3. Admin Pricing
4. Admin Analytics  
5. Admin Supporters

### Low Priority (Advanced Features)
6. Rave Intel System (complex, multiple routers)
7. Admin Connectors
8. Outbound Leads

## Testing Strategy

For each router implementation:

1. **Unit Tests** - Test router logic in isolation
2. **Integration Tests** - Test database operations
3. **E2E Tests** - Test full page functionality
4. **TypeScript** - Ensure `pnpm check` passes
5. **Build** - Ensure `pnpm build` succeeds

## Success Criteria

- ✅ All routers implemented
- ✅ All pages re-enabled
- ✅ TypeScript compilation passes  
- ✅ Build succeeds
- ✅ All tests pass
- ✅ No broken imports or missing routers
- ✅ Full functionality restored

## Notes

- Each router should follow existing patterns in `server/routers.ts`
- Use proper Zod validation for all inputs
- Implement proper authentication (publicProcedure, protectedProcedure, adminProcedure)
- Add audit logging where appropriate
- Follow existing code style and conventions
