/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * This is proprietary software. Reverse engineering, decompilation, or
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * Audit Logging Module
 *
 * Handles creation and retrieval of audit logs for tracking system
 * changes, user actions, and administrative operations. All audit
 * records are immutable and designed for compliance and monitoring.
 */

import { desc } from "drizzle-orm";
import { auditLogs, InsertAuditLog } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Create a new audit log entry
 * Safely handles JSON serialization of before/after snapshots
 */
export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available, skipping audit log");
    return;
  }
  try {
    await db.insert(auditLogs).values({
      ...log,
      beforeSnapshot: typeof log.beforeSnapshot === "string" ? log.beforeSnapshot : JSON.stringify(log.beforeSnapshot || {}),
      afterSnapshot: typeof log.afterSnapshot === "string" ? log.afterSnapshot : JSON.stringify(log.afterSnapshot || {}),
    });
  } catch (error) {
    console.error("[Audit] Failed to create audit log:", error);
  }
}

/**
 * Retrieve audit logs with pagination
 * Returns most recent entries first
 */
export async function listAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
