# Beatport Shop Integration - Complete Implementation

## 🎯 Overview

Full-stack Beatport v4 API integration for DJ Danny Hectic B's shop with:
- **Server-side only** token management (zero browser exposure)
- **Intelligent caching** (TTL-based, configurable per endpoint)
- **Revenue optimization** (click tracking, CTR analytics, affiliate-ready)
- **Production-grade UX** (loading states, error handling, mobile-first)
- **CI/CD quality gates** (TS error budget, security checks, build verification)

## 🏗️ Architecture

```
Frontend (React + tRPC)
    ↓ tRPC calls
Server (Express + tRPC Router)
    ↓ Cache check
Cache Layer (In-memory TTL)
    ↓ Cache miss
Token Manager (OAuth2)
    ↓ Authenticated request
Beatport API v4
```

## 📁 File Structure

```
server/lib/beatport/
├── cache.ts          # TTL caching system (15min-24h)
├── client.ts         # HTTP client with retry logic
├── router.ts         # tRPC endpoints (11 routes)
├── token.ts          # OAuth2 token manager
├── types.ts          # TypeScript definitions
├── index.ts          # Public exports
└── README.md         # Detailed API docs

client/src/
├── pages/
│   ├── BeatportShop.tsx      # Main discovery hub
│   ├── BeatportSearch.tsx    # Search interface
│   ├── BeatportChart.tsx     # Chart detail page
│   ├── BeatportGenre.tsx     # Genre browsing
│   └── AdminBeatport.tsx     # Admin dashboard
├── lib/analytics.ts          # Tracking utilities
└── examples/BeatportExamples.tsx  # Usage patterns

scripts/
└── ts-error-budget.sh        # TS error enforcement

.github/workflows/
└── ci.yml                    # Enhanced CI pipeline
```

## 🚀 Quick Start

### 1. Environment Setup

Add to `.env`:

```bash
BEATPORT_CLIENT_ID=your_client_id
BEATPORT_CLIENT_SECRET=your_client_secret
BEATPORT_API_BASE=https://api.beatport.com/v4
```

### 2. Server-Side Usage

```typescript
import { beatportGet } from '@/server/lib/beatport';

// Fetches with automatic caching + token refresh
const genres = await beatportGet('/catalog/genres/', { enabled: true });
```

### 3. Client-Side Usage

```typescript
import { trpc } from '@/lib/trpc';

function MyComponent() {
  const { data, isLoading } = trpc.beatport.genres.useQuery();
  // Data is fetched server-side, cached, and returned
}
```

## 📊 Caching Strategy

| Endpoint | TTL | Rationale |
|----------|-----|-----------|
| Genres | 24h | Rarely change |
| Sub-genres | 24h | Static metadata |
| Charts | 15min | Updated frequently |
| Chart tracks | 15min | Real-time rankings |
| Tracks | 30min | Balance freshness/load |
| Search | 5min | User-specific, varied |
| Health | 60s | Quick status checks |

## 🔒 Security Features

### 1. Token Management
- ✅ Tokens never sent to browser
- ✅ Automatic refresh on expiration (401)
- ✅ Token redaction in logs
- ✅ 30s safety margin before expiry

### 2. CI Security Checks
```bash
# Runs on every PR/push
pnpm audit --prod                    # Dependency vulnerabilities
grep -r "BEATPORT_CLIENT" client/    # Leaked secrets detection
```

### 3. Request Protection
- Rate limit handling (429 → exponential backoff)
- Retry logic (up to 3 attempts)
- Request timeout protection
- Error boundary wrapping

## 📈 Analytics & Tracking

### Event Types
1. `shop_chart_view` - Chart page views
2. `shop_track_view` - Track views
3. `shop_outbound_beatport_click` - External clicks
4. `shop_search` - Search queries
5. `shop_genre_view` - Genre navigation

### Tracking Example
```typescript
import { trackBeatportClick } from '@/lib/analytics';

// Tracks click + adds UTM params
trackBeatportClick('track', trackId, 'search-results');
window.open(beatportUrl, '_blank');
```

### Admin Dashboard
Access: `/admin/beatport` (admin role required)

**Metrics displayed:**
- Cache hit rate (hits/misses/total)
- Click-through rate (CTR%)
- 24h activity (searches, views, clicks)
- Top performing content
- Integration health status

## 🎨 UI Components

**Design Constraints:** ALL components reused from existing system.

### Shop Pages
- `/shop` - Discovery hub (charts + tracks grid)
- `/shop/search` - Debounced search (500ms)
- `/shop/charts/:id` - Chart detail with rankings
- `/shop/genres/:slug` - Genre-specific content

### Design System Compliance
```tsx
// ✅ Existing patterns used
<h1 className="text-9xl font-black uppercase">  // Brutalist header
<div className="border-foreground">             // Standard borders
<Button className="rounded-none">              // Sharp corners
<div className="aspect-square grayscale">      // Image treatment
```

## 🔧 CI/CD Pipeline

### Quality Gates (All must pass)
1. **TypeScript Error Budget** 
   - Baseline: 0 errors
   - Fails if errors increase
   - Auto-updates on improvements

2. **Lint Check**
   - `pnpm check` (type checking)
   - `pnpm format --check` (code style)

3. **Security Audit**
   - `pnpm audit --prod`
   - Secrets detection scan

4. **Build Verification**
   - `pnpm build` must succeed
   - No bundle errors

### Running Locally
```bash
# Establish baseline
bash scripts/ts-error-budget.sh

# Run full CI suite
pnpm check      # Type check
pnpm test       # Unit tests
pnpm audit      # Security
pnpm build      # Build verification
```

## 📋 API Endpoints

### Public Endpoints (via tRPC)
```typescript
trpc.beatport.genres.useQuery()
trpc.beatport.subGenres.useQuery({ genreId })
trpc.beatport.charts.useQuery({ genreId })
trpc.beatport.chartTracks.useQuery({ chartId })
trpc.beatport.tracks.useQuery({ genreId, bpmLow, bpmHigh })
trpc.beatport.search.useQuery({ q, type })
```

### Admin Endpoints
```typescript
trpc.beatport.cacheStats.useQuery()              // View cache metrics
trpc.beatport.clearCache.useMutation()           // Clear all cache
trpc.beatport.clearCache.useMutation({ pattern }) // Clear by pattern
trpc.beatport.resetCacheStats.useMutation()      // Reset counters
```

## 🐛 Troubleshooting

### "Beatport credentials not configured"
- Check `.env` file has `BEATPORT_CLIENT_ID` and `BEATPORT_CLIENT_SECRET`
- Restart server after adding credentials

### "Rate limit exceeded"
- Normal behavior under high load
- Retry with exponential backoff (automatic)
- Check admin dashboard for rate limit events

### Cache not working
- Verify cache stats in admin dashboard
- Check console logs for cache hit/miss
- Clear cache and refresh: `/admin/beatport`

### TypeScript errors in CI
```bash
# View error report
cat ts-errors-report.txt

# Update baseline (after fixing)
bash scripts/ts-error-budget.sh
```

## 🎯 Revenue Optimization

### 1. Centralized Link Tracking
All Beatport links go through `trackBeatportClick()`:
- Adds UTM parameters
- Logs click event
- Enables CTR analysis

### 2. Analytics-Driven Placement
Use admin dashboard to:
- Identify high-CTR content
- Optimize chart/track placement
- A/B test different layouts

### 3. Affiliate Integration (Ready)
```typescript
// Add affiliate ID when available
export function generateBeatportUrl(url, type, id) {
  url.searchParams.set('affid', 'YOUR_AFFILIATE_ID');
  return url.toString();
}
```

## 📝 Testing

### Unit Tests
```bash
# Beatport integration tests
pnpm test -- server/lib/beatport/beatport.test.ts

# Coverage: Token manager, HTTP client, cache
```

### Manual Testing Checklist
- [ ] /shop loads without errors
- [ ] Genre navigation works
- [ ] Search returns results
- [ ] Charts display correctly
- [ ] Outbound links open Beatport
- [ ] Admin dashboard loads
- [ ] Cache stats update
- [ ] No tokens in browser DevTools

## 📚 Additional Resources

- [Beatport API Docs](https://api.beatport.com/v4/docs)
- [tRPC Documentation](https://trpc.io)
- [Project Architecture](../README.md)

## 🚢 Deployment Checklist

- [ ] Set production Beatport credentials
- [ ] Configure affiliate ID
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Enable production logging
- [ ] Configure CDN caching
- [ ] Test rate limit handling
- [ ] Verify cache hit rates
- [ ] Monitor CTR metrics

## 🔮 Future Enhancements

- [ ] Database-backed analytics (replace localStorage)
- [ ] Real-time health monitoring endpoint
- [ ] A/B testing framework for CTR
- [ ] Performance budgets (Web Vitals)
- [ ] Prefetching for popular content
- [ ] Playlist curation features
- [ ] Track preview playback

---

**Status:** ✅ Production Ready  
**Last Updated:** 2026-02-09  
**Maintainer:** DJ Danny Hectic B / Hectic Radio
