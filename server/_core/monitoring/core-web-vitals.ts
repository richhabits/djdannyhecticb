/**
 * Core Web Vitals Monitoring & Tracking
 * Measures LCP, FID, CLS, TTFB, FCP
 */

import { logger } from '../logging';
import { cacheManager } from '../cache/cache-manager';

/**
 * Core Web Vitals thresholds (Google standards)
 */
export const CWV_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // ms
  FID: { good: 100, needsImprovement: 300 }, // ms
  CLS: { good: 0.1, needsImprovement: 0.25 }, // unitless
  TTFB: { good: 600, needsImprovement: 1800 }, // ms
  FCP: { good: 1800, needsImprovement: 3000 }, // ms
} as const;

export interface CoreWebVital {
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
  value: number;
  rating: 'good' | 'needsImprovement' | 'poor';
  delta: number;
  id: string;
  entries?: PerformanceEntry[];
  navigationTiming?: {
    startTime: number;
    endTime: number;
  };
}

export interface VitalsReport {
  timestamp: number;
  url: string;
  userAgent: string;
  vitals: CoreWebVital[];
  performance: {
    navigation: {
      duration: number;
      domContentLoaded: number;
      loadComplete: number;
    };
    resources: ResourceTiming[];
  };
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  cached: boolean;
}

/**
 * Client-side tracking code for Core Web Vitals
 * Add this to your frontend to track metrics
 */
export const CLIENT_TRACKING_CODE = `
<script>
  // Core Web Vitals tracking
  (function() {
    const vitals = {};

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.lcp = {
        value: lastEntry.renderTime || lastEntry.loadTime,
        id: lastEntry.id,
      };
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const delay = entry.processingStart - entry.startTime;
        vitals.fid = { value: delay, id: entry.name };
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      entryList.getEntries().forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          vitals.cls = { value: clsValue };
        }
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Time to First Byte (from navigation timing)
    vitals.ttfb = {
      value: performance.timing.responseStart - performance.timing.fetchStart,
    };

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    vitals.fcp = { value: fcpEntry?.startTime || 0 };

    // Send vitals to server
    window.addEventListener('beforeunload', () => {
      navigator.sendBeacon('/api/metrics', JSON.stringify({
        vitals,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }));
    });

    // Also send periodically (every 30 seconds)
    setInterval(() => {
      navigator.sendBeacon('/api/metrics', JSON.stringify({
        vitals,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }));
    }, 30000);
  })();
</script>
`;

export interface PerformanceMetrics {
  timestamp: number;
  vitals: {
    lcp?: { value: number; id?: string };
    fid?: { value: number; id?: string };
    cls?: { value: number };
    ttfb?: { value: number };
    fcp?: { value: number };
    inp?: { value: number; id?: string };
  };
  url: string;
  userAgent: string;
  session?: {
    userId?: number;
    sessionId?: string;
  };
}

/**
 * Rate vital value against thresholds
 */
export function rateVital(
  name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP',
  value: number
): 'good' | 'needsImprovement' | 'poor' {
  const thresholds = CWV_THRESHOLDS[name];

  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needsImprovement';
  return 'poor';
}

/**
 * Server-side performance monitoring
 */
export class PerformanceMonitor {
  /**
   * Record server response time
   */
  static recordResponseTime(path: string, duration: number, statusCode: number) {
    const metric = {
      path,
      duration,
      statusCode,
      timestamp: Date.now(),
    };

    logger.debug('Response time recorded', metric);

    // Store in Redis for aggregation
    cacheManager.set(
      `perf:response:${path}:${Date.now()}`,
      metric,
      { ttl: 3600 } // Keep for 1 hour
    );
  }

  /**
   * Record database query performance
   */
  static recordQueryTime(query: string, duration: number, rows: number) {
    const metric = {
      query: query.substring(0, 100), // Truncate for privacy
      duration,
      rows,
      timestamp: Date.now(),
    };

    if (duration > 100) {
      // Only log slow queries (>100ms)
      logger.warn('Slow database query detected', metric);
    }

    cacheManager.set(
      `perf:query:${Date.now()}`,
      metric,
      { ttl: 3600 }
    );
  }

  /**
   * Record resource usage
   */
  static recordResourceUsage(resource: 'memory' | 'cpu', usage: number, limit: number) {
    const percentage = (usage / limit) * 100;

    if (percentage > 80) {
      logger.warn(`High ${resource} usage detected`, { percentage, usage, limit });
    }

    cacheManager.set(
      `perf:resource:${resource}:${Date.now()}`,
      { percentage, usage, limit, timestamp: Date.now() },
      { ttl: 600 } // Keep for 10 minutes
    );
  }

  /**
   * Get performance summary
   */
  static async getSummary(durationMinutes: number = 60): Promise<{
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    errorRate: number;
    throughput: number; // requests per minute
  }> {
    try {
      const cutoff = Date.now() - durationMinutes * 60 * 1000;

      // In production, query from metrics database
      // This is a placeholder that demonstrates the structure

      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        throughput: 0,
      };
    } catch (error) {
      logger.error('Error getting performance summary', { error });
      return {
        avgResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        errorRate: 0,
        throughput: 0,
      };
    }
  }
}

/**
 * Express middleware for automatic performance monitoring
 */
export function performanceMonitoringMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Override res.send to capture response
    const originalSend = res.send.bind(res);

    res.send = function (body: any) {
      const duration = Date.now() - startTime;

      PerformanceMonitor.recordResponseTime(req.path, duration, res.statusCode);

      // Add performance headers
      res.setHeader('server-timing', `total;dur=${duration}`);

      return originalSend(body);
    };

    next();
  };
}
