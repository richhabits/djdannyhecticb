/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * This is proprietary software. Reverse engineering, decompilation, or
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * AI Mixes Module
 *
 * Handles creation and retrieval of AI-generated music mixes.
 * Manages mix metadata including setlists, genres, and creation
 * timestamps for the hectic AI studio feature.
 */

import { desc, eq } from "drizzle-orm";
import { aiMixes, InsertAIMix } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Create a new AI-generated mix
 * Automatically serializes setlist and genres to JSON
 */
export async function createAIMix(mix: InsertAIMix) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiMixes).values({
    ...mix,
    setlist: typeof mix.setlist === "string" ? mix.setlist : JSON.stringify(mix.setlist),
    genres: typeof mix.genres === "string" ? mix.genres : JSON.stringify(mix.genres),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(aiMixes).where(eq(aiMixes.id, insertedId)).limit(1);
  return created[0];
}

/**
 * List all AI mixes with pagination
 * Returns most recently created mixes first
 */
export async function listAIMixes(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(aiMixes)
    .orderBy(desc(aiMixes.createdAt))
    .limit(limit);
}
