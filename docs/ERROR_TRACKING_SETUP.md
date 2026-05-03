# Error Tracking & Monitoring Setup

**Status**: Implementation Ready  
**Last Updated**: 2026-05-03  
**Criticality**: MEDIUM

## Overview

This guide sets up production error tracking and monitoring for djdannyhecticb. We'll implement Sentry (free tier covers 5K events/month, sufficient for production monitoring).

---

## 1. Why Error Tracking?

**Production Issues Detection**:
- Real-time notifications of errors
- Stack traces with source maps
- User impact analysis
- Performance monitoring
- Session replay capabilities

**Without Error Tracking**, we would:
- Miss errors users encounter
- Have incomplete debugging information
- Rely on user bug reports only
- Lack performance baseline

**Selected Solution**: **Sentry** (Free tier sufficient for monitoring)

---

## 2. Sentry Setup

### 2.1 Create Sentry Project

1. **Sign Up** (if not already): https://sentry.io/signup/
   - Free tier: 5,000 events/month (sufficient)
   - No credit card required
   - Includes error tracking, releases, alerts

2. **Create Project**:
   - Dashboard → Projects → New Project
   - Platform: Node.js (backend) + React (frontend)
   - Team: Select or create
   - Alert Email: your-email@gmail.com

3. **Get DSN** (Data Source Name):
   - Settings → Projects → [Project Name] → Client Keys (DSN)
   - Format: `https://[key]@[domain].ingest.sentry.io/[project-id]`
   - Copy for next steps

### 2.2 Frontend (React) Setup

**Install Sentry SDK**:
```bash
pnpm add @sentry/react @sentry/tracing
```

**Initialize in main.tsx**:
```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Tracing
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions for replay
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
  
  // Release tracking
  release: process.env.VITE_APP_VERSION || "0.0.0",
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random plugins/extensions
    "chrome-extension://",
    "moz-extension://",
  ],
  
  // Allow list: Only track errors from our domain
  allowUrls: [
    /https?:\/\/djdannyhecticb\.com/,
    /https?:\/\/www\.djdannyhecticb\.com/,
    /https?:\/\/vercel\.app/,
  ],
});

// Capture unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  Sentry.captureException(event.reason);
});
```

**Add to Vercel env vars**:
```bash
VITE_SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project-id]
VITE_APP_VERSION=1.0.0
```

### 2.3 Backend (Node.js/Express) Setup

**Install Sentry SDK**:
```bash
pnpm add @sentry/node @sentry/integrations
```

**Initialize in server/index.ts**:
```typescript
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Early initialization (before other code)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({
      request: true,
      serverName: true,
      transaction: true,
    }),
    nodeProfilingIntegration(),
  ],
  
  // Tracing
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Profiling
  profilesSampleRate: 0.1,
  
  // Release
  release: process.env.APP_VERSION || "0.0.0",
  
  // Maximum error events per second
  maxBreadcrumbs: 50,
});

const app = express();

// Sentry middleware (MUST be early)
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Your routes here
app.use("/api", trpcHttpHandler);

// Error handler (MUST be last)
app.use(Sentry.Handlers.errorHandler());

// Final error handler
app.use((err, req, res, next) => {
  Sentry.captureException(err);
  res.status(500).json({ error: "Internal server error" });
});
```

**Add to Vercel env vars**:
```bash
SENTRY_DSN=https://[key]@[domain].ingest.sentry.io/[project-id]
APP_VERSION=1.0.0
```

### 2.4 Environment-Specific Configuration

**Development**: All errors captured locally
```bash
NODE_ENV=development
VITE_SENTRY_DSN=https://...  # Can use same or separate DSN
SENTRY_DSN=https://...
```

**Staging**: 10% of errors (sample rate)
```bash
NODE_ENV=staging
VITE_SENTRY_DSN=https://...
SENTRY_DSN=https://...
```

**Production**: 5% of errors (sample rate to manage quota)
```bash
NODE_ENV=production
VITE_SENTRY_DSN=https://...
SENTRY_DSN=https://...
```

---

## 3. Custom Error Handling

### 3.1 Capture Exceptions

```typescript
// Automatic (try/catch)
try {
  await processPayment();
} catch (error) {
  Sentry.captureException(error);
}

// Manual
Sentry.captureException(new Error("Custom error message"));

// With context
Sentry.captureException(error, {
  tags: {
    feature: "checkout",
    payment_provider: "stripe",
  },
  contexts: {
    order: {
      amount: 99.99,
      currency: "USD",
    },
  },
});
```

### 3.2 Capture Messages

```typescript
// Info level
Sentry.captureMessage("User clicked premium upgrade", "info");

// Warning level
Sentry.captureMessage("Payment retry #3 failed", "warning");

// Error level
Sentry.captureMessage("Database connection timeout", "error");
```

### 3.3 Add Breadcrumbs (Context)

```typescript
// Automatic breadcrumbs for navigation, console, HTTP
// Add custom breadcrumbs for app-specific events

Sentry.addBreadcrumb({
  category: "checkout",
  message: "User clicked checkout button",
  level: "info",
  data: {
    cart_total: 99.99,
    item_count: 3,
  },
});

Sentry.addBreadcrumb({
  category: "payment",
  message: "Stripe token created",
  level: "info",
  timestamp: Date.now() / 1000,
});
```

### 3.4 Add User Context

```typescript
// When user logs in
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
  ip_address: request.ip,
});

// When user logs out
Sentry.setUser(null);

// Or with additional data
Sentry.setUser({
  id: user.id,
  email: user.email,
  plan: "premium",
  signup_date: "2026-01-01",
});
```

### 3.5 Release Tracking

```typescript
// Set release after Sentry.init()
Sentry.setTag("version", "1.0.0");
Sentry.setTag("deployment", "vercel-prod-001");

// Or during init
Sentry.init({
  release: "my-app@1.0.0",
});
```

---

## 4. Integrations with Key Services

### 4.1 Stripe Integration

**Capture payment errors**:
```typescript
// In server/routers/paymentsRouter.ts
import * as Sentry from "@sentry/node";

export const createPaymentIntent = async (amount: number, userId: string) => {
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        userId,
      },
    });
    
    return intent;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        service: "stripe",
        operation: "create_payment_intent",
      },
      contexts: {
        stripe: {
          amount,
          currency: "usd",
        },
      },
    });
    throw error;
  }
};
```

### 4.2 Database Errors

**Capture query failures**:
```typescript
// In server/db.ts
import * as Sentry from "@sentry/node";

export async function getUser(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    return user;
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        service: "database",
        operation: "query_user",
      },
      contexts: {
        database: {
          query: "SELECT * FROM users WHERE id = $1",
          userId,
        },
      },
    });
    throw error;
  }
}
```

### 4.3 API Timeout Tracking

```typescript
// In server/_core/circuitBreaker.ts
import * as Sentry from "@sentry/node";

const startTime = Date.now();
try {
  const result = await fetch(url, { timeout: 5000 });
  const duration = Date.now() - startTime;
  
  Sentry.addBreadcrumb({
    category: "api",
    message: `API call to ${url}`,
    level: "info",
    data: {
      duration_ms: duration,
      status: result.status,
    },
  });
  
  return result;
} catch (error) {
  const duration = Date.now() - startTime;
  
  Sentry.captureException(error, {
    tags: {
      service: "external_api",
      timeout: error.message.includes("timeout"),
    },
    contexts: {
      api: {
        url,
        duration_ms: duration,
      },
    },
  });
  throw error;
}
```

---

## 5. Alerts & Notifications

### 5.1 Setup Alerts in Sentry

**1. Alert Rules**:
- Sentry Dashboard → Alerts → Create Alert Rule
- Condition: `error.exception` occurs more than 5 times in 5 minutes
- Action: Send email + Slack notification

**2. Critical Alert (Immediate)**:
- Condition: Error rate > 10% of all events
- Action: Email + Slack @channel

**3. Performance Alert**:
- Condition: API response time > 5 seconds
- Action: Email notification

### 5.2 Slack Integration

**Connect Sentry to Slack**:
1. Sentry → Settings → Integrations
2. Click "Slack"
3. Authorize workspace
4. Select channel: `#alerts` or `#errors`
5. Test integration

**Sample Alert**:
```
🚨 [Production] High Error Rate
djdannyhecticb (React)

Error: "Cannot read property 'id' of undefined"
Events: 23 in last 5 minutes
Users affected: 8

/checkout/confirm.tsx:45
  └─ processCheckout()

[View in Sentry] [Create Issue] [Ignore]
```

---

## 6. Source Maps Upload

**Why Source Maps?**
- Sentry needs them to show real source code (not minified)
- Enables proper stack traces with line numbers
- Required for debugging production builds

### 6.1 Automatic Upload via Build

**Option A: GitHub Actions** (recommended)

Create `.github/workflows/sentry-release.yml`:
```yaml
name: Sentry Release Upload

on:
  push:
    branches: [main, production]

jobs:
  sentry-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build
        run: |
          pnpm install
          pnpm build
      
      - name: Upload to Sentry
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
          sourcemaps: ./dist/public
          url_prefix: ~/
          version: ${{ github.sha }}
```

**Option B: Manual Upload** (for Vercel deployments)

```bash
# After build
pnpm add -D @sentry/cli

# In package.json build script
"build": "vite build && pnpm sentry:upload"

# Add script
"sentry:upload": "sentry-cli releases -o $SENTRY_ORG -p $SENTRY_PROJECT upload-sourcemaps dist/public --url-prefix '~'"
```

### 6.2 Get Sentry Token

```bash
# In Sentry Dashboard
# Settings → Account → Auth Tokens → New Token
# Permissions: release:write, sourcemaps:write

# Add to Vercel
vercel env add SENTRY_AUTH_TOKEN "sntrys_..." --prod
vercel env add SENTRY_ORG "your-org-name" --prod
vercel env add SENTRY_PROJECT "djdannyhecticb" --prod
```

---

## 7. Monitoring Dashboard

### 7.1 Key Metrics to Track

**Daily Dashboard Review**:

| Metric | Target | Action |
|--------|--------|--------|
| **Error Rate** | < 1% | Alert if > 5% |
| **New Errors** | < 5/day | Investigate immediately |
| **User Sessions with Errors** | < 5% | Alert if > 20% |
| **API Response Time (p95)** | < 1000ms | Alert if > 2000ms |
| **Database Query Time (p95)** | < 500ms | Alert if > 1000ms |

### 7.2 Create Custom Dashboard

```
Sentry Dashboard Widgets:

1. Top 5 Errors (Last 24h)
2. Error Trend (Last 7 days)
3. Affected Users (Last 24h)
4. Transaction Duration (p50, p95, p99)
5. Release Health (Adoption, Crash-free rate)
6. Custom Events (Feature usage, performance)
```

### 7.3 Weekly Review Process

**Every Monday 9 AM**:
1. Review error count and top errors
2. Check for new/critical issues
3. Review performance metrics
4. Create GitHub issues for actionable items
5. Document patterns/trends

---

## 8. Error Handling Best Practices

### 8.1 What to NOT Log

**Privacy**: Don't capture:
- Passwords
- API keys/secrets
- Full credit card numbers
- Social security numbers
- Personal health information

**Sentry Scrubbing**:
```typescript
Sentry.init({
  // ...
  beforeSend(event) {
    // Remove sensitive fields
    if (event.request?.cookies) {
      event.request.cookies = "[Redacted]";
    }
    return event;
  },
});
```

### 8.2 Error Sampling

**Prevent quota exhaustion**:

```typescript
// Sample 10% of errors in production
tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

// But 100% for certain high-priority errors
if (error.message.includes("payment")) {
  Sentry.captureException(error, {
    sample_rate: 1.0, // Always capture payment errors
  });
}
```

### 8.3 Error Grouping

Sentry auto-groups similar errors. Ensure proper grouping:

```typescript
// Good: Specific error with context
Sentry.captureException(error, {
  fingerprint: ["checkout", "payment-failed"],
});

// Bad: Generic error
Sentry.captureMessage("Something went wrong");
```

---

## 9. Cost Management

**Sentry Free Tier**: 5,000 events/month (includes errors, transactions, replays)

**Estimate for djdannyhecticb**:
- Frontend errors: ~100/month (10 users, rare errors)
- Backend errors: ~50/month (healthy infrastructure)
- Performance monitoring: ~500/month (0.1% sampling)
- **Total**: ~650/month (well under limit)

**Cost**: FREE (no payment required)

**Upgrade Path**: If exceeds 5K events/month, upgrade to Pro ($29/month or custom)

---

## 10. Implementation Checklist

- [ ] Create Sentry project and get DSN
- [ ] Add @sentry/react to frontend
- [ ] Add @sentry/node to backend
- [ ] Initialize Sentry in main.tsx
- [ ] Initialize Sentry in server/index.ts
- [ ] Add SENTRY_DSN to Vercel env vars
- [ ] Test error capture (throw test error)
- [ ] Set up Slack integration
- [ ] Configure alert rules
- [ ] Generate source maps
- [ ] Upload source maps to Sentry
- [ ] Test source map resolution
- [ ] Create monitoring dashboard
- [ ] Document error handling procedures
- [ ] Schedule weekly review process

---

## 11. Testing Error Capture

**Frontend Test**:
```typescript
// In console or test page
window.Sentry?.captureException(new Error("Test error"));

// Should appear in Sentry within 1 minute
```

**Backend Test**:
```bash
# Add test route
curl https://api.djdannyhecticb.com/api/test-error

# Should capture in Sentry
```

---

## 12. References

- [Sentry Documentation](https://docs.sentry.io/)
- [React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Node.js Integration](https://docs.sentry.io/platforms/node/)
- [Source Maps Guide](https://docs.sentry.io/product/source-maps/)
- [Alerting Documentation](https://docs.sentry.io/product/alerts/)

---

**Ownership**: DevOps / Platform Engineering  
**Status**: Ready for Implementation  
**Implementation Timeline**: 1-2 hours  
**Next Review**: 2026-08-03
