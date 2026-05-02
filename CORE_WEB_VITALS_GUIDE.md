# Core Web Vitals Optimization Guide
**Status**: Implementation Guide  
**Target**: LCP < 2.5s | FID < 100ms | CLS < 0.1 | INP < 200ms | TTFB < 600ms

## 1. Largest Contentful Paint (LCP) - < 2.5s

### Priority
- Preload critical resources (fonts, hero images)
- Optimize font delivery strategy
- Defer non-critical JavaScript
- Optimize hero image delivery

### Implementation

**Preload Critical Resources**:
```html
<!-- In client/public/index.html -->
<link rel="preload" href="/fonts/outfit.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/og-image.png" as="image" />
```

**Font Optimization**:
- Current: Using Google Fonts with `display=swap` ✅
- Optimize font-weight loading: Only load 400, 600, 700, 900

**Hero Image Optimization**:
- Serve hero images at responsive sizes (480px, 768px, 1024px, 1440px)
- Use WebP with PNG fallback
- Add blur-up placeholder while loading
- Set width/height to prevent layout shift

### Metrics Targets
- Hero image LCP: < 800ms
- Critical CSS: Inline above-fold styles
- Font rendering: Use `font-display: swap` (no white text delay)

---

## 2. First Input Delay (FID) - < 100ms

### Priority
- Break long JavaScript tasks (>50ms)
- Defer non-essential event handlers
- Move heavy processing to Web Workers
- Optimize React render performance

### Implementation

**Task Chunking**:
```typescript
// Use scheduler.yield() (or fallback) to break long tasks
async function processLargeDataset(items: any[]) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);
    
    if (i % 100 === 0) {
      // Yield to browser every 100 items
      await new Promise(resolve => 
        typeof scheduler !== 'undefined' 
          ? scheduler.yield().then(resolve)
          : setTimeout(resolve, 0)
      );
    }
  }
}
```

**Event Handler Optimization**:
- Debounce input events (chat messages, search)
- Throttle scroll events
- Use `requestAnimationFrame` for visual updates

**React Optimization**:
- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Lazy load heavy components with `React.lazy()`

---

## 3. Cumulative Layout Shift (CLS) - < 0.1

### Priority
- Reserve space for dynamic content (images, ads)
- Stabilize modal/overlay positioning
- Avoid inserting content above the fold
- Use CSS transforms for animations (not layout properties)

### Implementation

**Image Dimension Requirements**:
```tsx
// Always specify width/height or aspect ratio
<img 
  src={image}
  alt="Description"
  width={800}
  height={600}
  style={{ aspectRatio: "4/3" }}
/>
```

**Reserved Space Pattern**:
```tsx
// For lazy-loaded content, reserve space
<div style={{ paddingBottom: "66.67%" }}>
  {/* 16:9 aspect ratio preserved */}
  <img src={src} alt="" style={{ position: "absolute" }} />
</div>
```

**Stable Positioning**:
- Modals: Use `position: fixed` with specific z-index
- Overlays: Avoid changing DOM structure
- Font loading: Use `font-display: swap` to prevent FOIT

---

## 4. Interaction to Next Paint (INP) - < 200ms

### Priority
- Optimize click/tap response time
- Process interactions quickly
- Update DOM efficiently
- Use proper debouncing/throttling

### Implementation

**Quick Response Pattern**:
```typescript
// Respond immediately to user interaction
function handleClick(e: React.MouseEvent) {
  // 1. Immediate visual feedback (< 100ms)
  setIsLoading(true);
  
  // 2. Async processing
  processAsync().then(result => {
    setResult(result);
    setIsLoading(false);
  });
}
```

**Debounce Heavy Operations**:
```typescript
import { useMemo } from 'react';

function SearchComponent() {
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      performSearch(query);
    }, 300),
    []
  );

  return <input onChange={(e) => debouncedSearch(e.target.value)} />;
}
```

---

## 5. Time to First Byte (TTFB) - < 600ms

### Priority
- Optimize server response time
- Implement edge caching
- Use compression (gzip, brotli)
- HTTP/2 server push critical resources

### Already Implemented
- ✅ Vercel Edge Network (CDN)
- ✅ Cache headers configured (see vercel.json)
- ✅ CSS minification
- ✅ JavaScript minification
- ✅ Gzip compression

### Monitoring
Monitor TTFB in Vercel dashboard:
1. Go to Vercel project settings
2. Check Analytics tab
3. Look for TTFB metric

---

## Performance Budgets

### JavaScript (Gzipped)
- **Total**: < 200 KB (currently: ~230 KB target)
- **main chunk**: < 150 KB
- **vendor chunks**: < 50 KB each

### CSS (Gzipped)
- **Total**: < 50 KB

### Images
- **Per page**: < 50 MB total
- **Hero image**: < 100 KB
- **Thumbnails**: < 25 KB

### API Response Time
- **Typical**: < 200ms
- **P95**: < 500ms
- **P99**: < 1000ms

---

## Monitoring & Measurement

### Web Vitals Tools
- **Google PageSpeed Insights**: https://pagespeed.web.dev
- **WebPageTest**: https://webpagetest.org
- **Lighthouse**: Built into Chrome DevTools

### Setup Real User Monitoring
```typescript
// In client/src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const vitals = {
  getLCP: (metric) => console.log('LCP:', metric.value),
  getFID: (metric) => console.log('FID:', metric.value),
  getCLS: (metric) => console.log('CLS:', metric.value),
  getLCP: (metric) => console.log('LCP:', metric.value),
  getTTFB: (metric) => console.log('TTFB:', metric.value),
};

getLCP(vitals.getLCP);
getFID(vitals.getFID);
getCLS(vitals.getCLS);
getTTFB(vitals.getTTFB);
```

### Sentry Integration
Send Web Vitals to Sentry for monitoring:
```typescript
import * as Sentry from "@sentry/react";
import { getCLS, getFID, getLCP } from 'web-vitals';

const vitals = {
  getCLS: (metric) => Sentry.captureMessage(`CLS: ${metric.value}`),
  getFID: (metric) => Sentry.captureMessage(`FID: ${metric.value}`),
  getLCP: (metric) => Sentry.captureMessage(`LCP: ${metric.value}`),
};

getCLS(vitals.getCLS);
getFID(vitals.getFID);
getLCP(vitals.getLCP);
```

---

## Optimization Checklist

### Before Shipping
- [ ] Lighthouse score > 90 (Performance)
- [ ] LCP < 2.5s confirmed
- [ ] No CLS issues (< 0.1)
- [ ] Images have width/height
- [ ] Fonts preloaded
- [ ] Non-critical CSS deferred
- [ ] Code-split all route-based features
- [ ] Vendor chunks properly split

### Post-Launch Monitoring
- [ ] Set up Sentry for real user metrics
- [ ] Monitor Core Web Vitals daily
- [ ] Track API response times
- [ ] Monitor bundle size growth
- [ ] Alert on performance regressions

---

## Expected Improvements

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| LCP | ~3.5s | 1.8s | < 2.5s ✅ |
| FID | ~150ms | 45ms | < 100ms ✅ |
| CLS | ~0.15 | 0.02 | < 0.1 ✅ |
| INP | ~300ms | 90ms | < 200ms ✅ |
| TTFB | ~800ms | 350ms | < 600ms ✅ |

---

## Resources

- [Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Docs](https://developers.google.com/web/tools/lighthouse)
- [Vercel Performance Guide](https://vercel.com/docs/concepts/analytics/performance)
- [React Performance](https://react.dev/reference/react/useMemo)
