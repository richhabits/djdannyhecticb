# Staging Deployment Checklist

**Branch**: `staging`  
**Target**: Railway staging environment  
**Estimated Time**: 2-3 hours  
**Date**: 2026-05-13

---

## ✅ Pre-Deployment (Do These First)

### 1. Verify Local Setup
- [ ] Running on `staging` branch
- [ ] All changes committed
- [ ] `npm run build` passes locally
- [ ] Dev server starts without errors

```bash
# Verify
git branch
npm run build
NODE_ENV=development node --import tsx server/_core/index.ts
# (Check no errors, Ctrl+C to stop)
```

### 2. Create Railway Staging Project

**Via Railway Dashboard** (https://railway.app):
1. [ ] Go to your Railway account
2. [ ] Click "New Project"
3. [ ] Choose "Deploy from GitHub"
4. [ ] Select this repository
5. [ ] Select `staging` branch
6. [ ] Railway will auto-detect and configure

**Or via Railway CLI**:
```bash
railway login
railway init --name djdannyhectic-staging
railway link
```

### 3. Configure Environment Variables

**In Railway Dashboard**, add these variables:

```bash
# Core URLs
BASE_URL=https://staging.djdannyhecticb.com
FRONTEND_URL=https://staging.djdannyhecticb.com
API_URL=https://staging-api.djdannyhecticb.com

# Database (Railway creates this)
DATABASE_URL=postgresql://...

# Auth Secrets (generate with: openssl rand -base64 48)
JWT_SECRET=[64-CHAR-SECRET]
SESSION_SECRET=[64-CHAR-SECRET]
COOKIE_DOMAIN=.staging.djdannyhecticb.com

# OAuth - Google (from Google Cloud Console)
GOOGLE_CLIENT_ID=[YOUR-ID]
GOOGLE_CLIENT_SECRET=[YOUR-SECRET]
GOOGLE_CALLBACK_URL=https://staging.djdannyhecticb.com/api/oauth/google/callback

# Payments - Stripe SANDBOX
STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR-KEY]
STRIPE_SECRET_KEY=sk_test_[YOUR-KEY]
STRIPE_WEBHOOK_SECRET=whsec_test_[YOUR-SECRET]

# APIs
TICKETMASTER_API_KEY=[YOUR-KEY]
YOUTUBE_API_KEY=[YOUR-KEY]
GOOGLE_AI_API_KEY=[YOUR-GEMINI-KEY]

# Environment
NODE_ENV=staging
```

---

## 🚀 Deployment Steps

### Step 1: Push to Staging
```bash
git checkout staging
git pull origin staging
git push origin staging
```

### Step 2: Deploy
**Automatic**: Railway detects push and deploys  
**Manual**: `railway up`

### Step 3: Monitor
```bash
railway logs -f
# Watch for build completion and startup
```

### Step 4: Configure Domain (Optional)
```bash
# DNS CNAME:
# Name: staging
# Value: [railway-deployment-url]
```

### Step 5: Run Migrations
```bash
railway run npm run db:push
```

---

## ✅ Validation

### Health Check
```bash
curl https://staging.djdannyhecticb.com/api/trpc/system.health
# Expected: {"result":{"data":{"json":{"ok":true}}}}
```

### Events API
```bash
curl https://staging.djdannyhecticb.com/api/trpc/events.upcoming
# Expected: Array of events
```

### Frontend
```bash
open https://staging.djdannyhecticb.com
# Should load the app
```

---

## 📊 Success Criteria

- ✅ Deployment completes without errors
- ✅ Health check returns ok: true
- ✅ Events API returns data
- ✅ Frontend loads
- ✅ No errors in logs
- ✅ Response times <500ms

---

## 🔄 Rollback

```bash
git reset --hard [commit-hash]
git push -f origin staging
# Railway redeploys automatically
```

---

## 📞 Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Deploy fails | `railway logs -f` | Add missing env vars |
| App crashes | `railway logs -f` | Fix locally, push |
| Slow | `railway metrics` | Wait 30s after deploy |
| DNS not working | `dig staging.djdannyhecticb.com` | Verify CNAME in Railway |

