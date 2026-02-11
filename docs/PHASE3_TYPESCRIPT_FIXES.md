# PHASE 3: TypeScript Strictness Fixes to Zero

## Overview

**Goal:** Achieve 100% TypeScript green
- `pnpm check` must be 0 errors
- `pnpm build` must be 0 errors  
- No hacks, no silencing, no stubs

**Context:**
- Router drift is minimal (0.9% - 1/117 calls invalid)
- Architecture is 99.1% aligned
- Focus: TypeScript strictness errors, NOT router implementation

## Environment Requirement

**Must run locally with pnpm installed.**

This CI environment does not have pnpm. User must execute commands on local machine with node/pnpm available.

## Workflow

### Step 1: Capture Full Error List

```bash
cd ~/Projects/djdannyhecticb
pnpm check --pretty false > /tmp/ts.txt 2>&1 || true
```

Parse output into structured list and save as `docs/TS_ERROR_BACKLOG.md` with format:
```
Priority: [A-F]
File: client/src/path/to/file.tsx
Line: 42
Column: 10
Code: TS2339
Message: Property 'foo' does not exist on type 'Bar'
```

### Step 2: Fix by Priority Buckets

**Priority A: Syntax/JSX Corruption** (MUST BE ZERO FIRST)
- Malformed JSX tags
- Syntax errors from regex edits
- Broken imports

**Priority B: Type Union Mismatches**
- Switch cases on wrong union types
- Props expecting different union values

**Priority C: Null vs Undefined**
- React props expecting undefined but receiving null
- Optional fields with wrong nullability

**Priority D: Implicit Any**
- Missing type annotations on parameters
- Untyped map/filter/reduce callbacks

**Priority E: DTO Field Mismatches**
- Client expecting fields server doesn't provide
- Field name mismatches (eventName vs name)

**Priority F: Missing Imports / ES Target Issues**
- Missing React imports (useState, etc.)
- Set iteration needing Array.from()

### Step 3: Fix Each Bucket

After fixing each priority bucket, rerun:
```bash
pnpm check --pretty false > /tmp/ts.txt 2>&1 || true
grep -c "error TS" /tmp/ts.txt
```

Update `docs/TS_ERROR_BACKLOG.md` with:
- Remaining error count
- Which bucket is next
- Progress notes

### Step 4: Verify Build

After all TypeScript errors fixed:
```bash
pnpm build
```

Must succeed with no errors.

### Step 5: Create Proof Pack

Create `docs/PROOF_PACK.md` with literal command outputs:

```markdown
# Proof Pack: TypeScript Green

## pnpm check

\`\`\`
$ pnpm check
✓ No TypeScript errors found
\`\`\`

## pnpm build

\`\`\`
$ pnpm build
✓ Build succeeded in 18.5s
\`\`\`

## Router Drift Check

\`\`\`
$ bash scripts/check-router-drift.sh
✓ No router drift detected
All trpc.* references valid
\`\`\`
```

## Known Fixes

Based on identified issues in this repo, here are specific solutions:

### 1. GlobalBanner Severity Union

**Error:** `case "critical"/"high"/"medium"` not comparable to `"error"|"info"|"warning"`

**Solution A - Expand Type:**
```typescript
type Severity = "error" | "info" | "warning" | "critical" | "high" | "medium" | "low";
```

**Solution B - Map Values:**
```typescript
const severityMap: Record<string, "error" | "info" | "warning"> = {
  critical: "error",
  high: "error",
  medium: "warning",
  low: "info",
  error: "error",
  warning: "warning",
  info: "info"
};

const mappedSeverity = severityMap[severity] || "info";
```

### 2. SocialShareButton Navigator.share

**Error:** JSX condition syntax error from broken regex edit

**Solution:**
```typescript
const canShare = typeof navigator !== "undefined" && 
                 "share" in navigator && 
                 typeof (navigator as any).share === "function";

return (
  <div>
    {canShare && (
      <button onClick={handleShare}>
        Share
      </button>
    )}
  </div>
);
```

### 3. StructuredData "@type"

**Error:** Element implicitly has an 'any' type because expression of type '"@type"' can't be used to index

**Solution:**
```typescript
type JsonLd = {
  "@context": string;
  "@type"?: string;
  [key: string]: unknown;
};

const structuredData: JsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "DJ Performance"
};

// Now this works:
const type = structuredData["@type"];
```

### 4. ReactPlayer Typing

**Error:** Property 'url' does not exist on type 'ReactPlayerProps'

**DO NOT:** Install @types/react-player (it doesn't exist)

**Solution:**
1. Ensure correct import: `import ReactPlayer from "react-player";`
2. Check for conflicting local type declarations in `client/src/types/*.d.ts`
3. Remove any incorrect module augmentation for react-player
4. The package ships its own types - trust them

### 5. AdminBookings Field Mismatches

**Error:** Property 'eventName' does not exist on type 'Booking'

**Actual server fields:** `name`, `email`, `phone`, `location`
**Client was using:** `eventName`, `contactEmail`, `contactPhone`, `eventLocation`

**Solution:**
```typescript
// Replace:
booking.eventName → booking.name
booking.contactEmail → booking.email
booking.contactPhone → booking.phone
booking.eventLocation → booking.location
```

### 6. AdminEmpire Boolean vs String

**Error:** Type 'boolean' is not assignable to type 'string | Record<string, any>'

**Server expects:** `z.union([z.string(), z.record(z.string(), z.any())])`

**Solution:**
```typescript
// Convert boolean to string
const value = isActive ? "true" : "false";

await trpc.empire.update.mutate({
  id,
  value // Now a string, not boolean
});
```

### 7. Bookings eventDate/eventType

**Error:** Type 'Date' is not assignable to type 'string'

**Server expects:**
- `eventDate: string` (ISO format)
- `eventType: enum(["wedding", "corporate", "club", ...])`

**Solution:**
```typescript
// Convert Date to string
const eventDate = selectedDate.toISOString();

// Ensure eventType is from enum
const eventType: "wedding" | "corporate" | "club" = "wedding";

await trpc.bookings.create.mutate({
  eventDate,
  eventType,
  // ... other fields
});
```

### 8. LiveStudio Missing State

**Error:** Cannot find name 'isGoingLive' / 'streamUrl'

**Solution:**
```typescript
import { useState } from "react";

const LiveStudio = () => {
  const [isGoingLive, setIsGoingLive] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  
  // ... rest of component
};
```

### 9. Podcasts useState Import + coverArt

**Error:** 'useState' is not defined / Type 'null' is not assignable to type 'string | undefined'

**Solution:**
```typescript
import { useState } from "react";

// AudioPlayer Track type expects coverArt?: string
const tracks = podcasts.map(p => ({
  ...p,
  coverArt: p.coverArt ?? undefined // Convert null to undefined
}));
```

### 10. Profile AvatarImage src

**Error:** Type 'null' is not assignable to type 'string | undefined'

**Solution:**
```typescript
<AvatarImage src={profile.avatarUrl ?? undefined} />
```

### 11. Set Iteration ES2015+

**Error:** Type 'Set<string>' must have a '[Symbol.iterator]()' method (TS2802)

**Solution A - Prefer Array.from:**
```typescript
// Instead of: [...prev]
Array.from(prev)
```

**Solution B - If repo targets ES2015+:**
Check `tsconfig.json` - if `target: "ES2015"` or higher, Set iteration should work.

## Deliverables

1. **docs/TS_ERROR_BACKLOG.md**
   - Structured error list
   - Priority assignments
   - Progress tracking

2. **docs/PROOF_PACK.md**
   - Actual pnpm check output (0 errors)
   - Actual pnpm build output (success)
   - Router drift check output (0 violations)

3. **All fixes committed**
   - Small, reversible commits
   - Clear commit messages
   - No unrelated changes

4. **End state:**
   - `pnpm check` = 0 errors
   - `pnpm build` = success
   - No workarounds or hacks

## No-Hacks Policy

### Not Allowed:
- ❌ `continue-on-error` in CI
- ❌ Loosening tsconfig (strict: false)
- ❌ `@ts-ignore` or `@ts-expect-error`
- ❌ Adding `any` types to silence errors
- ❌ Fake router stubs
- ❌ Mock implementations
- ❌ Changing target to silence errors

### Required:
- ✅ Real type fixes
- ✅ Proper type annotations
- ✅ Correct null/undefined handling
- ✅ Accurate DTO field names
- ✅ Valid union types
- ✅ Complete imports

## Success Criteria

### Must Pass:
```bash
pnpm check
# Output: ✓ No TypeScript errors found

pnpm build
# Output: ✓ Build succeeded

bash scripts/check-router-drift.sh
# Output: ✓ No router drift detected
```

### Must Provide:
- Structured error backlog with progress
- Proof pack with actual command outputs
- Clean commit history

### Must Achieve:
- Zero TypeScript errors
- Successful build
- No router drift
- No hacks or workarounds

## User Action Required

Since this is a CI environment without pnpm, user must run locally:

```bash
cd ~/Projects/djdannyhecticb

# Get error list
pnpm check --pretty false > /tmp/ts.txt 2>&1 || true

# Show first 120 lines
sed -n '1,120p' /tmp/ts.txt

# Or show just errors
grep "error TS" /tmp/ts.txt | head -80
```

Then provide the output for systematic fixes.

## Next Steps

1. User runs `pnpm check` locally
2. User provides first 80-120 lines of errors
3. Create structured backlog
4. Fix by priority buckets
5. Verify after each bucket
6. Create proof pack
7. Achieve TypeScript green

---

**Pattern:** Facts over narratives. Real fixes over workarounds. Systematic over random.

**Goal:** 100% TypeScript green with proof.
