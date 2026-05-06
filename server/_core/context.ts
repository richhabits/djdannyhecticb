/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { authenticateSession } from "./adminAuth";
import { getDb } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  ipAddress?: string;
  db: ReturnType<typeof getDb> extends Promise<infer T> ? T : never;
};

/**
 * Security: Validate IP address format (IPv4 or IPv6)
 */
function isValidIpAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i;

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * Security: Extract IP address with spoofing protection
 * Only trust x-forwarded-for if behind a reverse proxy (check TRUST_PROXY env var)
 */
function getClientIpAddress(req: CreateExpressContextOptions["req"]): string {
  const trustProxy = process.env.TRUST_PROXY === "true";

  if (trustProxy) {
    // When behind reverse proxy, check x-forwarded-for (first IP in chain)
    const xForwardedFor = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim();
    if (xForwardedFor && isValidIpAddress(xForwardedFor)) {
      return xForwardedFor;
    }

    // Fallback to x-real-ip
    const xRealIp = req.headers["x-real-ip"] as string;
    if (xRealIp && isValidIpAddress(xRealIp)) {
      return xRealIp;
    }
  }

  // Direct connection - use socket remote address
  const socketIp = req.socket?.remoteAddress;
  if (socketIp && isValidIpAddress(socketIp)) {
    return socketIp;
  }

  return "unknown";
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // First try OAuth authentication
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  // If no OAuth user, try admin password authentication
  if (!user) {
    const sessionAuth = await authenticateSession(opts.req);
    if (sessionAuth.success && sessionAuth.user) {
      user = sessionAuth.user;
    }
  }

  // Security: Get IP address with spoofing protection
  const ipAddress = getClientIpAddress(opts.req);

  // Inject database instance into context (dependency injection pattern)
  const db = await getDb();

  return {
    req: opts.req,
    res: opts.res,
    user,
    ipAddress,
    db,
  };
}
