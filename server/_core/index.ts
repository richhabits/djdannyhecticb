import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { rateLimit, RateLimits } from "./rateLimit";
import { compressionMiddleware } from "./compression";
import { performanceMiddleware, monitoring } from "./monitoring";
import { initializeWebSocket } from "./websocket";
import { jobQueue } from "./queue";

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

  // Performance monitoring
  app.use(performanceMiddleware);

  // Compression middleware
  app.use(compressionMiddleware);

  // Rate limiting
  app.use("/api/trpc", rateLimit(RateLimits.API));
  app.use("/api/auth", rateLimit(RateLimits.STRICT));
  app.use("/api/payments", rateLimit(RateLimits.PAYMENT));

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize WebSocket server
  initializeWebSocket(server);

  // Health check endpoint with monitoring stats
  app.get("/api/health", (req, res) => {
    const stats = monitoring.getSummary(3600000); // Last hour
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      performance: stats,
      queue: jobQueue.getStats(),
    });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

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

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
