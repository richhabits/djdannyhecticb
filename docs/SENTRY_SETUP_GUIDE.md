/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

# Sentry Setup Guide for DJ Danny Hectic B

Quick step-by-step guide to get Sentry error tracking running in production.

## Prerequisites

- Sentry account (free tier available at [sentry.io](https://sentry.io))
- Access to Vercel project settings
- About 10 minutes

## Step 1: Create Sentry Projects

### Frontend Project (React)

1. Go to [sentry.io/dashboard](https://sentry.io/dashboard/)
2. Click "Projects" → "Create Project"
3. Select platform: **React**
4. Give it a name: `djdannyhecticb-frontend`
5. You'll get a **DSN** that looks like: `https://key@your-org.ingest.sentry.io/123456`
6. **Copy this DSN** - you'll need it

### Backend Project (Node.js)

Repeat the same but:
3. Select platform: **Node.js**
4. Give it a name: `djdannyhecticb-backend`
5. **Copy this DSN** too

You now have two DSNs:
- `VITE_SENTRY_DSN` (for React client)
- `SENTRY_DSN` (for Node.js server)

## Step 2: Get Auth Token (for automatic source map upload)

1. Go to [sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)
2. Click "Create New Token"
3. Give it a name: `djdannyhecticb-vercel`
4. Select scopes:
   - ✓ `project:read`
   - ✓ `project:releases`
   - ✓ `org:read`
5. Click "Create Token"
6. **Copy the token** - it's only shown once!

## Step 3: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `djdannyhecticb` project
3. Go to Settings → Environment Variables
4. Add these variables (mark as "Production" and "Sensitive"):

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SENTRY_DSN` | `https://key@your-org.ingest.sentry.io/frontend-id` | React DSN |
| `SENTRY_DSN` | `https://key@your-org.ingest.sentry.io/backend-id` | Node.js DSN |
| `SENTRY_AUTH_TOKEN` | `sntrys_yourtoken...` | From Step 2 |
| `SENTRY_ORG` | `your-org-name` | From Sentry URL |
| `SENTRY_PROJECT` | `djdannyhecticb-backend` | Node project name |
| `SENTRY_RELEASE` | `1.0.0` | Update per release |

5. Click "Save"

## Step 4: Test It Works

### Deploy to Vercel

```bash
# Push to main/production branch
git push origin main
```

Vercel will automatically:
- Build your project
- Upload source maps to Sentry
- Deploy to production

### Test Error Endpoints

Once deployed, test that Sentry is receiving errors:

```bash
# Test server error
curl https://your-domain.com/api/test-error

# Test message capture
curl https://your-domain.com/api/test-message
```

### Check Sentry Dashboard

1. Go to [sentry.io/dashboard](https://sentry.io/dashboard/)
2. Select your project
3. You should see the test errors appear in real-time

## Step 5: Set Up Alerts (Optional but Recommended)

### Slack Integration

1. Go to [Sentry Project Settings](https://sentry.io/settings/org/projects/)
2. Select your project
3. Go to "Integrations"
4. Find "Slack" and click "Install"
5. Select your Slack workspace and authorize
6. Choose which channel to post alerts to

### Create Alert Rule

1. In Sentry, go to "Alerts"
2. Click "Create Alert Rule"
3. Configure:
   - **Name**: "Production Errors"
   - **Condition**: `event.environment:production AND event.level:error`
   - **Frequency**: Alert for every new issue
   - **Action**: Post to Slack channel `#alerts`
4. Save

**Recommended Alert Rules**:

1. **Critical Errors** (every new error in production)
2. **Error Spike** (>10 errors in 1 minute)
3. **Performance Issues** (response time >1s)

## Step 6: Configure Release Tracking (Optional)

To track errors across releases:

1. Update `SENTRY_RELEASE` in Vercel before each production deployment:

```bash
# Before deploying, update version
SENTRY_RELEASE=1.0.1  # Update version
```

2. In Sentry dashboard, you can now see errors grouped by release

## Verification Checklist

After setup, verify everything is working:

- [ ] Both projects created in Sentry
- [ ] Two DSNs configured in Vercel
- [ ] Auth token saved in Vercel
- [ ] `SENTRY_ORG` and `SENTRY_PROJECT` set
- [ ] Deployed to production
- [ ] Test errors appear in Sentry dashboard
- [ ] Slack integration working (optional)

## Troubleshooting

### Errors Not Appearing

**Check**:
1. DSNs are correct (no typos)
2. Environment variables are set in "Production"
3. Deployed after adding variables
4. Check browser Network tab for Sentry requests

### Too Many Errors

**Reduce noise**:
1. In `client/src/lib/sentry.ts`, reduce `tracesSampleRate`
2. In `server/_core/sentry.ts`, reduce `tracesSampleRate`
3. In Sentry Settings → Data Privacy, filter out errors

### Source Maps Not Uploading

**Check**:
1. `SENTRY_AUTH_TOKEN` is correct
2. `SENTRY_ORG` matches your org
3. `SENTRY_PROJECT` matches project name
4. `SENTRY_RELEASE` is set to a version number

## Commands Reference

### Test Error Endpoints (development)

```bash
# Test error capture
pnpm dev
curl http://localhost:3000/api/test-error

# Test message capture
curl http://localhost:3000/api/test-message

# Test unhandled rejection
curl http://localhost:3000/api/test-rejection
```

### Manual Source Map Upload

```bash
# Install CLI if needed
npm install -g @sentry/cli

# Upload source maps
sentry-cli releases files upload-sourcemaps ./dist \
  --org your-org \
  --project djdannyhecticb-backend \
  --release 1.0.0
```

## Dashboard Overview

Once set up, you'll see in Sentry:

| Section | What to Look For |
|---------|------------------|
| **Issues** | List of error types, click to see details |
| **Performance** | Slow endpoints, transaction times |
| **Releases** | Error trends across versions |
| **Replays** | Session recordings when errors occur |
| **Alerts** | Notification history |

## Next Steps

1. **Weekly Review**: Check Sentry dashboard for patterns
2. **Set Thresholds**: Adjust alert rules based on traffic
3. **Create Runbook**: Document how to respond to common errors
4. **Performance Monitoring**: Use performance data to optimize slow endpoints
5. **User Feedback**: Implement in-app feedback forms

## Useful Links

- [Sentry Docs](https://docs.sentry.io/)
- [React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Node.js Integration](https://docs.sentry.io/platforms/node/)
- [Slack Setup](https://docs.sentry.io/product/integrations/slack/)
- [Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)

---

**Time to Complete**: ~10 minutes

**Difficulty**: Easy

**Questions?** Check [docs/ERROR_TRACKING.md](./ERROR_TRACKING.md) for detailed documentation
