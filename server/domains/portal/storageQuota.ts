/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { storageUsage } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/server/db";

export const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5GB per client

export const UPLOAD_SIZE_CAPS: Record<string, number> = {
  track: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  photo: 10 * 1024 * 1024, // 10MB
  layout: 10 * 1024 * 1024, // 10MB
  doc: 20 * 1024 * 1024, // 20MB
  playlist: 10 * 1024 * 1024, // cover art etc.
};

export async function getStorageUsageBytes(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const [row] = await db
    .select()
    .from(storageUsage)
    .where(eq(storageUsage.userId, userId))
    .limit(1);

  return row ? Number(row.bytesUsed) : 0;
}

export async function hasQuotaFor(userId: number, additionalBytes: number): Promise<boolean> {
  const used = await getStorageUsageBytes(userId);
  return used + additionalBytes <= STORAGE_QUOTA_BYTES;
}

export async function adjustStorageUsage(userId: number, deltaBytes: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const [existing] = await db
    .select({ id: storageUsage.id })
    .from(storageUsage)
    .where(eq(storageUsage.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(storageUsage)
      .set({
        bytesUsed: sql`GREATEST(0, ${storageUsage.bytesUsed}::bigint + ${deltaBytes})`,
        updatedAt: new Date(),
      })
      .where(eq(storageUsage.userId, userId));
  } else {
    await db.insert(storageUsage).values({
      userId,
      bytesUsed: Math.max(0, deltaBytes).toString(),
    });
  }
}
