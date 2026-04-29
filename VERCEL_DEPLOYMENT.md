# Vercel Deployment Configuration

This document describes the production deployment configuration for DJ Danny Hectic B on Vercel.

## Architecture Overview

**Deployment Strategy**: Full-stack Express.js application deployed to Vercel

- **Frontend**: React/Vite SPA built to `dist/public/`
- **Backend**: Express.js server bundled to `dist/index.mjs`
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL (configured via DATABASE_URL)

## Build Process

The `pnpm build` command performs:

1. Vite frontend build → `dist/public/`
2. esbuild server bundling → `dist/index.mjs`
3. All static files in `dist/` are deployed

```bash
# Build command in package.json
"build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.mjs"
```

## vercel.json Configuration

The configuration includes:

### Build Settings
- **buildCommand**: `pnpm build` - Builds both frontend and backend
- **outputDirectory**: `dist/` - Both static assets and server bundle
- **installCommand**: `pnpm install --frozen-lockfile` - Deterministic installs

### Route Rewrites
Routes API calls to Express server and SPA routes to index.html:

```json
{
  "source": "/api/:path*",      → API calls to Express
  "source": "/sitemap.xml",     → SEO sitemap
  "source": "/robots.txt",      → Robots file
  "source": "/:path*"           → SPA fallback to index.html
}
```

### Security Headers
Automatically applied to all responses:

- `Strict-Transport-Security` - HSTS (1 year)
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-Frame-Options` - Prevents clickjacking
- `X-XSS-Protection` - Browser XSS filter

### Caching
- Static assets (CSS, JS, images) cached for 1 year (immutable)
- HTML served with no cache (always fresh)

### Cron Jobs
Optional hourly cron job support for background tasks:
```
GET /api/cron/hourly (every hour)
```

## Environment Variables

Set these in Vercel Project Settings → Environment Variables:

### Required (Critical)
```
DATABASE_URL              PostgreSQL connection string (kept secret)
JWT_SECRET               Strong random secret ≥32 characters (kept secret)
```

### Recommended (API Integrations)
```
STRIPE_SECRET_KEY        Stripe API secret key (kept secret)
STRIPE_PUBLISHABLE_KEY   Stripe publishable key
STRIPE_WEBHOOK_SECRET    Stripe webhook signing secret (kept secret)

OAUTH_SERVER_URL         OAuth server URL
VITE_OAUTH_PORTAL_URL    OAuth portal URL (public)
VITE_APP_ID              Application ID (public)

CORS_ORIGINS             Comma-separated list of allowed CORS origins
                         e.g., "https://djdannyhecticb.com,https://api.example.com"
```

### Optional (Features)
```
GOOGLE_PLACES_API_KEY    Google Places API key (for location features)

PAYPAL_CLIENT_ID         PayPal client ID
PAYPAL_CLIENT_SECRET     PayPal secret (kept secret)
PAYPAL_MODE              "sandbox" or "live"

OWNER_OPEN_ID            OAuth owner ID for admin features

BUILT_IN_FORGE_API_URL   Internal API URL
BUILT_IN_FORGE_API_KEY   Internal API key (kept secret)
```

## Setup Instructions

### 1. Connect Repository to Vercel
```bash
# Option A: CLI
vercel login
vercel link

# Option B: Web Console
# Go to https://vercel.com/import and connect GitHub repo
```

### 2. Configure Environment Variables

In Vercel Project Settings:

1. Go to **Settings → Environment Variables**
2. Add each variable with its value
3. Select scope: **Production** for production-only secrets
4. Mark sensitive variables as "Sensitive" (encrypted at rest)

**Minimal setup (just get running)**:
```
DATABASE_URL     your-postgres-url
JWT_SECRET       your-32-char-secret
CORS_ORIGINS     https://your-domain.com
NODE_ENV         production
```

### 3. Deploy

```bash
# Automatic (recommended)
# Push to GitHub and Vercel auto-deploys

# Or manual
vercel deploy --prod
```

### 4. Verify Deployment

After deployment succeeds:

```bash
# Health check
curl https://your-domain.com/api/health
# Expected: "ok"

# Database connectivity check
curl https://your-domain.com/api/ready
# Expected: "ready" (if database is configured)

# Frontend SPA test
curl https://your-domain.com/
# Expected: HTML page with React app
```

## Common Issues & Solutions

### Issue: "Error: Cannot find module 'X'"
**Cause**: Missing dependency in `package.json`
**Solution**: Add to dependencies and rebuild
```bash
pnpm add missing-package
git push  # Triggers Vercel rebuild
```

### Issue: "DATABASE_URL is not set"
**Cause**: Environment variable not configured
**Solution**: 
1. Set `DATABASE_URL` in Vercel Project Settings
2. Redeploy: `vercel deploy --prod`

### Issue: "CORS error in browser"
**Cause**: `CORS_ORIGINS` not configured
**Solution**: 
1. Set `CORS_ORIGINS=https://your-domain.com` in Vercel
2. Redeploy

### Issue: "Build fails with 'Cannot find esbuild'"
**Cause**: Node version mismatch
**Solution**: 
1. In Vercel Project Settings, set Node version to 20+
2. Rebuild: `vercel deploy --prod`

### Issue: "Static files not loading (404 errors)"
**Cause**: Build output not in `dist/` directory
**Solution**: 
1. Verify `vite build` creates `dist/public/`
2. Verify esbuild creates `dist/index.mjs`
3. Run locally: `pnpm build && ls -la dist/`

## Performance Optimization

### Asset Optimization
- Vite automatically minifies and optimizes builds
- CSS/JS/images hashed for cache-busting
- Source maps excluded from production

### Database Connection Pooling
PostgreSQL connection pooling is handled by the app's database configuration. Ensure your DATABASE_URL includes:
```
?sslmode=require&application_name=djdannyhecticb
```

### Edge Functions (Advanced)
For sub-100ms response requirements:
```json
{
  "functions": {
    "api/fast/**/*.ts": {
      "memory": 3008,
      "maxDuration": 30
    }
  }
}
```

## Monitoring & Logs

### View Logs
```bash
vercel logs --prod
```

### Monitor Performance
1. Vercel Dashboard → Deployments → Analytics
2. Check Web Vitals and response times

### Error Tracking
Configure error reporting:
- Add Sentry or similar APM tool
- Set `SENTRY_DSN` environment variable
- Errors automatically tracked

## Database Migrations

Migrations run automatically on startup via `server/_core/migrate.ts`:

```typescript
if (process.env.NODE_ENV === "production") {
  await runMigrations();  // Auto-runs on first deploy
}
```

For safe migrations:
1. Test locally: `pnpm dev`
2. Run migration: `pnpm db:push`
3. Deploy to Vercel

## Rollback Procedure

If deployment breaks production:

```bash
# Option A: Revert to last stable commit
git revert <bad-commit>
git push  # Auto-deploys

# Option B: Use Vercel Dashboard
# Settings → Deployments → Click previous stable deployment → Promote to Production
```

## Scaling Considerations

- **Tier**: Hobby (free) - suitable for development
- **Scale**: Pro tier recommended for production
- **Bandwidth**: Unlimited included
- **Build time**: 45 min/month free, 1 min additional = $1

For high-traffic sites, consider:
- Regional deployment (add to `vercel.json`)
- Database read replicas
- CDN caching headers

## Additional Resources

- [Vercel Express.js Guide](https://vercel.com/guides/using-express-with-vercel)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js Runtime on Vercel](https://vercel.com/docs/functions/serverless-functions/node-js)
- [PostgreSQL on Vercel](https://vercel.com/docs/storage/vercel-postgres)
