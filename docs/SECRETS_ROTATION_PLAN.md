# Secrets Rotation Plan

**Status**: Implementation Required  
**Last Updated**: 2026-05-03  
**Criticality**: HIGH

## Overview

This document establishes a comprehensive secrets management and rotation policy for djdannyhecticb. Proper secret rotation is essential for maintaining security, limiting blast radius of compromises, and meeting compliance requirements (SOC 2, GDPR, PCI-DSS).

## Secrets Inventory

### Critical Secrets (Rotate Quarterly - Every 3 Months)

#### 1. **JWT_SECRET**
- **Purpose**: Sign/verify authentication tokens
- **Current Location**: Vercel Environment Variables (Encrypted)
- **Stored Securely**: Yes (Vercel marks as "Sensitive")
- **Rotation**: Q1, Q2, Q3, Q4 (Jan 1, Apr 1, Jul 1, Oct 1)
- **Impact**: All active sessions invalidated on rotation
- **Risk**: HIGH - Unauthorized token creation if compromised
- **Length**: Minimum 64 characters (use openssl rand -hex 32)

**Rotation Procedure**:
```bash
# Step 1: Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# Step 2: Update Vercel (create NEW variable first, do NOT delete old yet)
vercel env add JWT_SECRET_NEW $NEW_SECRET --prod

# Step 3: Deploy test build with fallback logic
# Code should check both old and new secrets during transition period

# Step 4: Update code to use new secret (after verification)
# Update env.ts to read JWT_SECRET (new value)

# Step 5: Wait 24 hours for any remaining old tokens to expire

# Step 6: Delete old secret
vercel env remove JWT_SECRET --prod
```

#### 2. **DATABASE_URL**
- **Purpose**: PostgreSQL connection string with credentials
- **Current Location**: Vercel Environment Variables (Encrypted)
- **Contains**: Database password, hostname, port, database name
- **Rotation**: Q1, Q2, Q3, Q4 (Rotate database password)
- **Impact**: Database unavailable during password rotation (~5 min)
- **Risk**: CRITICAL - Complete database compromise if leaked
- **Length**: Password should be 32+ characters

**Rotation Procedure**:
```bash
# Step 1: Connect to database host
# (Contact your provider: Vercel, Railway, Neon, etc.)

# Step 2: Create new database user with new password
# Example for PostgreSQL:
ALTER USER "djdannyhectic_user" WITH PASSWORD 'NEW_PASSWORD_HERE';

# Step 3: Update Vercel environment with new connection string
NEW_URL="postgresql://djdannyhectic_user:NEW_PASSWORD@host:5432/djdannyhectic"
vercel env add DATABASE_URL_NEW $NEW_URL --prod

# Step 4: Deploy and verify connection works
vercel deploy --prod

# Step 5: Remove old environment variable
vercel env remove DATABASE_URL --prod

# Step 6: Update git history (if accidentally committed)
git-filter-branch --force --index-filter 'git rm --cached .env*' HEAD
```

#### 3. **STRIPE_SECRET_KEY**
- **Purpose**: Stripe payment processing authentication
- **Current Location**: Vercel Environment Variables (Encrypted)
- **Rotation**: Quarterly (90 days)
- **Provider**: Stripe Dashboard → Settings → Restricted API Keys
- **Impact**: Payment processing temporarily unavailable
- **Risk**: HIGH - Unauthorized charges if compromised
- **Scope**: Full permissions (replace with restricted key when possible)

**Rotation Procedure**:
```bash
# Step 1: Log into Stripe Dashboard
# https://dashboard.stripe.com/apikeys

# Step 2: Create new restricted API key
# - Permissions: only payments + webhooks
# - DO NOT use full-access keys

# Step 3: Test new key in staging environment
STRIPE_SECRET_KEY=sk_test_xxxx npm run test:stripe

# Step 4: Update Vercel
vercel env add STRIPE_SECRET_KEY sk_live_xxxxx --prod

# Step 5: Deploy to production
vercel deploy --prod

# Step 6: Monitor Stripe logs for 1 hour

# Step 7: Revoke old key in Stripe Dashboard
# - Settings → API Keys → Delete (old key)
```

**Stripe Webhook Secret Rotation**:
```bash
# Rotate STRIPE_WEBHOOK_SECRET monthly
# 1. Stripe Dashboard → Webhooks → Select endpoint
# 2. Click "Reveal" to show current signing secret
# 3. Create new endpoint with same URL (dual-run for 24h)
# 4. Update vercel env with new secret
# 5. Monitor for webhook failures
# 6. Delete old endpoint after validation
```

### High-Priority Secrets (Rotate Semi-Annually - Every 6 Months)

#### 4. **GOOGLE_PLACES_API_KEY**
- **Purpose**: Google Maps/Places location services
- **Current Location**: Vercel Environment Variables
- **Rotation**: Jan 1, Jul 1
- **Impact**: Location features unavailable during rotation
- **Risk**: MEDIUM - API quota exhaustion if exposed
- **Scope**: Restrict to Places API only in Google Cloud Console

**Rotation Procedure**:
```bash
# Step 1: Google Cloud Console → APIs & Services → Credentials
# Step 2: Create new API key with restrictions:
#   - API restrictions: Places API, Maps SDK
#   - HTTP restrictions: domain.com only

# Step 3: Update Vercel
vercel env add GOOGLE_PLACES_API_KEY <new_key> --prod

# Step 4: Deploy and test
# Step 5: Delete old key after 24h monitoring

# Monitor usage:
gcloud compute project-info describe --project=PROJECT_ID \
  --format='value(name,labels.created)'
```

#### 5. **PAYPAL_CLIENT_ID** & **PAYPAL_CLIENT_SECRET**
- **Purpose**: PayPal payment processing (if enabled)
- **Current Location**: Vercel Environment Variables
- **Rotation**: Jan 1, Jul 1 (if PayPal enabled)
- **Impact**: PayPal payments unavailable during rotation
- **Risk**: MEDIUM - Unauthorized charges if exposed
- **Mode**: sandbox (dev) and live (prod) - separate secrets

**Rotation Procedure**:
```bash
# Step 1: PayPal Dashboard → Apps & Credentials
# Step 2: Generate new credentials for live app
# Step 3: Update Vercel (both ID and SECRET)
vercel env add PAYPAL_CLIENT_ID pm_live_xxx --prod
vercel env add PAYPAL_CLIENT_SECRET pm_live_secret_xxx --prod

# Step 4: Deploy and run transaction tests
npm run test:paypal

# Step 5: Delete old credentials from PayPal Dashboard
```

#### 6. **Email Service API Keys** (SendGrid/Resend)
- **Purpose**: Email notifications and transactional emails
- **Current Location**: Vercel Environment Variables
- **Rotation**: Jan 1, Jul 1
- **Impact**: Email sending unavailable during rotation
- **Risk**: MEDIUM - Email spoofing if exposed

**Rotation Procedure**:
```bash
# SendGrid (if using SendGrid)
# Step 1: SendGrid Dashboard → Settings → API Keys → Create
# Step 2: Copy new key
# Step 3: Test in staging: EMAIL_API_KEY=xxx npm test

# Resend (if using Resend)
# Step 1: Resend Dashboard → API Keys → Create
# Step 2: Copy new key
# Step 3: Update Vercel
vercel env add EMAIL_API_KEY re_live_xxx --prod

# Step 4: Monitor email logs for delivery failures
# Step 5: Delete old key
```

### Medium-Priority Secrets (Rotate Annually - Every 12 Months)

#### 7. **SPOTIFY_CLIENT_ID** & **SPOTIFY_CLIENT_SECRET**
- **Purpose**: Spotify API integration (if enabled)
- **Current Location**: Vercel Environment Variables
- **Rotation**: Jan 1
- **Impact**: Spotify features unavailable during rotation
- **Risk**: LOW-MEDIUM
- **Documentation**: https://developer.spotify.com/documentation

#### 8. **SOUNDCLOUD_CLIENT_ID**
- **Purpose**: SoundCloud integration (if enabled)
- **Rotation**: Jan 1
- **Impact**: SoundCloud features unavailable

#### 9. **PRINTFULL_API_KEY** (if merchandise enabled)
- **Purpose**: Merchandise print-on-demand integration
- **Rotation**: Jan 1
- **Impact**: Merchandise ordering unavailable

### Configuration Secrets (Rotate as Needed)

#### CORS_ORIGINS
- **Purpose**: Define allowed cross-origin domains
- **Rotation**: When adding new domain or retiring old one
- **Format**: Comma-separated list
- **Current**: `https://djdannyhecticb.com,https://www.djdannyhecticb.com`

#### Environment-Specific Overrides
- **EMAIL_FROM_ADDRESS**: Change anytime (no rotation needed)
- **NOTIFICATIONS_EMAIL**: Change anytime (no rotation needed)
- **INSTAGRAM_HANDLE**: Change anytime (no rotation needed)

## Rotation Calendar

```
2026 Rotation Schedule:
┌──────────────────────────────────────────────────────────────┐
│ Q1 (Jan 1)  │ JWT_SECRET, DATABASE_URL, STRIPE_SECRET        │
│             │ GOOGLE_PLACES_API_KEY, PAYPAL_*, EMAIL_API_KEY │
│             │ SPOTIFY_*, SOUNDCLOUD_*, PRINTFULL_*            │
├──────────────────────────────────────────────────────────────┤
│ Q2 (Apr 1)  │ JWT_SECRET, DATABASE_URL, STRIPE_SECRET        │
│             │ STRIPE_WEBHOOK_SECRET                          │
├──────────────────────────────────────────────────────────────┤
│ Q3 (Jul 1)  │ JWT_SECRET, DATABASE_URL, STRIPE_SECRET        │
│             │ GOOGLE_PLACES_API_KEY, PAYPAL_*, EMAIL_API_KEY │
├──────────────────────────────────────────────────────────────┤
│ Q4 (Oct 1)  │ JWT_SECRET, DATABASE_URL, STRIPE_SECRET        │
│             │ STRIPE_WEBHOOK_SECRET                          │
└──────────────────────────────────────────────────────────────┘
```

## Vercel Environment Variable Management

### Best Practices

1. **Mark as Sensitive**: All secrets should be marked "Sensitive (encrypted at rest)"
   ```bash
   vercel env ls --prod  # View current secrets
   vercel env add SECRET_NAME value --prod  # New secret
   ```

2. **Scope Restrictions**: Limit scope to specific environments
   - **Production**: CRITICAL secrets only
   - **Preview**: Non-sensitive or test tokens
   - **Development**: Separate test credentials

3. **Audit Logging**: Vercel logs all environment variable changes
   ```bash
   # View changes via Vercel Dashboard
   # Settings → Environment Variables → View activity log
   ```

4. **Version Control**: NEVER commit secrets to git
   ```bash
   # Good: reference from environment
   const secret = process.env.JWT_SECRET

   # Bad: hardcoded
   const secret = "sk_live_abc123..."

   # Prevent accidental commits
   echo ".env*" >> .gitignore
   echo "*.local" >> .gitignore
   ```

### Staging Secret Strategy

Maintain separate test credentials:
- **Stripe**: Use test mode keys for staging
- **PayPal**: Use sandbox credentials for staging
- **Email**: Use sandbox service for preview deployments
- **Database**: Separate read-only replica for non-prod

## Emergency Secret Rotation

**If a secret is compromised, rotate immediately**:

1. **Immediate** (0-5 min):
   - Revoke compromised secret at provider
   - Alert team on Slack
   - Post-incident response plan

2. **Within 15 minutes**:
   - Generate new secret
   - Deploy new secret to production
   - Update all dependent systems

3. **Within 1 hour**:
   - Monitor logs for unauthorized access using old secret
   - Review recent transactions/activities
   - Document incident

4. **Within 24 hours**:
   - Complete incident report
   - Implement preventative measures
   - Notify affected users (if applicable)

## Monitoring & Alerting

### Detect Secret Exposure

```bash
# GitHub Secret Scanning (native feature)
# Automatically detects committed secrets in repository
# Settings → Security → Secret scanning → Enable

# Monitor logs for unauthorized API usage
# Stripe: Dashboard → Logs → Monitor for suspicious patterns
# PayPal: Monitor unauthorized transactions
# Email: Monitor bounce rates and spam complaints
```

### Audit Trail

Maintain a log of all rotations:
```markdown
# Secrets Rotation Log

| Date | Secret | Rotated By | Reason | Status |
|------|--------|-----------|--------|--------|
| 2026-01-01 | JWT_SECRET | admin@... | Quarterly | ✓ Completed |
| 2026-01-01 | DATABASE_URL | admin@... | Quarterly | ✓ Completed |
| 2026-03-15 | STRIPE_SECRET | admin@... | Emergency | ✓ Compromised |
```

## Automation

### GitHub Actions Rotation Reminder

```yaml
# .github/workflows/secrets-rotation-reminder.yml
name: Secrets Rotation Reminder
on:
  schedule:
    - cron: '0 0 1 1,4,7,10 *'  # First day of Q1, Q2, Q3, Q4

jobs:
  reminder:
    runs-on: ubuntu-latest
    steps:
      - name: Create rotation issue
        uses: actions/create-issue@v2
        with:
          title: '[SECURITY] Quarterly Secrets Rotation Due'
          body: |
            # Secrets Rotation Checklist
            - [ ] JWT_SECRET
            - [ ] DATABASE_URL
            - [ ] STRIPE_SECRET_KEY
            - [ ] STRIPE_WEBHOOK_SECRET
            - [ ] GOOGLE_PLACES_API_KEY
            - [ ] PAYPAL_CLIENT_ID/SECRET
            - [ ] EMAIL_API_KEY
            
            See docs/SECRETS_ROTATION_PLAN.md for procedures
          labels: security,infrastructure
```

### Manual Checklist Template

```markdown
# [DATE] Secrets Rotation Checklist

## Quarterly Rotation (Q1/Q2/Q3/Q4)

### Critical (Must Complete)
- [ ] JWT_SECRET rotated and deployed
- [ ] DATABASE_URL rotated and tested
- [ ] STRIPE_SECRET_KEY rotated and verified

### High Priority (Complete This Quarter)
- [ ] GOOGLE_PLACES_API_KEY (if Jan 1 or Jul 1)
- [ ] PAYPAL_CLIENT_ID/SECRET (if Jan 1 or Jul 1)
- [ ] EMAIL_API_KEY (if Jan 1 or Jul 1)

### Medium Priority (Complete This Year)
- [ ] STRIPE_WEBHOOK_SECRET (Q2 and Q4)
- [ ] SPOTIFY credentials (Jan 1 only)
- [ ] SOUNDCLOUD credentials (Jan 1 only)
- [ ] PRINTFULL credentials (Jan 1 only)

## Sign-off
- Completed by: ________________
- Date: ________________
- Verified by: ________________
```

## Compliance & Security Standards

This rotation plan meets requirements from:
- **OWASP**: Secrets management best practices
- **NIST SP 800-53**: Access Control and Cryptography
- **SOC 2 Type II**: Credential management controls
- **PCI-DSS**: If processing payments directly
- **GDPR**: Protecting customer data via secure authentication

## References

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Stripe API Key Best Practices](https://stripe.com/docs/keys)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Ownership**: DevSecOps / Platform Engineering  
**Last Reviewed**: 2026-05-03  
**Next Review**: 2026-08-03
