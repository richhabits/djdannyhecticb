/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

# Sentry Error Tracking & Monitoring

This document explains how error tracking is configured for djdannyhecticb using Sentry.

## Overview

Sentry is configured for comprehensive error monitoring across both client and server sides:

- **Client-side**: Captures React errors, JavaScript exceptions, and performance issues
- **Server-side**: Captures Node.js/Express errors, tRPC errors, and unhandled rejections
- **Performance Monitoring**: Tracks slow requests and performance metrics
- **Session Tracking**: Records user sessions for debugging
- **Breadcrumbs**: Maintains a trail of events leading up to errors

## Setup & Configuration

### 1. Create a Sentry Project

1. Go to [sentry.io](https://sentry.io)
2. Sign up or log in
3. Create a new project
4. Select "React" for the frontend project (this generates a client DSN)
5. Optionally create a separate "Node.js" project for the backend (generates a server DSN)

### 2. Get Your DSNs

After creating your project, you'll receive:

- **Client DSN**: For browser error tracking (looks like `https://key@domain.ingest.sentry.io/123456`)
- **Server DSN**: For Node.js error tracking (same format as client)

### 3. Configure Environment Variables

#### Development

Create a `.env.local` file with:

```bash
SENTRY_DSN=https://your-client-key@your-sentry-project.ingest.sentry.io/123456
VITE_SENTRY_DSN=https://your-client-key@your-sentry-project.ingest.sentry.io/123456
```

#### Production (Vercel)

Add these to Vercel Project Settings → Environment Variables (mark as "Sensitive"):

```bash
SENTRY_DSN=https://your-server-key@your-sentry-project.ingest.sentry.io/123456
VITE_SENTRY_DSN=https://your-client-key@your-sentry-project.ingest.sentry.io/123456
SENTRY_AUTH_TOKEN=sntrys_YOUR_TOKEN_HERE  # Generate from Sentry settings
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_RELEASE=1.0.0  # Update with each release
```

### 4. Get Sentry Auth Token (for source maps)

1. Go to [sentry.io settings](https://sentry.io/settings/account/api/auth-tokens/)
2. Create a new authentication token with scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Copy the token and set `SENTRY_AUTH_TOKEN` in Vercel

## Architecture

### Client-Side Integration

**File**: `/client/src/lib/sentry.ts`

Sentry is initialized in `main.tsx` BEFORE any other code runs:

```typescript
import { initSentry } from "./lib/sentry";
initSentry();  // Must be first!
```

**Features**:
- Captures unhandled exceptions
- Tracks performance (50% sample rate in production)
- Sessions tracking
- Console error/warning capture
- Replay on errors (for debugging)
- Automatic breadcrumbs

**Configuration**:
- Performance sample rate: 1.0 (100%) in dev, 0.5 (50%) in production
- Replay sample rate: 1.0 (100%) in dev, 0.1 (10%) in production
- Error sample rate: 1.0 (100%) always

### Server-Side Integration

**File**: `/server/_core/sentry.ts`

Sentry is initialized in `index.ts` BEFORE Express middleware:

```typescript
import { initSentryServer, getSentryErrorHandler, getSentryRequestHandler } from "./sentry";
const sentryHandlers = initSentryServer();

// Then use middleware early
app.use(sentryHandlers.requestHandler);
// ... other middleware ...
app.use(sentryHandlers.errorHandler);
```

**Features**:
- Captures unhandled exceptions
- Tracks request performance
- tRPC error integration
- Breadcrumb collection
- User context tracking
- Graceful shutdown with error flush

**Configuration**:
- Performance sample rate: 1.0 (100%) in dev, 0.5 (50%) in production
- Source maps: Automatic upload on Vercel deploy

### Error Boundary

**File**: `/client/src/components/ErrorBoundary.tsx`

Enhanced React Error Boundary that:
- Catches component rendering errors
- Sends errors to Sentry
- Shows error reference ID to users
- Allows copying error ID for support tickets
- Shows stack traces in development only

## Error Tracking Usage

### Capturing Errors

#### Client-Side

```typescript
import { captureException, captureMessage, setSentryUser } from "@/lib/sentry";

// Capture exceptions
try {
  // something
} catch (error) {
  captureException(error, { context: "user action" });
}

// Capture messages
captureMessage("Something interesting happened", "info");

// Set user context (e.g., after login)
setSentryUser(userId, email, username);

// Set custom tags
setSentryTag("feature", "booking");

// Report feedback
reportFeedback("Bug Report", "The booking button doesn't work", name, email);
```

#### Server-Side

```typescript
import {
  captureServerException,
  captureServerMessage,
  setServerUser,
  addBreadcrumb,
  setServerTag,
} from "@/server/_core/sentry";

// Capture exceptions
try {
  // something
} catch (error) {
  captureServerException(error, { userId: user.id, endpoint: "/api/booking" });
}

// Capture messages
captureServerMessage("Order processed successfully", "info");

// Add breadcrumbs
addBreadcrumb("User logged in", "auth", "info", { userId });

// Set user context
setServerUser(userId, email, ipAddress);

// Set tags
setServerTag("environment", "production");
```

### tRPC Error Integration

All tRPC errors are automatically captured in Sentry with:
- Error path
- Error type
- Error code
- Stack trace (in development)

No additional setup required.

## Testing

### Test Error Endpoints

Development and testing endpoints are available at:

- `GET /api/test-error` - Throws a test error
- `GET /api/test-message` - Sends a test message
- `GET /api/test-rejection` - Creates an unhandled promise rejection

**Example**:

```bash
# In development (automatically enabled)
curl http://localhost:3000/api/test-error

# In production (requires ENABLE_TEST_ERRORS=true)
curl https://djdannyhecticb.com/api/test-error
```

### Testing Client Errors

In development, you can test Sentry in the browser console:

```javascript
// Test error capture
throw new Error("Test error from browser");

// Test message capture
import { captureMessage } from '@/lib/sentry';
captureMessage("Test message from console", "warning");
```

## Dashboard & Alerts

### Accessing Sentry Dashboard

1. Go to [sentry.io](https://sentry.io)
2. Select your project
3. View real-time errors, trends, and performance

### Key Sections

- **Issues**: List of unique error types with frequency
- **Performance**: Request performance, transaction details
- **Releases**: Deploy tracking and error comparison
- **Alerts**: Notifications for new errors or spikes

## Setting Up Alerts

### Slack Integration

1. In Sentry, go to Settings → Integrations
2. Find and install "Slack"
3. Select the channel where alerts should go
4. Create alert rules:

**Example Alert Rules**:

1. **Critical Errors**: All errors from production
   - Condition: `event.environment:production is ERROR`
   - Action: Notify #alerts

2. **Error Spike**: More than 10 errors in 1 minute
   - Condition: `count() > 10 in 1m`
   - Action: Notify #alerts

3. **Performance Issues**: Response time > 1 second
   - Condition: `transaction.duration > 1000ms`
   - Action: Notify #dev-alerts

### Email Alerts

1. In Sentry, go to Project Settings → Alerts
2. Create new alert rule
3. Set conditions and notification email

**Recommended Setup**:

- Alert on new error types in production
- Alert on error threshold spikes (10+ errors in 5 min)
- Daily digest of top errors

## Performance Monitoring

### Viewing Performance Data

1. In Sentry, go to **Performance** tab
2. See transaction names and response times
3. Identify slow endpoints

### Sample Rates

Sentry samples performance data to reduce noise:

- **Client**: 50% of transactions in production (1.0 in dev)
- **Server**: 50% of transactions in production (1.0 in dev)

This is configured in `/client/src/lib/sentry.ts` and `/server/_core/sentry.ts`

### Custom Performance Tracking

```typescript
import { startTransaction } from "@/server/_core/sentry";

const transaction = startTransaction("payment-processing", "http.server");
try {
  // Process payment
} finally {
  transaction?.finish();
}
```

## Session Replay

Sentry can record user sessions (with privacy controls):

- **Masks sensitive data**: Passwords, credit cards, etc.
- **Blocks media**: Videos, images for privacy
- **Sample rate**: 100% in dev, 10% on errors in production

Replays are automatically captured when errors occur.

**To view a replay**:

1. Go to an error in Sentry
2. Scroll down to "Session Replay" section
3. Click to play the recording

## Release Tracking

Sentry can track errors across releases to identify regressions:

1. Set `SENTRY_RELEASE` env var (e.g., `1.0.0`)
2. Deploy to production
3. View errors grouped by release in Sentry dashboard

**Vercel Integration**:

When you deploy to Vercel with Sentry configured:
- Release version is automatically tracked
- Source maps are uploaded automatically
- Errors are associated with the specific release

## Source Maps

Source maps allow Sentry to show original code in errors (not minified):

### Automatic Upload (Vercel)

When deploying to Vercel, source maps are automatically uploaded if:
- `SENTRY_AUTH_TOKEN` is set
- `SENTRY_ORG` is set
- `SENTRY_PROJECT` is set
- `SENTRY_RELEASE` is set

### Manual Upload

To manually upload source maps:

```bash
# Install sentry CLI
npm install -g @sentry/cli

# Upload source maps
sentry-cli releases files upload-sourcemaps ./dist \
  --org your-org \
  --project your-project \
  --release 1.0.0
```

## Privacy & Data Handling

### Data Collected

By default, Sentry collects:

- Error messages and stack traces
- User IP addresses (anonymized)
- Browser/device information
- Page URLs and request paths
- Custom breadcrumbs

### Data NOT Collected (Default)

- Passwords
- Credit card numbers
- Authentication tokens
- Request bodies (unless explicitly added)
- User session data (unless enabled)

### Disabling Certain Data

To prevent collecting certain data:

1. In Sentry Project Settings → Data Privacy
2. Toggle data filters on/off
3. Set URL patterns to exclude

### GDPR Compliance

Sentry complies with GDPR:

- Data retention: 90 days (configurable)
- Right to deletion: Supported
- Data export: Available

For GDPR considerations:
1. Update Privacy Policy to mention Sentry
2. Add user consent toggle (if required)
3. Configure data retention in Sentry settings

## Troubleshooting

### Errors Not Appearing in Sentry

**Check**:

1. DSN is configured correctly
2. Environment variable is set
3. Network tab shows requests to Sentry
4. No errors in console blocking Sentry

**Debug**:

```javascript
// In browser console
import * as Sentry from "@sentry/react";
console.log("Sentry DSN:", Sentry.getClient()?.getOptions().dsn);
console.log("Last event ID:", Sentry.lastEventId());
```

### Too Many Errors Being Captured

**Solutions**:

1. Adjust sample rates in `/client/src/lib/sentry.ts`
2. Add error patterns to `ignoreErrors` list
3. Set up error grouping rules in Sentry

### Performance Traces Missing

**Check**:

1. `tracesSampleRate` is > 0
2. Performance integrations are enabled
3. Transaction names are unique

## Best Practices

1. **Capture Context**: Always include relevant context when capturing errors
2. **Set User ID**: Set user context after login for better debugging
3. **Use Tags**: Add tags to errors for filtering (e.g., `feature: "booking"`)
4. **Breadcrumbs**: Use breadcrumbs to track important events
5. **Release Tracking**: Update `SENTRY_RELEASE` with each deployment
6. **Alert Thresholds**: Set reasonable thresholds to avoid alert fatigue
7. **Review Regularly**: Check Sentry dashboard weekly for trends
8. **Test Before Deploy**: Test with `/api/test-error` before major releases

## Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Sentry React Guide](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Node Guide](https://docs.sentry.io/platforms/node/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)

## Support

For issues with Sentry:

1. Check [Sentry Status Page](https://status.sentry.io/)
2. Review [Sentry Community](https://discuss.sentry.io/)
3. Contact [Sentry Support](https://sentry.io/support/)

---

**Last Updated**: 2026-05-03

**Version**: 1.0.0

**Maintainer**: DJ Danny Hectic B Team
