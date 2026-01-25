import { rateLimit } from "express-rate-limit";

// Generic public rate limit (120 requests per minute)
export const publicRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});

// Strict auth rate limit (10 attempts per minute)
export const authRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login attempts, please try again in a minute." },
});

// Strict shoutbox rate limit (5 attempts per minute)
export const shoutboxRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many shouts, please wait a moment." },
});

// Strict AI rate limit (10 attempts per minute)
export const aiRateLimit = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "AI capacity reached, please try again later." },
});
