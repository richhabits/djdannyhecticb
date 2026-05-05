/**
 * Cache Manager: High-level cache operations with automatic serialization
 * Handles get, set, delete, and invalidation operations
 */

import { getRedisClient } from './redis-client';
import { CACHE_TTL } from './cache-keys';
import { logger } from '../logging';

export interface CacheOptions {
  ttl?: number; // Override default TTL
  tags?: string[]; // For grouping related caches
  compress?: boolean; // Enable compression for large payloads
}

export class CacheManager {
  private client: any | null = null;
  private initialized = false;

  constructor() {
    // Lazy-load Redis client on first use instead of constructor
  }

  private getClient() {
    if (!this.initialized) {
      try {
        this.client = getRedisClient();
        this.initialized = true;
      } catch (error) {
        logger.warn('Redis not available - caching disabled', { error });
        this.client = null;
        this.initialized = true;
      }
    }
    return this.client;
  }

  /**
   * Get a value from cache
   * Returns null if key doesn't exist or has expired
   */
  async get<T = any>(key: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) return null; // Redis not available

    try {
      const value = await client.get(key);
      if (!value) return null;

      // Parse JSON if it looks like JSON
      try {
        return JSON.parse(value) as T;
      } catch {
        // If not JSON, return as-is
        return value as T;
      }
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null; // Graceful fallback
    }
  }

  /**
   * Set a value in cache with TTL
   */
  async set<T = any>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false; // Redis not available

    try {
      const ttl = options.ttl || CACHE_TTL.STANDARD;
      const serialized = JSON.stringify(value);

      if (ttl === CACHE_TTL.INDEFINITE || ttl === -1) {
        // No expiration
        await client.set(key, serialized);
      } else {
        // Set with expiration (EX for seconds)
        await client.setEx(key, ttl, serialized);
      }

      // Add tags if provided (for batch invalidation)
      if (options.tags?.length) {
        for (const tag of options.tags) {
          await client.sAdd(`tags:${tag}`, key);
        }
      }

      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false; // Graceful fallback
    }
  }

  /**
   * Get or compute - retrieves from cache or calls fetcher function
   * Perfect for lazy-loading cache with fallback
   */
  async getOrCompute<T = any>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }

    // Cache miss - compute value
    logger.debug('Cache miss, computing', { key });
    const computed = await fetcher();

    // Store in cache
    await this.set(key, computed, options);

    return computed;
  }

  /**
   * Batch get multiple keys
   */
  async mGet<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    const client = this.getClient();
    if (!client) return new Map(keys.map((k) => [k, null])); // Redis not available

    try {
      const values = await client.mGet(keys);
      const result = new Map<string, T | null>();

      keys.forEach((key, index) => {
        const value = values[index];
        try {
          result.set(key, value ? JSON.parse(value) : null);
        } catch {
          result.set(key, value as T);
        }
      });

      return result;
    } catch (error) {
      logger.error('Cache mget error', { count: keys.length, error });
      // Return empty map on error
      return new Map(keys.map((k) => [k, null]));
    }
  }

  /**
   * Batch set multiple keys
   */
  async mSet<T = any>(
    entries: Array<[string, T]>,
    options: CacheOptions = {}
  ): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false; // Redis not available

    try {
      const ttl = options.ttl || CACHE_TTL.STANDARD;
      const pipeline = client.multi();

      for (const [key, value] of entries) {
        const serialized = JSON.stringify(value);
        if (ttl === CACHE_TTL.INDEFINITE || ttl === -1) {
          pipeline.set(key, serialized);
        } else {
          pipeline.setEx(key, ttl, serialized);
        }
      }

      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error', { count: entries.length, error });
      return false;
    }
  }

  /**
   * Delete a single key
   */
  async delete(key: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false; // Redis not available

    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }

  /**
   * Batch delete multiple keys
   */
  async mDelete(keys: string[]): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false; // Redis not available

    try {
      if (keys.length === 0) return true;
      await client.del(keys);
      return true;
    } catch (error) {
      logger.error('Cache mdelete error', { count: keys.length, error });
      return false;
    }
  }

  /**
   * Delete keys matching a pattern
   * WARNING: Use sparingly, can be slow on large datasets
   */
  async deletePattern(pattern: string): Promise<number> {
    const client = this.getClient();
    if (!client) return 0; // Redis not available

    try {
      const keys = await client.keys(pattern);
      if (keys.length === 0) return 0;

      await client.del(keys);
      logger.info('Cache pattern deleted', { pattern, count: keys.length });
      return keys.length;
    } catch (error) {
      logger.error('Cache deletePattern error', { pattern, error });
      return 0;
    }
  }

  /**
   * Get all keys matching a pattern (for debugging)
   */
  async findKeys(pattern: string, limit: number = 1000): Promise<string[]> {
    const client = this.getClient();
    if (!client) return []; // Redis not available

    try {
      const keys = await client.keys(pattern);
      return keys.slice(0, limit);
    } catch (error) {
      logger.error('Cache findKeys error', { pattern, error });
      return [];
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false; // Redis not available

    try {
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memoryUsage: number;
    keysCount: number;
    hitRate?: number;
  }> {
    const client = this.getClient();
    if (!client) return { memoryUsage: 0, keysCount: 0 }; // Redis not available

    try {
      const info = await client.info('memory');
      const dbSize = await client.dbSize();

      // Parse memory info
      const memoryMatch = info.match(/used_memory:(\d+)/);
      const memory = memoryMatch ? parseInt(memoryMatch[1]) : 0;

      return {
        memoryUsage: memory,
        keysCount: dbSize,
      };
    } catch (error) {
      logger.error('Cache getStats error', { error });
      return { memoryUsage: 0, keysCount: 0 };
    }
  }

  /**
   * Clear all cache (emergency only)
   */
  async clear(): Promise<boolean> {
    const client = this.getClient();
    if (!client) return false; // Redis not available

    try {
      await client.flushDb();
      logger.warn('Cache cleared (FLUSH_DB)');
      return true;
    } catch (error) {
      logger.error('Cache clear error', { error });
      return false;
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<number> {
    const client = this.getClient();
    if (!client) return 0; // Redis not available

    try {
      const keys = await client.sMembers(`tags:${tag}`);
      if (keys.length === 0) return 0;

      await client.del([...keys, `tags:${tag}`]);
      logger.info('Cache tag invalidated', { tag, count: keys.length });
      return keys.length;
    } catch (error) {
      logger.error('Cache invalidateByTag error', { tag, error });
      return 0;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
