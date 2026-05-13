# Staging Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Git branch up-to-date with main
- [ ] .env.staging configured with real values
- [ ] Database migrations verified
- [ ] Secrets configured in Railway staging project

## Staging Deployment Steps

### 1. Create Railway Staging Project

```bash
# Via Railway CLI
railway init --name djdannyhectic-staging
railway link

# Or via Dashboard: https://railway.app
# Create new project from template
```

### 2. Configure Environment Variables

```bash
# Copy all values from .env.staging into Railway project
railway variables set BASE_URL https://staging.djdannyhecticb.com
railway variables set DATABASE_URL "postgresql://..."
railway variables set JWT_SECRET "[64-char-secret]"
# ... continue for all vars in .env.staging
```

### 3. Deploy Backend

```bash
git checkout staging
git pull origin staging

# Push to Railway (if using Railway git integration)
git push railway staging:main

# Or via CLI:
railway up
```

### 4. Deploy Frontend (Vercel or Railway)

```bash
# Option A: Vercel (recommended for static SPA)
vercel --prod --scope richhabits-projects

# Option B: Railway
npm run build
railway deploy
```

### 5. Verify Deployment

```bash
# Health check
curl https://staging-api.djdannyhecticb.com/api/trpc/system.health

# Events endpoint
curl https://staging-api.djdannyhecticb.com/api/trpc/events.upcoming

# Frontend
open https://staging.djdannyhecticb.com
```

### 6. Configure Domain DNS

Point staging domain to Railway:
- `staging.djdannyhecticb.com` → Railway load balancer
- `staging-api.djdannyhecticb.com` → Railway backend (if separate)

### 7. SSL/TLS

Railway auto-provisions SSL certificates via Let's Encrypt. No manual setup required.

## Testing in Staging

### Critical Paths
1. **Auth Flow**
   - Register new user
   - Google OAuth login
   - Session persistence
   - Logout

2. **Payment Flow**
   - Create payment intent (Stripe sandbox)
   - Process test payment
   - Verify webhook handling

3. **Data Flow**
   - Events/Ticketmaster sync
   - User profile creation
   - Comment/message posting

4. **External Integrations**
   - YouTube webhook test
   - Spotify API sync
   - Analytics tracking

### Smoke Tests
```bash
# Run these in staging
npm run test:smoke -- --base-url https://staging.djdannyhecticb.com
```

## Rollback Plan

If staging deployment fails:

```bash
# Revert to last working commit
git revert <commit-hash>
railway deploy
```

## Monitoring Staging

- Check Railway dashboard for errors
- Monitor CPU/memory usage
- Review application logs: `railway logs`
- Set up alerts for critical errors

## Staging → Production Promotion

Once staging is validated:

1. Merge staging → main via PR
2. Tag release: `git tag v1.0.0-staging`
3. Deploy to production
4. Verify production health

## Troubleshooting

### Build Fails
- Check `railway logs`
- Verify Node.js version in railway.json
- Ensure all dependencies in package.json

### API Not Responding
- Check DATABASE_URL connectivity
- Verify environment variables are set
- Check CORS configuration

### Database Issues
- Run migrations: `railway run npm run db:push`
- Check PostgreSQL logs in Railway dashboard

## Quick Commands

```bash
# View logs
railway logs -f

# SSH into environment
railway shell

# Check variables
railway variables

# Redeploy
railway deploy

# Stop service
railway stop
```
