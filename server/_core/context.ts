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

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  ipAddress?: string;
};

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

  // Get IP address from request
  const ipAddress =
    (opts.req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    (opts.req.headers["x-real-ip"] as string) ||
    opts.req.socket?.remoteAddress ||
    "unknown";

  return {
    req: opts.req,
    res: opts.res,
    user,
    ipAddress,
  };
}
