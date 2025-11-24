import Redis from 'ioredis';
import { z } from 'zod';

/**
 * Enterprise-level Redis cache implementation with multiple strategies
 */

// Initialize Redis client with connection pooling and retry logic
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },
});

// Cache key prefixes for different data types
export const CACHE_PREFIXES = {
  USER: 'user:',
  BOOKING: 'booking:',
  AVAILABILITY: 'availability:',
  MIX: 'mix:',
  EVENT: 'event:',
  ANALYTICS: 'analytics:',
  SESSION: 'session:',
  RATE_LIMIT: 'ratelimit:',
  STREAMING: 'streaming:',
  SOCIAL: 'social:',
} as const;

// Cache TTL configurations (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAILY: 86400, // 24 hours
  WEEKLY: 604800, // 7 days
} as const;

// Redis connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('ready', () => {
  console.log('✅ Redis ready to accept commands');
});

/**
 * Generic cache wrapper with automatic serialization
 */
export class CacheManager {
  /**
   * Get value from cache with type safety
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set<T>(key: string, value: T, ttl: number = CACHE_TTL.MEDIUM): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const result = await redis.setex(key, ttl, serialized);
      return result === 'OK';
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  static async delete(key: string): Promise<boolean> {
    try {
      const result = await redis.del(key);
      return result === 1;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async deleteByPattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      return await redis.del(...keys);
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error('Cache TTL error:', error);
      return -1;
    }
  }

  /**
   * Increment a counter
   */
  static async increment(key: string, amount = 1): Promise<number> {
    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  /**
   * Cache with automatic refresh on miss
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();
    
    // Cache the fresh data
    await this.set(key, fresh, ttl);
    
    return fresh;
  }
}

/**
 * Session management using Redis
 */
export class SessionManager {
  static async create(sessionId: string, data: any, ttl = CACHE_TTL.DAILY): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionId}`;
    return await CacheManager.set(key, data, ttl);
  }

  static async get(sessionId: string): Promise<any | null> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionId}`;
    return await CacheManager.get(key);
  }

  static async update(sessionId: string, data: any): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionId}`;
    const current = await this.get(sessionId);
    if (!current) return false;
    
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    const ttl = await CacheManager.ttl(key);
    return await CacheManager.set(key, updated, ttl > 0 ? ttl : CACHE_TTL.DAILY);
  }

  static async destroy(sessionId: string): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionId}`;
    return await CacheManager.delete(key);
  }

  static async extend(sessionId: string, additionalTtl = CACHE_TTL.DAILY): Promise<boolean> {
    const key = `${CACHE_PREFIXES.SESSION}${sessionId}`;
    const result = await redis.expire(key, additionalTtl);
    return result === 1;
  }
}

/**
 * Rate limiting using Redis
 */
export class RateLimiter {
  static async checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const key = `${CACHE_PREFIXES.RATE_LIMIT}${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Remove old entries
      await redis.zremrangebyscore(key, '-inf', windowStart);

      // Count current requests in window
      const currentCount = await redis.zcard(key);

      if (currentCount >= maxRequests) {
        // Get the oldest request time to calculate reset
        const oldestRequest = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetAt = oldestRequest.length > 1 
          ? new Date(Number(oldestRequest[1]) + windowMs)
          : new Date(now + windowMs);

        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      // Add current request
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.expire(key, Math.ceil(windowMs / 1000));

      return {
        allowed: true,
        remaining: maxRequests - currentCount - 1,
        resetAt: new Date(now + windowMs),
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // In case of error, allow the request but log it
      return {
        allowed: true,
        remaining: 0,
        resetAt: new Date(now + windowMs),
      };
    }
  }
}

/**
 * Distributed lock implementation for preventing race conditions
 */
export class DistributedLock {
  static async acquire(
    lockKey: string,
    ttlMs = 5000,
    maxRetries = 10,
    retryDelayMs = 100
  ): Promise<{ acquired: boolean; lockId: string }> {
    const lockId = `${Date.now()}-${Math.random()}`;
    const key = `lock:${lockKey}`;

    for (let i = 0; i < maxRetries; i++) {
      const result = await redis.set(key, lockId, 'PX', ttlMs, 'NX');
      
      if (result === 'OK') {
        return { acquired: true, lockId };
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelayMs));
    }

    return { acquired: false, lockId: '' };
  }

  static async release(lockKey: string, lockId: string): Promise<boolean> {
    const key = `lock:${lockKey}`;
    
    // Use Lua script to ensure atomic operation
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    try {
      const result = await redis.eval(script, 1, key, lockId) as number;
      return result === 1;
    } catch (error) {
      console.error('Lock release error:', error);
      return false;
    }
  }
}

/**
 * Cache invalidation strategies
 */
export class CacheInvalidator {
  /**
   * Invalidate all caches for a specific user
   */
  static async invalidateUser(userId: string): Promise<void> {
    const patterns = [
      `${CACHE_PREFIXES.USER}${userId}*`,
      `${CACHE_PREFIXES.BOOKING}*:user:${userId}`,
      `${CACHE_PREFIXES.SESSION}*:${userId}`,
    ];

    for (const pattern of patterns) {
      await CacheManager.deleteByPattern(pattern);
    }
  }

  /**
   * Invalidate all booking-related caches
   */
  static async invalidateBookings(date?: string): Promise<void> {
    const pattern = date 
      ? `${CACHE_PREFIXES.BOOKING}*:${date}*`
      : `${CACHE_PREFIXES.BOOKING}*`;
    
    await CacheManager.deleteByPattern(pattern);
    await CacheManager.deleteByPattern(`${CACHE_PREFIXES.AVAILABILITY}*`);
  }

  /**
   * Invalidate analytics caches
   */
  static async invalidateAnalytics(): Promise<void> {
    await CacheManager.deleteByPattern(`${CACHE_PREFIXES.ANALYTICS}*`);
  }

  /**
   * Clear all caches (use with caution)
   */
  static async clearAll(): Promise<void> {
    await redis.flushdb();
    console.log('⚠️ All caches cleared');
  }
}

/**
 * Pub/Sub functionality for real-time updates
 */
export class PubSub {
  private static publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  private static subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  private static handlers = new Map<string, Set<(message: any) => void>>();

  static async publish(channel: string, message: any): Promise<void> {
    try {
      const serialized = JSON.stringify(message);
      await this.publisher.publish(channel, serialized);
    } catch (error) {
      console.error('PubSub publish error:', error);
    }
  }

  static subscribe(channel: string, handler: (message: any) => void): void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      
      this.subscriber.subscribe(channel, (err) => {
        if (err) {
          console.error('PubSub subscribe error:', err);
        }
      });
    }

    this.handlers.get(channel)!.add(handler);
  }

  static unsubscribe(channel: string, handler?: (message: any) => void): void {
    if (!this.handlers.has(channel)) return;

    if (handler) {
      this.handlers.get(channel)!.delete(handler);
    } else {
      this.handlers.delete(channel);
      this.subscriber.unsubscribe(channel);
    }
  }

  static {
    // Set up message handler
    this.subscriber.on('message', (channel, message) => {
      const handlers = this.handlers.get(channel);
      if (!handlers) return;

      try {
        const parsed = JSON.parse(message);
        handlers.forEach(handler => handler(parsed));
      } catch (error) {
        console.error('PubSub message parsing error:', error);
      }
    });
  }
}

// Export the Redis client for direct access if needed
export { redis };