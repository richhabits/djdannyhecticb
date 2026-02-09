# GitHub Repository Settings - Required Checks

This document describes the recommended repository settings for maintaining code quality and security.

## Branch Protection Rules

### For `main` branch:

**Note:** These settings must be configured manually in GitHub repository settings under Settings → Branches → Branch protection rules.

1. **Require pull request reviews before merging**
   - Required number of approvals: 1
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from Code Owners (if CODEOWNERS file exists)

2. **Require status checks to pass before merging**
   - Required status checks:
     - `lint` (Lint & Type Check)
     - `build` (Build)
     - `boundary-audit` (Boundary Audit - No Bleed Check)
     - `analyze` (CodeQL Security Scan)
   
   - Status checks must pass before merging
   - Require branches to be up to date before merging

3. **Require conversation resolution before merging**
   - All conversations must be resolved

4. **Do not allow bypassing the above settings**
   - Include administrators

5. **Restrict who can push to matching branches**
   - Only allow specific users/teams to force push or delete

## Required Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)
**Triggers:** Push to main/copilot branches, Pull requests to main

**Jobs:**
- **lint**: TypeScript type checking
- **build**: Production build verification
- **test**: Unit tests (non-blocking)
- **boundary-audit**: Architectural boundary verification

**Status:** ✅ REQUIRED

### 2. CodeQL Workflow (`.github/workflows/codeql.yml`)
**Triggers:** Push, Pull requests, Weekly schedule

**Jobs:**
- **analyze**: Security vulnerability scanning

**Status:** ✅ REQUIRED

### 3. Dependabot (`.github/dependabot.yml`)
**Schedule:** Weekly on Mondays

**Updates:**
- npm/pnpm dependencies (grouped)
- GitHub Actions versions

**Status:** ✅ ENABLED

## Manual Configuration Steps

Since branch protection rules cannot be set via code, follow these steps:

### Step 1: Enable Branch Protection
1. Go to https://github.com/richhabits/djdannyhecticb/settings/branches
2. Click "Add rule" or edit existing rule for `main`
3. Enter branch name pattern: `main`

### Step 2: Configure Required Status Checks
1. Check "Require status checks to pass before merging"
2. Check "Require branches to be up to date before merging"
3. Add status checks:
   - Type "lint" and select "Lint & Type Check"
   - Type "build" and select "Build"
   - Type "boundary-audit" and select "Boundary Audit (No Bleed Check)"
   - Type "analyze" and select "Analyze (javascript-typescript)"

### Step 3: Configure Pull Request Reviews
1. Check "Require a pull request before merging"
2. Set "Required approving reviews" to 1
3. Check "Dismiss stale pull request approvals when new commits are pushed"

### Step 4: Additional Protections
1. Check "Require conversation resolution before merging"
2. Check "Do not allow bypassing the above settings"
3. Check "Include administrators" (recommended)

### Step 5: Save Changes
Click "Create" or "Save changes"

## Verification

After configuring, verify that:
1. New PRs show required checks
2. Cannot merge without passing checks
3. Cannot merge without approval
4. Dependabot creates PRs weekly

## Boundary Check Details

The `boundary-audit` job enforces architectural independence by:
- Running `scripts/boundary-audit.sh` to verify no shared services
- Scanning for forbidden project references (piing, hectictv, etc.)
- Checking package.json for forbidden dependencies
- Failing builds if boundary violations detected

This ensures djdannyhecticb.co.uk remains standalone with no shared infrastructure.

## CodeQL Security Scanning

CodeQL automatically scans for:
- SQL injection vulnerabilities
- Cross-site scripting (XSS)
- Command injection
- Path traversal
- Use of insecure cryptography
- And many other security issues

Results appear in the "Security" tab under "Code scanning alerts".

## Maintenance

- Review Dependabot PRs weekly
- Update required checks list if new critical workflows added
- Review CodeQL alerts immediately
- Run manual boundary audits quarterly: `./scripts/boundary-audit.sh`

---

**Last Updated:** 2026-02-09  
**Status:** Documentation only - requires manual GitHub configuration
