/**
 * Redis Caching Layer
 * High-performance caching for frequently accessed data
 */

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

class CacheManager {
  private redis: any = null;
  private enabled: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn("[Cache] REDIS_URL not configured, caching disabled");
      return;
    }

    try {
      // Try to import redis client
      const redis = await import("ioredis").catch(() => null);
      if (redis) {
        this.redis = new redis.default(redisUrl);
        this.enabled = true;
        console.log("[Cache] Redis cache initialized");
      }
    } catch (error) {
      console.warn("[Cache] Failed to initialize Redis:", error);
    }
  }

  private getKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    if (!this.enabled || !this.redis) return null;

    try {
      const fullKey = this.getKey(key, prefix);
      const data = await this.redis.get(fullKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("[Cache] Get error:", error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number, prefix?: string): Promise<boolean> {
    if (!this.enabled || !this.redis) return false;

    try {
      const fullKey = this.getKey(key, prefix);
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(fullKey, ttl, serialized);
      } else {
        await this.redis.set(fullKey, serialized);
      }
      return true;
    } catch (error) {
      console.error("[Cache] Set error:", error);
      return false;
    }
  }

  async del(key: string, prefix?: string): Promise<boolean> {
    if (!this.enabled || !this.redis) return false;

    try {
      const fullKey = this.getKey(key, prefix);
      await this.redis.del(fullKey);
      return true;
    } catch (error) {
      console.error("[Cache] Delete error:", error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.enabled || !this.redis) return 0;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.redis.del(...keys);
    } catch (error) {
      console.error("[Cache] Invalidate pattern error:", error);
      return 0;
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    prefix?: string
  ): Promise<T> {
    const cached = await this.get<T>(key, prefix);
    if (cached !== null) return cached;

    const value = await fetcher();
    await this.set(key, value, ttl, prefix);
    return value;
  }
}

export const cache = new CacheManager();

// Cache key generators
export const CacheKeys = {
  mixes: (id?: number) => id ? `mixes:${id}` : "mixes:all",
  events: (id?: number) => id ? `events:${id}` : "events:all",
  podcasts: () => "podcasts:all",
  user: (id: number) => `user:${id}`,
  wallet: (userId: number) => `wallet:${userId}`,
  analytics: (days: number) => `analytics:${days}`,
  stream: (id?: number) => id ? `stream:${id}` : "stream:active",
  shouts: (limit: number) => `shouts:${limit}`,
  empire: () => "empire:overview",
};

// Cache TTLs (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};
