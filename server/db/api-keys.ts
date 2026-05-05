/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * This is proprietary software. Reverse engineering, decompilation, or
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * API Keys Module
 *
 * Handles creation, validation, and lifecycle management of API keys
 * used for programmatic access to the platform. Supports scopes,
 * activation status, and usage tracking.
 */

import { desc, eq } from "drizzle-orm";
import { apiKeys, InsertApiKey } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Create a new API key with scopes
 * Automatically generates unique key and serializes scopes
 */
export async function createApiKey(apiKey: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(apiKeys).values({
    ...apiKey,
    scopes: typeof apiKey.scopes === "string" ? apiKey.scopes : JSON.stringify(apiKey.scopes || []),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(apiKeys).where(eq(apiKeys.id, insertedId)).limit(1);
  return created[0];
}

/**
 * List all API keys with optional filtering by active status
 * Returns most recently created keys first
 */
export async function listApiKeys(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(apiKeys).where(eq(apiKeys.isActive, true)).orderBy(desc(apiKeys.createdAt));
  }
  return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}

/**
 * Look up an API key by its key string
 * Used for authentication and validation
 */
export async function getApiKeyByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);
  return result[0];
}

/**
 * Update the last used timestamp for an API key
 * Called after successful authentication
 */
export async function updateApiKeyLastUsed(key: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ lastUsedAt: new Date(), updatedAt: new Date() }).where(eq(apiKeys.key, key));
}

/**
 * Deactivate an API key without deleting it
 * Preserves audit trail while preventing further use
 */
export async function deactivateApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(apiKeys).set({ isActive: false, updatedAt: new Date() }).where(eq(apiKeys.id, id));
}

/**
 * Permanently delete an API key from the database
 */
export async function deleteApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}
