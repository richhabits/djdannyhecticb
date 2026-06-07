import { OAuth2Client } from "google-auth-library";
import type { Express, Request, Response } from "express";
import * as db from "@/server/db";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { SignJWT } from "jose";
import { ENV } from "../../_core/env";
import crypto from "crypto";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function safeStateMatch(received: string | undefined, expected: string | undefined): boolean {
  if (!received || !expected || received.length !== expected.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(
    "[GoogleAuth] WARNING: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not configured. Google OAuth will not work."
  );
}

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL || "http://localhost:3000"}/api/auth/google/callback`
);

export function registerGoogleAuthRoutes(app: Express) {
  // Start the Google OAuth flow: issue a random CSRF state, store it in a
  // short-lived httpOnly cookie, and redirect to Google with that state.
  app.get("/api/auth/google/login", (req: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString("hex");
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(OAUTH_STATE_COOKIE, state, { ...cookieOptions, maxAge: OAUTH_STATE_MAX_AGE_MS });

    res.redirect(302, getGoogleAuthUrl(state));
  });

  // Google callback endpoint
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;

      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Authorization code is required" });
      }

      const expectedState = req.cookies?.[OAUTH_STATE_COOKIE];
      res.clearCookie(OAUTH_STATE_COOKIE, getSessionCookieOptions(req));

      if (typeof state !== "string" || !safeStateMatch(state, expectedState)) {
        return res.status(400).json({ error: "Invalid or expired OAuth state" });
      }

      // Exchange authorization code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Verify and decode the ID token
      const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        return res.status(400).json({ error: "Failed to verify token" });
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!email) {
        return res.status(400).json({ error: "Email not provided by Google" });
      }

      // Check if user should be admin
      const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);

      const isAdmin = adminEmails.includes(email.toLowerCase());

      // Upsert user in database
      await db.upsertUser({
        openId: googleId,
        email: email,
        name: name || null,
        loginMethod: "google",
        lastSignedIn: new Date(),
        role: isAdmin ? "admin" : "user",
      });

      // Create session token
      const jwtSecret = new TextEncoder().encode(ENV.jwtSecret);
      const sessionToken = await new SignJWT({
        openId: googleId,
        email: email,
        name: name || "",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("365d")
        .sign(jwtSecret);

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redirect to home page
      res.redirect(302, "/");
    } catch (error) {
      console.error("[GoogleAuth] Callback error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  });
}

export function getGoogleAuthUrl(state: string): string {
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state,
  });

  return url;
}
