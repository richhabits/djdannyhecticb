# Secrets Management Best Practices

**Status**: Production Guide  
**Applies To**: All developers, CI/CD, deployments  
**Last Updated**: 2026-05-03

---

## Overview

This document defines how to safely handle secrets in the djdannyhecticb project across development, staging, and production environments.

### Key Principles
1. **Secrets never in version control** - .env excluded via .gitignore
2. **Environment separation** - Different secrets per environment
3. **Minimal exposure** - Secrets accessed only when needed
4. **Audit trail** - All secret access logged
5. **Rotation policy** - Regular key rotation (monthly)

---

## Secret Storage by Environment

### Local Development
**Storage**: `.env` file (git-ignored)  
**Access**: Direct file read by Node.js  
**Security**: Encrypted disk recommended  
**Rotation**: Monthly or after any exposure  

```bash
# Create from template
cp .env.example .env

# Add your local development secrets
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-client-secret
DATABASE_URL=your-local-database-url
```

### Staging / Preview
**Storage**: Vercel Environment Variables (preview branch)  
**Access**: Vercel platform  
**Security**: Vercel encryption at rest  
**Rotation**: With each production rotation  

```bash
# Set staging secrets
vercel env add GOOGLE_CLIENT_ID --environments preview
vercel env add GOOGLE_CLIENT_SECRET --environments preview
```

### Production
**Storage**: Vercel Environment Variables (production)  
**Access**: Vercel platform + automatic injection at build/runtime  
**Security**: Vercel encryption, access logs, audit trail  
**Rotation**: Monthly, coordinated with deployment  

```bash
# Set production secrets
vercel env add GOOGLE_CLIENT_ID --environments production
vercel env add GOOGLE_CLIENT_SECRET --environments production
```

---

## Secrets Classified by Type

### Tier 1: CRITICAL (Database Access)
| Secret | Storage | Rotation | Owner |
|--------|---------|----------|-------|
| `DATABASE_URL` | Vercel + local .env | Every 30 days | DBA |
| `INTEGRATIONS_MASTER_KEY` | Vercel only | Every 60 days | DevOps |

**Access Control**: Only backend code, no frontend exposure

### Tier 2: HIGH (Authentication)
| Secret | Storage | Rotation | Owner |
|--------|---------|----------|-------|
| `GOOGLE_CLIENT_SECRET` | Vercel + local .env | Every 30 days | Auth Lead |
| `JWT_SECRET` | Vercel + local .env | Every 30 days | Auth Lead |
| `TWITCH_CLIENT_SECRET` | Vercel + local .env | Every 30 days | Stream Lead |

**Access Control**: Backend only (except JWT used for validation)

### Tier 3: MEDIUM (API Keys)
| Secret | Storage | Rotation | Owner |
|--------|---------|----------|-------|
| `GOOGLE_AI_API_KEY` | Vercel + local .env | Every 60 days | AI Lead |
| `YOUTUBE_DATA_API_KEY` | Vercel + local .env | Every 60 days | Stream Lead |
| `TICKETMASTER_API_KEY` | Vercel + local .env | Every 60 days | Content Lead |

**Access Control**: Backend only

### Tier 4: LOW (Public IDs)
| Secret | Storage | Rotation | Owner |
|--------|---------|----------|-------|
| `GOOGLE_CLIENT_ID` | Vercel + local .env | With CLIENT_SECRET | Auth Lead |
| `TWITCH_CLIENT_ID` | Vercel + local .env | With CLIENT_SECRET | Stream Lead |
| `VITE_GOOGLE_CLIENT_ID` | Vercel only (safe to expose) | With CLIENT_SECRET | Auth Lead |

**Access Control**: Can be in frontend environment variables (prefixed with VITE_)

---

## Workflow: Adding New Secrets

### For Developers (Local Development)

1. **Get the secret from owner**
   ```bash
   # Ask: "Can you share the staging API key for [service]?"
   # Receive via: 1Password, LastPass, or secure message
   ```

2. **Add to .env** (never commit)
   ```bash
   # .env (git-ignored)
   MY_NEW_API_KEY=sk_test_xxxxx
   ```

3. **Verify in code**
   ```typescript
   const key = process.env.MY_NEW_API_KEY;
   if (!key) {
     throw new Error("MY_NEW_API_KEY not configured");
   }
   ```

4. **Test locally**
   ```bash
   npm run dev
   # Verify feature works
   ```

### For DevOps (Production)

1. **Receive rotation request** with new secret
   
2. **Add to Vercel**
   ```bash
   # Production
   vercel env add MY_NEW_API_KEY --environments production
   # Paste value when prompted
   
   # Staging (optional)
   vercel env add MY_NEW_API_KEY --environments preview
   ```

3. **Verify in deployments**
   ```bash
   # Check Vercel dashboard
   vercel env list
   
   # Or via CLI
   vercel env pull
   cat .env
   ```

4. **Deploy and test**
   ```bash
   vercel --prod
   ```

5. **Document in audit log**
   ```
   Date: 2026-05-03
   Secret: MY_NEW_API_KEY
   Action: Rotated
   Vercel: ✅ Updated
   Deployed: ✅ v1.2.3
   Tested: ✅ Feature works
   ```

---

## Workflow: Rotating Secrets

### Monthly Rotation Checklist

**1st of every month**: Review and rotate tier 1 & 2 secrets

#### Step 1: Notify Team
```markdown
Subject: Monthly secret rotation - 2026-05-01

We're rotating the following secrets this week:
- DATABASE_URL (Supabase)
- GOOGLE_CLIENT_SECRET
- JWT_SECRET
- TWITCH_CLIENT_SECRET

Expected downtime: 0 minutes (hot-swap deployment)
Timeline: May 1-3, 2026
Owner: [DevOps Lead]

Expected user impact: Must re-login (new JWT tokens)
```

#### Step 2: Prepare New Secrets
- Obtain new credentials from each service provider
- Document old key details (for audit)
- Don't share secrets in Slack/email (use 1Password)

#### Step 3: Update Local Development
```bash
# Update .env with new secrets
vi .env
GOOGLE_CLIENT_SECRET=NEW_SECRET

# Commit (with git-ignored .env):
git add .
git commit -m "chore: prepare for secret rotation"
# .env is automatically ignored
```

#### Step 4: Update Production (Vercel)
```bash
# Update each secret
vercel env rm GOOGLE_CLIENT_SECRET --environments production
vercel env add GOOGLE_CLIENT_SECRET --environments production
# Paste NEW secret when prompted

# Verify all updated
vercel env list --environments production
```

#### Step 5: Deploy & Monitor
```bash
# Trigger deployment
vercel --prod

# Monitor for errors
curl https://djdannyhecticb.vercel.app/api/health

# Check logs
vercel logs --follow
```

#### Step 6: Revoke Old Credentials
- Delete old keys in each service provider
- Confirm in audit logs
- Document in rotation log

#### Step 7: Verify in All Environments
```bash
# Development
npm run dev
# Test login → should work

# Staging (preview deployment)
# Test at: https://git-branch-name.djdannyhecticb.vercel.app

# Production
# Test at: https://djdannyhecticb.vercel.app
```

#### Step 8: Document
```markdown
## Rotation Log - 2026-05-03

**Secrets Rotated**:
- DATABASE_URL: ✅ Rotated (Supabase)
- GOOGLE_CLIENT_SECRET: ✅ Rotated (Google Cloud)
- JWT_SECRET: ✅ Regenerated
- TWITCH_CLIENT_SECRET: ✅ Rotated (Twitch)

**Timeline**:
- 2026-05-01 10:00 AM: Started
- 2026-05-01 02:30 PM: Vercel updated
- 2026-05-01 03:00 PM: Production deployed
- 2026-05-01 03:15 PM: All systems verified
- 2026-05-01 04:00 PM: Old credentials revoked
- 2026-05-01 04:15 PM: Complete

**Verification**:
- ✅ Staging login works
- ✅ Production login works
- ✅ AI features working
- ✅ Database queries normal
- ✅ No error logs

**Impact**:
- Users must re-login (new JWT)
- 0 minutes downtime
- 0 failed transactions
```

---

## Verification: Secrets Not in Code

Run this before every commit:

```bash
#!/bin/bash
# scripts/verify-no-secrets.sh

echo "Checking for hardcoded secrets..."

PATTERNS=(
  "GOCSPX-"           # Google OAuth Secret format
  "sk_live_"          # Stripe live key
  "sk_test_"          # Stripe test key
  "BEGIN PRIVATE KEY" # Private keys
  "AIzaSy"            # Google API key prefix
  "Blackgrapeman"     # Database password
  "6j2q6m"            # Twitch Client ID pattern
)

FOUND=0
for pattern in "${PATTERNS[@]}"; do
  if grep -r "$pattern" . --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" \
      --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist 2>/dev/null | grep -v ".env"; then
    echo "❌ FOUND PATTERN: $pattern"
    FOUND=1
  fi
done

# Check .env is not in git
if git ls-files | grep -E "\.env($|\.)" >/dev/null 2>&1; then
  echo "❌ .env file is in version control!"
  FOUND=1
fi

if [ $FOUND -eq 0 ]; then
  echo "✅ No hardcoded secrets found"
  exit 0
else
  echo "❌ Secrets detected! Remove before committing."
  exit 1
fi
```

**Run before each push**:
```bash
chmod +x scripts/verify-no-secrets.sh
./scripts/verify-no-secrets.sh
```

---

## Verification: Secrets in Environment

After deployment, verify all secrets are accessible:

```bash
#!/bin/bash
# scripts/verify-secrets-configured.sh

echo "Verifying secrets configuration..."

# Check local development
echo "Local (.env):"
if [ -f .env ]; then
  grep "GOOGLE_CLIENT_ID=" .env >/dev/null && echo "  ✅ GOOGLE_CLIENT_ID" || echo "  ❌ GOOGLE_CLIENT_ID missing"
  grep "DATABASE_URL=" .env >/dev/null && echo "  ✅ DATABASE_URL" || echo "  ❌ DATABASE_URL missing"
  grep "JWT_SECRET=" .env >/dev/null && echo "  ✅ JWT_SECRET" || echo "  ❌ JWT_SECRET missing"
else
  echo "  ⚠️  .env not found - copy from .env.example"
fi

# Check Vercel
echo ""
echo "Vercel (production):"
vercel env list --environments production | grep -q "GOOGLE_CLIENT_ID" && echo "  ✅ GOOGLE_CLIENT_ID" || echo "  ❌ GOOGLE_CLIENT_ID missing"
vercel env list --environments production | grep -q "DATABASE_URL" && echo "  ✅ DATABASE_URL" || echo "  ❌ DATABASE_URL missing"
vercel env list --environments production | grep -q "JWT_SECRET" && echo "  ✅ JWT_SECRET" || echo "  ❌ JWT_SECRET missing"
```

---

## Emergency: Secret Compromised

If a secret is exposed:

### Immediate (< 5 minutes)
1. **Stop** using the compromised secret
2. **Revoke** the old credential in the service provider (delete)
3. **Alert** the team on Slack (private channel)

### Short-term (< 1 hour)
1. Generate new credential
2. Update in `.env` locally
3. Update in Vercel environment variables
4. Redeploy to all environments
5. Verify services are operational

### Long-term (< 24 hours)
1. Review audit logs for abuse
2. Monitor quotas/usage for anomalies
3. Document timeline in security log
4. Update rotation schedule if needed
5. Debrief team on prevention

---

## Tools & Scripts

### Check if Secret is Exposed
```bash
# Check GitHub
curl -s "https://api.github.com/search/code?q=GOCSPX-2xj87tsFlOTiE81 repo:romeovalentine/djdannyhecticb" | jq

# Check git history (local)
git log --all -S "GOCSPX-2xj87tsFlOTiE81" --oneline

# Check with gitleaks
gitleaks detect --verbose --no-git
```

### Encrypt Secrets (At Rest)
```typescript
import { SecretsManager } from './server/_core/secrets';

// Encrypt before storing in database
const encrypted = SecretsManager.encrypt(sensitiveKey);

// Decrypt when needed
const decrypted = SecretsManager.decrypt(encrypted);
```

### Generate Strong Secrets
```bash
# JWT Secret (32 bytes, 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# API Key mockup (for testing)
node -e "console.log('sk_test_' + require('crypto').randomBytes(16).toString('hex'))"
```

---

## Policy: Access Control

### Who Can Access Secrets?

| Role | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------|--------|--------|--------|--------|
| Backend Dev | ✅ Code | ✅ Code | ✅ Code | ✅ Code |
| Frontend Dev | ❌ No | ❌ No | ❌ No | ✅ Public |
| DevOps | ✅ All | ✅ All | ✅ All | ✅ All |
| Security | ✅ Audit | ✅ Audit | ✅ Audit | ✅ Audit |
| Product Lead | ❌ No | ❌ No | ⚠️ Inform | ✅ Yes |

### Audit Trail
- Every secret access logged by service provider
- Vercel: View access logs in dashboard
- Database: Query audit tables
- Review monthly in security meetings

---

## Checklists

### Onboarding New Developer
- [ ] Provide .env.example template
- [ ] Explain secret sources (1Password, manager request)
- [ ] Show how to run guard-secrets.sh
- [ ] Add to #secrets-rotation channel
- [ ] Have them complete first local setup
- [ ] Verify no secrets in their first PR

### Monthly Rotation
- [ ] Run rotation checklist (see above)
- [ ] Update all Tier 1 & 2 secrets
- [ ] Test all affected features
- [ ] Update rotation log
- [ ] Archive old credentials
- [ ] Brief team on changes

### Before Major Release
- [ ] Rotate Tier 2 & 3 secrets
- [ ] Audit for any exposed credentials
- [ ] Run gitleaks scan
- [ ] Verify monitoring alerts
- [ ] Update DEPLOYMENT_STATUS.md

---

## Contact & Escalation

**Questions about secrets?**
- #engineering-security Slack channel
- security-team@djdannyhecticb.com

**Urgent exposure detected?**
- Page on-call: ops-emergency@djdannyhecticb.com
- Call: [Emergency number]
- Do NOT post secrets in Slack

---

**Version**: 1.0  
**Last Updated**: 2026-05-03  
**Next Review**: 2026-06-03
