# Sentry Quick Reference Card

**For rapid setup and troubleshooting**

## 5-Minute Setup

```bash
# 1. Go to sentry.io and create 2 projects (React + Node.js)
# 2. Get two DSNs
# 3. Get auth token from Sentry API settings

# 4. Add to Vercel (Project Settings → Environment Variables)
VITE_SENTRY_DSN=https://key@org.ingest.sentry.io/123  # React
SENTRY_DSN=https://key@org.ingest.sentry.io/456       # Node.js
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_RELEASE=1.0.0

# 5. Deploy
git push origin main

# 6. Test (after deploy succeeds)
curl https://your-domain.com/api/test-error
```

## Environment Variables

| Variable | What | Example |
|----------|------|---------|
| `VITE_SENTRY_DSN` | React client | `https://key@org.ingest.sentry.io/react-123` |
| `SENTRY_DSN` | Node.js server | `https://key@org.ingest.sentry.io/node-456` |
| `SENTRY_AUTH_TOKEN` | API token | `sntrys_EyJpc...` |
| `SENTRY_ORG` | Org name | `my-company` |
| `SENTRY_PROJECT` | Project name | `my-app-backend` |
| `SENTRY_RELEASE` | Version | `1.0.0` |

## Common Commands

```bash
# Test error capture (development)
curl http://localhost:3000/api/test-error

# Test error capture (production)
curl https://your-domain.com/api/test-error

# Test message
curl http://localhost:3000/api/test-message

# Test unhandled rejection
curl http://localhost:3000/api/test-rejection

# View Sentry dashboard
# Go to: https://sentry.io/dashboard/
```

## Code Snippets

### Capture Error
```typescript
// Client
import { captureException } from "@/lib/sentry";
captureException(error);

// Server
import { captureServerException } from "@/server/_core/sentry";
captureServerException(error);
```

### Set User
```typescript
// Client
import { setSentryUser } from "@/lib/sentry";
setSentryUser(userId, email);

// Server
import { setServerUser } from "@/server/_core/sentry";
setServerUser(userId, email);
```

### Add Context
```typescript
// Client
import { setSentryTag, setSentryContext } from "@/lib/sentry";
setSentryTag("feature", "booking");
setSentryContext("booking", { bookingId });

// Server
import { setServerTag, setServerContext } from "@/server/_core/sentry";
setServerTag("feature", "booking");
setServerContext("booking", { bookingId });
```

### React Hook
```typescript
import { useSentryMonitoring } from "@/hooks/useSentryMonitoring";

function App() {
  useSentryMonitoring(); // Global error tracking
  return <YourApp />;
}
```

## Files to Know

| File | Purpose |
|------|---------|
| `/client/src/lib/sentry.ts` | Client initialization |
| `/server/_core/sentry.ts` | Server initialization |
| `/client/src/hooks/useSentryMonitoring.ts` | React hooks |
| `/docs/ERROR_TRACKING.md` | Full documentation |
| `/docs/SENTRY_SETUP_GUIDE.md` | Setup instructions |

## Dashboard Navigation

```
sentry.io/dashboard/
├── Issues
│   ├── Click issue → See details
│   ├── See stack trace
│   ├── See breadcrumbs
│   └── See affected users
│
├── Performance
│   ├── Slow endpoints
│   ├── Transaction times
│   └── Bottleneck analysis
│
├── Releases
│   ├── Compare errors across versions
│   └── Track regressions
│
└── Alerts
    ├── Slack notifications
    ├── Email alerts
    └── Alert rules
```

## Troubleshooting

### Errors not appearing?

```bash
# Check DSN is set
echo $VITE_SENTRY_DSN

# Check browser console for errors
# (F12 → Console tab)

# Check network tab
# (F12 → Network → filter by "sentry")

# Verify in development
pnpm dev
curl http://localhost:3000/api/test-error
```

### Source maps missing?

```bash
# Check SENTRY_AUTH_TOKEN is set
# Check SENTRY_ORG is correct
# Check SENTRY_PROJECT is correct
# Check SENTRY_RELEASE is set to version

# Verify upload in Sentry dashboard:
# Project Settings → Releases → [version] → Source Maps
```

### Too many errors?

```bash
# In /client/src/lib/sentry.ts
tracesSampleRate: 0.1  # Reduce from 0.5 to 0.1

# In /server/_core/sentry.ts
tracesSampleRate: 0.1  # Reduce from 0.5 to 0.1

# In Sentry → Project Settings → Data Privacy
# Add filters to ignore errors
```

## Slack Alerts Setup

```
1. Sentry Project → Integrations
2. Find "Slack" → Install
3. Select workspace and authorize
4. Choose channel for alerts
5. Go to "Alerts"
6. Create alert rule:
   - Condition: event.environment:production
   - Action: Post to Slack
```

## Performance Tuning

| Setting | Dev | Production | Notes |
|---------|-----|-----------|-------|
| `tracesSampleRate` | 1.0 | 0.5 | % of transactions |
| `replaysSessionSampleRate` | 1.0 | 0.1 | % of sessions |
| `replaysOnErrorSampleRate` | 1.0 | 1.0 | Always capture on error |

## Release Tracking

```bash
# Before deploying, update version
export SENTRY_RELEASE=1.0.1
git push origin main

# Vercel will automatically:
# - Build with new version
# - Upload source maps
# - Register release in Sentry

# In Sentry, you can now see:
# - Which version has errors
# - Errors per release
# - Regressions
```

## API Reference

### Client Functions
```typescript
initSentry()                          // Initialize
setSentryUser(id, email, username)    // Set user
clearSentryUser()                     // Clear user
setSentryTag(key, value)              // Add tag
setSentryContext(name, context)       // Add context
captureException(error, context)      // Capture error
captureMessage(msg, level)            // Capture message
getSentryEventId()                    // Get error ID
reportFeedback(title, message, ...)   // User feedback
```

### Server Functions
```typescript
initSentryServer()                    // Initialize
setServerUser(id, email, ip)          // Set user
clearServerUser()                     // Clear user
setServerTag(key, value)              // Add tag
setServerContext(name, context)       // Add context
captureServerException(error, ctx)    // Capture error
captureServerMessage(msg, level, ctx) // Capture message
addBreadcrumb(msg, category, level)   // Add breadcrumb
startTransaction(name, op)            // Start perf tracking
flushSentry(timeout)                  // Flush errors on shutdown
```

## When to Use What

| Scenario | Function | Example |
|----------|----------|---------|
| User logs in | `setSentryUser()` | After auth success |
| Error in component | `captureException()` | In catch block |
| Important event | `captureMessage()` | "Payment processed" |
| Debugging | `setSentryContext()` | Before async operation |
| Track action | `addBreadcrumb()` | User clicked button |
| Performance issue | `startTransaction()` | Slow API endpoint |

## Dashboard Tips

1. **Issues**: Sort by "Last Seen" to find current problems
2. **Performance**: Sort by "Apdex" to find worst endpoints
3. **Replays**: Watch session replay when error occurred
4. **Releases**: Compare errors between versions
5. **Alerts**: Set thresholds to avoid noise (e.g., >10 errors/min)

## Resources

- **Full Docs**: `/docs/ERROR_TRACKING.md`
- **Setup Guide**: `/docs/SENTRY_SETUP_GUIDE.md`
- **Sentry Docs**: https://docs.sentry.io
- **Status**: https://status.sentry.io

---

**Bookmark this page!** Control+D or Cmd+D to save
