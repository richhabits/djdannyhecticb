/**
 * Rate Limiting System
 * Prevents abuse and ensures fair usage
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyGenerator?: (req: any) => string;
  skipSuccessfulRequests?: boolean;
}

class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  check(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry
      const resetTime = now + config.windowMs;
      this.store.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: config.max - 1,
        resetTime,
      };
    }

    if (entry.count >= config.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: config.max - entry.count,
      resetTime: entry.resetTime,
    };
  }

  getKey(req: any): string {
    // Use IP address or user ID
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const userId = req.user?.id;
    return userId ? `user:${userId}` : `ip:${ip}`;
  }
}

export const rateLimiter = new RateLimiter();

// Predefined rate limit configs
export const RateLimits = {
  // API endpoints
  API: { windowMs: 60000, max: 100 }, // 100 requests per minute
  STRICT: { windowMs: 60000, max: 20 }, // 20 requests per minute
  VERY_STRICT: { windowMs: 60000, max: 5 }, // 5 requests per minute

  // Auth endpoints
  LOGIN: { windowMs: 900000, max: 5 }, // 5 attempts per 15 minutes
  SIGNUP: { windowMs: 3600000, max: 3 }, // 3 signups per hour

  // Analytics tracking
  TRACKING: { windowMs: 1000, max: 10 }, // 10 events per second

  // AI endpoints
  AI: { windowMs: 60000, max: 30 }, // 30 requests per minute

  // Payment endpoints
  PAYMENT: { windowMs: 60000, max: 10 }, // 10 requests per minute
};

/**
 * Rate limit middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return (req: any, res: any, next: any) => {
    const key = config.keyGenerator ? config.keyGenerator(req) : rateLimiter.getKey(req);
    const result = rateLimiter.check(key, config);

    res.setHeader("X-RateLimit-Limit", config.max.toString());
    res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
    res.setHeader("X-RateLimit-Reset", new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }

    next();
  };
}
