/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getAccessToken, clearTokenCache } from "./token";
import { beatportGet, BeatportError } from "./client";
import { ENV } from "../../_core/env";

// Mock the ENV module
vi.mock("../../_core/env", () => ({
  ENV: {
    beatportClientId: "test-client-id",
    beatportClientSecret: "test-client-secret",
    beatportApiBase: "https://api.beatport.com/v4",
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("Beatport Token Manager", () => {
  beforeEach(() => {
    clearTokenCache();
    vi.clearAllMocks();
  });

  it("should request a new token when cache is empty", async () => {
    const mockResponse = {
      access_token: "test-token-12345",
      token_type: "Bearer",
      expires_in: 3600,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const token = await getAccessToken();

    expect(token).toBe("test-token-12345");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.beatport.com/v4/auth/o/token/",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
    );
  });

  it("should reuse cached token if not expired", async () => {
    const mockResponse = {
      access_token: "test-token-12345",
      token_type: "Bearer",
      expires_in: 3600,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // First call - should fetch
    const token1 = await getAccessToken();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second call - should use cache
    const token2 = await getAccessToken();
    expect(token2).toBe(token1);
    expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
  });

  it("should throw error when credentials are missing", async () => {
    const originalEnv = { ...ENV };
    (ENV as any).beatportClientId = "";

    await expect(getAccessToken()).rejects.toThrow("Beatport credentials not configured");

    // Restore ENV
    Object.assign(ENV, originalEnv);
  });

  it("should throw error on failed token request", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => "Invalid credentials",
    });

    await expect(getAccessToken()).rejects.toThrow("Failed to request Beatport token");
  });
});

describe("Beatport HTTP Client", () => {
  beforeEach(() => {
    clearTokenCache();
    vi.clearAllMocks();
  });

  it("should make authenticated GET request", async () => {
    // Mock token request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "test-token",
        token_type: "Bearer",
        expires_in: 3600,
      }),
    });

    // Mock API request
    const mockData = { results: [{ id: 1, name: "Test Genre" }] };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await beatportGet("/catalog/genres/", { enabled: true });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.beatport.com/v4/catalog/genres/?enabled=true",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should handle query parameters correctly", async () => {
    // Mock token request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "test-token",
        token_type: "Bearer",
        expires_in: 3600,
      }),
    });

    // Mock API request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    await beatportGet("/catalog/tracks/", {
      genre_id: 1,
      page: 2,
      page_size: 50,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.beatport.com/v4/catalog/tracks/?genre_id=1&page=2&page_size=50",
      expect.any(Object)
    );
  });

  it("should filter out undefined and null params", async () => {
    // Mock token request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "test-token",
        token_type: "Bearer",
        expires_in: 3600,
      }),
    });

    // Mock API request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });

    await beatportGet("/catalog/tracks/", {
      genre_id: 1,
      page: undefined,
      page_size: null as any,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.beatport.com/v4/catalog/tracks/?genre_id=1",
      expect.any(Object)
    );
  });

  it("should throw BeatportError on API errors", async () => {
    // Mock token request
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "test-token",
        token_type: "Bearer",
        expires_in: 3600,
      }),
    });

    // Mock failed API request
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Resource not found",
    });

    await expect(beatportGet("/catalog/invalid/")).rejects.toThrow(BeatportError);
  });

  it("should throw error when API base is not configured", async () => {
    const originalEnv = { ...ENV };
    (ENV as any).beatportApiBase = "";

    await expect(beatportGet("/catalog/genres/")).rejects.toThrow(
      "Beatport API base URL not configured"
    );

    // Restore ENV
    Object.assign(ENV, originalEnv);
  });
});
