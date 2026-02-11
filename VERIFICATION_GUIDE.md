# TypeScript Verification Guide

## Overview

This guide provides the complete workflow for verifying TypeScript status and achieving 100% green.

**Key Principles:**
- **Facts, not estimates** - Get exact error counts
- **Product decisions** - Fix real pages, delete dead code
- **Prevent drift** - Guardrails in CI

---

## Phase 1: Re-baseline Reality

### Get Exact Error Count

```bash
bash scripts/get-ts-error-count.sh
```

**Output example:**
```
🔍 Running TypeScript check...

TypeScript Error Count: 47
```

### Check for Router Drift

```bash
bash scripts/check-router-drift.sh
```

**Output if clean:**
```
✅ No router drift detected
All trpc.* references are valid
```

**Output if drift found:**
```
❌ Router drift detected!

client/src/pages/AdminGovernance.tsx:25: trpc.pricing

Available routers:
  - system
  - beatport
  - ukEvents
  - auth
```

### Identify Top Failing Files

```bash
pnpm check --pretty false 2>&1 | grep "error TS" | head -n 40
```

**Example output:**
```
client/src/pages/AdminBookings.tsx:45:12 - error TS7006: Parameter 'booking' implicitly has an 'any' type.
client/src/pages/AdminBookings.tsx:67:8 - error TS2322: Type 'string | null' is not assignable to type 'string | undefined'.
```

---

## Phase 2: Fix Remaining Errors

### Strategy

For each file with errors:

1. **Check if page is routed/linked**
   - Look in `client/src/App.tsx` for route
   - Look in navigation components
   
2. **Make product decision**
   - **If routed:** Fix the errors properly
   - **If NOT routed:** Delete the page

### Common Error Categories

#### 1. Implicit Any

**Error:**
```typescript
events.map((event: any) => ...)
// Parameter 'event' implicitly has an 'any' type
```

**Fix:**
```typescript
events.map((event: Event) => ...)
// Add explicit type
```

#### 2. Null vs Undefined

**Error:**
```typescript
value: string | null
// Type 'string | null' is not assignable to type 'string | undefined'
```

**Fix:**
```typescript
value: string | undefined
// OR
value ?? undefined
```

#### 3. Missing Imports

**Error:**
```typescript
// 'useState' is not defined
```

**Fix:**
```typescript
import { useState } from 'react';
```

#### 4. Schema Mismatches

**Error:**
```typescript
eventDate: new Date()
// Type 'Date' is not assignable to type 'string'
```

**Fix:**
```typescript
eventDate: new Date().toISOString()
// Match the zod schema type
```

### Fix Commands

**Run TypeScript check:**
```bash
pnpm check
```

**Build verification:**
```bash
pnpm build
```

---

## Phase 3: Add Guardrails

### Router Drift Prevention

**Status:** ✅ Implemented

**Location:** `scripts/check-router-drift.sh`

**CI Integration:** `.github/workflows/ci.yml`

**How it works:**
1. Parses router keys from `server/routers.ts`
2. Scans all client pages for `trpc.*` usage
3. Validates references
4. Fails CI if drift detected

**Test locally:**
```bash
bash scripts/check-router-drift.sh
```

---

## Verification Commands

### Complete Verification

```bash
# 1. Get exact error count
bash scripts/get-ts-error-count.sh

# 2. Check router drift
bash scripts/check-router-drift.sh

# 3. Run full TypeScript check
pnpm check

# 4. Run build
pnpm build

# 5. Run tests (if applicable)
pnpm test
```

### CI Verification

The following checks run on every PR:

- ✅ `router-drift-check` - Prevents router drift (BLOCKING)
- ✅ `build` - Ensures runtime works (BLOCKING)
- ✅ `security` - No leaked secrets (BLOCKING)
- ✅ `ts-error-budget` - No new errors (BLOCKING)
- ⚠️ `typecheck` - Shows current status (NON-BLOCKING)

---

## Expected Error Categories

After cleanup, remaining errors typically fall into:

1. **Implicit Any** (30-40%)
   - Function parameters without types
   - Array/object destructuring
   
2. **Null vs Undefined** (20-30%)
   - Props expecting undefined getting null
   - Optional properties
   
3. **Missing Properties** (15-25%)
   - Interface properties used but not defined
   - Type mismatches
   
4. **Import/Export** (10-15%)
   - Missing imports
   - Type export issues

5. **Schema Mismatches** (5-10%)
   - Date vs string
   - Boolean vs string
   - Type unions not matching

---

## Success Criteria

### 100% TypeScript Green

To claim 100% green, ALL THREE must pass:

1. ✅ `pnpm check` exits 0
2. ✅ `pnpm build` exits 0
3. ✅ CI runs both and blocks on failure

### Additional Criteria

4. ✅ No router drift (verified by script)
5. ✅ No placeholder pages
6. ✅ No dead code
7. ✅ All routed pages functional

---

## Troubleshooting

### "Router not found" error

**Problem:** Page references `trpc.routerName` but router doesn't exist

**Solutions:**
1. Implement the router in `server/routers.ts`
2. Delete the page if not needed
3. Use existing router instead

### "Implicit any" everywhere

**Problem:** TypeScript strict mode requires explicit types

**Solution:**
- Add type annotations to function parameters
- Import types from shared/types.ts
- Use type inference where possible

### Build passes but TypeScript fails

**Problem:** Build (runtime) != TypeScript (compile-time)

**Explanation:**
- Build only checks if code runs
- TypeScript checks type safety
- Both must pass for 100% green

---

## Pattern for Future

### When Adding New Pages

1. ✅ Check if router exists first
2. ✅ If not, implement router before page
3. ✅ Use proper types from start
4. ✅ Verify with `pnpm check`

### When Seeing Errors

1. ✅ Get exact count (no estimates)
2. ✅ Check if page is routed
3. ✅ Fix if real, delete if dead
4. ✅ Verify with scripts

### When Refactoring

1. ✅ Run router drift check
2. ✅ Check TypeScript count
3. ✅ Fix errors incrementally
4. ✅ Verify guardrails work

---

## Quick Reference

### Scripts

```bash
# Error count
bash scripts/get-ts-error-count.sh

# Router drift
bash scripts/check-router-drift.sh

# Full check
pnpm check

# Build
pnpm build
```

### Files

- `scripts/check-router-drift.sh` - Router validation
- `scripts/get-ts-error-count.sh` - Error counting
- `.github/workflows/ci.yml` - CI enforcement
- `server/routers.ts` - Source of truth for routers

---

## Summary

**Goal:** 100% TypeScript Green

**Method:**
1. Get exact baseline (facts)
2. Fix real pages
3. Delete dead code
4. Add guardrails
5. Verify

**Result:** Sustainable clean architecture

---

_Last updated: 2026-02-10_
