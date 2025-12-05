import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from './cache';
import compression from 'compression';
import helmet from 'helmet';

// Rate limiters
let apiLimiter: RateLimiterMemory | RateLimiterRedis;
let authLimiter: RateLimiterMemory | RateLimiterRedis;
let uploadLimiter: RateLimiterMemory | RateLimiterRedis;

/**
 * Initialize rate limiters
 */
export function initializeRateLimiters() {
  const redis = getRedisClient();

  if (redis) {
    // Redis-backed rate limiters (for multi-server)
    apiLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl:api',
      points: 100, // 100 requests
      duration: 60, // per minute
    });

    authLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl:auth',
      points: 5, // 5 attempts
      duration: 300, // per 5 minutes
    });

    uploadLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl:upload',
      points: 10, // 10 uploads
      duration: 3600, // per hour
    });

    console.log('[Performance] Redis-backed rate limiters initialized');
  } else {
    // Memory-backed rate limiters (single server)
    apiLimiter = new RateLimiterMemory({
      points: 100,
      duration: 60,
    });

    authLimiter = new RateLimiterMemory({
      points: 5,
      duration: 300,
    });

    uploadLimiter = new RateLimiterMemory({
      points: 10,
      duration: 3600,
    });

    console.log('[Performance] Memory-backed rate limiters initialized');
  }
}

/**
 * API rate limiter middleware
 */
export async function rateLimitAPI(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await apiLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please slow down and try again later',
    });
  }
}

/**
 * Auth rate limiter middleware
 */
export async function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await authLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Please wait 5 minutes before trying again',
    });
  }
}

/**
 * Upload rate limiter middleware
 */
export async function rateLimitUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    await uploadLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'You can upload 10 files per hour',
    });
  }
}

/**
 * Compression middleware
 */
export function setupCompression() {
  return compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Compression level (0-9)
    threshold: 1024, // Only compress responses larger than 1KB
  });
}

/**
 * Security headers middleware
 */
export function setupSecurityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https:', 'wss:', 'ws:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        mediaSrc: ["'self'", 'https:', 'blob:'],
        frameSrc: ["'self'", 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
}

/**
 * Cache control headers
 */
export function setCacheHeaders(maxAge: number = 300) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
}

/**
 * No cache headers (for dynamic content)
 */
export function setNoCacheHeaders(req: Request, res: Response, next: NextFunction) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
}

/**
 * ETags for efficient caching
 */
export function setupETags() {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('ETag', `W/"${Date.now()}"`);
    next();
  };
}

/**
 * CORS headers for CDN
 */
export function setupCORS() {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

/**
 * Response time tracking
 */
export function trackResponseTime(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    res.set('X-Response-Time', `${duration}ms`);

    if (duration > 1000) {
      console.warn(`[Performance] Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });

  next();
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  track(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    // Keep only last 100 measurements
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift();
    }
  }

  getStats(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [name, _] of this.metrics) {
      stats[name] = this.getStats(name);
    }
    return stats;
  }

  clear() {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance wrapper
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    performanceMonitor.track(name, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    performanceMonitor.track(`${name}:error`, duration);
    throw error;
  }
}
