/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * Server-side cache for Beatport API responses
 * In-memory TTL cache with configurable expiration times
 */

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * TTL Configuration for different endpoint types (in seconds)
 */
export const CACHE_TTL = {
  genres: 86400, // 24 hours - genres rarely change
  subGenres: 86400, // 24 hours
  charts: 900, // 15 minutes - charts update frequently
  chartTracks: 900, // 15 minutes
  tracks: 1800, // 30 minutes
  search: 300, // 5 minutes - search results can vary
  artistTypes: 86400, // 24 hours
  commercialModelTypes: 86400, // 24 hours
  health: 60, // 1 minute
} as const;

class BeatportCache {
  private cache: Map<string, CacheEntry<any>>;
  private stats: { hits: number; misses: number };

  constructor() {
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0 };
    
    // Run cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Generate a cache key from endpoint and params
   */
  private generateKey(endpoint: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }
    
    // Sort params for consistent keys
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get TTL for a specific endpoint
   */
  private getTTL(endpoint: string): number {
    if (endpoint.includes('/genres/')) return CACHE_TTL.genres;
    if (endpoint.includes('/sub-genres/')) return CACHE_TTL.subGenres;
    if (endpoint.includes('/charts/') && endpoint.includes('/tracks/')) return CACHE_TTL.chartTracks;
    if (endpoint.includes('/charts/')) return CACHE_TTL.charts;
    if (endpoint.includes('/tracks/')) return CACHE_TTL.tracks;
    if (endpoint.includes('/search/')) return CACHE_TTL.search;
    if (endpoint.includes('/artist-types/')) return CACHE_TTL.artistTypes;
    if (endpoint.includes('/commercial-model-types/')) return CACHE_TTL.commercialModelTypes;
    if (endpoint.includes('/health')) return CACHE_TTL.health;
    
    // Default TTL for unknown endpoints
    return 300; // 5 minutes
  }

  /**
   * Get cached data if available and not expired
   */
  get<T>(endpoint: string, params?: Record<string, any>): T | null {
    const key = this.generateKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      console.log(`[Beatport Cache] MISS - ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      console.log(`[Beatport Cache] EXPIRED - ${key}`);
      return null;
    }

    this.stats.hits++;
    const age = Math.floor((Date.now() - entry.createdAt) / 1000);
    console.log(`[Beatport Cache] HIT - ${key} (age: ${age}s)`);
    return entry.data as T;
  }

  /**
   * Set cached data with TTL
   */
  set<T>(endpoint: string, params: Record<string, any> | undefined, data: T): void {
    const key = this.generateKey(endpoint, params);
    const ttl = this.getTTL(endpoint);
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data,
      expiresAt: now + ttl * 1000,
      createdAt: now,
    };

    this.cache.set(key, entry);
    console.log(`[Beatport Cache] SET - ${key} (TTL: ${ttl}s)`);
  }

  /**
   * Invalidate cache for specific endpoint/params
   */
  invalidate(endpoint: string, params?: Record<string, any>): void {
    const key = this.generateKey(endpoint, params);
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[Beatport Cache] INVALIDATED - ${key}`);
    }
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): number {
    let count = 0;
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      count++;
    });
    
    console.log(`[Beatport Cache] INVALIDATED ${count} entries matching pattern: ${pattern}`);
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`[Beatport Cache] CLEARED all ${size} entries`);
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removed = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      removed++;
    });

    if (removed > 0) {
      console.log(`[Beatport Cache] CLEANUP - removed ${removed} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
    console.log('[Beatport Cache] Statistics reset');
  }
}

// Singleton instance
export const beatportCache = new BeatportCache();
