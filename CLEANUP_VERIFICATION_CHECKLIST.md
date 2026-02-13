# Repository Cleanup Verification Checklist

Use this checklist to verify the repository is clean and ready for production after PR consolidation.

---

## Pre-Consolidation Verification

### Current State Assessment
- [x] Count open PRs: 21 (before cleanup)
- [x] Identify noise PRs: #2-#18 (17 PRs)
- [x] Identify deliverable PRs: #19-#22 (4 PRs)
- [x] Document PR overlap and conflicts
- [x] Create consolidation strategy

---

## Deployment & Infrastructure Checks

### Single Source of Deploy Truth
- [ ] **Verify:** Is deployment happening from CI, server, or separate repo?
- [ ] **Action:** Ensure only ONE deployment mechanism exists
- [ ] **Check:** No conflicting deployment workflows
- [ ] **Verify:** docker-compose.prod.yml location is clear (if exists)

**Expected State:**
```
✅ This repo: CI-only (lint, build, test, package)
✅ Deployment: Handled in separate infrastructure repo OR manual server deploy
❌ Should NOT have: GitHub Actions that SSH into production server
```

### Deployment Artifacts Removed
- [ ] No `deploy.yml` workflow in `.github/workflows/`
- [ ] No `mirror.yml` workflow in `.github/workflows/`
- [ ] No `deploy.sh` script in repository root
- [ ] No `rollback.sh` script in repository root
- [ ] No `hooks.json` webhook config
- [ ] No `webhook.service` systemd config
- [ ] No `nginx-webhook.conf` nginx config for webhooks
- [ ] No maintenance scripts with SSH commands

**Verification Command:**
```bash
# Should return 0 results
grep -r "ssh.*@.*" scripts/ --exclude-dir=node_modules
grep -r "213.199.45.126" . --exclude-dir=node_modules --exclude-dir=.git
find . -name "deploy*.sh" -o -name "rollback*.sh" 2>/dev/null | grep -v node_modules
```

---

## Git & CI Configuration Checks

### .gitignore Completeness
- [ ] Build outputs blocked: `dist/`, `build/`, `.next/`
- [ ] Logs blocked: `*.log`, `logs/`
- [ ] Temporary files: `*.tmp`, `.DS_Store`
- [ ] Proofpacks blocked: `*-proofpack.zip`, `ops-reports/`
- [ ] Environment files: `.env`, `.env.local`, `.env.*.local`
- [ ] IDE files: `.vscode/`, `.idea/`
- [ ] Dependencies: `node_modules/`, `pnpm-lock.yaml` (should be tracked!)

**Verification Command:**
```bash
cat .gitignore | grep -E "(dist|build|log|\.env|node_modules)"
```

**Note:** `pnpm-lock.yaml` SHOULD be tracked (committed) for dependency consistency.

### CI Gates
- [ ] **Lockfile check:** CI fails if pnpm-lock.yaml is out of sync
- [ ] **TypeScript:** `pnpm check` or `tsc --noEmit` in CI
- [ ] **Lint:** `pnpm lint` or `eslint .` in CI
- [ ] **Build:** `pnpm build` succeeds in CI
- [ ] **Tests:** `pnpm test` runs in CI (if tests exist)

**Verification Command:**
```bash
# Check CI workflow includes these
cat .github/workflows/ci.yml | grep -E "(pnpm check|pnpm lint|pnpm build|pnpm test)"
```

### No Force-Push Workflows
- [ ] No `git push --force` in workflows
- [ ] No `git rebase` in automation
- [ ] No commit history rewriting in CI

**Why:** Force push breaks collaborator workflows and PR history.

---

## Security Checks

### Secret Scanning
- [ ] **gitleaks:** Installed and configured OR GitHub secret scanning enabled
- [ ] **CI Gate:** Fails if secrets detected in commits
- [ ] **Pre-commit hook:** (Optional) Blocks local commits with secrets

**Verification Command:**
```bash
# Check if gitleaks workflow exists
ls -la .github/workflows/*secret* .github/workflows/*leak* 2>/dev/null

# Manual scan (if gitleaks installed)
gitleaks detect --source . --verbose 2>/dev/null || echo "gitleaks not installed"
```

### Environment Files Not Tracked
- [ ] `.env` is in .gitignore
- [ ] `.env.local` is in .gitignore
- [ ] `.env.*.local` is in .gitignore
- [ ] `.env.example` exists (safe template)

**Verification Command:**
```bash
# Should return no results
git log --all --full-history --source -- ".env" 2>/dev/null | head -5
```

If `.env` was accidentally committed in history:
```bash
# Nuclear option: rewrite history (dangerous!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Better option: Just ensure it's in .gitignore and warn users
echo "⚠️ .env was in history. Rotate all secrets and add .env to .gitignore"
```

### No Hardcoded Credentials
- [ ] No passwords in scripts
- [ ] No API keys in code
- [ ] No database URLs in code (should be env vars)
- [ ] No JWT secrets in code

**Verification Command:**
```bash
# Check for common secret patterns
grep -r -i "password.*=" scripts/ --exclude-dir=node_modules | grep -v "PASSWORD"
grep -r "api.key.*=" . --exclude-dir=node_modules --exclude-dir=.git | head -5
grep -r "mysql://.*:.*@" . --exclude-dir=node_modules --exclude-dir=.git
```

### TLS/SSL Certificates Not in Repo
- [ ] No `.crt` files in repository
- [ ] No `.key` files in repository
- [ ] No `.pem` files in repository (unless public keys for verification)

**Verification Command:**
```bash
# Should return no private key files
find . -name "*.key" -o -name "*.crt" 2>/dev/null | grep -v node_modules
```

---

## Feature Flags & Rollback

### Beatport Integration Toggle
- [ ] **Environment Variable:** `VITE_BEATPORT_ENABLED` or similar
- [ ] **Default:** `false` or requires explicit API keys
- [ ] **Behavior:** App works without Beatport if not configured
- [ ] **Admin UI:** Can disable feature without code deploy

**Verification Command:**
```bash
# Check if Beatport pages handle missing config gracefully
grep -r "BEATPORT_CLIENT_ID" client/ server/ | head -10
grep -r "if.*BEATPORT" client/ server/ | head -10
```

### Rollback Strategy
- [ ] **Git tags:** Release tagged (e.g., `v1.0.0`)
- [ ] **Previous tag:** Documented (e.g., `v0.9.0`)
- [ ] **Rollback command:** Documented in RELEASE_NOTES.md
- [ ] **Container images:** Tagged and stored (if using Docker)
- [ ] **Database migrations:** Reversible or documented

**Verification:**
```bash
# Check tags exist
git tag -l | tail -5

# Tag current release (if not done)
git tag -a v1.0.0 -m "Release v1.0.0: Beatport + CI hardening"
git push origin v1.0.0
```

---

## Cross-Project Contamination Check

### No @piing Dependencies
- [ ] `package.json` has no `@piing/*` packages
- [ ] No imports from `@piing/*` in code
- [ ] No shared database to piing project

**Verification Command:**
```bash
cat package.json | grep "@piing"  # Should return nothing
grep -r "from.*@piing" client/ server/ | head -5  # Should return nothing
```

### No @hectictv Dependencies
- [ ] `package.json` has no `@hectictv/*` packages
- [ ] No imports from `@hectictv/*` in code
- [ ] No shared database to hectictv project

**Verification Command:**
```bash
cat package.json | grep "@hectictv"  # Should return nothing
grep -r "from.*@hectictv" client/ server/ | head -5  # Should return nothing
```

### No hecticradio.com Infrastructure Coupling
- [ ] **Allowed:** Link-out to hecticradio.co.uk (external)
- [ ] **Allowed:** Embed hecticradio player (external)
- [ ] **NOT Allowed:** Shared database connection
- [ ] **NOT Allowed:** Shared authentication
- [ ] **NOT Allowed:** Shared API backend

**Verification Command:**
```bash
# Check for shared infrastructure
grep -r "hecticradio" . --exclude-dir=node_modules --exclude-dir=.git \
  | grep -v "stream" | grep -v "embed" | grep -v "link" | head -10
```

**Expected:** Only external links/embeds, no shared code or DB.

### No Shared Databases
- [ ] `DATABASE_URL` is unique to this project
- [ ] No connection strings to other project databases
- [ ] No shared schema names (e.g., `hectictv_users`)

**Verification Command:**
```bash
# Check database config
cat .env.example | grep DATABASE_URL
grep -r "hectictv\|hecticradio\|piing" server/_core/db.ts drizzle.config.ts
```

---

## Build & Dependencies Checks

### pnpm Enforced
- [ ] `preinstall` script blocks npm/yarn
- [ ] `pnpm-lock.yaml` exists and is committed
- [ ] Team knows to use `pnpm install` only

**Verification Command:**
```bash
cat package.json | grep preinstall
ls -la pnpm-lock.yaml
```

### Dependencies Up to Date
- [ ] No critical security vulnerabilities
- [ ] No major version drift
- [ ] Lock file synced with package.json

**Verification Command:**
```bash
# Check for vulnerabilities
pnpm audit --audit-level=moderate

# Check for outdated packages
pnpm outdated | head -20

# Verify lockfile sync
pnpm install --frozen-lockfile --prefer-offline || echo "Lockfile out of sync!"
```

### Build Succeeds
- [ ] `pnpm install` completes without errors
- [ ] `pnpm check` (TypeScript) passes
- [ ] `pnpm build` succeeds
- [ ] Build artifacts in `dist/` are valid

**Verification Command:**
```bash
pnpm install
pnpm check
pnpm build
ls -lh dist/

# Check bundle sizes
du -sh dist/*
```

**Expected Bundle Sizes:**
- Server: ~400-500KB
- Client main: ~500-600KB (pre-gzip)
- Client main (gzipped): ~130-150KB

---

## Documentation Checks

### Required Documentation Exists
- [ ] `README.md` - Project overview and setup
- [ ] `CONTRIBUTING.md` - How to contribute
- [ ] `SECURITY.md` - Security policy and reporting
- [ ] `LICENSE` - Project license
- [ ] `.env.example` - Environment variable template
- [ ] `DEPLOYMENT_CHECKLIST.md` - Deployment guide (if applicable)

**Verification Command:**
```bash
ls -la README.md CONTRIBUTING.md SECURITY.md LICENSE .env.example
```

### Documentation Is Current
- [ ] README reflects current features (mentions Beatport)
- [ ] .env.example includes all required variables
- [ ] SECURITY.md reflects CI-only scope
- [ ] No references to removed deployment features

**Verification Command:**
```bash
grep -i "beatport" README.md  # Should mention Beatport features
grep "BEATPORT_CLIENT_ID" .env.example  # Should exist
```

---

## PR Cleanup Verification

### Noise PRs Closed
- [ ] PRs #2-#8 (Analyze repository) - Closed
- [ ] PRs #9-#12 (Social media sharing) - Closed
- [ ] PRs #13-#18 (Find missing items) - Closed

**Target:** 17 PRs closed

### Deliverable PRs Status
- [ ] PR #22 (Beatport + CI) - [Merged OR Superseded]
- [ ] PR #21 (pnpm lockfile) - [Closed as superseded by #22]
- [ ] PR #20 (CI-only lock) - [Merged OR Superseded]
- [ ] PR #19 (Production hardening) - [Closed OR Superseded]

**Verification Command:**
```bash
# Check closed PRs (requires gh CLI)
gh pr list --state closed --limit 20 | grep -E "#(2|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18)"
```

### Open PRs Count
- [ ] **Before:** 21 open PRs
- [ ] **After:** ≤5 open PRs (ideally 1-2)
- [ ] **Active PRs:** Only feature work in progress

**Verification Command:**
```bash
gh pr list --state open | wc -l  # Should be ≤5
```

---

## Final Smoke Tests

### Development Environment
```bash
pnpm install
pnpm dev
# Visit http://localhost:3000/
# ✅ Home page loads
# ✅ Bio page loads
# ✅ Events section appears (if events exist)
# ✅ Beatport pages accessible (if configured)
```

### Production Build
```bash
pnpm build
pnpm start
# Visit http://localhost:3000/
# ✅ Production build serves correctly
# ✅ Assets load from dist/
# ✅ No console errors
```

### CI Pipeline
- [ ] Latest commit on main has green checkmark
- [ ] All CI jobs passing (lint, typecheck, build, test)
- [ ] No failing workflows
- [ ] Security scanning passing (if configured)

**Verification:**
```bash
# Check CI status (requires gh CLI)
gh run list --branch main --limit 5
```

---

## Post-Consolidation Actions

### Tagging & Release
- [ ] Tag release: `git tag -a v1.0.0 -m "Release v1.0.0"`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Create GitHub Release with release notes
- [ ] Attach build artifacts to release (if applicable)

### Communication
- [ ] Announce release in team chat/Discord
- [ ] Update project board/roadmap
- [ ] Close related Issues that were completed
- [ ] Thank contributors in release notes

### Monitoring
- [ ] Monitor error logs for 24-48h after deployment
- [ ] Check application metrics (if available)
- [ ] Monitor CI pipeline for new PRs
- [ ] Watch for user-reported issues

---

## Success Criteria

### Before Consolidation
- ❌ 21 open PRs (overwhelming)
- ❌ Unclear what to merge next
- ❌ Multiple conflicting changes
- ❌ Deployment confusion (where to deploy from?)
- ❌ Mixed concerns (analysis + feature work)

### After Consolidation
- ✅ ≤5 open PRs (manageable)
- ✅ Clear release path
- ✅ Conflicts resolved
- ✅ CI-only scope clear
- ✅ Only shippable PRs open
- ✅ Tagged release (v1.0.0)
- ✅ Production-ready codebase

---

## Verification Script

Save this as `verify-cleanup.sh`:

```bash
#!/bin/bash

echo "🔍 Repository Cleanup Verification"
echo "=================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

check() {
  local name="$1"
  local command="$2"
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $name"
    ((PASS++))
  else
    echo -e "${RED}✗${NC} $name"
    ((FAIL++))
  fi
}

warn() {
  local name="$1"
  local command="$2"
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} $name"
    ((WARN++))
  fi
}

echo ""
echo "Build Checks:"
check "pnpm lockfile exists" "test -f pnpm-lock.yaml"
check "package.json exists" "test -f package.json"
check ".gitignore exists" "test -f .gitignore"

echo ""
echo "Security Checks:"
check ".env is ignored" "grep -q '.env' .gitignore"
check "No .env in git history" "! git log --all -- '.env' 2>/dev/null | grep -q commit"
warn "Deployment scripts exist" "! find . -name 'deploy*.sh' 2>/dev/null | grep -q deploy"

echo ""
echo "Dependencies:"
check "No @piing packages" "! cat package.json | grep -q '@piing'"
check "No @hectictv packages" "! cat package.json | grep -q '@hectictv'"

echo ""
echo "Documentation:"
check "README exists" "test -f README.md"
check "SECURITY.md exists" "test -f SECURITY.md"
check ".env.example exists" "test -f .env.example"

echo ""
echo "=================================="
echo -e "${GREEN}Passed: $PASS${NC} | ${RED}Failed: $FAIL${NC} | ${YELLOW}Warnings: $WARN${NC}"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ All critical checks passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Review above.${NC}"
  exit 1
fi
```

**Run with:**
```bash
chmod +x verify-cleanup.sh
./verify-cleanup.sh
```

---

**Status:** Ready to use after PR consolidation  
**Last Updated:** February 12, 2026
