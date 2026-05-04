# EMERGENCY REFERENCE CARD - SECRET ROTATION

**Keep this visible during rotation. Print and post at desk.**

---

## ROTATION TIMELINE

```
09:00 UTC  Start Preparation (30 min)
09:30 UTC  Google OAuth Rotation (15 min)
09:45 UTC  API Keys Rotation - YouTube, Twitch, Gemini, Ticketmaster (20 min)
10:05 UTC  Database Password Rotation (20 min)
10:25 UTC  JWT Secret Rotation (10 min)
10:35 UTC  Verification & Testing (15 min)
10:50 UTC  Complete!
```

---

## QUICK VERIFICATION TESTS

### Test 1: Google OAuth Login
```bash
# Go to: https://djdannyhecticb.vercel.app
# Click "Login with Google"
# Expected: Login works ✓ or shows error ✗
```

### Test 2: Database Connection
```bash
psql "postgresql://postgres:PASSWORD@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres" -c "SELECT 1;"
# Expected: Shows "1" or "password authentication failed"
```

### Test 3: Logs Check
```bash
vercel logs production --lines 50
# Expected: NO errors containing "invalid", "unauthorized", "failed"
```

---

## IF SOMETHING BREAKS

### OAuth Not Working
1. Check: `vercel env list | grep GOOGLE`
2. Check: Google Cloud Console → Credentials → OAuth settings
3. Fix: `vercel env add GOOGLE_CLIENT_ID` (re-enter value)
4. Redeploy: `vercel --prod`
5. Still broken? `vercel rollback`

### Database Not Working
1. Check: `vercel env list | grep DATABASE_URL`
2. Test: `psql postgresql://...` (try connecting directly)
3. Check: Supabase → Database → Reset password if needed
4. Fix: `vercel env add DATABASE_URL` (re-enter correct URL)
5. Redeploy: `vercel --prod`
6. Still broken? `vercel rollback`

### API Keys Not Working
1. Check: Service dashboard (YouTube, Twitch, Ticketmaster)
2. Verify: Key hasn't expired or been revoked
3. Test: `curl https://api.service.com?key=YOUR_KEY`
4. Fix: `vercel env add APIKEY_NAME` (re-enter new key)
5. Redeploy: `vercel --prod`

### Complete System Down
1. **EMERGENCY**: `vercel rollback` (revert to previous deploy)
2. Verify: `curl https://djdannyhecticb.vercel.app` returns HTML
3. Notify: Team that system is back online (on old secrets)
4. Investigate: What went wrong
5. Retry: When confident in the fix

---

## CRITICAL CONTACTS

| Service | Issue | Action |
|---------|-------|--------|
| Google Cloud | OAuth broken | https://console.cloud.google.com/credentials |
| Vercel | Deployment broken | `vercel logs production --lines 200` |
| Supabase | DB connection | https://app.supabase.com → Database |
| Stripe | Payment broken | https://dashboard.stripe.com/apikeys |

---

## COMMANDS YOU'LL NEED

```bash
# Check environment variables in Vercel
vercel env list

# Update an environment variable
vercel env add SECRET_NAME

# View logs (watch for errors)
vercel logs production --lines 200

# Redeploy
vercel --prod

# Emergency rollback
vercel rollback

# Test database
psql "postgresql://postgres:PASSWORD@host:5432/postgres" -c "SELECT 1;"

# Test API key
curl "https://www.googleapis.com/youtube/v3/channels?key=YOUR_KEY" | jq '.error'
```

---

## CHECKLIST DURING ROTATION

```
□ Phase 1: Preparation - Completed?
□ Phase 2: Google OAuth - Completed? Can log in?
□ Phase 3: YouTube API - Completed? Key works?
□ Phase 4: Twitch API - Completed? Key works?
□ Phase 5: Database Password - Completed? Connected?
□ Phase 6: JWT Secret - Completed? Auth works?
□ Phase 7: API Keys (Google AI, Ticketmaster) - Completed?
□ Phase 8: Verification - All tests passed?
□ Cleanup: Backup secured? Old secrets revoked?
```

---

## STATUS BOARD (Track Your Progress)

```
Start Time: ________
Current Phase: ________
Current Step: ________
Issues: ________
Time Spent So Far: ________
Est. Time Remaining: ________
Contact if Help Needed: ________
```

---

## DECISION TREE: WHAT TO DO WHEN SOMETHING BREAKS

```
System not working?
├─ Is login broken?
│  ├─ Yes → Check Google OAuth (step 1 above)
│  └─ No → Check other services
│
├─ Is database broken?
│  ├─ Yes → Check Database Password (step 1 above)
│  └─ No → Check other services
│
├─ Are API calls failing?
│  ├─ Yes → Check API Key in Vercel (step 1 above)
│  └─ No → Check authentication
│
└─ Is entire system down?
   ├─ Yes → RUN: vercel rollback (EMERGENCY!)
   └─ No → Investigate specific failure
```

---

## QUICK FIX CHECKLIST

**When a secret stops working:**

1. ☐ Verify it was saved to Vercel: `vercel env list | grep SECRET_NAME`
2. ☐ Verify the exact value matches what you entered
3. ☐ Check for typos or extra spaces
4. ☐ Test the secret directly (curl/psql)
5. ☐ If direct test fails: Secret is wrong, regenerate
6. ☐ If direct test works: Vercel not updated, re-add and redeploy
7. ☐ If still failing: Check .env file is being used

---

## SECRET QUICK REFERENCE

| Secret | Storage | Status | Rotated Date |
|--------|---------|--------|--------------|
| GOOGLE_CLIENT_ID | Vercel | [ ] | ___________ |
| GOOGLE_CLIENT_SECRET | Vercel | [ ] | ___________ |
| YOUTUBE_DATA_API_KEY | Vercel | [ ] | ___________ |
| TWITCH_CLIENT_SECRET | Vercel | [ ] | ___________ |
| DATABASE_URL | Vercel | [ ] | ___________ |
| JWT_SECRET | Vercel | [ ] | ___________ |
| GOOGLE_AI_API_KEY | Vercel | [ ] | ___________ |
| TICKETMASTER_API_KEY | Vercel | [ ] | ___________ |

---

## REMEMBER

✓ Test EVERYTHING after each change
✓ Document each phase completion
✓ Take screenshots of errors
✓ Don't skip verification steps
✓ Keep this card visible
✓ Have team contact handy
✓ Monitor logs after rotation
✓ Revoke old secrets last (not first!)

---

**EMERGENCY CONTACT: _________________________**

**Print this card and keep visible during rotation**
