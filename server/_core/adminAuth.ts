/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { ENV } from "./env";
import { getDb } from "../db";
import { adminCredentials, users } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import type { Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminSessionPayload {
  userId: number;
  email: string;
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Verify admin password
 */
export async function verifyAdminPassword(
  email: string,
  password: string
): Promise<{ success: boolean; credential?: any; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    const credential = await db
      .select()
      .from(adminCredentials)
      .where(eq(adminCredentials.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (!credential) {
      return { success: false, error: "Invalid credentials" };
    }

    // Check if account is locked
    if (credential.lockedUntil && credential.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (credential.lockedUntil.getTime() - Date.now()) / 60000
      );
      return {
        success: false,
        error: `Account locked. Try again in ${minutesLeft} minute(s).`,
      };
    }

    // Verify password
    const isValid = await bcrypt.compare(password, credential.passwordHash);

    if (!isValid) {
      // Increment failed attempts
      const newAttempts = credential.failedLoginAttempts + 1;
      const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

      await db
        .update(adminCredentials)
        .set({
          failedLoginAttempts: newAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_DURATION_MS)
            : null,
          updatedAt: new Date(),
        })
        .where(eq(adminCredentials.id, credential.id));

      return {
        success: false,
        error: shouldLock
          ? "Too many failed attempts. Account locked for 15 minutes."
          : "Invalid credentials",
      };
    }

    // Successful login - reset failed attempts
    await db
      .update(adminCredentials)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adminCredentials.id, credential.id));

    return { success: true, credential };
  } catch (error) {
    console.error("[AdminAuth] Error verifying password:", error);
    return { success: false, error: "Authentication error" };
  }
}

/**
 * Create admin session token
 */
/**
 * Create session token (Admin/User)
 */
export async function createSessionToken(
  userId: number,
  email: string,
  role: "admin" | "user" = "admin"
): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    userId,
    email,
    role,
  } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + 60 * 60 * 24 * 7) // 7 days
    .sign(secret);

  return token;
}

export const createAdminSessionToken = (userId: number, email: string) => createSessionToken(userId, email, "admin");

/**
 * Authenticate admin from request (check session token)
 */
export async function authenticateSession(
  req: Request
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    if (process.env.OFFLINE_MODE === "1") {
      return { success: true, user: { id: 999999, email: "dev@local.host", role: "admin", name: "Dev User" } };
    }

    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return { success: false, error: "No session token" };
    }

    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(ENV.cookieSecret);

    const { payload } = await jwtVerify(token, secret);
    const sessionPayload = payload as unknown as AdminSessionPayload;

    // if (sessionPayload.role !== "admin") {
    //   return { success: false, error: "Not an admin session" };
    // }

    // Get user from database
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not available" };
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionPayload.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("[Auth] Error authenticating request:", error);
    return { success: false, error: "Invalid session" };
  }
}

/**
 * Create or update admin user and credentials
 */
export async function createAdminUser(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; userId?: number; error?: string }> {
  const db = await getDb();
  if (!db) {
    return { success: false, error: "Database not available" };
  }

  try {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingCredential = await db
      .select()
      .from(adminCredentials)
      .where(eq(adminCredentials.email, email))
      .limit(1)
      .then((rows) => rows[0]);

    if (existingCredential) {
      // Update password
      await db
        .update(adminCredentials)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(adminCredentials.id, existingCredential.id));

      return { success: true, userId: existingCredential.userId };
    }

    // Create new user
    const openId = `admin-${email}-${Date.now()}`;
    await db
      .insert(users)
      .values({
        openId,
        email,
        name: name || "Admin",
        loginMethod: "password",
        role: "admin",
        lastSignedIn: new Date(),
      });

    // Get the inserted user ID
    const insertedUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!insertedUser) {
      return { success: false, error: "Failed to create user" };
    }

    const userId = insertedUser.id;

    // Create credentials
    await db.insert(adminCredentials).values({
      userId,
      email,
      passwordHash,
    });

    return { success: true, userId };
  } catch (error) {
    console.error("[AdminAuth] Error creating admin user:", error);
    return { success: false, error: "Failed to create admin user" };
  }
}

