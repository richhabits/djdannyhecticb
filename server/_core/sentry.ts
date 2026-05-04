/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import * as Sentry from "@sentry/node";
import { Request, Response, NextFunction } from "express";

/**
 * Initialize Sentry for server-side error tracking
 *
 * Should be called early in the Express setup, before other middleware
 * This configures Sentry to:
 * - Capture unhandled exceptions
 * - Track performance metrics (50% sample rate in production)
 * - Set up source map upload for minified code
 * - Enable breadcrumb collection for request tracking
 */
export function initSentryServer() {
  const dsn = process.env.SENTRY_DSN;
  const environment = process.env.NODE_ENV || "development";
  const releaseVersion = process.env.SENTRY_RELEASE || "unknown";

  // Skip initialization if DSN is not configured
  if (!dsn) {
    if (environment === "development") {
      console.warn("Sentry DSN not configured. Error tracking disabled.");
    }
    return {
      errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => next(),
      requestHandler: (req: Request, res: Response, next: NextFunction) => next(),
    };
  }

  Sentry.init({
    dsn,
    environment,
    release: releaseVersion,

    // Performance monitoring (50% sample rate in production)
    tracesSampleRate: environment === "production" ? 0.5 : 1.0,

    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ request: true, serverName: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],

    // Attach stack traces
    attachStacktrace: true,

    // Source maps
    ...(environment === "production" && {
      sourceMaps: {
        include: ["./dist", "./build"],
        ignore: ["node_modules", "vendor"],
      },
    }),

    // Ignore certain errors
    ignoreErrors: [
      // Network errors that are not actionable
      /network/i,
      /timeout/i,
      /cancelled/i,
      // Third-party errors
      /google-analytics/i,
      /facebook/i,
      /twitter/i,
    ],
  });

  return {
    errorHandler: Sentry.Handlers.errorHandler(),
    requestHandler: Sentry.Handlers.requestHandler(),
  };
}

/**
 * Express middleware for Sentry error handling
 * Must be used AFTER all other middleware and route handlers
 */
export function getSentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

/**
 * Express middleware for Sentry request handling
 * Should be used EARLY in the middleware stack
 */
export function getSentryRequestHandler() {
  return Sentry.Handlers.requestHandler();
}

/**
 * Capture an exception with context
 */
export function captureServerException(
  error: Error,
  context?: {
    userId?: string;
    requestId?: string;
    [key: string]: any;
  }
) {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
}

/**
 * Capture a message
 */
export function captureServerMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "error",
  context?: Record<string, any>
) {
  if (context) {
    Sentry.setContext("message_context", context);
  }
  Sentry.captureMessage(message, level);
}

/**
 * Add a breadcrumb for tracking
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set user context for error tracking
 */
export function setServerUser(userId: string, email?: string, ip?: string) {
  Sentry.setUser({
    id: userId,
    email,
    ip_address: ip,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearServerUser() {
  Sentry.setUser(null);
}

/**
 * Set a tag for filtering errors
 */
export function setServerTag(key: string, value: string | number) {
  Sentry.setTag(key, value);
}

/**
 * Set context for errors
 */
export function setServerContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Start a transaction for tracking request performance
 */
export function startTransaction(name: string, op: string = "http.server") {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Flush pending errors before shutdown
 */
export async function flushSentry(timeout: number = 2000): Promise<boolean> {
  return Sentry.close(timeout);
}
