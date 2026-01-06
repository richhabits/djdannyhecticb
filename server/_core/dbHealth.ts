/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Database Health Check Utilities
 * 
 * Provides helpers to check if database is configured and available
 */

/**
 * Check if DATABASE_URL is configured
 */
export function hasDatabaseConfig(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "";
}

/**
 * Get a user-friendly error message for missing database
 */
export function getDatabaseErrorMessage(feature?: string): string {
  const featureText = feature ? ` (${feature})` : "";
  return `Database is not configured yet. Set DATABASE_URL in .env to enable this feature${featureText}.`;
}

/**
 * Check if database is available (both config and connection)
 * This is async because it may need to check the actual connection
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  if (!hasDatabaseConfig()) {
    return false;
  }
  
  try {
    const { getDb } = await import("../db");
    const db = await getDb();
    return db !== null;
  } catch (error) {
    console.warn("[DB Health] Database connection check failed:", error);
    return false;
  }
}

