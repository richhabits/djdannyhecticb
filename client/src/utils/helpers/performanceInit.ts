/**
 * Performance Initialization Module
 * Initializes all performance monitoring and optimization features
 */

import {
  initPerformanceMonitoring,
  getNavigationMetrics,
  getResourceMetrics,
  reportWebVitals,
} from './performance';

/**
 * Initialize performance monitoring for the application
 * Call this once on app startup
 */
export function initializePerformance() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Initialize web vitals tracking
    initPerformanceMonitals();

    // Log initial navigation metrics
    const navTiming = performance.timing;
    if (navTiming && navTiming.navigationStart) {
      logNavigationMetrics();
    }

    // Monitor resource loading
    monitorResourceLoading();

    // Setup performance observer for navigation timing
    setupNavigationObserver();

    // Log performance report on page unload (for analytics)
    window.addEventListener('beforeunload', () => {
      logPerformanceReport();
    });

    console.log('[Performance] Monitoring initialized');
  } catch (error) {
    console.error('[Performance] Initialization error:', error);
  }
}

function initPerformanceMonitals() {
  initPerformanceMonitoring();
}

function logNavigationMetrics() {
  const metrics = getNavigationMetrics();
  if (!metrics) return;

  console.group('[Performance] Navigation Metrics');
  console.log(`DNS lookup: ${metrics.dns}ms`);
  console.log(`TCP connection: ${metrics.tcp}ms`);
  console.log(`Time to First Byte: ${metrics.ttfb}ms`);
  console.log(`Download: ${metrics.download}ms`);
  console.log(`DOM Interactive: ${metrics.domInteractive}ms`);
  console.log(`DOM Complete: ${metrics.domComplete}ms`);
  console.log(`Load Complete: ${metrics.loadComplete}ms`);
  console.groupEnd();
}

function monitorResourceLoading() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming;
      const isSlowResource = resource.duration > 1000; // > 1 second

      if (isSlowResource) {
        console.warn('[Performance] Slow resource detected:', {
          name: resource.name,
          duration: resource.duration.toFixed(2) + 'ms',
          size: (resource.transferSize / 1024).toFixed(2) + 'KB',
          type: resource.initiatorType,
        });
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
}

function setupNavigationObserver() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navEntry = entry as any;

          const metrics = {
            name: 'Navigation',
            value: (navEntry.loadEventEnd || 0) - (navEntry.navigationStart || 0),
            id: 'navigation',
            delta: 0,
          };

          reportWebVitals(metrics);
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.debug('[Performance] Navigation observer not available:', error);
    }
  }
}

function logPerformanceReport() {
  const metrics = getNavigationMetrics();
  const resources = getResourceMetrics();

  if (!metrics || resources.length === 0) return;

  const totalResourceTime = resources.reduce((sum, r) => sum + r.duration, 0);
  const totalResourceSize = resources.reduce((sum, r) => sum + r.size, 0);

  const report = {
    navigationMetrics: metrics,
    resourceSummary: {
      count: resources.length,
      totalDuration: totalResourceTime,
      totalSize: totalResourceSize,
    },
  };

  // Send to analytics service if available
  if (window.navigator && window.navigator.sendBeacon) {
    try {
      window.navigator.sendBeacon(
        '/api/metrics/performance',
        JSON.stringify(report)
      );
    } catch (error) {
      console.debug('[Performance] Failed to send metrics:', error);
    }
  }
}

/**
 * Get current performance snapshot
 */
export function getPerformanceSnapshot() {
  return {
    navigation: getNavigationMetrics(),
    resources: getResourceMetrics(),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log custom performance mark and measure
 */
export function markPerformance(label: string) {
  if (typeof window === 'undefined' || !performance.mark) return;

  try {
    performance.mark(label);
  } catch (error) {
    console.debug('[Performance] Failed to mark:', label, error);
  }
}

/**
 * Measure time between marks
 */
export function measurePerformance(
  label: string,
  startMark: string,
  endMark: string
) {
  if (typeof window === 'undefined' || !performance.measure) return;

  try {
    performance.measure(label, startMark, endMark);
    const measure = performance.getEntriesByName(label)[0];
    if (measure) {
      console.log(`[Performance] ${label}: ${measure.duration.toFixed(2)}ms`);
    }
  } catch (error) {
    console.debug('[Performance] Failed to measure:', label, error);
  }
}

/**
 * Setup long task monitoring
 */
export function setupLongTaskMonitoring() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('[Performance] Long task detected:', {
            duration: (entry as any).duration.toFixed(2) + 'ms',
            name: entry.name,
          });
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.debug('[Performance] Long task observer not available:', error);
    }
  }
}

/**
 * Setup paint timing monitoring
 */
export function setupPaintTiming() {
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('[Performance] Paint timing:', {
            name: entry.name,
            duration: entry.startTime.toFixed(2) + 'ms',
          });
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.debug('[Performance] Paint observer not available:', error);
    }
  }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Setup memory monitoring (for devices that support it)
 */
export function setupMemoryMonitoring() {
  if (typeof window === 'undefined') return;

  const perfMemory = (performance as any).memory;
  if (!perfMemory) {
    console.debug('[Performance] Memory API not available');
    return;
  }

  console.log('[Performance] Memory Info:', {
    jsHeapSizeLimit: (perfMemory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    totalJSHeapSize: (perfMemory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    usedJSHeapSize: (perfMemory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
  });

  // Monitor memory periodically
  setInterval(() => {
    const usage =
      (perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit) * 100;
    if (usage > 90) {
      console.warn('[Performance] High memory usage:', usage.toFixed(1) + '%');
    }
  }, 30000); // Check every 30 seconds
}
