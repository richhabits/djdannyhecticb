/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "/logo-icon.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Support both VITE_OAUTH_PORTAL_URL and VITE_OAUTH_SERVER_URL for compatibility
  const oauthPortalUrl = 
    import.meta.env.VITE_OAUTH_PORTAL_URL || 
    import.meta.env.VITE_OAUTH_SERVER_URL || 
    "";
  const appId = import.meta.env.VITE_APP_ID || "";

  // Defensive check: if required vars are missing, return a safe fallback
  if (!oauthPortalUrl || !appId) {
    console.warn(
      "[getLoginUrl] Missing required environment variables:",
      { oauthPortalUrl: oauthPortalUrl || "MISSING", appId: appId || "MISSING" }
    );
    // Return a safe fallback URL that won't crash the app
    return "#";
  }

  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("[getLoginUrl] Failed to construct login URL:", error);
    return "#";
  }
};