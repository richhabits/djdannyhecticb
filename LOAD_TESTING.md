# Load Testing & Performance Validation Plan

## Performance Baselines (Current)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Dev startup time | ~3s | <5s | ✅ |
| Frontend build time | 30.8s | <60s | ✅ |
| Backend bundle size | 488.0kb | <2MB | ✅ |
| Healthcheck latency | <10ms | <50ms | ✅ |

---

## Load Testing Scenarios

### Scenario 1: Concurrent User Connections

**Objective**: Test WebSocket connections for live chat

```bash
# Install k6 (load testing tool)
brew install k6

# Run WebSocket load test
k6 run scripts/load-test-websocket.js --vus 100 --duration 60s
```

**Script**: `scripts/load-test-websocket.js`
```javascript
import ws from 'k6/ws';
import { check } from 'k6';

export let options = {
  vus: 100,        // 100 concurrent users
  duration: '60s', // 60 seconds
  thresholds: {
    'ws_connecting': ['p(95)<500'],  // 95% connect within 500ms
    'ws_session_duration': ['p(95)<30000'], // Keep alive 30s
  },
};

export default function () {
  let url = 'ws://localhost:3000/api/live/chat';
  let res = ws.connect(url, function (socket) {
    socket.on('open', () => {
      check(socket.status, { 'status is 101': (r) => r === 101 });
      socket.send(JSON.stringify({ type: 'join', channel: 'test' }));
    });

    socket.on('message', (data) => {
      check(data, { 'message received': (d) => d.length > 0 });
    });

    socket.on('close', () => console.log('Disconnected'));
  });

  check(res, { 'status is 101': (r) => r.status === 101 });
}
```

**Success Criteria**:
- ✅ 100 concurrent connections established
- ✅ Messages delivered within 100ms
- ✅ No connection drops under load
- ✅ CPU usage < 70%
- ✅ Memory stable (no leaks)

---

### Scenario 2: API Throughput

**Objective**: Test TRPC endpoint performance under load

```bash
k6 run scripts/load-test-api.js --vus 50 --duration 120s
```

**Script**: `scripts/load-test-api.js`
```javascript
import http from 'k6/http';
import { check, group, sleep } from 'k6';

export let options = {
  vus: 50,           // 50 concurrent users
  duration: '120s',  // 2 minutes
  rampUp: '30s',     // Ramp up over 30 seconds
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // Response times
    'http_req_failed': ['rate<0.01'],  // <1% error rate
  },
};

export default function () {
  group('Public APIs', () => {
    // Events endpoint
    let eventRes = http.get('http://localhost:3000/api/trpc/events.upcoming');
    check(eventRes, {
      'events status 200': (r) => r.status === 200,
      'events response < 300ms': (r) => r.timings.duration < 300,
    });
    sleep(1);

    // System health
    let healthRes = http.get('http://localhost:3000/api/trpc/system.health');
    check(healthRes, {
      'health status 200': (r) => r.status === 200,
      'health response < 100ms': (r) => r.timings.duration < 100,
    });
    sleep(1);

    // Analytics tracking
    let trackRes = http.post('http://localhost:3000/api/track', 
      JSON.stringify({ event: 'test_event', props: {} }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(trackRes, {
      'track status 200': (r) => r.status === 200,
      'track response < 200ms': (r) => r.timings.duration < 200,
    });
  });
}
```

**Success Criteria**:
- ✅ 95% of requests < 500ms
- ✅ 99% of requests < 1000ms
- ✅ Error rate < 1%
- ✅ Throughput > 100 requests/sec
- ✅ No timeouts

---

### Scenario 3: Database Load

**Objective**: Test database performance with concurrent queries

```bash
k6 run scripts/load-test-db.js --vus 25 --duration 60s
```

**Script**: `scripts/load-test-db.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 25,         // 25 concurrent queries
  duration: '60s',
  thresholds: {
    'http_req_duration': ['p(99)<2000'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function () {
  // Complex query: events with filtering
  let queryRes = http.get(
    'http://localhost:3000/api/trpc/events.search?input=' + 
    encodeURIComponent('{"query":"London","limit":50}')
  );
  check(queryRes, {
    'query status 200': (r) => r.status === 200,
    'query response < 1000ms': (r) => r.timings.duration < 1000,
  });
  sleep(1);
}
```

**Success Criteria**:
- ✅ Database handles 25 concurrent queries
- ✅ Query response < 2 seconds (p99)
- ✅ No connection pool exhaustion
- ✅ Database CPU < 80%

---

### Scenario 4: Spike Testing

**Objective**: Test behavior during sudden traffic spikes

```bash
k6 run scripts/load-test-spike.js
```

**Script**: `scripts/load-test-spike.js`
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp to 10 users
    { duration: '30s', target: 100 },  // Jump to 100 (spike)
    { duration: '30s', target: 10 },   // Drop back to 10
    { duration: '30s', target: 0 },    // Stop
  ],
  thresholds: {
    'http_req_duration': ['p(99)<1500'],
    'http_req_failed': ['rate<0.05'],
  },
};

export default function () {
  let res = http.get('http://localhost:3000/api/trpc/events.upcoming');
  check(res, {
    'spike test status': (r) => r.status === 200,
  });
  sleep(1);
}
```

**Success Criteria**:
- ✅ Recovers from spike within 60 seconds
- ✅ Response times < 1.5s during spike
- ✅ No cascading failures
- ✅ Auto-scaling triggered (if applicable)

---

### Scenario 5: Stress Testing

**Objective**: Find breaking point

```bash
# Gradually increase load until failure
k6 run scripts/load-test-stress.js
```

**Script**: `scripts/load-test-stress.js`
```javascript
export let options = {
  stages: [
    { duration: '10s', target: 50 },   // Warm up
    { duration: '10s', target: 100 },
    { duration: '10s', target: 200 },
    { duration: '10s', target: 500 },
    { duration: '10s', target: 1000 }, // Stress
    { duration: '10s', target: 0 },    // Cool down
  ],
  thresholds: {
    'http_req_failed': ['rate<0.5'],  // Stop if >50% fail
  },
};

export default function () {
  let res = http.get('http://localhost:3000/api/trpc/events.upcoming');
  check(res, { 'status ok': (r) => r.status === 200 });
}
```

**Expected Results**:
- Breaking point: ~500-1000 concurrent users
- At breaking point: 50% errors, 5+ second latencies
- Recovery: Complete recovery within 2 minutes of load reduction

---

## Performance Optimization Targets

### Frontend Performance
```bash
# Run Lighthouse audit
npm run lighthouse

# Expected scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >90
# - SEO: >90
```

### Backend Performance
```bash
# Profile response times
curl -w "@/tmp/profile.txt" https://staging.djdannyhecticb.com/api/trpc/events.upcoming

# Check bottlenecks
npm run profile
```

### Database Query Optimization
```bash
# Analyze slow queries
railway run npm run db:analyze-slow-queries

# Check indexes
railway run psql -c "SELECT * FROM pg_stat_user_indexes"
```

---

## Monitoring During Tests

```bash
# Terminal 1: Run test
k6 run scripts/load-test-api.js

# Terminal 2: Monitor server
railway logs -f

# Terminal 3: Monitor resources
watch -n 1 'ps aux | grep "node\|postgres"'

# Terminal 4: Database monitoring
railway run psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Test Report Template

```markdown
# Load Test Report - [Date]

## Test Configuration
- Scenario: [Name]
- Duration: [Time]
- Concurrent Users: [Count]
- Target URL: [URL]

## Results
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Avg Response Time | XXms | <500ms | ✅/❌ |
| p95 Response Time | XXms | <500ms | ✅/❌ |
| p99 Response Time | XXms | <1000ms | ✅/❌ |
| Error Rate | X% | <1% | ✅/❌ |
| Throughput | XXX req/s | >100 req/s | ✅/❌ |
| Peak Memory | XXMB | <1GB | ✅/❌ |
| Peak CPU | XX% | <80% | ✅/❌ |

## Issues Found
1. [Issue description]
   - Severity: High/Medium/Low
   - Impact: [Description]
   - Fix: [Proposed fix]

## Recommendations
1. [Optimization recommendation]
2. [Scaling recommendation]
3. [Monitoring recommendation]

## Sign-Off
- [ ] Performance targets met
- [ ] Ready for production
```

---

## Recommended Load Testing Schedule

1. **Before Staging**: Light smoke tests (10 VUs, 1 min)
2. **In Staging**: Full suite (30-120 min)
3. **Weekly**: Regression tests (10 min)
4. **Pre-Production**: Stress tests (30 min)

---

## Resources

- k6 Documentation: https://k6.io/docs
- Railway Monitoring: https://railway.app/dashboard/observability
- Performance Best Practices: https://nextjs.org/learn/seo/performance

