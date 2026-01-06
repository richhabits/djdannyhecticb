/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import express, { Request, Response } from "express";
import {
  verifyAdminPassword,
  createAdminSessionToken,
  createAdminUser,
} from "./adminAuth";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";

export function registerAdminAuthRoutes(app: express.Application) {
  // Admin login endpoint
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const result = await verifyAdminPassword(email, password);

      if (!result.success || !result.credential) {
        return res.status(401).json({ error: result.error || "Invalid credentials" });
      }

      // Create session token
      const token = await createAdminSessionToken(
        result.credential.userId,
        email
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("[AdminAuth] Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin logout endpoint
  app.post("/api/admin/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Admin setup endpoint (create first admin - should be protected in production)
  app.post("/api/admin/setup", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      // In production, you might want to check for a setup token or disable this after first admin
      const result = await createAdminUser(email, password, name);

      if (!result.success) {
        return res.status(400).json({ error: result.error || "Failed to create admin" });
      }

      res.json({
        success: true,
        message: "Admin user created successfully",
        userId: result.userId,
      });
    } catch (error) {
      console.error("[AdminAuth] Setup error:", error);
      res.status(500).json({ error: "Setup failed" });
    }
  });
}

