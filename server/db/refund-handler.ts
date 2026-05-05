/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * This is proprietary software. Reverse engineering, decompilation, or
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * Refund Handler Module
 *
 * Manages the complete lifecycle of refund requests including approval,
 * denial, and completion tracking. Integrates with payment systems
 * and maintains administrative audit trails.
 */

import { desc, eq } from "drizzle-orm";
import { refundRequests, InsertRefundRequest } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Create a new refund request for a purchase
 */
export async function createRefundRequest(data: InsertRefundRequest) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available (refund requests)");
  }

  const result = await db
    .insert(refundRequests)
    .values(data)
    .returning({ id: refundRequests.id });

  return result[0] || null;
}

/**
 * Get a specific refund request by ID
 */
export async function getRefundRequest(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(refundRequests).where(eq(refundRequests.id, id));
  return result[0] || null;
}

/**
 * List all refund requests with optional filtering
 */
export async function listRefundRequests(filters?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(refundRequests);

  if (filters?.status) {
    query = query.where(eq(refundRequests.status, filters.status as any)) as any;
  }

  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  return await query
    .orderBy(desc(refundRequests.requestedAt))
    .limit(limit)
    .offset(offset);
}

/**
 * List all refund requests for a purchase
 * Returns most recent requests first
 */
export async function listRefundRequestsByPurchase(purchaseId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(refundRequests)
    .where(eq(refundRequests.purchaseId, purchaseId))
    .orderBy(desc(refundRequests.requestedAt))
    .limit(limit);
}

/**
 * Approve a refund request with optional admin notes
 * Records the approving admin and timestamp
 */
export async function approveRefund(id: number, adminId: number, notes?: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(refundRequests)
    .set({
      status: "approved",
      adminId,
      responseNotes: notes || null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refundRequests.id, id));

  return true;
}

/**
 * Deny a refund request with optional admin notes
 * Records the denying admin and timestamp
 */
export async function denyRefund(id: number, adminId: number, notes?: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(refundRequests)
    .set({
      status: "denied",
      adminId,
      responseNotes: notes || null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refundRequests.id, id));

  return true;
}

/**
 * Mark a refund as completed/refunded
 * Called after payment processor confirms the refund
 */
export async function markRefundAsRefunded(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(refundRequests)
    .set({
      status: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(refundRequests.id, id));

  return true;
}
