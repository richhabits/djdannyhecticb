/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { ENV } from "../../_core/env";
import { getAccessToken } from "./token";

export interface BeatportRequestParams {
  [key: string]: string | number | boolean | undefined;
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
 * Makes an authenticated GET request to the Beatport API
 * @param path - API path (e.g., "/catalog/genres/")
 * @param params - Query parameters
 * @returns Response data as JSON
 */
export async function beatportGet<T = any>(
  path: string,
  params?: BeatportRequestParams
): Promise<T> {
  const { beatportApiBase } = ENV;

  if (!beatportApiBase) {
    throw new BeatportError("Beatport API base URL not configured");
  }

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

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new BeatportError(
        `Beatport API request failed: ${response.status} ${response.statusText}`,
        response.status,
        errorText
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof BeatportError) {
      throw error;
    }
    throw new BeatportError(
      `Failed to make Beatport API request: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
