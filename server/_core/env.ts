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
 * Validate critical environment variables in production
 */
function validateEnv() {
  if (!isProduction) return;

  const criticalVars = ["JWT_SECRET", "DATABASE_URL"];
  const missing = criticalVars.filter(v => !process.env[v]);

  if (missing.length > 0) {
    console.error(`[ENV] CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
    // Don't crash - allow graceful degradation, but log loudly
  }

  // Warn about weak JWT secret
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.warn("[ENV] WARNING: JWT_SECRET should be at least 32 characters for security");
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
