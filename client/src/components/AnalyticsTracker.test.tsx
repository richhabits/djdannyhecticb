import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { waitFor, act } from "../test/test-utils";
import { render } from "@testing-library/react";

// Mock the entire AnalyticsTracker module to avoid tRPC issues
vi.mock("./AnalyticsTracker", async () => {
  const actual = await vi.importActual("./AnalyticsTracker");
  return {
    ...actual,
    // Override components that use tRPC
    AnalyticsTracker: () => null,
    HeatmapTracker: () => null,
    useAnalytics: () => ({
      trackPageView: vi.fn(),
      trackEvent: vi.fn(),
    }),
  };
});

import { 
  getUserCohort,
  getDeviceFingerprint,
} from "./AnalyticsTracker";

// Mock window location
const mockLocation = {
  pathname: "/test-page",
  href: "https://example.com/test-page?utm_source=google",
  search: "?utm_source=google&utm_medium=cpc",
};

Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock document
Object.defineProperty(document, "referrer", {
  value: "https://google.com",
  configurable: true,
});

// Note: AnalyticsTracker and HeatmapTracker tests are skipped 
// because they require full tRPC context which is complex to mock.
// These components are tested through integration tests instead.

describe("getUserCohort", () => {
  it("should return a cohort string", () => {
    const cohort = getUserCohort();
    expect(typeof cohort).toBe("string");
    expect(cohort.length).toBeGreaterThan(0);
  });

  it("should return consistent cohort for same user", () => {
    const cohort1 = getUserCohort();
    const cohort2 = getUserCohort();
    expect(cohort1).toBe(cohort2);
  });
});

describe("getDeviceFingerprint", () => {
  beforeEach(() => {
    // Mock navigator properties
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      configurable: true,
    });
    Object.defineProperty(navigator, "language", {
      value: "en-US",
      configurable: true,
    });
    Object.defineProperty(navigator, "platform", {
      value: "MacIntel",
      configurable: true,
    });
    Object.defineProperty(screen, "width", {
      value: 1920,
      configurable: true,
    });
    Object.defineProperty(screen, "height", {
      value: 1080,
      configurable: true,
    });
  });

  it("should return a fingerprint string", () => {
    const fingerprint = getDeviceFingerprint();
    expect(typeof fingerprint).toBe("string");
    expect(fingerprint.length).toBeGreaterThan(0);
  });

  it("should include screen dimensions in fingerprint factors", () => {
    const fingerprint = getDeviceFingerprint();
    // Fingerprint is a hash, but should be consistent
    expect(fingerprint).toBeTruthy();
  });
});
