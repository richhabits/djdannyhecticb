/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Router } from "express";
import { captureServerException, addBreadcrumb, captureServerMessage } from "../_core/sentry";

const router = Router();

/**
 * Test endpoint that throws an error for Sentry testing
 * Use: GET /api/test-error
 */
router.get("/test-error", (req, res) => {
  try {
    addBreadcrumb("Test error endpoint hit", "test", "info", {
      timestamp: new Date().toISOString(),
    });

    // Simulate an error
    throw new Error("This is a test error from the test-error endpoint. This error is intentional and safe to ignore.");
  } catch (error) {
    if (error instanceof Error) {
      captureServerException(error, {
        endpoint: "/api/test-error",
        timestamp: new Date().toISOString(),
        reason: "Testing Sentry integration",
      });
    }

    res.status(500).json({
      error: "Test error generated successfully. Check Sentry dashboard.",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Test endpoint that captures a message
 * Use: GET /api/test-message
 */
router.get("/test-message", (req, res) => {
  captureServerMessage(
    "This is a test message from the test-message endpoint",
    "info",
    {
      endpoint: "/api/test-message",
      timestamp: new Date().toISOString(),
    }
  );

  res.status(200).json({
    message: "Test message sent to Sentry dashboard",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Test endpoint that simulates an unhandled promise rejection
 * Use: GET /api/test-rejection
 */
router.get("/test-rejection", (req, res) => {
  // Send response immediately
  res.status(202).json({
    message: "Promise rejection test initiated",
    note: "Check Sentry for the unhandled rejection",
  });

  // Unhandled rejection (intentional for testing)
  Promise.reject(new Error("This is a test unhandled promise rejection from /api/test-rejection"));
});

export default router;
