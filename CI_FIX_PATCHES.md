# CI Fix Patches for copilot/unified-ship

Apply these changes to make PR #22 CI pass.

## Patch 1: Fix Vite Placeholders

### client/index.html
Replace lines with Vite placeholders:

```diff
-    <link rel="icon" type="image/png" href="%VITE_APP_LOGO%" />
+    <link rel="icon" type="image/png" href="/hectic-logo.png" />

-    <title>%VITE_APP_TITLE%</title>
+    <title>DJ Danny Hectic B</title>
```

### client/src/main.tsx
Add after imports, before ReactDOM.createRoot:

```typescript
// Set dynamic title from env or use default
const title = import.meta.env.VITE_APP_TITLE || 'DJ Danny Hectic B';
if (title) {
  document.title = title;
}
```

### client/.env.example (NEW FILE)
Create this file:

```
VITE_APP_TITLE=DJ Danny Hectic B
VITE_APP_LOGO=/hectic-logo.png
```

## Patch 2: Add Missing Analytics Exports

### client/src/lib/analytics.ts
Add these functions at the end of the file:

```typescript
// Beatport analytics functions
export function trackBeatportClick(type: 'track' | 'chart' | 'genre', id: number | string, origin: string) {
  track('beatport_click', { type, id, origin });
  storeEvent('beatport_click', { type, id, origin, timestamp: Date.now() });
}

export function trackChartView(chartId: number) {
  track('beatport_chart_view', { chartId });
  storeEvent('beatport_chart_view', { chartId, timestamp: Date.now() });
}

export function trackGenreView(genreSlug: string) {
  track('beatport_genre_view', { genreSlug });
  storeEvent('beatport_genre_view', { genreSlug, timestamp: Date.now() });
}

export function trackSearch(query: string) {
  track('beatport_search', { query });
  storeEvent('beatport_search', { query, timestamp: Date.now() });
}

// Helper functions for admin dashboard
export function getEventStats(eventType: string) {
  const events = getStoredEvents(eventType);
  const last24h = events.filter((e: any) => Date.now() - e.timestamp < 24 * 60 * 60 * 1000);
  
  const topItems = getTopItems(events);
  
  return {
    total: events.length,
    last24h: last24h.length,
    topItems
  };
}

export function calculateCTR(views: number, clicks: number): number {
  if (views === 0) return 0;
  return (clicks / views) * 100;
}

// Event storage functions
function storeEvent(type: string, data: any) {
  try {
    const key = `analytics_${type}`;
    const stored = localStorage.getItem(key);
    const events = stored ? JSON.parse(stored) : [];
    events.push(data);
    // Keep last 1000 events per type
    if (events.length > 1000) {
      events.shift();
    }
    localStorage.setItem(key, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to store event:', error);
  }
}

function getStoredEvents(type: string): any[] {
  try {
    const key = `analytics_${type}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get stored events:', error);
    return [];
  }
}

function getTopItems(events: any[]): Array<{ item: string; count: number }> {
  const counts: Record<string, number> = {};
  
  events.forEach((e: any) => {
    const key = String(e.id || e.chartId || e.genreSlug || e.query || 'unknown');
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([item, count]) => ({ item, count }));
}
```

## Patch 3: Fix Framer Motion Usage

### client/src/pages/BookingQuote.tsx
Find and replace:

```diff
- <motion_div
+ <motion.div

-  </motion_div>
+  </motion.div>
```

Ensure the import is correct:
```typescript
import { motion } from "framer-motion";
```

## Patch 4: Fix TypeScript Errors in UKEventsPage

### client/src/pages/UKEventsPage.tsx

Fix implicit any types:

```diff
- const city = cities.find(c => c.id === selectedCity);
+ const city = cities.find((c: any) => c.id === selectedCity);

- const category = categories.find(c => c.id === selectedCategory);
+ const category = categories.find((c: any) => c.id === selectedCategory);

- .map(event => ({
+ .map((event: any) => ({
```

## Patch 5: Add Server Dependencies

### package.json

Add to dependencies section:

```json
"helmet": "^8.1.0",
"cors": "^2.8.6",
"express-rate-limit": "^8.2.1"
```

Add to devDependencies section:

```json
"@types/cors": "^2.8.19"
```

Then run:
```bash
pnpm install
```

This will update `pnpm-lock.yaml` automatically.

## Commands to Apply All Patches

```bash
cd ~/Projects/djdannyhecticb
git switch copilot/unified-ship

# Apply patches manually (edit files as shown above)
# OR use the provided patch files

# After making changes:
pnpm install
pnpm build  # Verify it passes

git add .
git commit -m "fix: apply CI fixes - Vite placeholders, analytics exports, Framer Motion, dependencies"
git push origin copilot/unified-ship
```

## Verification Checklist

After applying patches and pushing:

- [ ] `pnpm install --frozen-lockfile` passes
- [ ] `pnpm build` passes
- [ ] No missing export errors for analytics functions
- [ ] No Vite placeholder errors
- [ ] Framer Motion components render correctly
- [ ] TypeScript implicit any errors resolved
- [ ] Server dependencies installed

## Expected Result

PR #22 CI should turn GREEN with:
- ✅ Build passes
- ✅ TypeScript checks pass (or only pre-existing errors remain)
- ✅ All imports resolve correctly
