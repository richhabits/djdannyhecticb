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
import { registerOAuthRoutes } from "./oauth";
import { registerAdminAuthRoutes } from "./adminAuthRoutes";
import { registerSEORoutes } from "../routes/seo";
import { registerPaymentRoutes } from "../routes/payments";
import { appRouter } from "../routers";
import { createContext } from "./context";
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
  
  // Cookie parser for session management
  app.use(cookieParser());
  
  // Optimize body parser: smaller default limit, larger only for upload routes
  // Most API requests are small, saving memory
  app.use(express.json({ limit: process.env.NODE_ENV === "production" ? "1mb" : "10mb" }));
  app.use(express.urlencoded({ limit: process.env.NODE_ENV === "production" ? "1mb" : "10mb", extended: true }));
  
  // Security headers (consolidated, no duplicate comment)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: https://*.stripe.com; frame-src 'self' https://js.stripe.com https://*.stripe.com; media-src 'self' https: http: blob:;"
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
  // Admin authentication routes
  registerAdminAuthRoutes(app);
  // SEO routes (sitemap, robots.txt)
  registerSEORoutes(app);
  // Payment webhooks (Stripe, PayPal)
  registerPaymentRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
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
