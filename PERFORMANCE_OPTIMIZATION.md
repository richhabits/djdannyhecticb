# Performance Optimization Guide

This document outlines all performance optimizations implemented in djdannyhecticb.

## Overview

The application has been optimized across multiple dimensions:
- Bundle analysis and code splitting
- Image optimization with lazy loading
- Font optimization with system fallbacks
- Web Vitals tracking (LCP, FID, CLS, INP, TTFB)
- Performance budgeting
- Resource monitoring

## Performance Tools Installed

```bash
npm install --save-dev rollup-plugin-visualizer bundle-analyzer @next/bundle-analyzer
```

### Installed Packages
- **rollup-plugin-visualizer**: Visualizes bundle composition
- **bundle-analyzer**: Analyzes bundle sizes
- **@next/bundle-analyzer**: Next.js bundle analysis

## Quick Start

### Check Performance Report
```bash
pnpm perf:check
```

This runs a full build and generates a performance report with:
- Total bundle size (raw and gzipped)
- File type breakdown
- Performance budget status
- Top 10 largest files
- Optimization recommendations

### Analyze Bundle
```bash
pnpm build:analyze
```

Opens an interactive bundle visualization showing:
- Module composition
- Gzip sizes
- Brotli sizes
- Module dependencies

## Performance Utilities

### Web Vitals Tracking

**File**: `client/src/utils/performance.ts`

Tracks Core Web Vitals automatically:
- **LCP** (Largest Contentful Paint): ≤ 2.5s
- **FID** (First Input Delay): ≤ 100ms
- **CLS** (Cumulative Layout Shift): ≤ 0.1
- **INP** (Interaction to Next Paint): ≤ 200ms
- **TTFB** (Time to First Byte): ≤ 600ms

```typescript
import {
  initPerformanceMonitoring,
  trackLCP,
  trackCLS,
  trackFID,
  reportWebVitals,
} from '@/utils/performance';

// Initialize monitoring
initPerformanceMonitoring();

// Or track individual metrics
trackLCP(reportWebVitals);
trackCLS(reportWebVitals);
trackFID(reportWebVitals);
```

### Performance Initialization

**File**: `client/src/utils/performanceInit.ts`

Initialize all performance monitoring on app startup:

```typescript
import { initializePerformance } from '@/utils/performanceInit';

// In your main app component or index.tsx
initializePerformance();
```

Features:
- Automatic Web Vitals tracking
- Navigation metrics logging
- Resource loading monitoring
- Slow resource detection (> 1s)
- Performance report on page unload
- Long task monitoring
- Paint timing monitoring
- Memory monitoring

### Lazy Loading

**File**: `client/src/hooks/useLazyLoad.ts`

Lazy load images and components as they come into view:

```typescript
import { useLazyLoad, useLazyLoadComponent } from '@/hooks/useLazyLoad';

// For single element
const { ref, isLoaded } = useLazyLoad<HTMLImageElement>();
return <img ref={ref} src={src} />;

// For components
const { ref, isVisible } = useLazyLoadComponent<HTMLDivElement>();
return (
  <div ref={ref}>
    {isVisible && <ExpensiveComponent />}
  </div>
);
```

### Lazy Image Component

**File**: `client/src/components/LazyImage.tsx`

Optimized image component with:
- Lazy loading
- Blur-up placeholder effect
- Responsive images
- WebP with fallback support

```typescript
import { LazyImage, ResponsiveImage, BlurUpImage } from '@/components/LazyImage';

// Basic lazy image
<LazyImage
  src="image.jpg"
  alt="Description"
  placeholder="blur-placeholder.jpg"
/>

// Responsive with WebP
<ResponsiveImage
  src="image.jpg"
  alt="Description"
  webpSrc="image.webp"
/>

// Blur-up effect
<BlurUpImage
  src="image.jpg"
  alt="Description"
  placeholder="tiny-placeholder.jpg"
/>
```

### Image Optimization Utilities

**File**: `client/src/utils/imageOptimization.ts`

Utility functions for image optimization:

```typescript
import {
  generateResponsiveImages,
  getOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  getThumbnailUrl,
  getHighQualityUrl,
  SIZE_PRESETS,
  QUALITY_PRESETS,
  RESPONSIVE_BREAKPOINTS,
} from '@/utils/imageOptimization';

// Generate responsive image URLs
const images = generateResponsiveImages('image.jpg', [320, 640, 1024]);

// Get optimized URL with quality
const optimized = getOptimizedImageUrl('image.jpg', 800, 80);

// Generate srcSet for responsive images
const srcSet = generateSrcSet('image.jpg');

// Get sizes attribute
const sizes = generateSizes();

// Quick presets
const thumb = getThumbnailUrl('image.jpg'); // 200px, quality 70
const hq = getHighQualityUrl('image.jpg');  // 1920px, quality 90
```

## Font Optimization

**File**: `client/src/index.css`

Font optimizations implemented:

1. **Font Display Swap**: Uses `display=swap` to prevent FOUT (Flash of Unstyled Text)
2. **System Font Fallbacks**: Cascades to system fonts if web fonts fail to load
3. **Font Variables**: CSS custom properties for consistent font usage
4. **Font Weight Optimization**: Only loads necessary font weights (400, 500, 700, 900)
5. **Font Size Adjust**: Reduces layout shift during font swap
6. **Variable Fonts**: Uses CSS font-variation-settings for modern browsers

CSS Variables available:
```css
--font-primary: 'Inter', sans-serif;      /* Body text */
--font-heading: 'Outfit', sans-serif;     /* Headings */
--font-mono: 'Fira Code', monospace;      /* Code */
```

## Code Splitting Strategy

**File**: `vite.config.ts`

Bundle is split into multiple chunks for optimal caching:

1. **vendor-react** (React & React DOM)
2. **vendor-ui** (Radix UI components)
3. **vendor-icons** (Lucide React icons)
4. **vendor-charts** (Recharts)
5. **vendor-forms** (React Hook Form + Zod)
6. **vendor-utils** (Utility libraries)
7. **main** (Application code)

Benefits:
- Better browser caching (vendor code changes less frequently)
- Parallel downloads
- Smaller initial bundle
- Faster updates (only changed code needs to download)

## Performance Budget

**File**: `client/performance-budget.json`

Defines maximum acceptable bundle sizes:

```json
{
  "bundles": [
    { "name": "main", "maxSize": "250kb" },
    { "name": "vendor", "maxSize": "200kb" },
    { "name": "styles", "maxSize": "50kb" }
  ],
  "metrics": {
    "LCP": { "target": 2500 },
    "FID": { "target": 100 },
    "CLS": { "target": 0.1 },
    "INP": { "target": 200 },
    "TTFB": { "target": 600 }
  }
}
```

## Vite Build Optimization

**File**: `vite.config.ts`

Build configuration includes:

1. **Code Splitting**: Optimized chunk sizes with manual chunks
2. **Minification**: Using esbuild with terser options
3. **Tree Shaking**: Unused code removal
4. **CSS Minification**: Automatic CSS compression
5. **ES2020 Target**: Modern JavaScript syntax for smaller output
6. **Source Map Disabled**: Smaller production bundles
7. **Gzip/Brotli Support**: Server-side compression ready

### Build Flags
```bash
# Development build
pnpm dev

# Production build with analysis
pnpm build:analyze

# Performance check
pnpm perf:check

# Just build
pnpm build
```

## Performance Scripts

### Available Commands

```bash
# Build and analyze bundle
pnpm build:analyze

# Generate performance report
pnpm perf:report

# Full performance check (build + report)
pnpm perf:check
```

### Performance Report Output

The `perf:report` script generates:
- Total bundle size (raw and gzipped)
- Compression ratio percentage
- Top 10 largest files
- File type breakdown by count and size
- Performance budget status
- Optimization recommendations

Example output:
```
========================================
📊 PERFORMANCE REPORT
========================================

BUNDLE SUMMARY
──────────────────────────────────────
Total size:     2.45 MB
Gzipped size:   580.32 KB
Compression:    23.7%

TOP 10 LARGEST FILES (Gzipped)
──────────────────────────────────────
1. vendor-react.js
   Size: 412 KB (Gzipped: 145 KB)
   Ratio: 35.2%
...
```

## Best Practices

### 1. Image Optimization
- Always use lazy loading for images below the fold
- Provide placeholder images for better UX
- Use WebP format with fallbacks
- Optimize images for different viewport sizes

### 2. Component Lazy Loading
```typescript
// Bad: Loads all components upfront
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';

// Good: Load on demand
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analytics = lazy(() => import('./pages/Analytics'));
```

### 3. Font Loading
- Rely on system fonts when possible
- Use `font-display: swap` to prevent FOUT
- Limit to necessary font weights
- Preload critical fonts

### 4. Bundle Monitoring
- Run `pnpm perf:check` regularly (before commits/PRs)
- Keep individual bundles under size limits
- Code split large features
- Remove unused dependencies

### 5. Web Vitals
- Monitor Core Web Vitals in production
- Set up alerts for threshold breaches
- Track improvements over time
- Test on real devices and connections

### 6. Network Considerations
- Enable gzip/brotli compression on server
- Use CDN for static assets
- Implement HTTP/2 push for critical resources
- Set appropriate cache headers

## Monitoring in Production

To integrate performance monitoring in production:

1. **Add performance tracking endpoint**:
```typescript
// API endpoint to receive metrics
app.post('/api/metrics/performance', (req, res) => {
  const metrics = req.body;
  // Store in analytics database
  res.json({ ok: true });
});
```

2. **Configure analytics service**:
```typescript
// Send metrics to Google Analytics, Sentry, etc.
if (window.gtag) {
  window.gtag('event', 'web_vitals', {
    metric_value: metric.value,
    metric_id: metric.id,
    metric_delta: metric.delta,
  });
}
```

## Troubleshooting

### High LCP
- Lazy load images and heavy components
- Optimize server response time (TTFB)
- Use CSS critical path optimization
- Minimize CSS blocking rendering

### High FID/INP
- Code split large bundles
- Defer non-critical JavaScript
- Use Web Workers for heavy computation
- Profile with Chrome DevTools

### High CLS
- Set image dimensions explicitly
- Reserve space for dynamic content
- Use `font-display: swap` carefully
- Avoid sudden layout changes

### Large Bundles
- Check for duplicate dependencies
- Remove unused code
- Use dynamic imports for routes
- Profile with bundle analyzer

## References

- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Image Optimization](https://web.dev/image-optimization/)
- [Font Loading Strategy](https://web.dev/font-display/)
- [Code Splitting](https://web.dev/reduce-javascript-for-faster-initial-load/)
