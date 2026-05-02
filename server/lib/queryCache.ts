/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Query Result Caching
 * Implements in-memory caching for frequently accessed data with TTL and invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  totalSize: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    totalSize: 0,
  };
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxSize = 100 * 1024 * 1024; // 100MB default

  constructor(maxSize?: number) {
    if (maxSize) this.maxSize = maxSize;
    // Auto cleanup every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get a value from cache if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    // Don't cache if over size limit
    const estimatedSize = JSON.stringify(data).length;
    if (this.stats.totalSize + estimatedSize > this.maxSize) {
      this.cleanup(); // Try to free space
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    this.stats.sets++;
    this.stats.totalSize += estimatedSize;
  }

  /**
   * Delete a specific cache key
   */
  delete(key: string): boolean {
    const had = this.cache.has(key);
    if (had) {
      this.cache.delete(key);
      this.stats.deletes++;
    }
    return had;
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.stats.deletes += count;
    return count;
  }

  /**
   * Clear all cache
   */
  clear(): number {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    this.stats.totalSize = 0;
    return size;
  }

  /**
   * Remove expired entries and oldest entries if cache is full
   */
  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expired.push(key);
      }
    }

    // Delete expired
    expired.forEach(key => this.cache.delete(key));

    // If still over size, remove oldest
    if (this.stats.totalSize > this.maxSize) {
      const sorted = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.timestamp - b.timestamp
      );

      for (const [key] of sorted) {
        if (this.stats.totalSize <= this.maxSize * 0.8) break;
        this.cache.delete(key);
        this.stats.deletes++;
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : "0.00";

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Shutdown cache (cleanup interval)
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Create singleton instance
const queryCache = new QueryCache();

/**
 * Cache wrapper for expensive queries
 */
export async function cacheQuery<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 300000 // 5 minutes default
): Promise<T> {
  const cached = queryCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await fn();
  queryCache.set(key, result, ttlMs);
  return result;
}

/**
 * Cache keys generator
 */
export const cacheKeys = {
  chat: (sessionId: number, limit?: number, offset?: number) =>
    `chat:session:${sessionId}:${limit ?? 50}:${offset ?? 0}`,
  reactions: (sessionId: number) => `reactions:session:${sessionId}`,
  donations: (sessionId: number, userId?: number) =>
    userId ? `donations:session:${sessionId}:user:${userId}` : `donations:session:${sessionId}`,
  leaderboard: () => "leaderboard:global",
  userStats: (userId: number) => `user:stats:${userId}`,
  streamerStats: (userId: number) => `streamer:stats:${userId}`,
  notifications: (userId: number) => `notifications:user:${userId}`,
  badges: (userId: number) => `badges:user:${userId}`,
};

export { queryCache };
