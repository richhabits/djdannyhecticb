import Redis from 'ioredis';
import { ENV } from './env';

let redis: Redis | null = null;
const memoryCache = new Map<string, { value: any; expires: number }>();

/**
 * Initialize Redis connection
 */
export function getRedisClient(): Redis | null {
  if (!ENV.REDIS_URL) {
    console.warn('[Cache] Redis not configured, using memory cache');
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(ENV.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            console.error('[Cache] Redis connection failed after 3 retries');
            return null;
          }
          return Math.min(times * 100, 2000);
        },
      });

      redis.on('connect', () => {
        console.log('[Cache] Redis connected');
      });

      redis.on('error', (err) => {
        console.error('[Cache] Redis error:', err);
      });
    } catch (error) {
      console.error('[Cache] Failed to initialize Redis:', error);
      return null;
    }
  }

  return redis;
}

/**
 * Get value from cache
 */
export async function get<T>(key: string): Promise<T | null> {
  const client = getRedisClient();

  // Redis cache
  if (client) {
    try {
      const value = await client.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
    } catch (error) {
      console.error(`[Cache] Failed to get ${key} from Redis:`, error);
    }
  }

  // Memory cache fallback
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.value as T;
  }

  // Clean expired
  if (cached && cached.expires <= Date.now()) {
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set value in cache
 */
export async function set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  const client = getRedisClient();

  // Redis cache
  if (client) {
    try {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
      return;
    } catch (error) {
      console.error(`[Cache] Failed to set ${key} in Redis:`, error);
    }
  }

  // Memory cache fallback
  memoryCache.set(key, {
    value,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete value from cache
 */
export async function del(key: string): Promise<void> {
  const client = getRedisClient();

  if (client) {
    try {
      await client.del(key);
    } catch (error) {
      console.error(`[Cache] Failed to delete ${key} from Redis:`, error);
    }
  }

  memoryCache.delete(key);
}

/**
 * Delete multiple keys matching pattern
 */
export async function deletePattern(pattern: string): Promise<number> {
  const client = getRedisClient();

  if (client) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
        return keys.length;
      }
    } catch (error) {
      console.error(`[Cache] Failed to delete pattern ${pattern}:`, error);
    }
  }

  // Memory cache pattern delete
  let count = 0;
  const regex = new RegExp(pattern.replace('*', '.*'));
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      count++;
    }
  }
  return count;
}

/**
 * Increment counter
 */
export async function incr(key: string, ttlSeconds?: number): Promise<number> {
  const client = getRedisClient();

  if (client) {
    try {
      const value = await client.incr(key);
      if (ttlSeconds) {
        await client.expire(key, ttlSeconds);
      }
      return value;
    } catch (error) {
      console.error(`[Cache] Failed to increment ${key}:`, error);
    }
  }

  // Memory cache increment
  const cached = memoryCache.get(key);
  const newValue = (cached?.value || 0) + 1;
  memoryCache.set(key, {
    value: newValue,
    expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : Date.now() + 300000,
  });
  return newValue;
}

/**
 * Cache wrapper for functions
 */
export function cached<T>(
  key: string | ((...args: any[]) => string),
  ttlSeconds: number = 300
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = typeof key === 'function' ? key(...args) : key;

      // Try cache first
      const cachedValue = await get<T>(cacheKey);
      if (cachedValue !== null) {
        return cachedValue;
      }

      // Execute function
      const result = await originalMethod.apply(this, args);

      // Cache result
      await set(cacheKey, result, ttlSeconds);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache helper for tRPC queries
 */
export async function cacheQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await queryFn();
  await set(key, result, ttlSeconds);
  return result;
}

/**
 * Clear entire cache
 */
export async function clearAll(): Promise<void> {
  const client = getRedisClient();

  if (client) {
    try {
      await client.flushdb();
    } catch (error) {
      console.error('[Cache] Failed to flush Redis:', error);
    }
  }

  memoryCache.clear();
}

/**
 * Get cache stats
 */
export async function getCacheStats() {
  const client = getRedisClient();

  if (client) {
    try {
      const info = await client.info('stats');
      const keyspace = await client.info('keyspace');
      return {
        type: 'redis',
        info,
        keyspace,
      };
    } catch (error) {
      console.error('[Cache] Failed to get Redis stats:', error);
    }
  }

  return {
    type: 'memory',
    keys: memoryCache.size,
    items: Array.from(memoryCache.keys()),
  };
}

/**
 * Cleanup on shutdown
 */
export async function closeCache() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
  memoryCache.clear();
}
