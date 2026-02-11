/**
 * Analytics Tracking Service
 * 
 * Self-hosted, privacy-respecting click tracking.
 * - IP addresses are hashed with SERVER_SALT
 * - PII fields (email, phone) are blocked
 * - Event names are validated (max 80 chars)
 * - Props size is limited to prevent abuse
 */

import { z } from "zod";
import crypto from "crypto";
import { Request, Response, Express } from "express";
import { getDb } from "../db";
import { analyticsEvents } from "../../drizzle/schema";

// Validation schema for tracking events
const trackEventSchema = z.object({
    event: z.string()
        .min(1, "Event name is required")
        .max(80, "Event name must be <= 80 characters")
        .regex(/^[a-z][a-z0-9_]*$/, "Event name must be snake_case"),
    props: z.record(z.string(), z.unknown())
        .optional()
        .refine(
            (props) => {
                if (!props) return true;
                const str = JSON.stringify(props);
                return str.length <= 4096; // 4KB limit
            },
            { message: "Props too large (max 4KB)" }
        )
        .refine(
            (props) => {
                if (!props) return true;
                // Block PII fields
                const piiFields = ['email', 'phone', 'password', 'ssn', 'credit_card', 'ip'];
                const keys = Object.keys(props).map(k => k.toLowerCase());
                return !keys.some(k => piiFields.some(pii => k.includes(pii)));
            },
            { message: "PII fields are not allowed" }
        ),
    path: z.string().max(512).optional(),
});

/**
 * Hash IP address with server salt for privacy
 */
function hashIP(ip: string): string {
    const salt = process.env.SERVER_SALT || process.env.SESSION_SECRET || "default-salt-change-me";
    return crypto.createHash("sha256").update(ip + salt).digest("hex");
}

/**
 * Get client IP from request (handles proxies)
 */
function getClientIP(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
}

/**
 * Store analytics event in database
 */
async function storeEvent(data: {
    event: string;
    path?: string;
    referrer?: string;
    userAgent?: string;
    ipHash: string;
    props?: Record<string, unknown>;
}): Promise<void> {
    const db = await getDb();
    if (!db) {
        console.warn("[Analytics] Database not available, skipping event:", data.event);
        return;
    }

    await db.insert(analyticsEvents).values({
        event: data.event,
        path: data.path || null,
        referrer: data.referrer || null,
        userAgent: data.userAgent?.substring(0, 512) || null,
        ipHash: data.ipHash,
        props: data.props ? JSON.stringify(data.props) : null,
    });
}

/**
 * Track event handler
 */
async function handleTrackEvent(req: Request, res: Response): Promise<void> {
    try {
        // Validate request body
        const result = trackEventSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ ok: false, error: result.error.errors[0].message });
            return;
        }

        const { event, props, path } = result.data;

        // Store the event
        await storeEvent({
            event,
            path: path || req.headers["referer"]?.replace(/https?:\/\/[^/]+/, "") || undefined,
            referrer: req.headers["referer"] as string | undefined,
            userAgent: req.headers["user-agent"] as string | undefined,
            ipHash: hashIP(getClientIP(req)),
            props,
        });

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error("[Analytics] Error tracking event:", error);
        // Always return ok to not leak info to client
        res.status(200).json({ ok: true });
    }
}

/**
 * Register analytics routes
 */
export function registerAnalyticsRoutes(app: Express): void {
    // Apply lightweight rate limiting via the existing trackLimiter
    const { trackLimiter } = require("./rateLimit");

    app.post("/api/track", trackLimiter, handleTrackEvent);

    console.log("[Analytics] Routes registered: POST /api/track");
}

export { storeEvent, hashIP };
