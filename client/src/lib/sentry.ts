/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for client-side error tracking
 *
 * This configures Sentry to:
 * - Capture unhandled exceptions and promise rejections
 * - Track performance metrics (50% sample rate)
 * - Capture 100% of errors
 * - Enable session tracking for user identification
 * - Set up breadcrumbs for context
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;

  // Skip initialization if DSN is not configured
  if (!dsn) {
    if (environment === "development") {
      console.warn("Sentry DSN not configured. Error tracking disabled.");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release: import.meta.env.VITE_APP_VERSION || "unknown",

    // Performance monitoring (50% sample rate)
    tracesSampleRate: environment === "production" ? 0.5 : 1.0,

    // Capture 100% of errors
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.captureConsoleIntegration({
        levels: ["error", "warn"],
      }),
      Sentry.httpClientIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Session tracking (for monitoring user issues)
    autoSessionTracking: true,

    // Attach breadcrumbs for context
    attachStacktrace: true,

    // Replay configuration (capture session on errors)
    replaysSessionSampleRate: environment === "production" ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,

    // Ignore certain errors that are not actionable
    ignoreErrors: [
      // Ignore network errors from browser extensions
      "top.GLOBALS",
      "plugin-or-something.js",
      // Ignore errors from third-party services
      /gtag|google-analytics/i,
      /facebook|fb_/i,
      /twitter|tweet/i,
      // Ignore errors from browser bugs
      /SecurityError/,
      /chrome-extension/,
      /moz-extension/,
    ],
  });
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context (e.g., on logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Set custom tags for filtering errors
 */
export function setSentryTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Set custom context for errors
 */
export function setSentryContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Capture a custom exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext("error_context", context);
  }
  Sentry.captureException(error);
}

/**
 * Capture a custom message
 */
export function captureMessage(message: string, level: "fatal" | "error" | "warning" | "info" | "debug" = "error") {
  Sentry.captureMessage(message, level);
}

/**
 * Get Sentry event ID (for displaying to users)
 */
export function getSentryEventId(): string | null {
  return Sentry.lastEventId();
}

/**
 * Report feedback to Sentry (for users to provide context)
 */
export function reportFeedback(title: string, message: string, name?: string, email?: string) {
  Sentry.captureUserFeedback({
    eventId: Sentry.lastEventId() || "",
    name,
    email,
    comments: `${title}\n\n${message}`,
  });
}
