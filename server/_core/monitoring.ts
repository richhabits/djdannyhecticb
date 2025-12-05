import { datadogRum } from '@datadog/browser-rum';
import { ENV } from './env';

/**
 * Initialize Datadog Real User Monitoring
 */
export function initializeDatadog() {
  if (!ENV.DATADOG_APPLICATION_ID || !ENV.DATADOG_CLIENT_TOKEN) {
    console.warn('[Monitoring] Datadog not configured');
    return;
  }

  datadogRum.init({
    applicationId: ENV.DATADOG_APPLICATION_ID,
    clientToken: ENV.DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    service: 'hectic-radio',
    env: ENV.nodeEnv,
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  });

  datadogRum.startSessionReplayRecording();
  
  console.log('[Monitoring] Datadog RUM initialized');
}

/**
 * Track custom action
 */
export function trackAction(name: string, context?: Record<string, any>) {
  if (typeof window !== 'undefined' && datadogRum) {
    datadogRum.addAction(name, context);
  }
}

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, any>) {
  if (typeof window !== 'undefined' && datadogRum) {
    datadogRum.addError(error, context);
  }
}

/**
 * Set user context
 */
export function setUser(userId: string, email?: string, name?: string) {
  if (typeof window !== 'undefined' && datadogRum) {
    datadogRum.setUser({
      id: userId,
      email,
      name,
    });
  }
}

/**
 * Add custom timing
 */
export function addTiming(name: string) {
  if (typeof window !== 'undefined' && datadogRum) {
    datadogRum.addTiming(name);
  }
}

// Server-side monitoring
export class PerformanceMonitor {
  private static metrics = new Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
  }>();

  static track(metricName: string, duration: number) {
    const existing = this.metrics.get(metricName);
    
    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
    } else {
      this.metrics.set(metricName, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
      });
    }
  }

  static getMetrics() {
    const result: Record<string, any> = {};
    
    for (const [name, data] of this.metrics.entries()) {
      result[name] = {
        count: data.count,
        avgTime: data.totalTime / data.count,
        minTime: data.minTime,
        maxTime: data.maxTime,
      };
    }

    return result;
  }

  static clearMetrics() {
    this.metrics.clear();
  }
}

/**
 * Middleware to track API performance
 */
export function apiPerformanceMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data: any) {
    const duration = Date.now() - start;
    const metricName = `api.${req.method}.${req.path}`;
    
    PerformanceMonitor.track(metricName, duration);

    if (duration > 1000) {
      console.warn(`[Performance] Slow API: ${req.method} ${req.path} took ${duration}ms`);
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Health check endpoint
 */
export async function getHealthCheck() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    metrics: PerformanceMonitor.getMetrics(),
  };
}
