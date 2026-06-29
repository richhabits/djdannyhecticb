/**
 * Portal Auth Routes — registration and login for portal clients
 */

import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { getDb } from "@/server/db";
import { users, adminCredentials } from "../../../drizzle/schema";
import { clientProfiles } from "../../../drizzle/portal-schema";
import { eq } from "drizzle-orm";
import { createSessionToken } from "../auth/adminAuth";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../auth/cookies";

const PORTAL_ROLES = ["booking_client", "artist", "brand"] as const;
type PortalRole = (typeof PORTAL_ROLES)[number];

export function registerPortalAuthRoutes(app: express.Application) {
  // Register new portal user
  app.post("/api/portal/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name, role, displayName, company } = req.body;

      if (!email || !password || !name || !role) {
        return res.status(400).json({ error: "email, password, name and role are required" });
      }

      if (!PORTAL_ROLES.includes(role as PortalRole)) {
        return res.status(400).json({ error: "Invalid role. Must be booking_client, artist or brand" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      // Check if email already exists
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
        .then(r => r[0]);

      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const openId = `portal-${email}-${Date.now()}`;

      await db.insert(users).values({
        openId,
        email,
        name,
        displayName: displayName || name,
        loginMethod: "password",
        role: role as any,
        lastSignedIn: new Date(),
      });

      const insertedUser = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1)
        .then(r => r[0]);

      if (!insertedUser) {
        return res.status(500).json({ error: "Failed to create account" });
      }

      // Store credentials in adminCredentials table (reuse existing table)
      await db.insert(adminCredentials).values({
        userId: insertedUser.id,
        email,
        passwordHash,
      });

      // Create profile
      await db.insert(clientProfiles).values({
        userId: insertedUser.id,
        displayName: displayName || name,
        company: company || null,
      });

      // Issue session
      const token = await createSessionToken(undefined, insertedUser.id, email, role as any);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({ success: true, user: { id: insertedUser.id, email, name, role } });
    } catch (error) {
      console.error("[PortalAuth] Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Portal login (email + password, any portal role)
  app.post("/api/portal/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const credential = await db
        .select()
        .from(adminCredentials)
        .where(eq(adminCredentials.email, email))
        .limit(1)
        .then(r => r[0]);

      if (!credential) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (credential.lockedUntil && credential.lockedUntil > new Date()) {
        const mins = Math.ceil((credential.lockedUntil.getTime() - Date.now()) / 60000);
        return res.status(401).json({ error: `Account locked. Try again in ${mins} minute(s).` });
      }

      const valid = await bcrypt.compare(password, credential.passwordHash);
      if (!valid) {
        const attempts = credential.failedLoginAttempts + 1;
        const lock = attempts >= 5;
        await db.update(adminCredentials).set({
          failedLoginAttempts: attempts,
          lockedUntil: lock ? new Date(Date.now() + 15 * 60 * 1000) : null,
          updatedAt: new Date(),
        }).where(eq(adminCredentials.id, credential.id));
        return res.status(401).json({ error: lock ? "Account locked for 15 minutes" : "Invalid credentials" });
      }

      await db.update(adminCredentials).set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(adminCredentials.id, credential.id));

      const user = await db.select().from(users).where(eq(users.id, credential.userId)).limit(1).then(r => r[0]);
      if (!user) return res.status(401).json({ error: "User not found" });

      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

      const token = await createSessionToken(undefined, user.id, email, user.role as any);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      console.error("[PortalAuth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Session check — returns current user
  app.get("/api/portal/me", async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.[COOKIE_NAME];
      if (!token) return res.status(401).json({ error: "Not authenticated" });

      const { jwtVerify } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
      const { payload } = await jwtVerify(token, secret);
      const { userId } = payload as any;

      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Database not available" });

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1).then(r => r[0]);
      if (!user) return res.status(401).json({ error: "User not found" });

      res.json({ id: user.id, email: user.email, name: user.name, role: user.role, displayName: user.displayName });
    } catch {
      res.status(401).json({ error: "Invalid session" });
    }
  });

  // Logout
  app.post("/api/portal/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });
}
