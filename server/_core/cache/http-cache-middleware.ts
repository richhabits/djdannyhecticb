/**
 * HTTP Response Caching Middleware
 * Caches GET request responses based on configured patterns
 */

import { Request, Response, NextFunction } from 'express';
import { cacheManager } from './cache-manager';
import { CACHE_TTL } from './cache-keys';
import { logger } from '../logging';

interface CacheMiddlewareOptions {
  ttl?: number;
  condition?: (req: Request) => boolean; // Cache only if condition is true
  keyGenerator?: (req: Request) => string; // Custom cache key generator
  varyBy?: string[]; // Headers to include in cache key (e.g., 'accept-language')
}

const DEFAULT_KEY_GENERATOR = (req: Request): string => {
  return `http:${req.method}:${req.originalUrl}`;
};

export function httpCacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const {
    ttl = CACHE_TTL.STANDARD,
    condition = (req) => req.method === 'GET',
    keyGenerator = DEFAULT_KEY_GENERATOR,
    varyBy = ['accept', 'accept-encoding'],
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests by default
    if (!condition(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);

    // Try to serve from cache
    try {
      const cached = await cacheManager.get<{ body: any; headers: Record<string, string> }>(
        cacheKey
      );

      if (cached) {
        logger.debug('HTTP cache hit', { url: req.originalUrl, method: req.method });

        // Add cache hit header
        res.setHeader('x-cache', 'hit');

        // Restore headers
        Object.entries(cached.headers).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-length') {
            res.setHeader(key, value);
          }
        });

        return res.send(cached.body);
      }
    } catch (error) {
      logger.warn('HTTP cache read error', { error, key: cacheKey });
      // Continue to handler
    }

    // Cache miss - intercept response
    const originalSend = res.send.bind(res);

    res.send = function (body: any) {
      // Add cache miss header
      res.setHeader('x-cache', 'miss');

      // Cache successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const responseToCache = {
          body,
          headers: Object.fromEntries(
            Array.from(res.getHeaders().entries()).filter(([key]) => {
              const lowerKey = key.toLowerCase();
              // Skip internal and computed headers
              return !['transfer-encoding', 'connection', 'content-encoding'].includes(lowerKey);
            })
          ),
        };

        cacheManager
          .set(cacheKey, responseToCache, { ttl })
          .catch((error) => {
            logger.warn('HTTP cache write error', { error, key: cacheKey });
          });
      }

      return originalSend(body);
    };

    next();
  };
}

/**
 * Caches responses by URL with optional vary headers
 * Useful for API endpoints that vary by user, region, etc.
 */
export function varyHttpCache(varyHeaders: string[] = []) {
  return httpCacheMiddleware({
    ttl: CACHE_TTL.STANDARD,
    keyGenerator: (req) => {
      let key = `http:${req.method}:${req.originalUrl}`;

      // Add vary headers to key
      for (const header of varyHeaders) {
        const value = req.get(header);
        if (value) {
          key += `:${header}=${value}`;
        }
      }

      return key;
    },
  });
}

/**
 * Cache-busting response header
 * Middleware that invalidates cache when certain headers are present
 */
export function cacheInvalidationMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Check for cache invalidation header
    const invalidatePattern = req.get('x-cache-invalidate');

    if (invalidatePattern) {
      try {
        const count = await cacheManager.deletePattern(invalidatePattern);
        logger.info('Cache invalidated via header', { pattern: invalidatePattern, count });
        res.setHeader('x-cache-invalidated', count.toString());
      } catch (error) {
        logger.error('Cache invalidation error', { error });
      }
    }

    next();
  };
}

/**
 * Response header metadata for caching
 * Add cache control headers to responses
 */
export function setCacheHeaders(ttl: number = CACHE_TTL.STANDARD) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set cache control headers
    const maxAge = ttl;
    const cacheControl = `public, max-age=${maxAge}`;

    res.setHeader('cache-control', cacheControl);
    res.setHeader('expires', new Date(Date.now() + maxAge * 1000).toUTCString());

    next();
  };
}

/**
 * Tag-based cache invalidation helper
 * Attach tags to cached responses for batch invalidation
 */
export function taggedCacheMiddleware(getTags: (req: Request) => string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tags = getTags(req);

    // Store tags on response object for later use
    (res as any).cacheTags = tags;

    // Invalidate tags on modification methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      res.on('finish', () => {
        if (res.statusCode < 300) {
          // Success - invalidate related caches
          for (const tag of tags) {
            cacheManager.invalidateByTag(tag).catch((error) => {
              logger.warn('Cache tag invalidation failed', { tag, error });
            });
          }
        }
      });
    }

    next();
  };
}
