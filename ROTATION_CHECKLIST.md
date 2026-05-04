# SECRET ROTATION CHECKLIST - DJ DANNY HECTIC B

**CRITICAL: These secrets were exposed in .env and must be rotated immediately**

Status: URGENT - Execute within 24 hours
Date Created: 2026-05-03
Last Updated: 2026-05-03

---

## EXECUTIVE SUMMARY

This document provides step-by-step instructions for rotating all exposed secrets in the djdannyhecticb project. All secrets listed in `.env` must be regenerated or revoked immediately due to exposure.

### Exposed Secrets Requiring Rotation

| Secret | Service | Risk Level | Rotation Difficulty |
|--------|---------|------------|---------------------|
| `GOOGLE_CLIENT_ID` | Google OAuth | CRITICAL | Medium |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | CRITICAL | Medium |
| `YOUTUBE_DATA_API_KEY` | YouTube API | HIGH | Easy |
| `TWITCH_CLIENT_ID` | Twitch API | HIGH | Easy |
| `TWITCH_CLIENT_SECRET` | Twitch API | CRITICAL | Easy |
| `DATABASE_URL` (password) | PostgreSQL/Supabase | CRITICAL | Hard |
| `JWT_SECRET` | Application Auth | CRITICAL | Medium |
| `GOOGLE_AI_API_KEY` | Google Gemini API | HIGH | Easy |
| `TICKETMASTER_API_KEY` | Ticketmaster API | MEDIUM | Easy |
| `STRIPE_*` keys | Stripe Payments | CRITICAL | Hard |
| `ADMIN_EMAILS` | Configuration | LOW | N/A (not a secret) |

---

## PRE-ROTATION CHECKLIST

### Before Starting Rotation

- [ ] **NOTIFY TEAM**: Alert any team members or stakeholders
- [ ] **SCHEDULE ROTATION**: Execute during low-traffic window (preferably night/weekend)
- [ ] **BACKUP SECRETS**: Store current secrets securely (encrypted password manager only)
- [ ] **PREPARE ROLLBACK**: Document current credentials for emergency revert
- [ ] **TEST ENVIRONMENT**: Verify non-production environment first
- [ ] **COMMUNICATION PLAN**: Prepare user notification if needed
- [ ] **ENABLE MONITORING**: Set up alerts for failed login attempts
- [ ] **DOCUMENT TIMELINE**: Note start time of rotation process

### Services That Will Be Affected During Rotation

| Service | Impact | Duration | Affected Users |
|---------|--------|----------|-----------------|
| Google OAuth Login | UNAVAILABLE | ~5-10 min per step | All users |
| YouTube Live Detection | UNAVAILABLE | ~2-3 min | Streaming features |
| Twitch Live Detection | UNAVAILABLE | ~2-3 min | Streaming features |
| Booking System | AVAILABLE | No impact | All users |
| Database Access | BRIEF OUTAGE | ~30 sec | All API endpoints |
| JWT Sessions | BRIEF DISRUPTION | ~1 min | Active sessions may reset |

---

## PHASE 1: PREPARATION (30 minutes)

### 1.1 Create Backup Directory

```bash
# Create secure backup directory
mkdir -p ~/.rotation-backup-$(date +%Y%m%d)
chmod 700 ~/.rotation-backup-$(date +%Y%m%d)

# Copy current .env
cp /Users/romeovalentine/djdannyhecticb/.env ~/.rotation-backup-$(date +%Y%m%d)/.env.backup
chmod 600 ~/.rotation-backup-$(date +%Y%m%d)/.env.backup
```

### 1.2 Document Current Status

```bash
# Export current values to secure location
cat > ~/.rotation-backup-$(date +%Y%m%d)/ROTATION_LOG.txt << 'EOF'
DJ DANNY HECTIC B - SECRET ROTATION LOG
Started: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Rotated By: YOUR_NAME
Reason: Security - Exposed Secrets

SERVICES TO ROTATE:
- [ ] Google OAuth (Client ID & Secret)
- [ ] YouTube Data API Key
- [ ] Twitch API Credentials
- [ ] PostgreSQL Password (Supabase)
- [ ] JWT Secret
- [ ] Google AI API Key
- [ ] Ticketmaster API Key
- [ ] Stripe Keys (if configured)

COMPLETION TIME: __________
EOF

chmod 600 ~/.rotation-backup-$(date +%Y%m%d)/ROTATION_LOG.txt
```

### 1.3 Notify Stakeholders

Send notification to team:
> "Beginning scheduled secret rotation at [TIME]. Services may be briefly unavailable. Expected duration: 45 minutes. Estimated completion: [TIME+45min]"

### 1.4 Enable Enhanced Monitoring

Set up monitoring for:
- Failed login attempts (after rotation)
- API error rates
- Database connection failures
- 5xx errors on all endpoints

---

## PHASE 2: GOOGLE OAUTH ROTATION (10-15 minutes)

**Impact**: Google login will be unavailable during this step

### Step 2.1: Create New OAuth Credentials in Google Cloud Console

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Select the **djdannyhecticb project** (or relevant project)
3. Navigate to **APIs & Services** → **Credentials**
4. Find the existing OAuth 2.0 Client ID for Web Application
5. Click the client ID to open details
6. **Take screenshot of current settings** for reference
7. **NOTE DOWN**: 
   - Authorized Redirect URIs currently configured
   - Any other dependent configurations

### Step 2.2: Create New OAuth Client ID

1. In **Credentials** page, click **+ CREATE CREDENTIALS** → **OAuth client ID**
2. Select **Web application**
3. Enter Name: `djdannyhecticb-web-new-[DATE]`
4. Add Authorized Redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   https://djdannyhecticb.vercel.app/api/auth/google/callback
   https://djdannyhecticb-*.vercel.app/api/auth/google/callback
   https://djdannyhecticb.com/api/auth/google/callback
   ```
5. Click **CREATE**
6. **SAVE credentials** from the dialog:
   - New Client ID
   - New Client Secret

### Step 2.3: Update Application with New Credentials

```bash
# Update .env with new credentials
cat > /tmp/update_google.sh << 'EOF'
#!/bin/bash

# Replace GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
NEW_CLIENT_ID="YOUR_NEW_CLIENT_ID"
NEW_CLIENT_SECRET="YOUR_NEW_CLIENT_SECRET"

sed -i.bak \
  -e "s/^GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$NEW_CLIENT_ID/" \
  -e "s/^GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$NEW_CLIENT_SECRET/" \
  /Users/romeovalentine/djdannyhecticb/.env

echo "Updated Google OAuth credentials in .env"
EOF

chmod +x /tmp/update_google.sh
# Execute with your actual new credentials
```

**OR manually edit**: `/Users/romeovalentine/djdannyhecticb/.env`
```
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET
```

### Step 2.4: Update Vercel Environment Variables

```bash
# Update production environment in Vercel
vercel env add GOOGLE_CLIENT_ID
# Paste: YOUR_NEW_CLIENT_ID

vercel env add GOOGLE_CLIENT_SECRET
# Paste: YOUR_NEW_CLIENT_SECRET
```

OR via Vercel Web UI:
1. Go to https://vercel.com/dashboard
2. Select djdannyhecticb project
3. Settings → Environment Variables
4. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Step 2.5: Redeploy Application

```bash
# Deploy to Vercel
cd /Users/romeovalentine/djdannyhecticb
vercel --prod
```

### Step 2.6: Test Google OAuth Login

1. Visit https://djdannyhecticb.vercel.app
2. Click "Login with Google"
3. Verify successful authentication flow
4. **DOCUMENT**: "Google OAuth - ROTATED ✓"

### Step 2.7: Revoke Old OAuth Credentials

After successful testing (wait 10 minutes):
1. Return to Google Cloud Console
2. Find the **old** OAuth Client ID
3. Click the delete icon (trash bin)
4. Confirm deletion
5. **DOCUMENT**: "Google OAuth Old ID - REVOKED ✓"

---

## PHASE 3: YOUTUBE API KEY ROTATION (5 minutes)

**Impact**: YouTube live detection will be unavailable briefly

### Step 3.1: Generate New YouTube Data API Key

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Ensure **djdannyhecticb project** is selected
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **API key**
5. Copy the new API key to clipboard
6. **Click "Restrict Key"** to set restrictions:
   - Application restrictions: **IP addresses** (restrict to production IPs if known)
   - API restrictions: **YouTube Data API v3** only
7. **SAVE** the configuration

### Step 3.2: Update Application

```bash
# Update .env
sed -i.bak "s/^YOUTUBE_DATA_API_KEY=.*/YOUTUBE_DATA_API_KEY=YOUR_NEW_KEY/" \
  /Users/romeovalentine/djdannyhecticb/.env
```

Manual edit: `/Users/romeovalentine/djdannyhecticb/.env`
```
YOUTUBE_DATA_API_KEY=YOUR_NEW_KEY
```

### Step 3.3: Update Vercel Environment Variables

```bash
vercel env add YOUTUBE_DATA_API_KEY
# Paste: YOUR_NEW_KEY
```

### Step 3.4: Verify API Key Works

```bash
# Test the API key
curl -s "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true&key=YOUR_NEW_KEY" \
  | jq '.items[0].statistics'
```

Expected response:
```json
{
  "viewCount": "...",
  "commentCount": "...",
  "subscriberCount": "..."
}
```

### Step 3.5: Revoke Old Key

1. Return to Google Cloud Console Credentials page
2. Find the **old** YouTube Data API Key
3. Click delete (trash icon)
4. Confirm deletion
5. **DOCUMENT**: "YouTube API Key - ROTATED ✓"

---

## PHASE 4: TWITCH API CREDENTIALS ROTATION (5 minutes)

**Impact**: Twitch live detection will be unavailable briefly

### Step 4.1: Generate New Twitch Credentials

1. Go to **Twitch Developer Console**: https://dev.twitch.tv/console/apps
2. Sign in with djdannyhecticb Twitch account
3. Find the application: "djdannyhecticb" or similar
4. Click the application name
5. Click **Manage** button
6. **Generate New Secret** button
7. **COPY** the new OAuth 2.0 Client Secret to clipboard
8. Note: **Client ID remains the same** unless rotating that as well

### Step 4.2: Update Twitch Secret in .env

```bash
# Update .env - Client ID may stay same, Secret must change
sed -i.bak "s/^TWITCH_CLIENT_SECRET=.*/TWITCH_CLIENT_SECRET=YOUR_NEW_SECRET/" \
  /Users/romeovalentine/djdannyhecticb/.env
```

Manual edit: `/Users/romeovalentine/djdannyhecticb/.env`
```
TWITCH_CLIENT_ID=6j2q6mwwjtxn2l1sfnux1hp6yxgumt  # Keep same
TWITCH_CLIENT_SECRET=YOUR_NEW_SECRET               # Update this
```

### Step 4.3: Update Vercel Environment Variables

```bash
vercel env add TWITCH_CLIENT_SECRET
# Paste: YOUR_NEW_SECRET
```

### Step 4.4: Test Twitch Integration

```bash
# Test if new secret works with Twitch API
curl -s -X POST "https://id.twitch.tv/oauth2/token" \
  -d "client_id=6j2q6mwwjtxn2l1sfnux1hp6yxgumt" \
  -d "client_secret=YOUR_NEW_SECRET" \
  -d "grant_type=client_credentials" \
  | jq '.access_token'
```

Should return a valid access token (not an error).

### Step 4.5: Verify Live Detection Works

1. If applicable, trigger a live detection test
2. Verify Twitch channel detection succeeds
3. **DOCUMENT**: "Twitch Secret - ROTATED ✓"

---

## PHASE 5: POSTGRESQL PASSWORD ROTATION (15-20 minutes)

**CRITICAL: This will cause brief database outage (~30 seconds)**

### Step 5.1: Prepare for Database Rotation

```bash
# Current DATABASE_URL format:
# postgresql://postgres:CURRENT_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres

# Extract components
# Host: db.mzfpsfnmeacbknpcpibj.supabase.co
# Port: 5432
# User: postgres
# Database: postgres
```

### Step 5.2: Change Supabase Database Password

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select **djdannyhecticb project**
3. Navigate to **Database** → **Database Settings** (⚙️ icon)
4. Under **Roles** section, find **postgres** role
5. Click the **postgres** role
6. Click **Reset password** button
7. **COPY** the new password immediately to a secure location
8. **SAVE** the changes

### Step 5.3: Construct New DATABASE_URL

```bash
# Format:
# postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres

# Build your new URL:
# postgresql://postgres:YOUR_NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres
```

### Step 5.4: Update Local .env File

```bash
# Update .env
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres|" \
  /Users/romeovalentine/djdannyhecticb/.env
```

Manual edit: `/Users/romeovalentine/djdannyhecticb/.env`
```
DATABASE_URL=postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres
```

### Step 5.5: Update Vercel Environment Variables

```bash
vercel env add DATABASE_URL
# Paste: postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres
```

### Step 5.6: Test Database Connection

```bash
# Test connection with new password
psql postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres \
  -c "SELECT version();"
```

Expected: PostgreSQL version output

### Step 5.7: Verify Application Can Connect

1. Deploy application with new DATABASE_URL
2. Check logs for connection errors
3. Verify no "authentication failed" errors
4. Test database-dependent features (bookings, contact form, etc.)
5. **DOCUMENT**: "PostgreSQL Password - ROTATED ✓"

---

## PHASE 6: JWT SECRET ROTATION (10 minutes)

**CRITICAL: This will invalidate all existing user sessions**

### Step 6.1: Generate New JWT Secret

```bash
# Generate 64-character random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example: a3f9e2c1b8d4e7a9f6c2e8b1d5a3f9c6e2b7a1d4e8f9c6b2a5e8d1f3a9c2
```

Copy the generated secret.

### Step 6.2: Update .env File

```bash
# Update .env
sed -i.bak "s/^JWT_SECRET=.*/JWT_SECRET=YOUR_NEW_SECRET/" \
  /Users/romeovalentine/djdannyhecticb/.env
```

Manual edit: `/Users/romeovalentine/djdannyhecticb/.env`
```
JWT_SECRET=YOUR_NEW_SECRET
```

### Step 6.3: Update Vercel Environment Variables

```bash
vercel env add JWT_SECRET
# Paste: YOUR_NEW_SECRET
```

### Step 6.4: Inform Users (Optional)

If users have active sessions:
> "Applying security update. Your session will be reset. Please log in again."

### Step 6.5: Deploy Updated Application

```bash
cd /Users/romeovalentine/djdannyhecticb
vercel --prod
```

### Step 6.6: Verify Authentication Still Works

1. Clear browser cookies/cache
2. Visit https://djdannyhecticb.vercel.app
3. Complete login flow
4. Verify JWT tokens are issued correctly
5. Check user session persists across page refreshes
6. **DOCUMENT**: "JWT Secret - ROTATED ✓"

### Step 6.7: Monitor for Session Issues

- Watch for "unauthorized" or "token invalid" errors
- Monitor 401 response rates
- Check user complaint channels for login issues

---

## PHASE 7: GOOGLE AI API KEY ROTATION (5 minutes)

**Impact**: AI features (Gemini) briefly unavailable

### Step 7.1: Generate New Google AI API Key

1. Go to **Google AI Studio**: https://aistudio.google.com/apikey
2. Sign in with appropriate account
3. Click **+ Create API key** button
4. Select **Create API key in new project** or select existing project
5. **COPY** the new API key

### Step 7.2: Restrict the New API Key

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Find your new API key in the list
4. Click to open key details
5. **Application restrictions**: HTTP referrers
6. Add:
   ```
   https://djdannyhecticb.vercel.app/*
   https://djdannyhecticb.com/*
   ```
7. **API restrictions**: Google AI API (Generative Language API)
8. **SAVE**

### Step 7.3: Update Application

```bash
# Update .env
sed -i.bak "s/^GOOGLE_AI_API_KEY=.*/GOOGLE_AI_API_KEY=YOUR_NEW_KEY/" \
  /Users/romeovalentine/djdannyhecticb/.env
```

Manual edit: `/Users/romeovalentine/djdannyhecticb/.env`
```
GOOGLE_AI_API_KEY=YOUR_NEW_KEY
```

### Step 7.4: Update Vercel

```bash
vercel env add GOOGLE_AI_API_KEY
# Paste: YOUR_NEW_KEY
```

### Step 7.5: Test AI Features

1. Trigger any AI-powered feature (text generation, summaries, etc.)
2. Verify successful API response
3. **DOCUMENT**: "Google AI API Key - ROTATED ✓"

### Step 7.6: Revoke Old Key

1. Go to Google AI Studio: https://aistudio.google.com/apikey
2. Find the old key in the list
3. Click delete (trash icon)
4. Confirm deletion
5. **DOCUMENT**: "Google AI API Key Old - REVOKED ✓"

---

## PHASE 8: TICKETMASTER API KEY ROTATION (5 minutes)

**Impact**: Event listing features briefly unavailable

### Step 8.1: Generate New Ticketmaster API Key

1. Go to **Ticketmaster Developer Portal**: https://developer.ticketmaster.com/
2. Sign in with your account
3. Navigate to **My Account** → **Applications**
4. Find your application (create one if none exists)
5. Click **Regenerate Consumer Key** or **Regenerate Consumer Secret**
6. **COPY** the new API key/secret

### Step 8.2: Update Application

```bash
# Update .env
sed -i.bak "s/^TICKETMASTER_API_KEY=.*/TICKETMASTER_API_KEY=YOUR_NEW_KEY/" \
  /Users/romeovalentine/djdannyhecticb/.env
```

Manual edit: `/Users/romeovalentine/djdannyhecticb/.env`
```
TICKETMASTER_API_KEY=YOUR_NEW_KEY
```

### Step 8.3: Update Vercel

```bash
vercel env add TICKETMASTER_API_KEY
# Paste: YOUR_NEW_KEY
```

### Step 8.4: Test Event Listing

```bash
# Test API with new key
curl -s "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_NEW_KEY&keyword=music&countryCode=GB&size=1" \
  | jq '.events[0].name'
```

Should return an event name.

### Step 8.5: Verify in Application

1. Navigate to events section
2. Verify events load successfully
3. **DOCUMENT**: "Ticketmaster API Key - ROTATED ✓"

---

## PHASE 9: STRIPE KEY ROTATION (if configured)

**CRITICAL: Payment processing will be unavailable during this step**

### Step 9.1: Check Current Stripe Configuration

```bash
# Check if Stripe is configured
grep "STRIPE_" /Users/romeovalentine/djdannyhecticb/.env
```

If empty or blank, **SKIP this phase** (not configured).

### Step 9.2: Generate New Stripe API Keys (if configured)

1. Go to **Stripe Dashboard**: https://dashboard.stripe.com/
2. Navigate to **Developers** → **API Keys**
3. Find **Secret Key** (starts with `sk_live_` or `sk_test_`)
4. Click **Reveal test key** (if test mode)
5. If using Live keys, follow Account security best practices:
   - Enable API key restrictions
   - Request new live keys via Stripe support if needed

### Step 9.3: Archive Old Stripe Keys

1. If rotating **publishable keys** (safe but good practice):
   - Update `STRIPE_PUBLISHABLE_KEY`
   - Update `VITE_STRIPE_PUBLISHABLE_KEY`

2. If rotating **secret keys** (CRITICAL):
   - Stripe doesn't allow key rotation directly
   - Instead: **RESTRICT access** to old key in Stripe Dashboard
   - Request new API keys through Stripe Account settings

### Step 9.4: Update Vercel Environment

```bash
vercel env add STRIPE_SECRET_KEY
# Paste new key (only if new key issued)

vercel env add STRIPE_PUBLISHABLE_KEY
# Paste new key
```

### Step 9.5: Test Stripe Integration

```bash
# Test with new keys
curl -s https://api.stripe.com/v1/charges \
  -u "YOUR_NEW_SECRET_KEY:" \
  | jq '.error'
```

Should return null (no error) or valid response.

### Step 9.6: Verify Payments Work

1. Create a test payment
2. Verify transaction in Stripe Dashboard
3. **DOCUMENT**: "Stripe Keys - ROTATED ✓"

---

## PHASE 10: FINAL VERIFICATION (15 minutes)

### Step 10.1: Verify All Secrets Updated

```bash
# Create verification checklist
cat > /tmp/verify_rotation.sh << 'EOF'
#!/bin/bash

echo "=== SECRET ROTATION VERIFICATION ==="

ENV_FILE="/Users/romeovalentine/djdannyhecticb/.env"

# Check that old secrets are NOT in file
echo "Checking for old secret patterns..."

# These should NOT return results
grep -i "plit8kpi986o5vhleoadlmfs7bpa92h3" $ENV_FILE && echo "ERROR: Old Google Client ID found!" || echo "✓ Old Google Client ID not found"
grep -i "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" $ENV_FILE && echo "ERROR: Old Google Secret found!" || echo "✓ Old Google Secret not found"
grep -i "AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8" $ENV_FILE && echo "ERROR: Old YouTube API Key found!" || echo "✓ Old YouTube API Key not found"
grep -i "6j2q6mwwjtxn2l1sfnux1hp6yxgumt" $ENV_FILE && echo "ERROR: Old Twitch ID found!" || echo "✓ Old Twitch ID not found"
grep -i "fiv5vbp5j3eu3izmfl3ox6rvcilcy" $ENV_FILE && echo "ERROR: Old Twitch Secret found!" || echo "✓ Old Twitch Secret not found"
grep -i "Blackgrapeman10" $ENV_FILE && echo "ERROR: Old DB password found!" || echo "✓ Old DB password not found"

echo ""
echo "=== VERIFICATION COMPLETE ==="
EOF

chmod +x /tmp/verify_rotation.sh
/tmp/verify_rotation.sh
```

### Step 10.2: Test All Critical Flows

- [ ] Google OAuth login (complete flow)
- [ ] Database connection (run migration or query)
- [ ] JWT token generation and validation
- [ ] YouTube API detection (if configured)
- [ ] Twitch API detection (if configured)
- [ ] Event listing (Ticketmaster)
- [ ] AI features (if enabled)
- [ ] Booking form submission
- [ ] Contact form submission
- [ ] Payment processing (if Stripe enabled)

### Step 10.3: Monitor Application Logs

```bash
# Check Vercel deployment logs
vercel logs production --lines 100

# Look for errors like:
# - "authentication failed"
# - "invalid API key"
# - "unauthorized"
# - "token signature invalid"
```

### Step 10.4: Run Security Audit

```bash
# Check .env is NOT in git history
git log --all --full-history -- ".env" | head -1
# Should return nothing (no results)

# Verify .gitignore blocks .env
grep -E "^\.env$|^\.env\." /Users/romeovalentine/djdannyhecticb/.gitignore
# Should show multiple matches
```

### Step 10.5: Document Rotation Completion

```bash
cat > ~/.rotation-backup-$(date +%Y%m%d)/ROTATION_COMPLETE.txt << 'EOF'
ROTATION COMPLETED: $(date -u +%Y-%m-%dT%H:%M:%SZ)

All exposed secrets have been rotated:
- [X] Google OAuth (Client ID & Secret)
- [X] YouTube Data API Key
- [X] Twitch Client Secret
- [X] PostgreSQL Password
- [X] JWT Secret
- [X] Google AI API Key
- [X] Ticketmaster API Key
- [X] Stripe Keys (if applicable)

All tests passed:
- [X] OAuth login working
- [X] Database accessible
- [X] API integrations functional
- [X] No old secrets in .env
- [X] No old secrets in git history
- [X] Vercel deployment successful

Next Steps:
1. Delete backup file: ~/.rotation-backup-$(date +%Y%m%d)/
2. Review git logs for any accidental commits
3. Enable MFA on all connected services
4. Schedule quarterly rotation reviews
EOF

echo "✓ Rotation Complete - See ~/.rotation-backup-$(date +%Y%m%d)/ROTATION_COMPLETE.txt"
```

---

## PHASE 11: CLEANUP & SECURITY HARDENING (10 minutes)

### Step 11.1: Verify .env is Not in Git

```bash
# Comprehensive check for .env in git
git log --diff-filter=D --summary | grep delete | grep ".env"
git ls-tree -r HEAD | grep ".env"

# Should return NO results
```

### Step 11.2: Verify .gitignore is Correct

```bash
cat /Users/romeovalentine/djdannyhecticb/.gitignore | grep -A2 "Environment variables"
```

Should show:
```
.env
.env.local
.env.*.local
```

### Step 11.3: Create .env.example for Team

Ensure `/Users/romeovalentine/djdannyhecticb/.env.example` exists with all keys **but NO values**:

```bash
# Verify .env.example exists
ls -la /Users/romeovalentine/djdannyhecticb/.env.example

# It should NOT contain:
grep -i "plit8kpi986o5vhleoadlmfs7bpa92h3\|AIzaSyBGSh5G9yb8\|Blackgrapeman10\|fiv5vbp5j3eu3izmfl3ox6rvcilcy" \
  /Users/romeovalentine/djdannyhecticb/.env.example
# Should return NO results
```

### Step 11.4: Enable MFA on All Connected Services

For each service, enable MFA if available:

- **Google Cloud**: https://console.cloud.google.com/ → Account settings → Security → 2-Step Verification
- **Twitch**: https://www.twitch.tv/settings/security → Two-Factor Authentication
- **Stripe**: https://dashboard.stripe.com/ → Account settings → Security
- **Supabase**: https://app.supabase.com/ → Settings → Authentication
- **Vercel**: https://vercel.com/account/security → Enable 2FA

### Step 11.5: Secure Backup Files

```bash
# Secure backup directory
chmod 700 ~/.rotation-backup-$(date +%Y%m%d)
chmod 600 ~/.rotation-backup-$(date +%Y%m%d)/*

# Optional: Encrypt backup
tar czf ~/.rotation-backup-$(date +%Y%m%d).tar.gz ~/.rotation-backup-$(date +%Y%m%d)/
openssl enc -aes-256-cbc -in ~/.rotation-backup-$(date +%Y%m%d).tar.gz -out ~/.rotation-backup-$(date +%Y%m%d).tar.gz.enc -k "PASSWORD"

# Remove unencrypted backup
rm -rf ~/.rotation-backup-$(date +%Y%m%d)/
```

### Step 11.6: Review Admin Emails Configuration

```bash
grep "ADMIN_EMAILS" /Users/romeovalentine/djdannyhecticb/.env

# Should show email(s) for administrators
# Example: ADMIN_EMAILS=djdannyhecticb@gmail.com
```

### Step 11.7: Update Secret Storage Documentation

Document where secrets should be stored going forward:

```
APPROVED STORAGE LOCATIONS:
✓ Vercel Environment Variables (production)
✓ .env.local (local development only)
✓ Encrypted password manager (team sharing)
✓ Supabase Secrets (backend only)

FORBIDDEN LOCATIONS:
✗ Git repository
✗ .env file in repo
✗ Code comments
✗ Slack/Discord messages
✗ Email
✗ Unencrypted files
```

---

## EMERGENCY PROCEDURES

### Emergency Revert Procedure

If rotation fails critically:

```bash
# 1. Restore backup
cp ~/.rotation-backup-$(date +%Y%m%d)/.env.backup /Users/romeovalentine/djdannyhecticb/.env

# 2. Redeploy with old secrets
cd /Users/romeovalentine/djdannyhecticb
vercel --prod

# 3. Document incident
echo "ROTATION FAILED - REVERTED TO OLD SECRETS" >> ~/.rotation-backup-$(date +%Y%m%d)/ROTATION_LOG.txt
echo "Reason: ___________________" >> ~/.rotation-backup-$(date +%Y%m%d)/ROTATION_LOG.txt
echo "Reverted at: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> ~/.rotation-backup-$(date +%Y%m%d)/ROTATION_LOG.txt

# 4. Alert team
# Send: "ROTATION FAILED - System reverted to previous configuration"

# 5. Investigate root cause
# Check Vercel logs for specific errors
```

### If Authentication Fails After Rotation

```bash
# Check Vercel logs
vercel logs production --lines 200 | grep -i "error\|fail\|invalid\|unauthorized"

# Look for specific error:
# - "Invalid OAuth credentials" → Re-check Google Cloud Console
# - "Database connection refused" → Check DATABASE_URL password
# - "Invalid JWT" → Check JWT_SECRET consistency

# Common fixes:
# 1. Verify .env was properly saved
# 2. Check Vercel env vars match .env
# 3. Ensure no trailing spaces in secrets
# 4. Check quote characters (use single quotes for secrets)
# 5. Wait 30-60 seconds for Vercel to rebuild
```

### If Database Connection Fails

```bash
# Test database password directly
psql postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres \
  -c "SELECT 1;"
  
# If fails: "password authentication failed"
# → Return to Supabase and reset password again

# If connection times out:
# → Check IP whitelist in Supabase settings
# → Ensure Vercel is whitelisted (should be automatic)
```

### If OAuth Continues to Fail

```bash
# Verify redirect URIs match exactly
# In Google Cloud Console:
# 1. Check: APIs & Services → Credentials
# 2. Click OAuth Client ID
# 3. Verify Authorized Redirect URIs include:
#    - https://djdannyhecticb.vercel.app/api/auth/google/callback

# Common issues:
# - Protocol mismatch (http vs https)
# - Domain mismatch (typo in URL)
# - Preview URLs not configured for Vercel preview deployments
```

---

## POST-ROTATION SECURITY HARDENING

### 1. Schedule Quarterly Reviews

Add calendar reminders:
- [ ] May 2026 - Current rotation (completed)
- [ ] August 2026 - Q3 review
- [ ] November 2026 - Q4 review
- [ ] February 2027 - Q1 review

### 2. Document Secret Lifecycle

For each secret, track:
- Date created
- Date rotated
- Reason for rotation
- Who performed rotation
- Approval required: Yes/No

### 3. Implement Secret Versioning

Consider using:
- **AWS Secrets Manager** (for advanced teams)
- **HashiCorp Vault** (enterprise solution)
- **1Password Business** (team password manager)
- **Vercel Secrets** (current solution, adequate)

### 4. Enable Audit Logging

```bash
# Ensure all login attempts are logged
# Monitor:
# - Failed login attempts (should be rare)
# - New API key usage
# - Database connection patterns

# Configure Supabase to log auth events
# Configure Vercel to track environment variable access
```

### 5. Create Incident Response Plan

Document for future incidents:
- Who to notify (team members, stakeholders)
- How to detect secret exposure
- Steps to take within first 24 hours
- Communication templates
- Legal/compliance notifications required

---

## VERIFICATION CHECKLIST - FINAL

Before marking rotation as complete:

### Authentication & Authorization
- [ ] Google OAuth login works
- [ ] Admin emails configuration still valid
- [ ] User sessions not broken
- [ ] JWT tokens being generated correctly
- [ ] Token validation working

### API Integrations
- [ ] YouTube channel detection works
- [ ] Twitch channel detection works
- [ ] Ticketmaster events loading
- [ ] Google AI API responding
- [ ] All endpoints return 2xx (not 401/403)

### Database
- [ ] Application can read from database
- [ ] Application can write to database (bookings, etc.)
- [ ] No "password authentication failed" errors
- [ ] Connection pooling working
- [ ] Migrations executed successfully

### Deployment
- [ ] Vercel build succeeded
- [ ] No environment variable errors
- [ ] All secrets properly redacted in logs
- [ ] Preview deployments also work
- [ ] Production domain accessible

### Security
- [ ] No old secrets in .env
- [ ] No old secrets in git history
- [ ] .env.example has no actual values
- [ ] .gitignore properly blocks .env files
- [ ] MFA enabled on all service accounts
- [ ] No secrets in code comments

### Documentation
- [ ] Rotation documented in ROTATION_CHECKLIST.md
- [ ] Backup securely stored
- [ ] Incident response plan updated
- [ ] Team notified of completion
- [ ] Recovery procedures documented

---

## SUPPORT & ESCALATION

### If You Get Stuck

| Issue | Action |
|-------|--------|
| Google OAuth not working | Check Google Cloud Console → Credentials → OAuth settings |
| Database won't connect | Verify password has no special chars that need escaping, test with psql |
| Vercel deployment fails | Check build logs: `vercel logs production` |
| API keys not recognized | Ensure no leading/trailing spaces in .env |
| Session issues | Clear browser cache and cookies, verify JWT_SECRET matches |
| Payment processing broken | Check Stripe dashboard for API key restrictions |

### Escalation Contacts

- **Google Cloud Support**: https://support.google.com/cloud
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/docs/support
- **Stripe Support**: https://support.stripe.com/
- **Twitch Developers**: https://dev.twitch.tv/support

---

## SIGN-OFF

Rotation completed by: ________________________
Date: ________________________
Time completed: ________________________
Issues encountered: ________________________
All tests passed: [ ] Yes [ ] No

---

**IMPORTANT REMINDERS:**
- Always rotate secrets when team members leave
- Always rotate after any credential exposure
- Never commit .env files to git
- Never hardcode secrets in code
- Rotate quarterly as best practice
- Use environment variables exclusively for secrets
- Enable MFA on all service accounts

**This document is CONFIDENTIAL and contains sensitive information. Destroy securely when no longer needed.**
