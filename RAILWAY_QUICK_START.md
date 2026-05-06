# Railway Deployment - Quick Start (5 Minutes)

## TL;DR: Deploy Backend to Railway

### 1. Go to Railway.app
```
https://railway.app/dashboard
```

### 2. Create New Project
- Click **"New Project"** → **"Deploy from GitHub"**
- Select: `richhabits/djdannyhecticb`
- Click **"Deploy"**

### 3. Add Environment Variables
Railway dashboard → **"Variables"** tab → Add these:

```
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_z5oIdPSA2Oxk@ep-divine-leaf-abpjfgjl-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-strong-secret-minimum-32-characters-long-change-this
GOOGLE_CLIENT_ID=223520511634-plit8kpi986o5vhleoadlmfs7bpa92h3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
STRIPE_SECRET_KEY=sk_live_[your-key]
STRIPE_WEBHOOK_SECRET=whsec_[your-key]
PAYPAL_CLIENT_ID=[your-id]
PAYPAL_CLIENT_SECRET=[your-secret]
PAYPAL_MODE=live
EMAIL_API_KEY=SG.[your-key]
CORS_ORIGINS=https://djdannyhecticb.vercel.app
```

### 4. Wait for Build
- Watch **"Deployments"** tab
- Build takes 2-5 minutes (first time)
- Status changes to **"Running"** (green)

### 5. Get API URL
Once running:
- Click on deployment
- Copy **"Public URL"** (looks like `https://djdannyhecticb-production-xxxx.railway.app`)

### 6. Test It
```bash
curl https://[your-railway-url]/api/health
```

Expected response:
```json
{ "status": "ok" }
```

### 7. Update Vercel
In Vercel project settings, update:
```
VITE_API_URL=https://[your-railway-url]
```

---

## What Happens Automatically

✅ Code is cloned from GitHub
✅ Dependencies installed (`pnpm install`)
✅ Frontend built (`vite build`)
✅ Backend bundled (`esbuild dist/index.mjs`)
✅ Server starts on PORT 3000
✅ Public URL assigned automatically

---

## Required Secrets (Get From Email/Password Manager)

| Secret | Value | Where To Find |
|--------|-------|---------------|
| `JWT_SECRET` | 32+ random chars | Generate new: `openssl rand -hex 32` |
| `DATABASE_URL` | PostgreSQL connection | Neon dashboard |
| `STRIPE_SECRET_KEY` | `sk_live_*` | Stripe dashboard → Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` | Stripe dashboard → Webhooks |
| `PAYPAL_*` | From PayPal app | PayPal developer dashboard |
| `EMAIL_API_KEY` | SendGrid/Resend key | Email provider dashboard |
| `GOOGLE_CLIENT_SECRET` | OAuth secret | Google Cloud Console |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check Railway logs - usually missing env vars |
| Server won't start | DATABASE_URL is invalid or network blocked |
| 502 Bad Gateway | Server crashed - check logs in Railway dashboard |
| CORS errors | Add frontend URL to `CORS_ORIGINS` variable |

---

## Video Demo (If Needed)

Railway has auto-deployment tutorial at:
```
https://www.youtube.com/watch?v=example (search "Railway GitHub deployment")
```

---

## Status Indicators

| Status | What It Means | Action |
|--------|--------------|--------|
| 🟢 Running | All good, API is live | Use the public URL |
| 🟡 Building | Deployment in progress | Wait 2-5 minutes |
| 🔴 Failed | Build or runtime error | Check logs, fix variables |
| ⚫ Crashed | Server exited | Check logs, verify database |

---

**That's it! API is now live on Railway** 🚀

Full guide: See `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
