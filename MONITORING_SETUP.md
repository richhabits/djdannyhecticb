# Monitoring & Alerting Setup Guide
**Date**: 2026-05-01  
**Status**: Implementation Guide

## Overview
Comprehensive monitoring setup for djdannyhecticb.com to ensure 99.9% uptime, fast response times, and early detection of performance issues.

---

## 1. Sentry Integration (Error Tracking & Performance)

### Setup
```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Set environment variable
export SENTRY_DSN=your-dsn-here
```

### Integration in React
```typescript
// client/src/main.tsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new BrowserTracing(),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Integration in Backend
```typescript
// server/_core/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
});

// Wrap Express middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Key Alerts
- **Error Rate**: Alert if > 5 errors/minute
- **Critical Errors**: Alert immediately for critical severity
- **Performance**: Alert if p95 API response > 500ms
- **Database**: Alert on slow queries > 1000ms

---

## 2. Vercel Analytics (Native, Built-in)

### Enable in Vercel Dashboard
1. Go to Project Settings
2. Select "Analytics" tab
3. Enable "Web Analytics"

### Key Metrics
- Core Web Vitals (LCP, FID, CLS, INP, TTFB)
- Real User Monitoring
- Response times by route
- Edge cache hit rate

### Thresholds to Monitor
| Metric | Target | Alert If |
|--------|--------|----------|
| LCP | < 2.5s | > 3.5s |
| FID | < 100ms | > 150ms |
| CLS | < 0.1 | > 0.15 |
| INP | < 200ms | > 300ms |
| TTFB | < 600ms | > 800ms |

---

## 3. Uptime Monitoring

### Using Better Stack (Recommended)
```bash
# Health endpoint
GET https://djdannyhecticb.com/api/health

# Should return
{
  "status": "ok",
  "uptime": "99.95%",
  "timestamp": "2026-05-01T12:00:00Z"
}
```

### Configuration
- Check frequency: Every 60 seconds
- Timeout: 30 seconds
- Regions: US, EU, Asia
- Escalation: Page on-call after 5 minutes

### Alerts
- Downtime alert: Immediate
- Degraded performance: After 2 minutes
- High error rate: > 1% for 5 minutes

---

## 4. Database Monitoring

### Query Performance Tracking
```typescript
// server/lib/performanceMonitoring.ts (already implemented)
// Tracks all queries with metrics

// View slow queries
const slowQueries = monitor.getSlowQueries(100);
console.log(slowQueries);
```

### Key Queries to Monitor
| Query | Max Time | Alert |
|-------|----------|-------|
| chat_messages by session | 100ms | 200ms |
| donations by session | 150ms | 300ms |
| leaderboard | 200ms | 400ms |
| reactions by session | 100ms | 200ms |
| user stats | 150ms | 300ms |

### Connection Pool Monitoring
```typescript
// Monitor in server startup
setInterval(() => {
  console.log(`DB Pool Status: ${pool.status()}`);
}, 60000);
```

---

## 5. Real User Monitoring (RUM)

### Web Vitals Script
```typescript
// client/src/utils/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Also send to Sentry
  if (window.Sentry) {
    window.Sentry.captureMessage(`Web Vital: ${metric.name} = ${metric.value}ms`);
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Key Metrics
- LCP (Largest Contentful Paint)
- FID/INP (Interaction delays)
- CLS (Layout shifts)
- TTFB (Time to first byte)
- Network performance

---

## 6. API Response Time Monitoring

### Implementation in Backend
```typescript
// server/_core/monitoring.ts
import { measureAsync } from '../lib/performanceMonitoring';

router.get('/api/chat', async (req, res) => {
  const result = await measureAsync(
    'api:GET:/chat',
    () => getChatsQuery(req.query),
    { userId: req.user?.id }
  );
  res.json(result);
});
```

### Thresholds
- **Good**: < 200ms
- **Fair**: 200-500ms
- **Poor**: > 500ms

### Alert Conditions
- p95 > 400ms for 5 minutes
- p99 > 1000ms for any sample
- Error rate > 1% for any endpoint

---

## 7. Resource Usage Monitoring

### CPU & Memory
Monitor via Vercel or host provider:
- Alert if CPU > 80% for > 5 minutes
- Alert if Memory > 90% for > 5 minutes

### Database Connections
```typescript
// Monitor connection pool
setInterval(() => {
  const status = pool.status();
  if (status.idle === 0 && status.waiting > 5) {
    console.warn('Database connection pool exhausted');
    // Alert on-call
  }
}, 30000);
```

---

## 8. Load Test Results Logging

### After Running Load Tests
```bash
# Run k6 test
k6 run load-test/k6-scenario.js --vus 1000 --duration 10m \
  --summary-export=results.json

# Store results for comparison
cp results.json load-test/results-$(date +%Y%m%d-%H%M%S).json
```

### Track Metrics Over Time
- Response times under load
- Error rates
- Database performance
- Memory usage
- CPU utilization

---

## 9. Dashboard Setup

### Vercel Dashboard
- Deployments
- Web Vitals
- Response times by route
- Error trends

### Sentry Dashboard
- Error rate by issue
- Performance trends
- User impact
- Release tracking

### Custom Monitoring
Create a simple monitoring page:
```typescript
// server/routes/monitoring.ts
router.get('/monitoring/stats', (req, res) => {
  const metrics = monitor.getAllMetrics();
  const cache = queryCache.getStats();
  const health = {
    status: 'ok',
    metrics,
    cache,
    timestamp: new Date(),
  };
  res.json(health);
});
```

---

## 10. Alert Configuration

### Severity Levels
| Level | Response | Example |
|-------|----------|---------|
| Critical | Page immediately | Downtime, error rate > 10% |
| High | Within 15 min | p95 > 1s, 500 errors > 1%/min |
| Medium | Within 1 hour | p95 > 500ms, cache hit < 80% |
| Low | Weekly review | Minor performance dips |

### Escalation Policy
1. **Auto**: Alert on-call via phone
2. **5 min**: Page secondary
3. **15 min**: Page manager
4. **30 min**: Incident commander

---

## Implementation Checklist

### Phase 1: Basic Monitoring (Day 1)
- [ ] Sentry integration
- [ ] Vercel Web Analytics enabled
- [ ] Health endpoint created
- [ ] Basic uptime monitoring setup

### Phase 2: Advanced Monitoring (Week 1)
- [ ] Database query logging
- [ ] Real User Monitoring script
- [ ] API response time tracking
- [ ] Custom dashboards

### Phase 3: Alerting (Week 2)
- [ ] Configure Sentry alerts
- [ ] Set up on-call rotation
- [ ] Create runbooks for alerts
- [ ] Test alerting system

### Phase 4: Optimization (Ongoing)
- [ ] Review metrics daily
- [ ] Optimize slow queries
- [ ] Monitor bundle size
- [ ] Track Core Web Vitals trends

---

## Cost Estimates

| Service | Cost | Notes |
|---------|------|-------|
| Sentry | Free - $29/mo | 50K error events/mo free |
| Vercel | Included | Native Web Analytics |
| Better Stack | $10-30/mo | Uptime monitoring |
| Datadog | $15-30/mo | Optional, for advanced metrics |
| **Total** | **$25-60/mo** | Can use free tier initially |

---

## Resources

- [Sentry Docs](https://docs.sentry.io)
- [Vercel Analytics](https://vercel.com/docs/concepts/analytics)
- [Web Vitals](https://web.dev/vitals/)
- [Better Stack Docs](https://betterstack.com/docs)
- [k6 Load Testing](https://k6.io/docs/)
