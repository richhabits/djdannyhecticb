/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * This is proprietary software. Reverse engineering, decompilation, or
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * DATABASE DEPENDENCY INJECTION PATTERN
 *
 * This module implements a DatabaseProvider class to decouple the database layer
 * from direct global getDb() calls across 72+ files. Instead of importing and calling
 * getDb() directly (which creates a single point of failure), modules now receive
 * a db instance injected via their context or constructor.
 *
 * MIGRATION STRATEGY:
 * 1. New code should receive `db` from tRPC context: `ctx.db`
 * 2. Route handlers should accept db as a parameter rather than calling getDb() directly
 * 3. Services can use DatabaseProvider.getInstance() during transition period
 * 4. Gradual migration path - old and new patterns coexist
 *
 * PATTERN EXAMPLE:
 *
 * ❌ OLD (Direct global call):
 *   const db = await getDb();
 *   const data = await db.select().from(users).where(...);
 *
 * ✅ NEW (Injected via context):
 *   myRouter.query('getData', publicProcedure
 *     .query(async ({ ctx }) => {
 *       const data = await ctx.db.select().from(users).where(...);
 *     })
 *   );
 *
 * This eliminates circular dependencies, improves testability, and enables
 * database mocking for unit tests.
 */

import { getDb } from "../db";

export class DatabaseProvider {
  private static instance: DatabaseProvider;
  private db: any = null;
  private isInitialized = false;

  private constructor() {}

  /**
   * Get the singleton instance (for backward compatibility during transition)
   */
  static getInstance(): DatabaseProvider {
    if (!DatabaseProvider.instance) {
      DatabaseProvider.instance = new DatabaseProvider();
    }
    return DatabaseProvider.instance;
  }

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.db = await getDb();
      this.isInitialized = true;
    } catch (error) {
      console.error("[DatabaseProvider] Failed to initialize:", error);
      this.db = null;
    }
  }

  /**
   * Get the database instance
   * Automatically initializes if needed
   */
  async getDb() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.db;
  }

  /**
   * Check if database is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.db !== null;
  }

  /**
   * Reset the instance (useful for testing)
   */
  reset(): void {
    this.db = null;
    this.isInitialized = false;
  }
}

/**
 * Helper function to get database instance from provider
 * Use this in services that are not tRPC routers
 */
export async function getDatabaseInstance() {
  const provider = DatabaseProvider.getInstance();
  return provider.getDb();
}
