/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

export const ENV = {
  // Backend can read either APP_ID or VITE_APP_ID (for compatibility)
  appId: process.env.APP_ID ?? process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY ?? "",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  paypalMode: process.env.PAYPAL_MODE ?? "sandbox", // sandbox or live
};
