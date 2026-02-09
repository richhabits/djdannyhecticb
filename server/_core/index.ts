/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import helmet from "helmet";
import cors from "cors";
import { registerOAuthRoutes } from "./oauth";
import { registerAdminAuthRoutes } from "./adminAuthRoutes";
import { registerSEORoutes } from "../routes/seo";
import { registerPaymentRoutes } from "../routes/payments";
import { registerUploadRoutes } from "../routes/upload";
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

  // Request ID and Logging (First)
  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);

  // Security headers and CORS
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://*.stripe.com"],
        "connect-src": ["'self'", "https:", "https://*.stripe.com"],
        "frame-src": ["'self'", "https://js.stripe.com", "https://*.stripe.com"],
        "img-src": ["'self'", "data:", "https:"],
        "media-src": ["'self'", "https:", "http:", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: ENV.corsOrigins,
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

  // Aggressive memory optimization for production
  const bodyLimit = process.env.NODE_ENV === "production" ? "300kb" : "10mb";
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ limit: bodyLimit, extended: true }));

  // Disable unnecessary features to save resources
  app.disable("x-powered-by");
  app.disable("etag"); // Let nginx handle caching


  // Global Rate Limiting (DDoS Protection)
  const { strictLimiter } = await import("./rateLimit");
  app.use(strictLimiter);

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

    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: https://*.stripe.com; frame-src 'self' https://js.stripe.com https://*.stripe.com; media-src 'self' https: http: blob:;"
    );
    next();
  });

  // Authentication routes with specific rate limits
  const { authLimiter, bookingLimiter, aiLimiter } = await import("./rateLimit");

  // OAuth callback under /api/oauth/callback (only if configured)
  try {
    registerOAuthRoutes(app);
  } catch (error) {
    // Don't crash if OAuth isn't configured
    if (process.env.NODE_ENV === "development") {
      console.warn("[OAuth] Routes not registered:", error);
    }
  }

  // Admin authentication routes
  app.use("/api/admin/auth", authLimiter);
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

  // File Uploads
  registerUploadRoutes(app);

  // Procedure-specific rate limiting for tRPC
  app.use("/api/trpc/danny.chat", aiLimiter);
  app.use("/api/trpc/ai.listenerAssistant", aiLimiter);
  app.use("/api/trpc/bookings.create", bookingLimiter);
  app.use("/api/trpc/auth.register", authLimiter);

  // Intel endpoints - D1 Hardening tier (60 req/min)
  const { intelLimiter } = await import("./rateLimit");
  app.use("/api/trpc/raveIntel", intelLimiter);

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
