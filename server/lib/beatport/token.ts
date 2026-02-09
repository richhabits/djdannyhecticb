/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { ENV } from "../../_core/env";

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // Timestamp in milliseconds
}

let tokenCache: CachedToken | null = null;

/**
 * Redacts sensitive information from a token for logging
 */
function redactToken(token: string): string {
  if (!token || token.length < 10) return "[REDACTED]";
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
}

/**
 * Requests a new access token from Beatport API using client_credentials flow
 */
async function requestToken(): Promise<CachedToken> {
  const { beatportClientId, beatportClientSecret, beatportApiBase } = ENV;

  if (!beatportClientId || !beatportClientSecret) {
    throw new Error("Beatport credentials not configured");
  }

  const tokenUrl = `${beatportApiBase}/auth/o/token/`;

  // Prepare form-urlencoded body
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: beatportClientId,
    client_secret: beatportClientSecret,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to request Beatport token: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data: TokenResponse = await response.json();

    // Calculate expiration with 30s safety margin
    const expiresAt = Date.now() + (data.expires_in - 30) * 1000;

    console.log(
      `[Beatport Token] Successfully obtained token, expires in ${data.expires_in}s (${redactToken(data.access_token)})`
    );

    return {
      accessToken: data.access_token,
      expiresAt,
    };
  } catch (error) {
    console.error("[Beatport Token] Error requesting token:", error);
    throw error;
  }
}

/**
 * Gets a valid access token, refreshing if necessary
 */
export async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Check if we have a valid cached token
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.accessToken;
  }

  // Token is expired or doesn't exist, request a new one
  console.log("[Beatport Token] Token expired or not found, requesting new token");
  tokenCache = await requestToken();
  return tokenCache.accessToken;
}

/**
 * Clears the cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  tokenCache = null;
  console.log("[Beatport Token] Token cache cleared");
}
