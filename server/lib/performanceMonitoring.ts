/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Performance Monitoring and Metrics
 * Tracks API response times, database query performance, and resource usage
 */

interface Metric {
  name: string;
  duration: number; // milliseconds
  timestamp: number;
  context?: Record<string, any>;
}

interface MetricsSnapshot {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
  count: number;
}

class PerformanceMonitor {
  private metrics = new Map<string, Metric[]>();
  private slowQueryThreshold = 200; // milliseconds
  private slowQueryLog: Metric[] = [];

  /**
   * Record a metric
   */
  recordMetric(
    name: string,
    duration: number,
    context?: Record<string, any>
  ): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metric: Metric = {
      name,
      duration,
      timestamp: Date.now(),
      context,
    };

    this.metrics.get(name)!.push(metric);

    // Track slow queries
    if (duration > this.slowQueryThreshold) {
      this.slowQueryLog.push(metric);
      // Keep only last 1000 slow queries
      if (this.slowQueryLog.length > 1000) {
        this.slowQueryLog.shift();
      }
    }
  }

  /**
   * Get metrics for a specific query type
   */
  getMetrics(name: string): MetricsSnapshot | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const len = durations.length;

    return {
      p50: durations[Math.floor(len * 0.5)],
      p75: durations[Math.floor(len * 0.75)],
      p90: durations[Math.floor(len * 0.9)],
      p95: durations[Math.floor(len * 0.95)],
      p99: durations[Math.floor(len * 0.99)],
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / len,
      count: len,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, MetricsSnapshot> {
    const result: Record<string, MetricsSnapshot> = {};

    for (const [name] of this.metrics) {
      const snapshot = this.getMetrics(name);
      if (snapshot) {
        result[name] = snapshot;
      }
    }

    return result;
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit: number = 100): Metric[] {
    return this.slowQueryLog.slice(-limit).reverse();
  }

  /**
   * Clear metrics older than specified time
   */
  cleanup(olderThanMs: number = 3600000): number {
    const cutoff = Date.now() - olderThanMs;
    let removed = 0;

    for (const [, metrics] of this.metrics) {
      const before = metrics.length;
      const filtered = metrics.filter(m => m.timestamp > cutoff);
      removed += before - filtered.length;
      this.metrics.set(metrics[0].name, filtered);
    }

    return removed;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.slowQueryLog = [];
  }
}

// Create singleton instance
const monitor = new PerformanceMonitor();

/**
 * Async wrapper to measure function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    monitor.recordMetric(name, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    monitor.recordMetric(name, duration, { ...context, error: true });
    throw error;
  }
}

/**
 * Sync wrapper to measure function execution time
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  context?: Record<string, any>
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    monitor.recordMetric(name, duration, context);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    monitor.recordMetric(name, duration, { ...context, error: true });
    throw error;
  }
}

/**
 * Performance budget check - logs warning if metric exceeds threshold
 */
export function checkPerformanceBudget(
  metricName: string,
  maxP95: number
): boolean {
  const metrics = monitor.getMetrics(metricName);
  if (!metrics) return true;

  if (metrics.p95 > maxP95) {
    console.warn(
      `Performance budget exceeded for ${metricName}: p95=${metrics.p95}ms > ${maxP95}ms`
    );
    return false;
  }

  return true;
}

/**
 * Performance budgets for different queries
 */
export const PERFORMANCE_BUDGETS = {
  // Database queries
  "db:chat.getMessages": 100,
  "db:donations.getBySession": 150,
  "db:reactions.getBySession": 100,
  "db:leaderboard.getGlobal": 200,
  "db:notifications.getUser": 150,

  // API endpoints
  "api:GET:/stream": 200,
  "api:POST:/donation": 300,
  "api:GET:/leaderboard": 250,
  "api:GET:/chat": 150,

  // General
  "overall:response": 500,
} as const;

export { monitor };
