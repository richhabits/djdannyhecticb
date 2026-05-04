# SECRET STORAGE & MANAGEMENT GUIDE

**DJ DANNY HECTIC B - Security Standards for Secrets**

Last Updated: 2026-05-03
Created: 2026-05-03

---

## EXECUTIVE SUMMARY

This guide establishes mandatory security practices for managing secrets (API keys, passwords, tokens) in the djdannyhecticb project. Failure to follow these guidelines puts user data and application integrity at risk.

### Key Principles

1. **Never commit secrets to version control**
2. **Always use environment variables for secrets**
3. **Rotate secrets immediately when exposed**
4. **Rotate secrets quarterly as best practice**
5. **Use service-specific secret management where available**
6. **Enable MFA on all service accounts**
7. **Audit secret access regularly**
8. **Encrypt secrets at rest**
9. **Document secret lifecycle**
10. **Train all team members**

---

## APPROVED SECRET STORAGE LOCATIONS

### For Local Development

#### ✓ APPROVED: `.env.local` (Development Only)

**Location**: `/Users/romeovalentine/djdannyhecticb/.env.local`

**Rules**:
- Never commit to git
- Never share via email or chat
- File permissions: `600` (read/write owner only)
- Used only for local testing
- Can contain real or test credentials

**Example**:
```bash
GOOGLE_CLIENT_ID=your-local-client-id
GOOGLE_CLIENT_SECRET=your-local-client-secret
DATABASE_URL=postgresql://user:password@localhost:5432/djdannyhecticb
JWT_SECRET=local-test-secret-change-in-production
```

#### ✓ APPROVED: `.env.development.local`

**Location**: `/Users/romeovalentine/djdannyhecticb/.env.development.local`

**Rules**:
- Use for development-specific secrets
- Different values than production
- Use test API keys (not production keys)
- Never commit to git

**Best Practice**:
```bash
# Use test/sandbox credentials ONLY
GOOGLE_CLIENT_ID=test-client-id-from-google-console
STRIPE_SECRET_KEY=sk_test_... (not sk_live_...)
DATABASE_URL=postgresql://localhost:5432/dev_djdannyhecticb
```

### For Production Deployment

#### ✓ APPROVED: Vercel Environment Variables

**Where**: https://vercel.com/dashboard → djdannyhecticb → Settings → Environment Variables

**Features**:
- Automatically redacted in logs
- Separate production/preview/development values
- Encrypted at rest
- Audit trail of changes
- Easy rollback
- Integrated with CI/CD

**Setup Steps**:
1. Go to Vercel dashboard
2. Select djdannyhecticb project
3. Navigate to **Settings** → **Environment Variables**
4. Add variables for each environment:
   - **Production** (applies to `*.vercel.app` domain)
   - **Preview** (applies to preview deployments)
   - **Development** (applies to local dev)

**Rules**:
- Always use meaningful names (e.g., `GOOGLE_CLIENT_SECRET`, not `SECRET`)
- Add descriptive comment for each variable
- Enable "Encrypt" flag (automatic)
- Verify values after adding
- Never paste multiple secrets in one field

### For Team Collaboration

#### ✓ APPROVED: Encrypted Password Manager

**Options**:
- **1Password** (recommended for small teams)
- **LastPass** (enterprise option)
- **KeePass** (self-hosted, free)
- **Bitwarden** (open-source, self-hosted available)

**Setup**:
1. Create team vault/collection
2. Each team member creates account
3. Share vault access via secure invite link
4. Store secrets with metadata (service, date created, rotation date)

**Example Entry**:
```
Name: DJ Danny Hectic B - Google OAuth
Username: service-account@example.com
Password: [GOOGLE_CLIENT_SECRET value]
Notes:
- Service: Google Cloud Console
- Created: 2026-05-03
- Last Rotated: 2026-05-03
- Next Rotation Due: 2026-08-03
- Created By: Developer Name
- Rotation Link: https://console.cloud.google.com/
```

#### ✓ APPROVED: Supabase Secrets (Backend Only)

**Where**: Supabase Dashboard → Project Settings → Secrets

**Use Cases**:
- Secrets needed only by backend/Edge Functions
- Database credentials
- Third-party API keys for backend use

**Setup**:
1. Go to https://app.supabase.com
2. Select project
3. Settings → Secrets
4. Add secret with Key/Value pairs
5. Reference in Edge Functions via `Deno.env.get("KEY")`

**Rules**:
- Never expose to frontend
- Use for internal APIs only
- Rotate with backend deployments

---

## FORBIDDEN SECRET STORAGE LOCATIONS

### ✗ NEVER: .env File in Repository

**Location**: `/Users/romeovalentine/djdannyhecticb/.env`

**Issues**:
- Visible in git history forever
- Exposed if repository leaked
- Visible to anyone with repo access
- Hard to delete completely from git

**How to fix if already committed**:
```bash
# Remove from git history
git rm --cached .env
git commit -m "Remove .env from git history"

# Rewrite history (DESTRUCTIVE - use with caution)
git filter-branch --tree-filter "rm -f .env" -- --all

# Force push (requires repo admin)
git push origin --force --all
git push origin --force --tags
```

### ✗ NEVER: .env* Files Without .local Suffix

**Examples to Avoid**:
- `.env.production` (should be `.env.production.local`)
- `.env.staging` (should be `.env.staging.local`)
- `.env.test` (should be `.env.test.local`)

**Why**:
- Easy to accidentally commit
- Might be tracked by mistake
- Confusing naming conventions

**Correct Pattern**:
```
.env.local              ← Development secrets (gitignored)
.env.development.local  ← Dev-specific secrets (gitignored)
.env.test.local        ← Test secrets (gitignored)
.env.production.local   ← Staging/prod for local testing (gitignored)
```

### ✗ NEVER: Code Comments or Strings

**BAD EXAMPLES**:

```javascript
// ❌ NEVER DO THIS
const API_KEY = "AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8"; // Google API Key
const PASSWORD = "Blackgrapeman10"; // DB password

// ❌ OR THIS
fetch(`https://api.example.com?key=${GOOGLE_CLIENT_SECRET}`)

// ❌ OR THIS - Test secret visible in code
const testSecret = "sk_test_REDACTED_FOR_SECURITY";
```

**Why**:
- Visible in code review
- Exposed in compiled output
- Easy to accidentally commit
- Readable in browser DevTools (if frontend)

**Correct approach**:
```javascript
// ✓ CORRECT
const API_KEY = process.env.GOOGLE_CLIENT_ID;
const PASSWORD = process.env.DATABASE_PASSWORD;

// ✓ SAFE - Using env variable
fetch(`https://api.example.com?key=${process.env.GOOGLE_CLIENT_SECRET}`)

// ✓ SAFE - No hardcoded secret
const testSecret = process.env.STRIPE_TEST_KEY;
```

### ✗ NEVER: Slack, Discord, Email, or Chat

**DO NOT**:
- Share secrets in Slack/Discord channels
- Send secrets via email
- Post in Google Drive documents
- Share in GitHub issues/discussions
- Include in error logs

**If Accidentally Shared**:
1. IMMEDIATELY revoke the secret
2. Delete the message/email
3. Rotate the secret
4. Report in security channel
5. Document incident

### ✗ NEVER: Unencrypted Files

**AVOID**:
- Plaintext credential files on disk
- Unencrypted backup files
- Documentation with actual secrets
- Screenshots containing credentials

**If Necessary**:
- Encrypt with GPG: `gpg -c secretfile.txt`
- Encrypt with OpenSSL: `openssl enc -aes-256-cbc -in file -out file.enc`
- Use encrypted password manager instead
- Delete after use

### ✗ NEVER: Browser Local Storage

**BAD EXAMPLE**:
```javascript
// ❌ NEVER DO THIS
localStorage.setItem('apiKey', 'AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8');
```

**Why**:
- Visible to any JavaScript on the page
- Visible in browser DevTools
- Exposed in XSS attacks
- Easily copied by malicious scripts

**Correct for Frontend**:
- Only use public keys (e.g., `VITE_STRIPE_PUBLISHABLE_KEY`)
- Keep public keys in `.env`
- Never store secret keys in frontend
- Use backend API to make authenticated requests

---

## SECRET TYPES & HANDLING

### 1. OAuth Credentials

**Secrets**:
- Client ID (public, can be in frontend)
- Client Secret (PRIVATE, backend only)
- Refresh Token (PRIVATE, backend only)

**Rotation Frequency**: When compromised OR quarterly

**Rotation Steps**:
1. Generate new Client ID/Secret in service console
2. Update in .env and Vercel
3. Verify login works
4. Revoke old credentials
5. Monitor for failed logins

**Example**:
```bash
# Google OAuth - Rotate both
GOOGLE_CLIENT_ID=new-id
GOOGLE_CLIENT_SECRET=new-secret

# GitHub OAuth - Rotate secret only
GITHUB_CLIENT_ID=same-as-before
GITHUB_CLIENT_SECRET=new-secret
```

### 2. API Keys

**Types**:
- **Read-only keys** (lower risk): YouTube API, events API
- **Write-access keys** (higher risk): Stripe, AWS, deployment APIs

**Rotation Frequency**: 
- Read-only: Every 6 months
- Write-access: Every 3 months or immediately if compromised

**Handling**:
```bash
# Keys should have restrictions
# In service dashboard, restrict:
# - IP addresses
# - HTTP referrers
# - Allowed operations (read vs write)
# - Rate limits

# Example: YouTube API
YOUTUBE_DATA_API_KEY=AIzaSyBGSh5G9y... (restricted to YouTube API only)
```

### 3. Database Passwords

**Rotation Frequency**: Every 6 months OR immediately if compromised

**Special Considerations**:
- Causes brief downtime (~30 seconds)
- All connections must be updated
- Can lock users out if not coordinated
- Need rollback plan

**Rotation Steps**:
1. Change password in database admin panel
2. Update in .env
3. Update in Vercel
4. Test connection immediately
5. Monitor for connection errors

**Critical**: Never reuse old passwords

### 4. JWT Secrets

**Rotation Frequency**: Every 6 months OR when team member leaves

**Impact**: Invalidates all existing user sessions

**Handling**:
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in .env
JWT_SECRET=new-64-character-hex-string

# Communicate to users: "Session reset for security update"
```

### 5. Webhook Secrets

**Examples**: Stripe webhook secret, GitHub webhook secret

**Rotation Frequency**: When compromised OR annually

**Handling**:
1. Generate new secret in service dashboard
2. Update in .env/Vercel
3. Redeploy
4. Verify webhooks processing correctly
5. Revoke old secret

### 6. Master Keys / Encryption Keys

**Use Cases**:
- Encrypting integration secrets
- Database encryption keys
- Email encryption keys

**Rotation Frequency**: Rarely (very disruptive)

**Handling**:
- Store in hardware security module (HSM) if possible
- Use AWS KMS or Google Cloud KMS for large systems
- Plan rotation carefully (might require re-encryption)

---

## SECRET LIFECYCLE MANAGEMENT

### Timeline: Secret Birth to Retirement

```
CREATE (Day 1)
    ↓
STORE SECURELY (Immediately)
    ↓
DOCUMENT (Within 1 hour)
    ↓
VERIFY WORKING (Within 24 hours)
    ↓
USE IN PRODUCTION (Within 48 hours)
    ↓
MONITOR (Continuously)
    ↓
SCHEDULE ROTATION (Mark calendar)
    ↓
ROTATE (At scheduled time)
    ↓
REVOKE OLD (Within 24 hours of rotation)
    ↓
ARCHIVE (Store encrypted backup)
    ↓
DELETE (After 1 year, shred backup)
```

### Documentation Template

For each secret created, document in secure password manager:

```
SERVICE: Google Cloud OAuth
TYPE: Client Secret
CREATED: 2026-05-03
CREATED BY: Developer Name
SERVICE ACCOUNT: project@google.com
ROTATION SCHEDULE: 2026-08-03 (quarterly)
LOCATION IN APP: GOOGLE_CLIENT_SECRET env var
DEPENDENCIES: Auth middleware, login form, OAuth redirect handler
REVOCATION LINK: https://console.cloud.google.com/
NOTES: Part of Vercel environment variables, also in .env.local
INCIDENT LOG: None
STATUS: Active
```

---

## VERCEL ENVIRONMENT VARIABLES - BEST PRACTICES

### Setting Up Variables for All Environments

```bash
# Development (local - .env.local)
GOOGLE_CLIENT_ID=test-local-id
GOOGLE_CLIENT_SECRET=test-local-secret

# Staging/Preview (Vercel preview)
GOOGLE_CLIENT_ID=test-staging-id  
GOOGLE_CLIENT_SECRET=test-staging-secret

# Production (Vercel production)
GOOGLE_CLIENT_ID=production-id
GOOGLE_CLIENT_SECRET=production-secret
```

### Command-Line Setup

```bash
# List all environment variables
vercel env list

# Add new variable (interactive)
vercel env add GOOGLE_CLIENT_ID
# Prompts for value, then asks which environments to apply to

# Remove variable
vercel env remove GOOGLE_CLIENT_ID

# Pull variables locally
vercel env pull  # Creates .env.local with all prod vars (for reference)

# Push variables
vercel env push  # Uploads .env to Vercel (dangerous - don't do this with real secrets!)
```

### Web UI Setup

1. Go to https://vercel.com/dashboard
2. Select djdannyhecticb project
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter Key: `GOOGLE_CLIENT_ID`
6. Enter Value: your actual client ID
7. Select environments: Production ☑, Preview ☑, Development ☐
8. Click **Save**

**Tips**:
- Add comment explaining what the secret is
- Use consistent naming (SNAKE_CASE_CAPITALS)
- Never leave "Development" checked for production secrets
- Verify in app that it loaded correctly

---

## GIT & .GITIGNORE CONFIGURATION

### Verify .gitignore Blocks All Secrets

Your `.gitignore` should have:

```bash
# Environment variables
.env
.env.local
.env.*.local
.env.production
.env.development
.env.test
.env.staging
```

**Verify it's working**:

```bash
# Check if .env would be committed
git check-ignore -v .env
# Should output: .env:.gitignore:N   .env

# List all files that would be committed (should NOT include .env files)
git ls-files | grep "\.env"
# Should return NO results

# Check git history for any .env exposure
git log --all --full-history -- "*.env"
# Should return NO results
```

### If .env Was Already Committed

**Remove from git history** (DESTRUCTIVE):

```bash
# OPTION 1: Using git filter-branch (old method, still works)
git filter-branch --tree-filter "rm -f .env" -- --all
git push origin --force --all

# OPTION 2: Using git-filter-repo (newer, cleaner)
git filter-repo --path .env --invert-paths
git push origin --force --all --tags

# OPTION 3: Using BFG Repo-Cleaner (easiest)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --aggressive --prune=now
git push origin --force --all
```

**WARNING**: These operations rewrite git history. Notify all team members to re-clone the repository.

---

## ROTATION PROCEDURES

### Quarterly Rotation Schedule

Set calendar reminders for:
- **Next rotation due**: August 2026 (3 months from May 2026)
- **Notification**: 1 week before scheduled date
- **Execution window**: 2-hour window during low traffic

### Automated Rotation (Advanced)

For larger systems, consider automating rotation:

```bash
# Example: Create a rotation script
cat > /usr/local/bin/rotate-secrets.sh << 'EOF'
#!/bin/bash

# Quarterly secret rotation script
# Run: rotation-secrets.sh

set -e

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/secure/backups/secrets/$DATE"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# Log all actions
exec 1> >(tee "$BACKUP_DIR/rotation.log")
exec 2>&1

echo "=== SECRET ROTATION STARTED ==="
echo "Date: $DATE"
echo "Operator: $(whoami)"

# TODO: Add rotation steps for each secret type
# This is a template - customize for your needs

echo "=== BACKUP COMPLETED ==="
echo "Backup location: $BACKUP_DIR"
EOF

chmod +x /usr/local/bin/rotate-secrets.sh

# Run quarterly
rotation-secrets.sh
```

### Manual Rotation Checklist

For each secret type:

```
BEFORE ROTATION:
□ Backup current secret
□ Document current value
□ Verify monitoring is active
□ Notify team

DURING ROTATION:
□ Generate new secret
□ Update in one location (env vars first)
□ Test immediately
□ Verify in all environments
□ Monitor for errors

AFTER ROTATION:
□ Revoke old secret in service
□ Document rotation in ticket
□ Update password manager
□ Schedule next rotation
□ Archive backup securely
```

---

## INCIDENT RESPONSE: SECRET COMPROMISED

### Immediate Actions (First Hour)

**STEP 1**: Confirm exposure
```bash
# Search git history for secret
git log -p --all -S "SECRET_VALUE" -- :/

# Search GitHub if public repo
# Go to repo settings → Security → Secret scanning alerts
```

**STEP 2**: Assess scope
- When was secret created?
- Where is it used?
- Who has access to that system?
- What data could be accessed?

**STEP 3**: Revoke immediately
- Delete the secret from service console
- Mark as compromised in password manager
- Note time of revocation

### Short Term (First 24 Hours)

**STEP 4**: Rotate secret
- Follow rotation procedure for that secret type
- Deploy new version immediately
- Verify functionality in production

**STEP 5**: Monitor activity
```bash
# Check for suspicious activity using that secret
# Examples:
# - Unusual API calls
# - Unauthorized database access
# - Failed authentication attempts
# - Unexpected charges (for payment services)

# Set up alerts
# - Failed auth attempts > 5 per minute
# - Unusual API call patterns
# - Geographical anomalies
```

**STEP 6**: Investigate root cause
- How did exposure happen?
- Was git exposure detected?
- Did someone share accidentally?
- Was email compromised?

**STEP 7**: Document incident
```
SECURITY INCIDENT REPORT

Date: 2026-05-03
Time: 14:30 UTC
Severity: HIGH
Secret: GOOGLE_CLIENT_SECRET

TIMELINE:
14:15 - Secret exposure detected in .env file
14:20 - Revoked in Google Cloud Console
14:25 - New secret generated and deployed
14:30 - Verified new secret working
15:00 - Monitored for suspicious activity
16:00 - Completed root cause analysis

ROOT CAUSE:
.env file was created with production credentials during setup

REMEDIATION:
1. ✓ Old secret revoked
2. ✓ New secret deployed to production
3. ✓ .gitignore verified
4. ✓ Team notified
5. ✓ Security training scheduled

LESSONS LEARNED:
- Implement pre-commit hook to prevent .env commits
- Use environment variable templates instead of .env examples
- Add secret scanning to CI/CD pipeline
```

### Long Term (Next Week)

**STEP 8**: Implement prevention
- Add pre-commit hook to block .env files
- Enable GitHub secret scanning
- Set up git alerts
- Training on secret management

**STEP 9**: Follow up
- Verify no unauthorized access occurred
- Check audit logs in all systems
- Monitor for additional compromises
- Update security policies

---

## TEAM TRAINING & DOCUMENTATION

### For All Team Members

**REQUIRED KNOWLEDGE**:
1. Never commit .env files
2. Always use environment variables
3. Report suspected exposures immediately
4. Use password manager for sharing
5. Enable MFA on all accounts

**TRAINING**:
- Read this guide (30 minutes)
- Watch video: "Secrets Management Best Practices" (10 minutes)
- Complete quiz: Identify insecure code patterns (5 minutes)
- Annual refresher training

### For Developers

**ADDITIONAL SKILLS**:
1. Setting up .env.local for development
2. Using environment variables in code
3. Deploying with Vercel environment variables
4. Rotating secrets when needed
5. Responding to compromises

**Tools**:
- `.env` file for local development
- Vercel CLI for managing variables
- Password manager for secure sharing
- Git pre-commit hooks to prevent commits

### For DevOps / Ops

**ADDITIONAL RESPONSIBILITIES**:
1. Managing master keys
2. Rotating all secrets quarterly
3. Auditing secret access
4. Coordinating cross-system rotations
5. Incident response leadership

---

## SECURITY TOOLS & AUTOMATION

### Pre-Commit Hooks (Prevent Committing Secrets)

```bash
# Install pre-commit framework
pip install pre-commit

# Create .pre-commit-config.yaml
cat > /Users/romeovalentine/djdannyhecticb/.pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
        
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-added-large-files
        args: ['--maxkb=100']
      - id: detect-private-key
        
  - repo: local
    hooks:
      - id: block-env-files
        name: Block .env files
        entry: bash -c 'git diff --cached --name-only | grep "\.env" && exit 1 || exit 0'
        language: system
        stages: [commit]
EOF

# Install hooks
pre-commit install

# Run against all files
pre-commit run --all-files
```

### GitHub Secret Scanning (If Using GitHub)

```bash
# Enable in repository settings:
# 1. Go to repo → Settings → Security → Secret scanning
# 2. Enable "Push protection"
# 3. Configure "Custom patterns" if needed
```

### Local Secret Detection

```bash
# Scan your repository for secrets
npm install -g detect-secrets-engine

detect-secrets scan \
  --baseline .secrets.baseline \
  --all-files .

# Verify scan results
detect-secrets audit .secrets.baseline
```

---

## COMPLIANCE & AUDIT

### Quarterly Audit Checklist

Every 3 months, verify:

```
□ All secrets have been rotated within last 90 days
□ No secrets in git history
□ .gitignore properly configured
□ MFA enabled on all service accounts
□ Vercel environment variables match .env.example format
□ No unused/old secrets active
□ Password manager access reviewed
□ Rotation schedule updated for next quarter
□ Team training completed
□ Incident response plan updated
```

### Annual Audit

Every 12 months, conduct full:

```
□ Secret inventory (list all secrets, usage, rotation date)
□ Access control review (who has access to which secrets)
□ Incident review (any compromises this year?)
□ Tool effectiveness review (are processes working?)
□ Architecture review (can we improve secret management?)
□ Compliance review (GDPR, SOC2, etc.)
□ Security training effectiveness survey
```

### Documentation for Compliance

Keep documented:
- Secret inventory
- Rotation schedule and completion
- Incident reports
- Access logs
- Training records
- Tool versions and configurations

---

## QUICK REFERENCE: SECRET TYPES

| Secret | Service | Sensitivity | Rotation | Storage |
|--------|---------|-------------|----------|---------|
| Google Client ID | Google OAuth | Public | N/A | Vercel Env |
| Google Client Secret | Google OAuth | Private | Monthly | Vercel Env |
| API Key (read-only) | Various APIs | Medium | 6 months | Vercel Env |
| API Key (write) | Various APIs | High | 3 months | Vercel Env |
| Database Password | PostgreSQL | Critical | 6 months | Vercel Env |
| JWT Secret | App Auth | Critical | 6 months | Vercel Env |
| Webhook Secret | Various | High | 6 months | Vercel Env |
| OAuth Token | External APIs | Private | Varies | Vercel Env |

---

## SUMMARY: DO's AND DON'Ts

### DO ✓

- [x] Store secrets in Vercel Environment Variables for production
- [x] Use .env.local for local development only
- [x] Rotate secrets quarterly minimum
- [x] Rotate immediately if exposed
- [x] Use environment variables in code: `process.env.SECRET_NAME`
- [x] Add .env files to .gitignore
- [x] Document when each secret was created/rotated
- [x] Enable MFA on all service accounts
- [x] Revoke old secrets after rotation
- [x] Monitor for unusual activity using secrets

### DON'T ✗

- [ ] Never commit .env to git
- [ ] Never hardcode secrets in source code
- [ ] Never share secrets via email/Slack
- [ ] Never use same secret across environments
- [ ] Never reuse old secret values
- [ ] Never expose secrets in error messages
- [ ] Never store secrets in browser storage
- [ ] Never commit screenshots with secrets visible
- [ ] Never skip MFA on service accounts
- [ ] Never ignore unauthorized access alerts

---

**This document is CONFIDENTIAL. Keep secure and share only with authorized team members.**

**For questions or updates, contact: Security Team**
