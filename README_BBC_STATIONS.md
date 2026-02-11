# BBC Radio Stations - Health Check & Featured System

This document describes the BBC Radio station health checking and featuring system implementation.

## Overview

This system provides:
1. **Health probes** - Verify station streams are live
2. **Featured stations** - Pin/feature BBC stations (especially 1Xtra)
3. **Stream validation** - Check audio availability
4. **Playwright tests** - UI verification

## Components

### 1. Configuration

**`config/featuredStations.json`**
- Defines BBC stations to feature/pin
- BBC Radio 1Xtra has priority 1 (top feature)
- Supports fuzzy name matching

### 2. Health Probe Scripts

**`scripts/probe_streams.ts`**
- Checks station stream health
- Tests HTTP 200/206 + audio content-type
- Reports ok/bad counts
- Exits 1 if >10% bad

**Usage:**
```bash
# Check UK stations
API_BASE=https://api.radiohectic.com COUNTRY=GB node scripts/probe_streams.ts

# Check with custom limit
API_BASE=https://api.radiohectic.com LIMIT=1000 node scripts/probe_streams.ts
```

**`scripts/pin_featured.ts`**
- Identifies BBC stations from API
- Fuzzy matching for name variants
- Verifies BBC Radio 1Xtra is present

**Usage:**
```bash
# Find BBC stations
API_BASE=https://api.radiohectic.com node scripts/pin_featured.ts
```

### 3. Playwright E2E Tests

**`tests/e2e/featured_bbc.spec.ts`**
- Verifies Featured row exists
- Checks BBC stations are visible
- Confirms 1Xtra is displayed

**`tests/e2e/one_xtra_play.spec.ts`**
- Tests 1Xtra playback
- Verifies Live chip displays
- Checks player controls

**Usage:**
```bash
# Install Playwright
pnpm add -D @playwright/test
npx playwright install

# Run tests
npx playwright test tests/e2e/featured_bbc.spec.ts
npx playwright test tests/e2e/one_xtra_play.spec.ts

# Run all e2e tests
npx playwright test
```

## Acceptance Criteria

✅ **Health probe:** bad ≤ 10% (retry once if needed)
✅ **Featured config:** Contains BBC pins with 1Xtra priority
✅ **Fuzzy matcher:** Finds "BBC Radio 1Xtra" and variants
✅ **Playwright specs:** Featured row and 1Xtra playback green
✅ **UI shows:** BBC stations with Live chip

## Integration

### Adding Featured Stations to UI

To integrate featured stations in your app:

1. **Load configuration:**
```typescript
import featuredStations from '../config/featuredStations.json';
```

2. **Filter stations:**
```typescript
const featured = stations.filter(station => 
  featuredStations.some(f => 
    station.name.toLowerCase().includes(f.match.name.toLowerCase())
  )
).sort((a, b) => {
  // Sort by priority
  const aPriority = featuredStations.find(f => 
    a.name.toLowerCase().includes(f.match.name.toLowerCase())
  )?.priority || 999;
  const bPriority = featuredStations.find(f => 
    b.name.toLowerCase().includes(f.match.name.toLowerCase())
  )?.priority || 999;
  return aPriority - bPriority;
});
```

3. **Display featured section:**
```tsx
<section className="featured-stations">
  <h2>Featured</h2>
  {featured.map(station => (
    <StationCard 
      key={station.id} 
      station={station}
      isPinned={station.name.includes('1Xtra')}
      showLiveIndicator={true}
    />
  ))}
</section>
```

## API Endpoints

If using the radio-browser API:
- **Stations:** `GET /v1/stations?country=GB&limit=500`
- **Count:** `GET /v1/stations/count?country=GB`

## Troubleshooting

### 1Xtra not found
```bash
# Check for name variants
node scripts/pin_featured.ts
# Look for "BBC Radio 1 Xtra", "BBC 1XTRA", etc.
```

### 1Xtra won't play
```bash
# Test stream URL directly
curl -I <stream_url>
# Should return 200/206 + audio content-type
```

### High failure rate
```bash
# Rerun probe once (transient failures normal)
node scripts/probe_streams.ts
# If still high, investigate top offenders
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/e2e-tests.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Health probe check
  run: |
    API_BASE=${{ secrets.RADIO_API_BASE }} node scripts/probe_streams.ts
```

## Admin Dashboard

To verify in admin:
1. Go to Admin → Ingestion Ops
2. Run "Trigger Global Sync (UK)"
3. Go to Admin → Curation / Featured
4. Verify BBC group populated
5. Ensure BBC Radio 1Xtra is Pinned
6. Go to Admin → NOC
7. Confirm BBC streams show Healthy

## License

Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
All rights reserved.
