# Governance Cleanup - PR Consolidation
**Generated:** January 25, 2026  
**Status:** Identity locked, ready for cleanup

## ✅ Merge Complete

**Commit:** `6d764f3` - `feat(identity): restore "New Chapter" narrative to bio + homepage`  
**Status:** Merged to `main` and pushed to GitHub  
**Files Changed:** 
- `client/src/pages/Bio.tsx` (+28 lines)
- `client/src/pages/Home.tsx` (+16 lines, -8 lines)

---

## 🧹 PR Cleanup Required

### Analysis-Only PRs (Close These - 20+ branches)

These are AI-generated analysis branches that don't ship product value. They should be closed:

#### `cursor/analyze-repository-contents-*` (10 branches)
- `origin/cursor/analyze-repository-contents-claude-4.1-opus-thinking-c5e8`
- `origin/cursor/analyze-repository-contents-claude-4.5-sonnet-thinking-0492`
- `origin/cursor/analyze-repository-contents-composer-1-f82b`
- `origin/cursor/analyze-repository-contents-gemini-3-pro-preview-ccf3`
- `origin/cursor/analyze-repository-contents-gpt-5.1-codex-3e3d`
- `origin/cursor/analyze-repository-contents-gpt-5.1-codex-high-0c9b`
- `origin/cursor/analyze-repository-contents-gpt-5.1-codex-high-4796`
- `origin/cursor/analyze-repository-contents-gpt-5.1-codex-high-57e2`
- `origin/cursor/analyze-repository-contents-gpt-5.1-codex-high-bb6a`
- (Check for more variants)

#### `cursor/find-missing-items-*` (6 branches)
- `origin/cursor/find-missing-items-claude-4.5-opus-high-thinking-4e2d`
- `origin/cursor/find-missing-items-claude-4.5-sonnet-thinking-581d`
- `origin/cursor/find-missing-items-composer-1-2a66`
- `origin/cursor/find-missing-items-gemini-3-pro-preview-1a47`
- `origin/cursor/find-missing-items-gpt-5.1-codex-2943`
- `origin/cursor/find-missing-items-gpt-5.1-codex-high-f8d8`

#### `cursor/implement-social-media-sharing-*` (6+ branches)
- `origin/cursor/implement-social-media-sharing-for-user-engagement-claude-4.5-opus-high-thinking-6485`
- `origin/cursor/implement-social-media-sharing-for-user-engagement-claude-4.5-sonnet-thinking-17c8`
- `origin/cursor/implement-social-media-sharing-for-user-engagement-composer-1-1b1e`
- `origin/cursor/implement-social-media-sharing-for-user-engagement-gemini-3-pro-preview-29d5`
- `origin/cursor/implement-social-media-sharing-for-user-engagement-gpt-5.1-codex-d652`
- `origin/cursor/implement-social-media-sharing-for-user-engagement-gpt-5.1-codex-high-12ad`
- (Check for more variants)

### Other Branches to Review

- `origin/copilot/create-dj-site-structure` - Review if this has valuable structure changes

---

## 📋 How to Close PRs

### Option 1: GitHub UI (Recommended)

1. Go to: https://github.com/richhabits/djdannyhecticb/pulls
2. Filter by "Open" PRs
3. For each analysis-only PR:
   - Open the PR
   - Click "Close pull request"
   - Add comment: "Closing analysis-only PR. Content has been merged via identity-lock/new-chapter."

### Option 2: GitHub CLI (If Installed)

```bash
# List all open PRs
gh pr list --state open

# Close analysis-only PRs (example)
gh pr close <PR_NUMBER> --comment "Closing analysis-only PR. Content merged via identity-lock/new-chapter."
```

### Option 3: Bulk Close Script

Create a script to close all analysis PRs:

```bash
#!/bin/bash
# Close all analysis-only PRs

BRANCHES=(
  "cursor/analyze-repository-contents-claude-4.1-opus-thinking-c5e8"
  "cursor/analyze-repository-contents-claude-4.5-sonnet-thinking-0492"
  # ... add all branches
)

for branch in "${BRANCHES[@]}"; do
  PR_NUM=$(gh pr list --head "$branch" --json number --jq '.[0].number')
  if [ ! -z "$PR_NUM" ]; then
    gh pr close "$PR_NUM" --comment "Closing analysis-only PR. Content merged via identity-lock/new-chapter."
    echo "Closed PR #$PR_NUM for branch $branch"
  fi
done
```

---

## ✅ Verification Checklist

After cleanup, verify:

- [ ] All analysis-only PRs are closed
- [ ] Only product-shipping PRs remain open
- [ ] `main` branch has the "New Chapter" content
- [ ] Homepage shows "NEW CHAPTER" extract
- [ ] Bio page shows "THE NEW CHAPTER" section
- [ ] CTAs work (`/bio` and `/mixes` routes)

---

## 🎯 Post-Cleanup State

**Target State:**
- `main` branch = single source of truth
- Open PRs = only product features, not analysis
- Identity locked = "New Chapter" narrative in place
- Governance = clean, no cognitive noise

**Next Steps:**
1. Close all analysis-only PRs (this document)
2. Review remaining PRs for actual product value
3. Establish PR standards: "No analysis-only PRs, only shipping features"
4. Lock identity: "New Chapter" is now canonical

---

## 📊 Current Branch Count

**Total Remote Branches:** 25  
**Analysis-Only Branches:** ~20+  
**Product Branches:** ~5 (review individually)

**Goal:** Reduce to <10 branches total (main + active feature branches only)

---

**Status:** Ready for cleanup. Identity is locked. Governance cleanup is the final step.
