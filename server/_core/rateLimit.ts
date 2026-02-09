/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Request, Response, NextFunction } from "express";

/**
 * Enterprise Rate Limiting Middleware
 * 
 * Features:
 * - Tiered rate limits (different limits for different endpoints)
 * - Memory-backed (clean and fast)
 * - X-RateLimit headers (Industry Standard)
 * - Graceful handling
 */

// Memory cache for rate limiting
const memoryLimiter = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit configuration tiers
 */
export const RateLimitTiers = {
    // Public API endpoints
    PUBLIC: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100, // 100 requests per minute
        name: "public",
    },

    // Authentication endpoints
    AUTH: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 attempts per 15 minutes
        name: "auth",
    },

    // Booking / Lead gen endpoints
    BOOKING: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 5, // 5 bookings per hour
        name: "booking",
    },

    // AI Chat endpoints
    AI: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20, // 20 messages per minute
        name: "ai",
    },

    // DDoS protection (very strict)
    STRICT: {
        windowMs: 10 * 1000, // 10 seconds
        maxRequests: 300, // Reduced strictness for asset loading
        name: "strict",
    },

    // Intelligence / Alert endpoints (D1 Hardening)
    INTEL: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60, // 60 requests per minute
        name: "intel",
    },

    // Analytics tracking (lightweight)
    TRACK: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60, // 60 events per minute per user
        name: "track",
    },
} as const;

export type RateLimitTier = keyof typeof RateLimitTiers;

function getRateLimitKey(req: Request, tier: RateLimitTier): string {
    // Use session ID if available, otherwise IP
    const sessionId = req.cookies?.session || "anon";
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";

    return `ratelimit:${tier}:${sessionId}:${ip}`;
}

/**
 * Create rate limiter middleware
 */
export function createRateLimiter(tier: RateLimitTier = "PUBLIC") {
    const config = RateLimitTiers[tier];

    return (req: Request, res: Response, next: NextFunction) => {
        const key = getRateLimitKey(req, tier);
        const now = Date.now();

        let record = memoryLimiter.get(key);

        // Check if record exists and is still valid
        if (record && record.resetTime > now) {
            record.count++;
        } else {
            // Create new record or reset expired one
            record = {
                count: 1,
                resetTime: now + config.windowMs
            };
            memoryLimiter.set(key, record);

            // Periodically clean up memory
            if (memoryLimiter.size > 10000) {
                for (const [k, v] of memoryLimiter.entries()) {
                    if (v.resetTime < now) memoryLimiter.delete(k);
                }
            }
        }

        const remaining = Math.max(0, config.maxRequests - record.count);

        // Set Industry Standard Headers
        res.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", remaining.toString());
        res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000).toString());

        if (record.count > config.maxRequests) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader("Retry-After", retryAfter.toString());

            console.warn(`[RateLimit] ${tier} exceeded for ${key}. Retry in ${retryAfter}s`);

            return res.status(429).json({
                error: "Too many requests. Please try again later.",
                retryAfter,
                tier: config.name
            });
        }

        next();
    };
}

// Export common limiters
export const publicLimiter = createRateLimiter("PUBLIC");
export const authLimiter = createRateLimiter("AUTH");
export const bookingLimiter = createRateLimiter("BOOKING");
export const aiLimiter = createRateLimiter("AI");
export const strictLimiter = createRateLimiter("STRICT");
export const intelLimiter = createRateLimiter("INTEL");
export const trackLimiter = createRateLimiter("TRACK");

