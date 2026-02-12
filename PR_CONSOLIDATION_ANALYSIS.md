# PR Consolidation Analysis

**Date:** February 12, 2026  
**Task:** Close legacy noise PRs and consolidate real deliverable PRs into shippable release

---

## Current State

### Open PRs Breakdown

#### Real Deliverable PRs (#19-#22)
| PR # | Title | Files | Commits | Status | Notes |
|------|-------|-------|---------|--------|-------|
| #22 | Beatport v4 API integration + CI/TS fixes | 34 | 15 | Open | Includes Beatport integration + CI fixes |
| #21 | sync pnpm lockfile and resolve TS lint | 5 | 3 | Open | CI fixes only |
| #20 | Lock repo to CI-only, remove deployment artifacts | 110 | 67 | Open | Major cleanup/refactor |
| #19 | Production hardening | 28 | 7 | Draft | Has merge conflicts |

#### Legacy Noise PRs (#2-#18)
- **#2-#8**: "Analyze repository contents" (7 PRs) - Analysis only
- **#9-#12**: "Implement social media sharing" (4 PRs) - Draft/backlog
- **#13-#18**: "Find missing items" (6 PRs) - Analysis only

**Total noise PRs: 17**

---

## Analysis of Deliverable PRs

### PR Overlap Assessment

**Key Finding:** PR #22 appears to be a **superset** of PR #21

**Evidence:**
- PR #21 changes:
  - `package.json` (update @trpc from ^11.6.0 to ^11.8.0)
  - `pnpm-lock.yaml` (lockfile sync)
  - `server/routers.ts` (fix videoTestimonials query)
  - `server/scripts/hygiene-job.ts` (fix import paths)
  - `server/scripts/virtual-math-test.ts` (fix import paths)

- PR #22 includes:
  - All the same package.json/pnpm-lock changes
  - Plus 29 additional Beatport-related files
  - CI workflow updates

**Conclusion:** PR #22 supersedes PR #21. If #22 merges, #21 becomes redundant.

### PR #20 Analysis

**Major Changes:**
- 110 files modified
- Removes deployment workflows (deploy.yml, mirror.yml)
- Adds CI-only protection (no-deploy-sentinel.yml)
- Adds security and governance docs
- Updates package.json and pnpm-lock.yaml

**Conflicts:** Likely conflicts with #22 on:
- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/ci.yml`

### PR #19 Analysis

**Status:** Draft with merge conflicts
**Changes:** 
- 28 files (boundary enforcement, security fixes, CI/CD automation)
- Hardening scripts and documentation

**Issue:** Already has merge conflicts, suggests it's based on outdated main

---

## Recommended Consolidation Strategy

### Option A: Single Release PR (RECOMMENDED)

**Why:** Cleanest approach, avoids merge conflicts, clear signal of what ships

**Steps:**
1. Create new branch `release/v1.0-beatport-hardening` from latest main
2. Cherry-pick or merge in order:
   - First: PR #21 commits (CI fixes) OR just use PR #22 which includes these
   - Second: PR #22 commits (Beatport integration)
   - Third: PR #20 commits (cleanup/hardening) - resolve conflicts
   - Fourth: PR #19 commits (production hardening) - if still valuable
3. Resolve any conflicts in the release branch
4. Get CI green on release branch
5. Open ONE release PR to main
6. Close #19-#22 as "superseded by release PR"

**Pros:**
- One review, one merge, one clear release
- Easy rollback (single commit)
- No "which PR actually shipped?" confusion
- Can test the full integrated change before merge

**Cons:**
- More upfront work to create release branch
- Need to communicate clearly that old PRs are superseded

### Option B: Sequential Merge Order

**If you don't want a new release PR, merge in this order:**

1. **Merge #22 first** (includes Beatport + CI fixes)
   - Resolves both feature work and CI cleanup
   - Close #21 as "superseded by #22"

2. **Merge #20 second** (CI-only lock + cleanup)
   - Will have conflicts on package.json/pnpm-lock - resolve by accepting main's version
   - This is disruptive, but necessary cleanup

3. **Close #19** (production hardening)
   - Already has conflicts
   - Much of this may already be covered by #20
   - Migrate useful bits to Issues

**Pros:**
- Uses existing PR review infrastructure
- Incremental progress

**Cons:**
- Multiple conflict resolutions
- Hard to rollback if something breaks
- "Which PR broke prod?" debugging difficulty

---

## Recommended Approach: **Option A (Single Release PR)**

### Detailed Execution Plan

#### Phase 1: Prepare Release Branch (30 min)

```bash
# Ensure main is up to date
git fetch origin
git checkout main
git pull origin main

# Create release branch
git checkout -b release/v1.0-beatport-hardening

# Strategy: Start with PR #22 (Beatport + CI fixes)
git fetch origin copilot/unified-ship
git merge origin/copilot/unified-ship --no-commit
# Review and commit

# Add PR #20 changes (CI-only lock)
git fetch origin copilot/add-beatport-api-integration  
git merge origin/copilot/add-beatport-api-integration --no-commit
# Resolve conflicts (likely package.json, pnpm-lock.yaml)
# Commit

# Evaluate PR #19 - if valuable, cherry-pick specific commits
git fetch origin copilot/prepare-for-production-merge
# Selectively cherry-pick commits that don't conflict

# Test
pnpm install
pnpm check  # TypeScript
pnpm build  # Production build
pnpm test   # Run tests
```

#### Phase 2: Verify CI Green (15 min)

```bash
# Push release branch
git push origin release/v1.0-beatport-hardening

# Open PR from release branch to main
# Title: "Release v1.0: Beatport Integration + CI Hardening + Cleanup"
```

#### Phase 3: Close Superseded PRs (10 min)

Close with this message for each:

```markdown
Closing in favor of consolidated release PR #[NEW_NUMBER].

This PR's changes are included in the release PR:
- [List what was included]

The consolidation approach ensures:
✅ No merge conflicts
✅ All changes tested together
✅ Single, atomic release
✅ Clear rollback path
```

#### Phase 4: Close Noise PRs (10 min)

Close PRs #2-#18 with this message:

```markdown
Closing to reduce PR backlog. This was an analysis/exploration PR with no production code.

If any findings from this PR are still relevant, they can be re-tracked as Issues.

Ref: PR consolidation effort to restore signal-to-noise ratio.
```

---

## Missing Items Verification Checklist

Before calling it "clean", verify:

### Deployment & Infrastructure
- [ ] Single source of deploy truth (CI or server, not both)
- [ ] No deployment artifacts in repo (docker-compose.prod.yml, deploy scripts)
- [ ] Server deployment handled in separate repo if needed

### Git & CI
- [ ] .gitignore blocks build outputs, logs, proofpacks, zips
- [ ] pnpm lock consistency check in CI
- [ ] CI gates: `pnpm -w lint`, `pnpm -w check`, `pnpm -w build`
- [ ] No force-push or rebase workflows (causes issues)

### Security
- [ ] gitleaks or basic secret-scan gate
- [ ] .env never tracked (check git history)
- [ ] No hardcoded credentials in scripts
- [ ] HTTPS/TLS certificates not in repo

### Feature Flags
- [ ] Beatport API integration toggle (env var: VITE_BEATPORT_ENABLED?)
- [ ] Can disable new features without code deploy

### Rollback Strategy
- [ ] Tag release (v1.0.0)
- [ ] Keep previous image/commit hash
- [ ] Document rollback procedure

### Cross-Project Contamination Check
- [ ] No references to @piing packages
- [ ] No references to @hectictv packages
- [ ] No shared database connections to other projects
- [ ] No hecticradio.com infrastructure coupling (except embed/link)

---

## Success Metrics

### Before
- 21 open PRs
- Unclear what to merge
- Multiple conflicting changes
- No clear release path

### After
- 1 release PR (or 0 if merged)
- 0-2 active feature PRs
- 17 noise PRs closed
- Clear "what shipped" documentation
- CI green on main
- Tagged release (v1.0.0)

---

## Communication Templates

### For Superseded PRs (#19-#22)

```markdown
Hi @richhabits,

Closing this PR as part of the repository consolidation effort.

This PR's changes have been integrated into release PR #[NEW_NUMBER]: "Release v1.0: Beatport Integration + CI Hardening + Cleanup"

**What was included:**
- [List specific changes from this PR that made it to release]

**Why consolidate:**
The release PR approach ensures:
- ✅ No merge conflicts between overlapping PRs
- ✅ All changes tested together as a cohesive unit
- ✅ Single, atomic release with clear scope
- ✅ Easy rollback if issues arise

Thank you for your work on this!
```

### For Noise PRs (#2-#18)

```markdown
Closing to reduce PR backlog and restore signal-to-noise ratio.

This PR was part of repository analysis/exploration work and doesn't contain production code ready for merge.

**If you have specific action items from this analysis:**
Please open GitHub Issues for them so they can be properly tracked and prioritized.

**Context:**
As part of the repository cleanup, we're consolidating active work into a single release PR and closing exploratory/draft PRs that have served their purpose.
```

---

## Next Steps

1. **Decision Point:** Choose Option A (Release PR) or Option B (Sequential Merge)
2. **If Option A:** Follow Phase 1-4 execution plan above
3. **If Option B:** Start with merging PR #22, resolve conflicts incrementally
4. **Either way:** Close noise PRs #2-#18
5. **Document:** Create release notes listing what shipped
6. **Tag:** Create v1.0.0 tag on main after merge
7. **Verify:** Run through missing items checklist above

---

**Status:** Analysis complete. Ready for execution decision.
