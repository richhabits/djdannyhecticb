/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { ENV } from "../../_core/env";
import { getAccessToken, clearTokenCache } from "./token";
import { beatportCache } from "./cache";

export interface BeatportRequestParams {
  [key: string]: string | number | boolean | undefined;
}

export interface BeatportGetOptions {
  useCache?: boolean;
  retries?: number;
}

export class BeatportError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = "BeatportError";
  }
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Makes an authenticated GET request to the Beatport API with caching and retry logic
 * @param path - API path (e.g., "/catalog/genres/")
 * @param params - Query parameters
 * @param options - Request options (caching, retries)
 * @returns Response data as JSON
 */
export async function beatportGet<T = any>(
  path: string,
  params?: BeatportRequestParams,
  options: BeatportGetOptions = {}
): Promise<T> {
  const { useCache = true, retries = 3 } = options;
  const { beatportApiBase } = ENV;

  if (!beatportApiBase) {
    throw new BeatportError("Beatport API base URL not configured");
  }

  // Check cache first
  if (useCache) {
    const cached = beatportCache.get<T>(path, params);
    if (cached !== null) {
      return cached;
    }
  }

  // Prepare request
  const startTime = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Get access token
      const accessToken = await getAccessToken();

      // Build query string
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const url = `${beatportApiBase}${path}${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const latency = Date.now() - startTime;

      // Handle 401 - token expired
      if (response.status === 401) {
        console.warn(`[Beatport Client] 401 Unauthorized - clearing token cache`);
        clearTokenCache();
        
        // Retry once with fresh token
        if (attempt === 0) {
          await sleep(1000);
          continue;
        }
        
        throw new BeatportError(
          `Authentication failed after token refresh`,
          response.status
        );
      }

      // Handle 429 - rate limit with exponential backoff
      if (response.status === 429) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.warn(
          `[Beatport Client] 429 Rate Limited - attempt ${attempt + 1}/${retries}, backing off ${backoffMs}ms`
        );
        
        if (attempt < retries - 1) {
          await sleep(backoffMs);
          continue;
        }
        
        throw new BeatportError(
          `Rate limit exceeded after ${retries} attempts`,
          response.status
        );
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[Beatport Client] ${response.status} ${response.statusText} - ${path} (${latency}ms)`
        );
        throw new BeatportError(
          `Beatport API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorText
        );
      }

      // Success
      const data = await response.json();
      console.log(
        `[Beatport Client] SUCCESS - ${path} (${latency}ms, attempt ${attempt + 1})`
      );

      // Cache successful response
      if (useCache) {
        beatportCache.set(path, params, data);
      }

      return data as T;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof BeatportError) {
        if (error.statusCode && error.statusCode !== 429 && error.statusCode !== 401) {
          throw error;
        }
      }
      
      // Last attempt, throw error
      if (attempt === retries - 1) {
        break;
      }
      
      // Wait before retry
      await sleep(1000 * (attempt + 1));
    }
  }

  // All retries exhausted
  if (lastError instanceof BeatportError) {
    throw lastError;
  }
  throw new BeatportError(
    `Failed to make Beatport API request after ${retries} attempts: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}
