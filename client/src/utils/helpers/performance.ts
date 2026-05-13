export interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
}

export function reportWebVitals(metric: WebVitalMetric) {
  // Send to analytics
  console.log(`${metric.name}:`, metric.value);

  if (typeof window !== 'undefined' && window.navigator && window.navigator.sendBeacon) {
    const data = JSON.stringify(metric);
    window.navigator.sendBeacon('/api/metrics', data);
  }
}

// Track Largest Contentful Paint (LCP)
export function trackLCP(callback: (metric: WebVitalMetric) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      callback({
        name: 'LCP',
        value: lastEntry?.renderTime || lastEntry?.loadTime || 0,
        id: lastEntry?.id || 'lcp',
        delta: 0,
      });
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
}

// Track Cumulative Layout Shift (CLS)
export function trackCLS(callback: (metric: WebVitalMetric) => void) {
  if ('PerformanceObserver' in window) {
    let sessionValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const anyEntry = entry as any;
        if (!('hadRecentInput' in entry) || !anyEntry.hadRecentInput) {
          sessionValue += anyEntry.value || 0;
          callback({
            name: 'CLS',
            value: sessionValue,
            id: anyEntry.id || 'cls',
            delta: anyEntry.value || 0,
          });
        }
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  }
}

// Track First Input Delay (FID)
export function trackFID(callback: (metric: WebVitalMetric) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const anyEntry = entry as any;
        callback({
          name: 'FID',
          value: anyEntry.processingDuration || 0,
          id: anyEntry.id || 'fid',
          delta: 0,
        });
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  }
}

// Track Interaction to Next Paint (INP)
export function trackINP(callback: (metric: WebVitalMetric) => void) {
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const anyEntry = entry as any;
        callback({
          name: 'INP',
          value: anyEntry.duration || 0,
          id: anyEntry.id || 'inp',
          delta: 0,
        });
      }
    });
    observer.observe({ entryTypes: ['interaction'] });
  }
}

// Track Time to First Byte (TTFB)
export function trackTTFB(callback: (metric: WebVitalMetric) => void) {
  const navigation = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.fetchStart;
    callback({
      name: 'TTFB',
      value: ttfb,
      id: 'ttfb',
      delta: 0,
    });
  }
}

// Performance monitoring initialization
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track all web vitals
  trackLCP(reportWebVitals);
  trackCLS(reportWebVitals);
  trackFID(reportWebVitals);
  trackINP(reportWebVitals);
  trackTTFB(reportWebVitals);

  // Log performance metrics
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page load time:', pageLoadTime, 'ms');
  });
}

// Navigation timing metrics
export function getNavigationMetrics() {
  if (typeof window === 'undefined') return null;

  const navTiming = performance.timing;
  if (!navTiming || !navTiming.navigationStart) return null;

  return {
    dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
    tcp: navTiming.connectEnd - navTiming.connectStart,
    ttfb: navTiming.responseStart - navTiming.fetchStart,
    download: navTiming.responseEnd - navTiming.responseStart,
    domInteractive: navTiming.domInteractive - navTiming.navigationStart,
    domComplete: navTiming.domComplete - navTiming.navigationStart,
    loadComplete: navTiming.loadEventEnd - navTiming.navigationStart,
  };
}

// Resource timing metrics
export function getResourceMetrics() {
  if (typeof window === 'undefined') return [];

  return performance.getEntriesByType('resource').map((entry) => ({
    name: entry.name,
    duration: (entry as PerformanceResourceTiming).duration,
    size: (entry as PerformanceResourceTiming).transferSize || 0,
    type: (entry as PerformanceResourceTiming).initiatorType,
  }));
}
