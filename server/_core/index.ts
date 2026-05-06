/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * API Facade Exports
 * ===================
 * The facade layer provides type-safe boundaries between frontend and backend.
 * See api-facade.ts for domain groupings and architectural documentation.
 */
export type {
  APIFacade,
  DomainBoundary,
  ContentRouters,
  CommerceRouters,
  EngagementRouters,
  StreamingRouters,
  EventsRouters,
  MusicRouters,
  MonetizationRouters,
  SystemRouters,
  AIRouters,
  AuthRouters,
  AdminRouters,
  PerformanceRouters,
} from "./api-facade";
export { routerDomainMap } from "./api-facade";

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import helmet from "helmet";
import cors from "cors";
import { registerOAuthRoutes } from "./oauth";
import { registerGoogleAuthRoutes } from "./googleAuth";
import { registerAdminAuthRoutes } from "./adminAuthRoutes";
import { registerSEORoutes } from "../routes/seo";
import { registerPaymentRoutes } from "../routes/payments";
import { registerRateCardRoutes } from "../routes/ratecard";
import { registerUploadRoutes } from "../routes/upload";
import { registerWebhookRoutes } from "../routes/webhooks";
import { registerCronRoutes } from "../routes/cron";
import streamEventsRouter, { setupStreamWebSocket } from "../routers/streamEventsRouter";
import { setupLiveWebSocket } from "../routers/liveWebSocket";
import stripeEventsRouter from "../routers/stripeEventsRouter";
import youtubeEventsRouter from "../routers/youtubeEventsRouter";
import ticketmasterRouter from "../routers/ticketmasterRouter";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ENV } from "./env";
import { requestIdMiddleware } from "./middleware/requestId";
import { loggerMiddleware } from "./middleware/logger";
import {
  publicRateLimit,
  authRateLimit,
  shoutboxRateLimit,
  aiRateLimit
} from "./middleware/rateLimit";
import { serveStatic, setupVite } from "./vite";
import { initializeRedis } from "./cache/redis-client";
import { httpCacheMiddleware } from "./cache/http-cache-middleware";
import { performanceMonitoringMiddleware } from "./monitoring/core-web-vitals";

/**
 * Security: Validate CORS origins using URL constructor
 * Ensures only valid URLs are allowed as CORS origins
 */
function validateCorsOrigins(origins: string[]): string[] {
  const validOrigins: string[] = [];

  for (const origin of origins) {
    try {
      new URL(origin);
      validOrigins.push(origin);
    } catch (error) {
      console.warn(`[Security] Invalid CORS origin (malformed URL): ${origin}`);
    }
  }

  return validOrigins;
}

/**
 * Security: Audit logging helper
 * Logs security-relevant events for monitoring and compliance
 */
function auditLog(action: string, details: { userId?: number | string; ipAddress?: string; result?: string; error?: string }) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    ...details
  };

  // In production, this should be sent to a centralized logging system
  console.log(`[AUDIT] ${action}:`, logEntry);
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Initialize Redis for caching (non-blocking with graceful fallback)
  if (process.env.NODE_ENV !== "development" || process.env.REDIS_HOST) {
    try {
      await initializeRedis();
      console.log('[CACHE] Redis initialized successfully');
    } catch (error) {
      console.warn('[CACHE] Redis initialization failed - caching disabled', error);
    }
  }

  // Setup WebSocket for stream events
  setupStreamWebSocket(server);

  // Setup WebSocket for live chat and reactions
  setupLiveWebSocket(server);

  // Request ID and Logging (First)
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);

  // Security headers and CORS
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // Security: Removed 'unsafe-eval' and 'unsafe-inline' from script-src
        // Using strict CSP with trusted domains only (Stripe for payments)
        "script-src": ["'self'", "https://js.stripe.com", "https://*.stripe.com"],
        "connect-src": ["'self'", "https:", "https://*.stripe.com"],
        "frame-src": ["'self'", "https://js.stripe.com", "https://*.stripe.com", "https://www.youtube.com", "https://player.twitch.tv", "https://www.tiktok.com", "https://www.instagram.com"],
        "img-src": ["'self'", "data:", "https:"],
        // Security: Removed 'http:' from media-src - only allow secure HTTPS
        "media-src": ["'self'", "https:", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Security: Validate CORS origins before applying middleware
  const validCorsOrigins = validateCorsOrigins(ENV.corsOrigins);

  if (isProduction && validCorsOrigins.length === 0) {
    throw new Error("[Security] CRITICAL: No valid CORS origins configured for production");
  }

  if (validCorsOrigins.length > 0) {
    console.log("[Security] Allowed CORS origins:", validCorsOrigins);
  }

  app.use(cors({
    origin: validCorsOrigins.length > 0 ? validCorsOrigins : ENV.corsOrigins,
    credentials: true,
  }));

  // Rate Limiting (Targeted)
  app.use("/api/admin/login", authRateLimit);
  app.use("/api/admin/setup", authRateLimit);
  app.use("/api/oauth", authRateLimit);
  app.use("/api/trpc/shouts.create", shoutboxRateLimit);
  app.use("/api/trpc/ai", aiRateLimit);
  app.use("/api/trpc/danny.chat", aiRateLimit);
  app.use("/api", publicRateLimit);

  // Cookie parser for session management
  app.use(cookieParser());

  // Security: Use consistent body size limits across dev and prod
  // Prevents potential issues with asymmetric configuration
  const bodyLimit = "100kb";
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ limit: bodyLimit, extended: true }));

  // Disable unnecessary features to save resources
  app.disable("x-powered-by");
  app.disable("etag"); // Let nginx handle caching

  // Performance monitoring (track response times, resource usage)
  if (process.env.NODE_ENV === "production") {
    app.use(performanceMonitoringMiddleware());
  }

  // Security headers (consolidated)
  const isProduction = process.env.NODE_ENV === "production";
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

    // HSTS - Enforce HTTPS in production (1 year, include subdomains)
    if (isProduction) {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }

    // Permissions Policy - Restrict browser features
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );

    // Security: Removed 'unsafe-inline' and 'unsafe-eval' from CSP headers
    // Using strict CSP with only secure sources
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' https://js.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: https://*.stripe.com; frame-src 'self' https://js.stripe.com https://*.stripe.com; media-src 'self' https: blob:;"
    );
    next();
  });

  // OAuth callback under /api/oauth/callback (only if configured)
  try {
    registerOAuthRoutes(app);
  } catch (error) {
    // Don't crash if OAuth isn't configured
    if (process.env.NODE_ENV === "development") {
      console.warn("[OAuth] Routes not registered:", error);
    }
  }

  // Google OAuth routes
  registerGoogleAuthRoutes(app);

  // Admin authentication routes
  registerAdminAuthRoutes(app);

  // Health Checks (Self-Healing Sentinel)
  app.get("/api/health", (req, res) => res.status(200).send("ok"));
  app.get("/api/ready", async (req, res) => {
    const { isDatabaseAvailable } = await import("./dbHealth");
    const isReady = await isDatabaseAvailable();
    if (isReady) {
      res.status(200).send("ready");
    } else {
      res.status(503).send("database_not_available");
    }
  });

  // SEO routes (sitemap, robots.txt)
  registerSEORoutes(app);

  // Payment webhooks (Stripe, PayPal)
  registerPaymentRoutes(app);

  // Rate Card
  registerRateCardRoutes(app);

  // File Uploads
  registerUploadRoutes(app);

  // Analytics Tracking (self-hosted)
  const { registerAnalyticsRoutes } = await import("./analytics");
  registerAnalyticsRoutes(app);

  // Webhook Routes (Telnyx, Vapi)
  registerWebhookRoutes(app);

  // Stream Events (WebSocket + API)
  app.use("/api/stream", streamEventsRouter);

  // Stripe Events (Real donations)
  app.use("/api/stripe", stripeEventsRouter);

  // YouTube Events (Real follows)
  app.use("/api/youtube", youtubeEventsRouter);

  // Ticketmaster Events (Concerts and shows)
  app.use("/api/ticketmaster", ticketmasterRouter);

  // Cron Job Routes
  registerCronRoutes(app);

  // Rate limiting is handled globally by express-rate-limit middleware

  // tRPC API
  const { logger } = await import("./logger");
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path, type }) => {
        logger.error(`[TRPC] Error on ${path} (${type})`, {
          code: error.code,
          message: error.message,
          path,
          type,
          ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
        });
      },
    })
  );

  // Global Error Handler (Must be after all other routes)
  const { globalErrorHandler } = await import("./errors");
  app.use(globalErrorHandler);

  // Initialize Social Proof WebSocket Service
  if (process.env.OFFLINE_MODE !== "1") {
    const { socialProofService } = await import("./socialProof");
    await socialProofService.initialize(server);

    // Initialize Autonomous Ops Engine
    const { autonomousEngine } = await import("./autonomousEngine");
    setInterval(() => autonomousEngine.runCycle(), 60000);
    autonomousEngine.runCycle(); // Initial run
  } else {
    console.log("⚠️ [DEV] OFFLINE_MODE active. Skipping SocialProof, AutonomousEngine, and DB-dependent services.");
  }

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    console.log("🎨 [SERVER] Starting Vite...");
    await setupVite(app, server);
  } else {
    // Run migrations on production startup
    try {
      const { runMigrations } = await import("./migrate");
      await runMigrations();
    } catch (e) {
      console.error("[Migration] Failed to import or run migrator:", e);
    }
    serveStatic(app);
  }


  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort && process.env.NODE_ENV === "development") {
    // Only log in development to reduce I/O
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    // Only log in development to reduce I/O
    if (process.env.NODE_ENV === "development") {
      console.log(`Server running on http://localhost:${port}/`);
    }
  });
}

startServer().catch((error) => {
  // Always log startup errors
  console.error("Failed to start server:", error);
  process.exit(1);
});
