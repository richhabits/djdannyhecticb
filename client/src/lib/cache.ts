/**
 * Client-side Caching Utilities
 * 
 * Provides utilities for caching API responses and expensive computations.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Storage type */
  storage?: "memory" | "session" | "local";
  /** Cache key prefix */
  prefix?: string;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Get a value from cache
 */
export function getFromCache<T>(key: string, options: CacheOptions = {}): T | null {
  const { storage = "memory", prefix = "cache:" } = options;
  const fullKey = prefix + key;

  if (storage === "memory") {
    const entry = memoryCache.get(fullKey) as CacheEntry<T> | undefined;
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    if (entry) {
      memoryCache.delete(fullKey);
    }
    return null;
  }

  const storageObj = storage === "session" ? sessionStorage : localStorage;
  const raw = storageObj.getItem(fullKey);
  
  if (!raw) return null;

  try {
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.expiresAt > Date.now()) {
      return entry.data;
    }
    storageObj.removeItem(fullKey);
  } catch {
    storageObj.removeItem(fullKey);
  }

  return null;
}

/**
 * Set a value in cache
 */
export function setInCache<T>(key: string, data: T, options: CacheOptions = {}): void {
  const { ttl = DEFAULT_TTL, storage = "memory", prefix = "cache:" } = options;
  const fullKey = prefix + key;
  const now = Date.now();

  const entry: CacheEntry<T> = {
    data,
    timestamp: now,
    expiresAt: now + ttl,
  };

  if (storage === "memory") {
    memoryCache.set(fullKey, entry);
    return;
  }

  const storageObj = storage === "session" ? sessionStorage : localStorage;
  try {
    storageObj.setItem(fullKey, JSON.stringify(entry));
  } catch (e) {
    // Storage might be full, try to clear old entries
    clearExpiredCache(storage);
    try {
      storageObj.setItem(fullKey, JSON.stringify(entry));
    } catch {
      // Give up if still failing
      console.warn("Cache storage full, unable to cache:", key);
    }
  }
}

/**
 * Remove a value from cache
 */
export function removeFromCache(key: string, options: CacheOptions = {}): void {
  const { storage = "memory", prefix = "cache:" } = options;
  const fullKey = prefix + key;

  if (storage === "memory") {
    memoryCache.delete(fullKey);
    return;
  }

  const storageObj = storage === "session" ? sessionStorage : localStorage;
  storageObj.removeItem(fullKey);
}

/**
 * Clear all expired entries from cache
 */
export function clearExpiredCache(storage: "memory" | "session" | "local" = "memory"): void {
  const now = Date.now();

  if (storage === "memory") {
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }
    return;
  }

  const storageObj = storage === "session" ? sessionStorage : localStorage;
  const keysToRemove: string[] = [];

  for (let i = 0; i < storageObj.length; i++) {
    const key = storageObj.key(i);
    if (!key?.startsWith("cache:")) continue;

    try {
      const raw = storageObj.getItem(key);
      if (raw) {
        const entry: CacheEntry<unknown> = JSON.parse(raw);
        if (entry.expiresAt <= now) {
          keysToRemove.push(key);
        }
      }
    } catch {
      keysToRemove.push(key!);
    }
  }

  keysToRemove.forEach(key => storageObj.removeItem(key));
}

/**
 * Clear all cache entries
 */
export function clearAllCache(storage?: "memory" | "session" | "local"): void {
  if (!storage || storage === "memory") {
    memoryCache.clear();
  }

  if (!storage || storage === "session") {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("cache:")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }

  if (!storage || storage === "local") {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("cache:")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Cached fetch with automatic caching
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = getFromCache<T>(key, options);
  if (cached !== null) {
    return cached;
  }

  const data = await fetchFn();
  setInCache(key, data, options);
  return data;
}

/**
 * Memoize a function with caching
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions & { keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  const { keyFn = (...args) => JSON.stringify(args), ...cacheOptions } = options;

  return ((...args: Parameters<T>) => {
    const key = keyFn(...args);
    const cached = getFromCache<ReturnType<T>>(key, cacheOptions);
    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    setInCache(key, result, cacheOptions);
    return result;
  }) as T;
}

/**
 * Hook-friendly cached query
 */
export function useCachedQuery<T>(
  key: string,
  options: CacheOptions = {}
): {
  get: () => T | null;
  set: (data: T) => void;
  remove: () => void;
  clear: () => void;
} {
  return {
    get: () => getFromCache<T>(key, options),
    set: (data: T) => setInCache(key, data, options),
    remove: () => removeFromCache(key, options),
    clear: () => clearAllCache(options.storage),
  };
}

export default {
  getFromCache,
  setInCache,
  removeFromCache,
  clearExpiredCache,
  clearAllCache,
  cachedFetch,
  memoize,
  useCachedQuery,
};
