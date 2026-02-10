# Get Actual CI Output - Instructions

## Stop Narratives, Get Facts

No more summaries or estimates. We need the actual CI output to create a surgical fix plan.

---

## Files Verified ✅

Before getting CI output, verified no local corruption:

**VideoGallery.tsx:**
- ✅ Clean ReactPlayer import: `import ReactPlayer from "react-player"`
- ✅ Clean JSX usage (lines 181-187)
- ✅ No regex damage detected

**SocialShareButton.tsx:**
- ✅ Correct navigator.share check (line 36: `if (navigator.share)`)
- ✅ Correct navigator.share check (line 90: `{navigator.share && ...}`)
- ✅ No syntax errors

**Git Status:**
- ✅ No uncommitted changes
- ✅ Clean working directory

---

## Option A: GitHub UI (2 Clicks)

### Steps:
1. Go to: https://github.com/richhabits/djdannyhecticb/actions
2. Click: Latest workflow run on branch `copilot/add-beatport-api-integration`
3. Click: `typecheck` job (the one that's blocking)
4. Scroll to the error output
5. Copy/paste:
   - The first 60-100 lines of TypeScript errors
   - The final summary at the bottom

### Also Check:
- `router-drift-check` job (if it failed)
- `build` job (if it failed)

---

## Option B: GitHub CLI (Command Line)

### Prerequisites:
```bash
# Install gh CLI if needed
brew install gh  # macOS
# or download from: https://cli.github.com/

# Authenticate
gh auth login
```

### Commands:

```bash
# Navigate to repo
cd ~/Projects/djdannyhecticb

# 1. List recent runs on your branch
gh run list --branch copilot/add-beatport-api-integration --limit 5

# 2. Get the RUN_ID from above (first column)
# Then get failed job logs
gh run view RUN_ID --log-failed > /tmp/ci_failed.log

# Or get ALL logs (larger file)
gh run view RUN_ID --log > /tmp/ci_full.log

# 3. Extract TypeScript errors
rg -n "error TS\d+:" /tmp/ci_failed.log | head -n 60

# 4. Get context around first error
rg -n "error TS\d+:" /tmp/ci_failed.log | head -n 1 | cut -d: -f1
# Then view lines around that line number
```

### Example:
```bash
$ gh run list --branch copilot/add-beatport-api-integration --limit 5
✓ CI main copilot/add-beatport-api-integration push 1234567

$ gh run view 1234567 --log-failed > /tmp/ci_failed.log

$ rg -n "error TS\d+:" /tmp/ci_failed.log | head -n 60
```

---

## What to Paste Back

### Format:

```
=== First 60 TypeScript Errors ===
[paste output from rg command]

=== Context (50 lines above first error) ===
[paste ~50 lines of context]

=== Job Summary ===
[paste final summary from CI]
```

---

## What to Look For

### Likely Error Categories:

1. **Syntax Errors** (TS1005, TS1381)
   - JSX corruption
   - Missing semicolons
   - Malformed code

2. **Type Mismatches** (TS2322, TS2339)
   - Property doesn't exist
   - Type incompatibility
   - Union mismatch

3. **Implicit Any** (TS7006, TS7031)
   - Missing type annotations
   - Untyped parameters

4. **Router Issues** (if router-drift-check fails)
   - Non-existent router references
   - Wrong procedure names

5. **Import Issues** (TS2307)
   - Missing modules
   - Wrong paths

---

## Common Issues to Check

### If ReactPlayer Errors:
- Check: Is `url` prop being used?
- Check: Any local `.d.ts` files declaring ReactPlayer?
- Check: Import is `import ReactPlayer from "react-player"`

### If navigator.share Errors:
- Check: Is it wrapped in `if (navigator.share)`?
- Check: No regex replacements in JSX

### If GlobalBanner Errors:
- Check: Severity union mismatch
- Look for: "critical" | "high" vs "error" | "info"

---

## After Getting Output

1. **Paste the output here** (in issue/chat)
2. **Get surgical fix plan** based on actual errors
3. **Execute fixes** one by one
4. **Push and verify** with CI
5. **Repeat** until `pnpm check` exits 0

---

## No More Estimates

**Before:** "~97 errors (estimated)"
**After:** "47 errors" (from CI output)

**Before:** "Router drift might exist"
**After:** "3 violations found" (exact files/lines)

**Before:** "Build should pass"
**After:** "Build exits 0" (actual result)

---

## Success Criteria

✅ `pnpm check` exits 0
✅ `pnpm build` exits 0
✅ `bash scripts/check-router-drift.sh` exits 0

All proven by CI output, not estimates.

---

_CI is the source of truth. Let's get the actual output._
