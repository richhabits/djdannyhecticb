# Action Required: Apply CI Fixes from Your Mac

## Current Situation

✅ **Branch Created**: `copilot/unified-ship` exists on GitHub  
✅ **PR #21 Fixes Applied**: Commits 13c9988 and 5fdcc9c are on the branch  
❌ **CI Fixes Missing**: The build/lint fixes are not yet on `copilot/unified-ship`  
❌ **I Cannot Push**: Running in GitHub Actions CI environment without cross-branch push ability

## Why I Can't Push Directly

I'm a bot running in GitHub Actions that:
- Can commit to the **current working branch** via `report_progress`  
- **Cannot** switch branches in the CI environment
- **Cannot** cherry-pick between branches in CI  
- **Cannot** push to `copilot/unified-ship` from here

The CI fixes were created on `copilot/add-beatport-api-integration` but need to be applied to `copilot/unified-ship`.

## Solution: You Push from Your Mac

### Step 1: Open the Patch Document

The file `CI_FIX_PATCHES.md` contains all the changes needed, organized in 5 patches.

### Step 2: Apply Patches on Your Mac

```bash
cd ~/Projects/djdannyhecticb
git switch copilot/unified-ship
git pull origin copilot/unified-ship  # Make sure you're up to date

# Now apply the patches from CI_FIX_PATCHES.md
# You can do this manually by editing the files, or:

# Option A: Manual editing
#  - Open CI_FIX_PATCHES.md
#  - Follow each patch section
#  - Edit the files as shown

# Option B: If you have the commits locally
# git cherry-pick a6a7711 92b2113 782a418

# After applying changes:
pnpm install  # Updates lockfile with new dependencies
pnpm build    # Verify it works

# Commit and push
git add .
git commit -m "fix: apply CI fixes - Vite placeholders, analytics exports, Framer Motion, dependencies"
git push origin copilot/unified-ship
```

### Step 3: Verify CI Passes

After pushing, check PR #22 on GitHub:
- Build should pass ✅
- TypeScript checks should pass ✅  
- All imports should resolve ✅

## What the Patches Fix

1. **Vite Placeholders** (index.html, main.tsx, .env.example)
   - Removes `%VITE_APP_LOGO%` and `%VITE_APP_TITLE%`
   - Adds safe defaults so build never depends on CI secrets

2. **Missing Analytics Functions** (analytics.ts)
   - `trackBeatportClick()`
   - `trackChartView()`
   - `trackGenreView()`
   - `trackSearch()`
   - `getEventStats()`
   - `calculateCTR()`
   - Event storage helpers

3. **Framer Motion Fix** (BookingQuote.tsx)
   - Changes `motion_div` to `motion.div`

4. **TypeScript Errors** (UKEventsPage.tsx)
   - Adds type annotations to fix implicit any

5. **Server Dependencies** (package.json)
   - Adds helmet, cors, express-rate-limit, @types/cors

## Files Changed Summary

- `client/index.html` - 2 lines
- `client/src/main.tsx` - +4 lines
- `client/.env.example` - NEW FILE
- `client/src/lib/analytics.ts` - +80 lines
- `client/src/pages/BookingQuote.tsx` - Fix motion usage
- `client/src/pages/UKEventsPage.tsx` - +3 type annotations
- `package.json` - +4 dependencies
- `pnpm-lock.yaml` - Auto-updated by pnpm install

## Expected Outcome

After you push from your Mac:
- ✅ PR #22 CI turns GREEN
- ✅ `pnpm build` passes
- ✅ `pnpm install --frozen-lockfile` passes
- ✅ All imports resolve correctly
- ✅ Ready to merge

## Questions?

If anything is unclear in the patches, the full details are in `CI_FIX_PATCHES.md`.

---

**Status**: Waiting for you to apply patches from your Mac and push to `copilot/unified-ship`.
