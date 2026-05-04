# SECURITY VERIFICATION & EMERGENCY PROCEDURES

**DJ DANNY HECTIC B - Secret Rotation Verification & Emergency Response**

Last Updated: 2026-05-03
Created: 2026-05-03

---

## PART 1: PRE-ROTATION VERIFICATION CHECKLIST

### Environment Check

Before beginning rotation, verify your environment:

```bash
# 1. Verify you're in the correct repository
pwd
# Should output: /Users/romeovalentine/djdannyhecticb

# 2. Check git status
git status
# Should show "clean — nothing to commit"

# 3. Verify .env file exists
ls -la .env
# Should exist with 600 permissions

# 4. Verify .gitignore is correct
grep "\.env" .gitignore
# Should show .env entries

# 5. Check Vercel CLI is installed
vercel --version
# Should show version number

# 6. Verify authentication to Vercel
vercel whoami
# Should show your Vercel account
```

### Service Access Check

Verify you can access all services that need secret rotation:

```bash
# Google Cloud Console
# 1. Visit https://console.cloud.google.com/
# 2. Verify you can see djdannyhecticb project
# 3. Check you have "Editor" or "Owner" role

# Vercel
# 1. Visit https://vercel.com/dashboard
# 2. Verify djdannyhecticb project visible
# 3. Check you have edit access

# Supabase
# 1. Visit https://app.supabase.com
# 2. Select djdannyhecticb project
# 3. Verify you can access Database Settings

# Twitch Developer Console
# 1. Visit https://dev.twitch.tv/console/apps
# 2. Verify djdannyhecticb application visible

# Ticketmaster Developer Portal
# 1. Visit https://developer.ticketmaster.com/
# 2. Verify API key visible
```

### Team Communication Check

```bash
# 1. Notify team member or stakeholder
# Message: "Starting secret rotation. System may be briefly unavailable. Expected duration: 45 min."

# 2. Set calendar reminder for post-rotation testing
# Reminder: 30 minutes after expected completion

# 3. Prepare rollback contact information
# Who to call if critical issue: _______________

# 4. Set up monitoring dashboard
# Open in browser: https://vercel.com/dashboard/djdannyhecticb
```

---

## PART 2: POST-ROTATION VERIFICATION CHECKLIST

### Immediate Tests (Within 5 Minutes)

#### Test 1: Google OAuth Login

```bash
# Step 1: Clear browser cache
# Chrome: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
# Firefox: Shift+Delete
# Safari: Develop → Clear Website Data

# Step 2: Visit application
# Go to: https://djdannyhecticb.vercel.app

# Step 3: Click "Login with Google"

# Expected Result: 
# ✓ Google login page loads
# ✓ Can grant permission
# ✓ Redirected back to app
# ✓ Successfully logged in

# If Failed: Check these
# - Google Cloud Console → Credentials → OAuth settings
# - Vercel env vars have new GOOGLE_CLIENT_ID and SECRET
# - Deployment completed successfully
```

#### Test 2: Database Connection

```bash
# From command line:
psql "postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres" \
  -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Expected Output:
# count
# ------
#    n  (number of tables)

# If Failed: Check these
# - Database password correct in Supabase
# - DATABASE_URL in Vercel matches exact format
# - No typos in host/port
# - Firewall/IP whitelist allows connections
```

#### Test 3: API Key Functionality

```bash
# YouTube API
curl -s "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true&key=YOUR_NEW_KEY" \
  | jq '.items[0].statistics.subscriberCount'

# Should return a subscriber count number

# Twitch API
curl -s -H "Client-ID: YOUR_CLIENT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.twitch.tv/helix/users?login=djdannyhecticb \
  | jq '.data[0].login'

# Should return: djdannyhecticb

# Ticketmaster API
curl -s "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_KEY&countryCode=GB&size=1" \
  | jq '.events[0].name'

# Should return an event name
```

#### Test 4: Application Functionality

**Test each feature in application**:

```
□ Login/Logout works
□ Booking form submits successfully
□ Contact form submits successfully
□ Event listings display
□ Live stream detection works (if applicable)
□ AI features respond (if applicable)
□ No 401/403 errors in browser console
□ No CORS errors
□ API calls succeed (check Network tab)
```

### Verification Tests (Within 1 Hour)

#### Test 5: Session Persistence

```bash
# 1. Log in to application
# 2. Wait 5 minutes without activity
# 3. Refresh page
# Expected: Still logged in, session valid

# 4. Close browser completely
# 5. Reopen and visit site
# 6. Check if still logged in (browser stored JWT)
# Expected: Either logged in (if Remember Me) or needs re-login

# If Sessions keep expiring:
# - Check JWT_SECRET matches in Vercel
# - Verify token expiration time in code
# - Check browser cookie settings
```

#### Test 6: Error Monitoring

```bash
# Check Vercel logs for errors
vercel logs production --lines 200

# Look for these patterns (should NOT appear):
# - "invalid key"
# - "authentication failed"
# - "unauthorized"
# - "token signature invalid"
# - "ECONNREFUSED" (database)
# - "connection refused"

# If any appear: 
# - Note exact error message
# - Check corresponding secret value
# - Verify in Vercel env vars
```

#### Test 7: Load Testing

```bash
# Make repeated requests to verify stability
# Run for 2-3 minutes

for i in {1..50}; do
  curl -s https://djdannyhecticb.vercel.app/api/health \
    -H "Authorization: Bearer YOUR_JWT_TOKEN" \
    -w "Status: %{http_code}\n"
done | sort | uniq -c

# Expected: All responses should be 200 OK
# Should NOT see: 401, 403, 500 errors
```

---

## PART 3: EMERGENCY PROCEDURES

### Emergency 1: OAuth Login Broken

**Symptoms**:
- Login button shows error
- Redirect fails
- "Invalid client" error message
- Blank page after clicking login

**Diagnosis** (5 minutes):

```bash
# Check Vercel environment variables
vercel env list | grep GOOGLE

# Check logs
vercel logs production --lines 50 | grep -i "oauth\|google\|error"

# Check Google Cloud Console
# 1. Go to https://console.cloud.google.com/
# 2. Check OAuth 2.0 Client ID configuration
# 3. Verify Authorized Redirect URIs
```

**Quick Fix**:

```bash
# Option 1: Verify secrets were saved to Vercel
vercel env add GOOGLE_CLIENT_ID
# (re-enter your value to confirm)

# Option 2: Re-check credentials in Google Cloud
# - Go to Credentials page
# - Copy Client ID and Secret again
# - Paste into Vercel

# Option 3: Deploy with force refresh
vercel --prod --force

# Option 4: Wait 2-3 minutes for propagation
# Vercel caches env vars
```

**If Still Broken** (Emergency Revert):

```bash
# Last resort: restore old secrets from backup
cp ~/.rotation-backup-$(date +%Y%m%d)/.env.backup .env

# Redeploy with old secrets
vercel --prod --force

# Verify login works again
# Then investigate root cause slowly

# Do NOT push broken credentials to git!
```

### Emergency 2: Database Connection Failed

**Symptoms**:
- "Cannot connect to database" error
- Booking form won't submit
- Contact form won't submit
- 500 errors on API endpoints
- "ECONNREFUSED" in logs

**Diagnosis** (5 minutes):

```bash
# Test password directly
psql "postgresql://postgres:PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres" \
  -c "SELECT 1;"

# If "password authentication failed":
# → Password is wrong, reset in Supabase

# If "connection timeout":
# → Firewall/IP whitelist issue

# If "connection refused":
# → Database server down (Supabase issue)

# Check Vercel logs
vercel logs production --lines 100 | grep -i "database\|postgres\|connection"
```

**Quick Fix**:

```bash
# Step 1: Verify password in Supabase
# 1. Go to https://app.supabase.com
# 2. Project → Settings → Database
# 3. Copy postgres role password
# 4. Build new DATABASE_URL

# Step 2: Update Vercel
vercel env add DATABASE_URL
# Paste: postgresql://postgres:CORRECT_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres

# Step 3: Wait for redeploy and test
# Wait 60 seconds for Vercel to rebuild
# Then test form submission
```

**If Still Broken**:

```bash
# Check database is actually running
# Go to https://app.supabase.com → Project
# Look for any warning banners
# Check Status page for incidents

# If Supabase is down:
# Contact support and wait

# If password might be wrong:
# Reset password from Supabase console and try again
```

### Emergency 3: JWT/Authentication Issues

**Symptoms**:
- "Invalid token" error
- "Token signature verification failed"
- Users logged out unexpectedly
- Session keeps resetting

**Diagnosis** (5 minutes):

```bash
# Check JWT_SECRET in Vercel
vercel env list | grep JWT_SECRET

# Check in logs for JWT errors
vercel logs production --lines 200 | grep -i "jwt\|token"

# Inspect JWT token in application
# 1. Open DevTools → Application → Cookies
# 2. Look for token or session cookie
# 3. Go to https://jwt.io
# 4. Paste token to decode
# 5. Verify it's valid format
```

**Quick Fix**:

```bash
# Option 1: Verify JWT_SECRET in Vercel matches
vercel env add JWT_SECRET
# Re-enter current value to confirm it was saved

# Option 2: Check token expiration
# If token was valid but now invalid:
# - Clear browser cookies
# - Log out and log in again
# - New token should be generated with new secret

# Option 3: Restart all sessions
vercel --prod --force
# Forces new build, invalidates all tokens
# Users will need to login again
```

**Communication**:

```bash
# If users are affected, notify them:
# "Applying security update. Your session will be reset. Please log in again."

# Post recovery:
# "Security update complete. Thank you for your patience."
```

### Emergency 4: API Key Issues

**Symptoms**:
- "Invalid API key" error
- "Unauthorized" from external API
- Feature stops working (YouTube, Twitch, Ticketmaster)
- 403 Forbidden errors

**Diagnosis** (5 minutes):

```bash
# Test API key directly
# YouTube
curl -s "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true&key=YOUR_KEY" | jq '.error'

# Twitch
curl -s -H "Client-ID: YOUR_KEY" https://api.twitch.tv/helix/users \
  | jq '.error'

# Ticketmaster
curl -s "https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_KEY&size=1" \
  | jq '.fault'

# Check Vercel logs for which API failed
vercel logs production --lines 100 | grep -i "youtube\|twitch\|ticketmaster"
```

**Quick Fix**:

```bash
# For each broken API:

# 1. Regenerate new key in service console
# 2. Test key works: curl (see test above)
# 3. Update in Vercel: vercel env add YOUTUBE_DATA_API_KEY
# 4. Redeploy: vercel --prod
# 5. Test feature in application
```

### Emergency 5: Complete Deployment Failure

**Symptoms**:
- "Deployment failed" in Vercel
- Application won't load
- 503 Service Unavailable
- Cannot access https://djdannyhecticb.vercel.app

**Diagnosis** (2 minutes):

```bash
# Check deployment status
vercel ls | head -5

# View failed deployment logs
vercel logs production --lines 500

# Common causes:
# - Environment variable missing/malformed
# - Build step failed
# - Invalid secret format
# - Missing dependency
```

**Emergency Revert**:

```bash
# Roll back to previous deployment
vercel rollback

# Or manually redeploy old version
git checkout HEAD~1
vercel --prod

# Then investigate what went wrong in new version
```

**Verification**:

```bash
# Once reverted, verify:
curl -s https://djdannyhecticb.vercel.app | head -20
# Should see HTML, not error

# Check status
vercel status
# Should show green ✓
```

---

## PART 4: MONITORING AFTER ROTATION

### Real-Time Monitoring (First Hour)

Set up continuous monitoring with these tools:

```bash
# Monitor Vercel logs in real-time
vercel logs production --follow

# Watch for:
# - ERROR entries (red)
# - 401/403 responses (auth failures)
# - 5xx errors (server failures)
# - Database connection failures
```

### Dashboard Monitoring (First Day)

```bash
# Vercel Analytics
# 1. Go to https://vercel.com/dashboard
# 2. Select djdannyhecticb
# 3. Analytics tab
# 4. Watch for:
#    - Error rate (should be < 1%)
#    - Response time (should be < 200ms)
#    - Bandwidth (should be normal)

# Google Cloud Console
# 1. Go to https://console.cloud.google.com/
# 2. APIs & Services → Credentials
# 3. Check usage of new OAuth credentials

# Supabase
# 1. Go to https://app.supabase.co
# 2. Project → Database → Logs
# 3. Watch for connection errors
```

### Alert Setup

**Recommended alerts**:

```bash
# Failed login attempts > 5 per minute
# - Indicates compromised secret or misconfiguration

# Database connections failing > 10% of requests
# - Indicates password issue

# API errors > 1% of requests
# - Indicates key issue

# Unusual API usage patterns
# - Indicates compromised key

# 5xx errors > 5 per minute
# - Indicates deployment issue
```

### Daily Checklist (For 7 Days After Rotation)

```
□ Day 1: No critical errors in logs
□ Day 2: User-reported issues addressed
□ Day 3: Verify no anomalous API usage
□ Day 4: Check third-party service dashboards
□ Day 5: Verify performance metrics normal
□ Day 6: Confirm no security incidents
□ Day 7: Mark rotation as complete, archive logs
```

---

## PART 5: TESTING PROCEDURES

### Security Test: Verify Old Secrets Don't Work

```bash
# After rotation, old secrets should be invalid

# Test old Google Client Secret (SHOULD FAIL)
curl -s -X POST "https://oauth2.googleapis.com/token" \
  -d "client_id=OLD_CLIENT_ID" \
  -d "client_secret=OLD_CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  | jq '.error'

# Should return: "invalid_client" or similar error

# Test old database password (SHOULD FAIL)
psql "postgresql://postgres:OLD_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres" \
  -c "SELECT 1;" 2>&1 | grep -i "password\|failed"

# Should show: "password authentication failed"
```

### Functional Test: Verify New Secrets Work

```bash
# Test new credentials work correctly

# Google OAuth
curl -s -X POST "https://oauth2.googleapis.com/token" \
  -d "client_id=NEW_CLIENT_ID" \
  -d "client_secret=NEW_CLIENT_SECRET" \
  -d "grant_type=client_credentials" \
  | jq '.access_token' | grep -q "."
# Should return non-empty access token

# Database
psql "postgresql://postgres:NEW_PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres" \
  -c "SELECT version();" | grep -i "postgres"
# Should show PostgreSQL version

# YouTube API
curl -s "https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true&key=NEW_KEY" \
  | jq '.items[0].statistics' | grep -q "viewCount"
# Should return statistics object
```

### Load Test: Verify Performance

```bash
# Simulate concurrent users with new secrets
# Using Apache Bench (ab) tool

ab -c 10 -n 100 https://djdannyhecticb.vercel.app/api/health

# Expected:
# - Requests per second: > 100
# - Failed requests: 0
# - Response time: < 200ms
```

---

## PART 6: ROLLBACK PROCEDURE

### If Rotation Must Be Aborted

```bash
# Step 1: Stop ongoing rotation (don't continue)

# Step 2: Restore from backup
cp ~/.rotation-backup-$(date +%Y%m%d)/.env.backup .env

# Step 3: Update Vercel with old credentials
# Manually update each env var back to previous value
vercel env add GOOGLE_CLIENT_ID
# Paste old value

# Step 4: Redeploy immediately
vercel --prod --force

# Step 5: Verify application works
# Test login, API calls, database access

# Step 6: Document incident
# Why was rollback needed?
# What will be different next time?
# Who needs to be notified?

# Step 7: Schedule retry
# When will we try rotation again?
# What will be fixed beforehand?
```

### If Critical System Broken After Rotation

```bash
# Immediate action: Revert to previous Vercel deployment
vercel rollback

# Verify website is back online
curl -s https://djdannyhecticb.vercel.app | head -5

# Notify team
# "Critical issue with rotation - reverted. Investigating..."

# Investigate root cause before retry
# - Check logs: vercel logs production --lines 500
# - Verify environment variables
# - Confirm credentials are correct
# - Test in staging first

# When root cause identified:
# - Fix the issue
# - Test again in staging
# - Retry rotation with corrected procedure
```

---

## PART 7: POST-ROTATION CLEANUP

### 24 Hours After Successful Rotation

```bash
# Step 1: Archive backup securely
tar czf ~/.rotation-backup-$(date +%Y%m%d).tar.gz \
  ~/.rotation-backup-$(date +%Y%m%d)/

# Step 2: Encrypt archive (optional but recommended)
gpg --symmetric ~/.rotation-backup-$(date +%Y%m%d).tar.gz
# When prompted, enter strong passphrase

# Step 3: Remove unencrypted files
rm -rf ~/.rotation-backup-$(date +%Y%m%d)/
rm ~/.rotation-backup-$(date +%Y%m%d).tar.gz

# Step 4: Store encrypted backup securely
# Copy to secure location (encrypted drive, cloud storage)
# Do NOT keep on laptop
```

### 7 Days After Successful Rotation

```bash
# Step 1: Verify no issues reported
# Check Slack/email for user reports
# All issues should be resolved by now

# Step 2: Confirm all services working
# Manually test critical paths one final time:
# - Login works
# - Bookings work
# - API calls work
# - No error logs

# Step 3: Update rotation calendar
# Schedule next rotation: Next 3 months

# Step 4: Document lessons learned
# What went well?
# What could be improved?
# Update procedure if needed
```

### 30 Days After Rotation

```bash
# Delete local backup after 30 days
rm ~/.rotation-backup-$(date +%Y%m%d).tar.gz.gpg

# Why 30 days?
# - Enough time to catch any delayed issues
# - Old secrets won't be useful anymore
# - Reduces security risk from backup file
```

---

## PART 8: CRITICAL CONTACT LIST

**Keep this information handy during rotation:**

| Service | Support Link | Emergency? | Contact |
|---------|--------------|-----------|---------|
| Google Cloud | support.google.com/cloud | Yes | Available 24/7 |
| Vercel | vercel.com/support | Yes | Available 24/7 |
| Supabase | supabase.com/support | Yes | Available 24/7 |
| Stripe | support.stripe.com | Yes | Available 24/7 |
| Twitch | dev.twitch.tv/support | No | Business hours |
| Ticketmaster | developer.ticketmaster.com/support | No | Business hours |

**Internal Contacts**:
- Tech Lead: ________________________
- DevOps: ________________________
- Team Slack: #djdannyhecticb-dev

---

## EMERGENCY QUICK REFERENCE

### If Login Broken: 
1. Check Google Cloud OAuth settings
2. Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel
3. Redeploy: `vercel --prod`
4. If not fixed in 5 min: `vercel rollback`

### If Database Broken:
1. Test password directly with psql
2. Check DATABASE_URL in Vercel (exact format)
3. Reset password in Supabase if needed
4. Redeploy: `vercel --prod`
5. If not fixed in 5 min: `vercel rollback`

### If API Keys Broken:
1. Test key directly with curl
2. Check service dashboard (YouTube, Twitch, etc.)
3. Regenerate key if expired
4. Update in Vercel
5. Redeploy: `vercel --prod`
6. If not fixed in 5 min: `vercel rollback`

### If Complete Deployment Broken:
1. Immediately: `vercel rollback`
2. Verify site is up: `curl https://djdannyhecticb.vercel.app`
3. Notify team
4. Investigate root cause in logs
5. Fix and retry when confident

---

**This document is CONFIDENTIAL - Keep secure and accessible only during rotation events.**
