/**
 * Monitoring and Performance Metrics
 * Tracks performance, errors, and system health
 */

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

interface PerformanceMetric {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
}

class Monitoring {
  private metrics: Metric[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private maxMetrics = 10000;

  /**
   * Record a metric
   */
  record(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      tags,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Record performance metric
   */
  recordPerformance(metric: PerformanceMetric) {
    this.performanceMetrics.push(metric);

    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxMetrics) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get metrics summary
   */
  getSummary(timeWindowMs: number = 3600000) {
    const cutoff = new Date(Date.now() - timeWindowMs);
    
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);
    const recentPerformance = this.performanceMetrics.filter((m) => m.timestamp > cutoff);

    // Calculate averages
    const avgResponseTime = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, m) => sum + m.duration, 0) / recentPerformance.length
      : 0;

    const errorRate = recentPerformance.length > 0
      ? recentPerformance.filter((m) => m.statusCode >= 400).length / recentPerformance.length
      : 0;

    // Group metrics by name
    const metricsByName: Record<string, number[]> = {};
    recentMetrics.forEach((m) => {
      if (!metricsByName[m.name]) {
        metricsByName[m.name] = [];
      }
      metricsByName[m.name].push(m.value);
    });

    const aggregatedMetrics: Record<string, number> = {};
    Object.entries(metricsByName).forEach(([name, values]) => {
      aggregatedMetrics[name] = values.reduce((sum, v) => sum + v, 0) / values.length;
    });

    return {
      avgResponseTime,
      errorRate,
      totalRequests: recentPerformance.length,
      metrics: aggregatedMetrics,
      timestamp: new Date(),
    };
  }

  /**
   * Get performance stats for an endpoint
   */
  getEndpointStats(endpoint: string, method: string) {
    const relevant = this.performanceMetrics.filter(
      (m) => m.endpoint === endpoint && m.method === method
    );

    if (relevant.length === 0) {
      return null;
    }

    const durations = relevant.map((m) => m.duration);
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const errorCount = relevant.filter((m) => m.statusCode >= 400).length;

    return {
      endpoint,
      method,
      count: relevant.length,
      avgDuration,
      minDuration,
      maxDuration,
      errorCount,
      errorRate: errorCount / relevant.length,
    };
  }
}

export const monitoring = new Monitoring();

/**
 * Performance middleware
 */
export function performanceMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    monitoring.recordPerformance({
      endpoint: req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
    });
  });

  next();
}
