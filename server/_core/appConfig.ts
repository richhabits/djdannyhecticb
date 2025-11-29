/**
 * App Configuration
 * 
 * Central configuration for white-label/clone mode support.
 * All hard-coded brand strings should reference this config.
 */

export const APP_CONFIG = {
  primaryBrandId: 1, // Default to Danny Hectic B brand
  appName: "DJ Danny Hectic B",
  supportEmail: "support@djdannyhecticb.com",
  legalName: "DJ Danny Hectic B",
  defaultBrand: {
    name: "DJ Danny Hectic B",
    slug: "danny-hectic-b",
    type: "personality" as const,
    primaryColor: "#FF6B00",
    secondaryColor: "#000000",
  },
} as const;

export type AppConfig = typeof APP_CONFIG;

