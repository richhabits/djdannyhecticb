/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Validate JWT secret meets security requirements
 * Production requirement: 64+ chars with uppercase and numbers
 */
function validateJwtSecret(secret: string): { valid: boolean; reason?: string } {
  if (!secret) {
    return { valid: false, reason: "JWT_SECRET is not set" };
  }

  if (secret.length < 64) {
    return { valid: false, reason: `JWT_SECRET must be at least 64 characters (current: ${secret.length})` };
  }

  const hasUppercase = /[A-Z]/.test(secret);
  const hasNumbers = /[0-9]/.test(secret);

  if (!hasUppercase || !hasNumbers) {
    return { valid: false, reason: "JWT_SECRET must contain uppercase letters and numbers" };
  }

  return { valid: true };
}

/**
 * Validate critical environment variables in production
 */
function validateEnv() {
  if (!isProduction) return;

  const criticalVars = ["JWT_SECRET", "DATABASE_URL"];
  const missing = criticalVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error(`[ENV] CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }

  // Security: Enforce strong JWT secret in production
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    const validation = validateJwtSecret(jwtSecret);
    if (!validation.valid) {
      console.error(`[ENV] CRITICAL: ${validation.reason}`);
      console.error("[ENV] JWT_SECRET Requirements (Production):");
      console.error("  - Minimum 64 characters");
      console.error("  - Must contain uppercase letters");
      console.error("  - Must contain numbers");
      console.error("  - Generate with: openssl rand -base64 48 | tr -d '\\n'");
      process.exit(1);
    }
  }

  // Warn about missing optional services
  if (!process.env.PRINTFULL_API_KEY) {
    console.warn("[ENV] WARNING: PRINTFULL_API_KEY not set - merchandise/print features disabled");
  }
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.warn("[ENV] WARNING: PayPal credentials missing - PayPal payment option disabled");
  }
  if (!process.env.EMAIL_API_KEY) {
    console.warn("[ENV] WARNING: EMAIL_API_KEY not set - email notifications disabled");
  }
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.warn("[ENV] WARNING: Spotify credentials missing - Spotify integration disabled");
  }
}

validateEnv();

export const ENV = {
  // Backend can read either APP_ID or VITE_APP_ID (for compatibility)
  appId: process.env.APP_ID ?? process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  paypalMode: process.env.PAYPAL_MODE ?? "sandbox", // sandbox or live
  soundcloudClientId: process.env.SOUNDCLOUD_CLIENT_ID ?? "",
  soundcloudUserId: process.env.SOUNDCLOUD_USER_ID ?? "",
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID ?? "",
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
  spotifyArtistId: process.env.SPOTIFY_ARTIST_ID ?? "",
  beatportProfileUrl: process.env.BEATPORT_PROFILE_URL ?? "",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") ?? ["http://localhost:3000"],
  // Email configuration
  emailServiceProvider: process.env.EMAIL_SERVICE_PROVIDER ?? "sendgrid", // resend or sendgrid
  emailApiKey: process.env.EMAIL_API_KEY ?? "",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? "noreply@djdannyhectic.com",
  emailFromDomain: process.env.EMAIL_FROM_DOMAIN ?? "djdannyhectic.com",
  notificationsEmail: process.env.NOTIFICATIONS_EMAIL ?? "",
  // Contact info
  phoneNumber: process.env.PHONE_NUMBER ?? "07957 432842",
  instagramHandle: process.env.INSTAGRAM_HANDLE ?? "djdannyhecticb",
  // Printfull integration
  printfullApiKey: process.env.PRINTFULL_API_KEY ?? "",
};
