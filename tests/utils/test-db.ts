/**
 * Test Database Setup
 * Provides in-memory SQLite for testing (avoid PostgreSQL dependency)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * Mock database context for testing
 * In real scenarios, you'd use an in-memory SQLite or test PostgreSQL instance
 */
export interface TestDbContext {
  users: Map<number, any>;
  subscriptions: Map<number, any>;
  payments: Map<number, any>;
  bookings: Map<number, any>;
  products: Map<number, any>;
}

export function createTestDbContext(): TestDbContext {
  return {
    users: new Map(),
    subscriptions: new Map(),
    payments: new Map(),
    bookings: new Map(),
    products: new Map(),
  };
}

/**
 * Reset database between tests
 */
export async function resetTestDb(db: TestDbContext) {
  db.users.clear();
  db.subscriptions.clear();
  db.payments.clear();
  db.bookings.clear();
  db.products.clear();
}
