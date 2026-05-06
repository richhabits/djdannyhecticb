# Railway Deployment Guide - DJ Danny Hectic B Backend

## Overview

This guide provides step-by-step instructions to deploy the Node.js backend to Railway (railway.app).

**Status**: Backend code is production-ready for Railway deployment.

---

## Prerequisites

### Account & Access
- Railway account (free tier available at https://railway.app)
- GitHub account with access to `https://github.com/richhabits/djdannyhecticb`
- Environment variables prepared (see Environment Variables section below)

### Project Structure (Verified)
- **Build Command**: `pnpm build`
- **Start Command**: `pnpm start`
- **Build Output**: `dist/index.mjs`
- **Runtime**: Node.js 18+ (Railway defaults to latest)
- **Package Manager**: pnpm 10.4.1

---

## Deployment Steps

### Step 1: Create Railway Project

1. Go to https://railway.app/dashboard
2. Click **"New Project"** → Select **"Deploy from GitHub"**
3. Select GitHub repo: `richhabits/djdannyhecticb`
4. Railway will auto-detect the `railway.json` configuration
5. Click **"Deploy"**

**Expected**: Railway clones the repo and begins the build process.

---

### Step 2: Configure Environment Variables

Railway will auto-populate some variables from `railway.json`. You must add the following to the Railway project dashboard under **"Variables"**:

#### Required (Critical)

```
NODE_ENV=production
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require
JWT_SECRET=[generate-strong-secret-min-32-chars]
GOOGLE_CLIENT_ID=223520511634-plit8kpi986o5vhleoadlmfs7bpa92h3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

#### Payment & Commerce (Required for checkout)

```
STRIPE_SECRET_KEY=sk_live_[your-key]
STRIPE_PUBLISHABLE_KEY=pk_live_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-key]
PAYPAL_CLIENT_ID=[client-id]
PAYPAL_CLIENT_SECRET=[secret]
PAYPAL_MODE=live
```

#### Email & Notifications (Recommended)

```
EMAIL_SERVICE_PROVIDER=sendgrid
EMAIL_API_KEY=SG.[your-key]
EMAIL_FROM_ADDRESS=noreply@djdannyhectic.com
NOTIFICATIONS_EMAIL=alerts@djdannyhectic.com
```

#### Streaming & Content (Optional)

```
YOUTUBE_DATA_API_KEY=AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8
YOUTUBE_CHANNEL_ID=UC72QyiDSnHnJAGXT0xyuCWA
TWITCH_CLIENT_ID=6j2q6mwwjtxn2l1sfnux1hp6yxgumt
TWITCH_CLIENT_SECRET=fiv5vbp5j3eu3izmfl3ox6rvcilcy
TWITCH_CHANNEL_NAME=djdannyhecticb
```

#### AI & Analytics (Optional)

```
GOOGLE_AI_API_KEY=AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8
GEMINI_MODEL=gemini-1.5-flash
GROQ_API_KEY=[key]
COHERE_API_KEY=[key]
TICKETMASTER_API_KEY=HoaPBhMHhjI2Lszbd5fv1Zp05OG5HIrY
```

#### CORS & Domain

```
CORS_ORIGINS=https://djdannyhecticb.vercel.app,https://djdannyhectic.com
```

#### Redis Caching (Optional but recommended for production)

```
REDIS_URL=redis://[user]:[password]@[host]:[port]
REDIS_HOST=[host]
REDIS_PORT=[port]
```

**Where to add**: Railway Project Dashboard → "Variables" tab → Add each environment variable

---

### Step 3: Verify Build & Deployment

1. Railway automatically triggers a build when you add environment variables
2. Watch the **Deployments** tab for build logs
3. Look for:
   - `pnpm install` ✓
   - `pnpm build` ✓
   - `dist/index.mjs` created ✓
   - Server starts on port 3000

**Status will show**: "Running" (green) when deployment is successful.

---

### Step 4: Get Live API URL

Once deployment is successful:

1. Go to Railway Project Dashboard
2. Click on the deployed service
3. Look for **"Public URL"** or **"Domain"** section
4. URL format: `https://djdannyhecticb-production-xxxx.railway.app`
5. Copy this URL — this is your live API endpoint

**Example**:
```
https://djdannyhecticb-production-abc123.railway.app
```

---

### Step 5: Test the API

Test that the backend is running:

```bash
# Health check endpoint
curl https://[railway-url]/api/health

# Expected response:
# { "status": "ok", "timestamp": "2026-05-05T10:30:00Z" }
```

---

## Environment Variables Reference

### Auto-Populated by railway.json
- `PORT=3000` (Railway sets automatically)
- `NODE_ENV=production`

### Must Set Manually

| Variable | Type | Example | Notes |
|----------|------|---------|-------|
| `DATABASE_URL` | Required | `postgresql://...` | Primary data store |
| `JWT_SECRET` | Required | 32+ random chars | Session signing key |
| `GOOGLE_CLIENT_ID` | Required | OAuth2 ID | Google login |
| `GOOGLE_CLIENT_SECRET` | Required | OAuth2 secret | Google login |
| `STRIPE_SECRET_KEY` | Required | `sk_live_...` | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Required | `whsec_...` | Payment webhooks |
| `PAYPAL_CLIENT_ID` | Recommended | PayPal ID | PayPal checkout |
| `EMAIL_API_KEY` | Recommended | SendGrid key | Email notifications |
| `CORS_ORIGINS` | Recommended | Vercel URL | Frontend domain |

---

## Build & Deployment Process

### Build Timeline
- **Total build time**: 2-5 minutes (first time)
- **Subsequent builds**: 1-2 minutes (dependency caching)

### Build Steps (Automated)
1. Clone from GitHub
2. Install dependencies: `pnpm install`
3. Build frontend: `vite build`
4. Bundle backend: `esbuild server/_core/index.ts --bundle --format=esm --outfile=dist/index.mjs`
5. Start server: `pnpm start` (runs `node dist/index.mjs`)

### What Happens
- Nixpacks detects pnpm and Node.js
- Runs `pnpm install` automatically
- Executes `pnpm build` from package.json
- Starts with `pnpm start` command

---

## Deployment Verification Checklist

- [ ] Repository connected to Railway
- [ ] All environment variables added
- [ ] Build completed without errors
- [ ] Deployment status shows "Running"
- [ ] Public URL generated
- [ ] Health check endpoint responds (HTTP 200)
- [ ] API calls work (test with real endpoint)
- [ ] Error logs show no critical issues

---

## Troubleshooting

### Build Fails: "pnpm not found"
**Solution**: Railway uses Nixpacks which auto-detects pnpm. If not detected:
1. Add a `nixpacks.toml` file (optional):
```toml
[providers]
pnpm = {}
```

### Deployment Fails: Missing Environment Variables
**Check**: 
1. DATABASE_URL must be valid PostgreSQL connection string
2. JWT_SECRET must be at least 32 characters
3. All API keys are correct (not expired)

### Health Check Failing (HTTP 500)
**Check logs**:
1. Railway Dashboard → Deployments → View Build Logs
2. Look for error messages in stderr
3. Common issues:
   - Missing DATABASE_URL
   - Invalid database connection
   - Missing required environment variables

### Port Conflicts
- Railway auto-assigns PORT=3000
- Server listens on `process.env.PORT` or defaults to 3000
- This is handled by the codebase ✓

---

## Next Steps (After Deployment)

1. **Update Frontend**: Update `VITE_API_URL` in Vercel to point to Railway API
2. **Configure Webhooks**: Update Stripe/PayPal webhook URLs to Railway endpoint
3. **Database Migrations**: If needed, run: `npm run db:push` in Railway console
4. **Monitor Performance**: Check Railway dashboard for metrics
5. **Set Up Alerts**: Configure alerts for build failures or memory issues

---

## Database Considerations

### PostgreSQL (Neon - Currently Used)
- Connection URL already in `.env`
- Railway will use the same DATABASE_URL in production
- Ensure firewall allows Railway IP ranges

### D1 (Cloudflare) - Alternative
- Not compatible with Railway (Cloudflare-only)
- Stick with PostgreSQL (Neon)

### Testing Database Connection
```bash
# In Railway console:
psql $DATABASE_URL -c "SELECT 1"
```

---

## Security Checklist

- [ ] JWT_SECRET is strong (min 32 chars, random)
- [ ] Database connection over SSL (sslmode=require in URL)
- [ ] API keys are not committed to Git
- [ ] CORS_ORIGINS restricted to your domains
- [ ] Stripe keys are production keys (sk_live_*, not sk_test_*)
- [ ] Environment variables are Railway-managed (not in code)

---

## Monitoring & Logs

### View Logs
- Railway Dashboard → Deployments → View Logs
- Look for:
  - Redis connection status ✓
  - Database connection ✓
  - API route registration ✓
  - Rate limiter status ✓

### Performance Monitoring
- Railway provides CPU, Memory, Network graphs
- Red deployment = crash or failure
- Green = running normally

---

## Rollback & Disaster Recovery

If deployment fails:
1. Railway keeps previous deployment available
2. Click "Rollback" on failed deployment
3. Previous version becomes active instantly
4. No data loss (database unaffected)

---

## FAQ

**Q: How often are deployments built?**
A: On every Git push to main/master. Use `railway up` CLI to trigger manual builds.

**Q: Can I have multiple environments?**
A: Yes! Create separate Railway projects for staging/production.

**Q: How do I run database migrations on Railway?**
A: Use Railway console: `pnpm db:push`

**Q: What if my build is too slow?**
A: Check for large dependencies. Vite build can be optimized with `vite --analyze`.

**Q: Is there a free tier?**
A: Yes! Railway offers $5/month free credits. Small APIs stay within free tier.

---

## Support Resources

- [Railway Docs](https://docs.railway.app)
- [Railway GitHub Integration](https://docs.railway.app/deploy/github)
- [Railway Environment Variables](https://docs.railway.app/deploy/environment-variables)
- [Project Repo](https://github.com/richhabits/djdannyhecticb)

---

**Last Updated**: 2026-05-05
**Backend Status**: Production Ready ✓
**Next Deployment**: Frontend configuration needed
