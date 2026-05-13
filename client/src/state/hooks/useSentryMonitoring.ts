/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useEffect } from "react";
import { captureException, setSentryUser, clearSentryUser, setSentryTag, setSentryContext } from "@/lib/sentry";
import * as Sentry from "@sentry/react";

/**
 * Hook to monitor API errors and set up error tracking context
 * Use this in your main app to capture all errors
 *
 * @example
 * function App() {
 *   useSentryMonitoring();
 *   return <YourApp />;
 * }
 */
export function useSentryMonitoring() {
  useEffect(() => {
    // Set up global error handlers
    const handleError = (event: ErrorEvent) => {
      if (event.error instanceof Error) {
        captureException(event.error, {
          type: "global_error",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureException(new Error(String(event.reason)), {
        type: "unhandled_rejection",
        reason: event.reason,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);
}

/**
 * Hook to track user authentication in Sentry
 *
 * @example
 * function Dashboard({ user }) {
 *   useSentryUser(user?.id, user?.email);
 *   return <YourDashboard />;
 * }
 */
export function useSentryUser(userId?: string, email?: string, username?: string) {
  useEffect(() => {
    if (userId) {
      setSentryUser(userId, email, username);
    } else {
      clearSentryUser();
    }
  }, [userId, email, username]);
}

/**
 * Hook to add tags for error filtering
 *
 * @example
 * function BookingPage() {
 *   useSentryTags({ feature: "booking", version: "2.0" });
 *   return <YourBooking />;
 * }
 */
export function useSentryTags(tags: Record<string, string>) {
  useEffect(() => {
    Object.entries(tags).forEach(([key, value]) => {
      setSentryTag(key, value);
    });
  }, [tags]);
}

/**
 * Hook to track page/route navigation
 *
 * @example
 * function HomePage() {
 *   useSentryPageTracking("home");
 *   return <YourHome />;
 * }
 */
export function useSentryPageTracking(pageName: string) {
  useEffect(() => {
    setSentryContext("page", {
      name: pageName,
      url: window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    // Add breadcrumb for navigation
    Sentry.addBreadcrumb({
      category: "navigation",
      message: `Navigated to ${pageName}`,
      level: "info",
      data: {
        page: pageName,
        path: window.location.pathname,
      },
    });
  }, [pageName]);
}

/**
 * Hook to track user actions (clicks, forms, etc.)
 *
 * @example
 * function BookingForm() {
 *   const trackAction = useSentryAction();
 *   return (
 *     <form onSubmit={(e) => {
 *       trackAction("booking_submitted");
 *       // handle submit
 *     }}>
 *       ...
 *     </form>
 *   );
 * }
 */
export function useSentryAction() {
  return (actionName: string, data?: Record<string, any>) => {
    Sentry.addBreadcrumb({
      category: "user-action",
      message: actionName,
      level: "info",
      data: {
        action: actionName,
        ...data,
        timestamp: new Date().toISOString(),
      },
    });
  };
}

/**
 * Hook to monitor async operations and track timing
 *
 * @example
 * function MyComponent() {
 *   const trackAsync = useSentryAsync();
 *   const handleFetch = async () => {
 *     const { start, end } = trackAsync("fetch_data");
 *     try {
 *       const response = await fetch("/api/data");
 *       end("success");
 *     } catch (error) {
 *       end("error", error);
 *     }
 *   };
 * }
 */
export function useSentryAsync() {
  return (operationName: string) => {
    const startTime = performance.now();

    return {
      start: () => startTime,
      end: (status: "success" | "error", error?: Error) => {
        const duration = performance.now() - startTime;

        Sentry.addBreadcrumb({
          category: "async-operation",
          message: `${operationName}: ${status}`,
          level: status === "error" ? "error" : "info",
          data: {
            operation: operationName,
            status,
            duration: Math.round(duration),
            ...(error && { error: error.message }),
          },
        });
      },
    };
  };
}

/**
 * Hook to monitor API responses
 *
 * @example
 * function useApi() {
 *   const trackResponse = useSentryResponse();
 *
 *   return {
 *     fetch: async (url) => {
 *       const response = await fetch(url);
 *       trackResponse(url, response.status, response.headers);
 *       return response;
 *     }
 *   };
 * }
 */
export function useSentryResponse() {
  return (endpoint: string, status: number, headers?: Headers) => {
    Sentry.addBreadcrumb({
      category: "http",
      message: `${status} ${endpoint}`,
      level: status >= 400 ? "error" : "info",
      data: {
        endpoint,
        status,
        contentType: headers?.get("content-type"),
      },
    });
  };
}

/**
 * Hook for performance monitoring of components
 *
 * @example
 * function SlowComponent() {
 *   const { recordMetric } = useSentryPerformance();
 *
 *   useEffect(() => {
 *     const start = performance.now();
 *     return () => {
 *       recordMetric("component_render", performance.now() - start);
 *     };
 *   }, []);
 * }
 */
export function useSentryPerformance() {
  return {
    recordMetric: (metricName: string, value: number, unit: string = "ms") => {
      Sentry.captureMessage(`Performance: ${metricName} = ${value}${unit}`, "info");
    },
  };
}
