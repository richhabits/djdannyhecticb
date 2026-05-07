/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * This is proprietary software. Reverse engineering, decompilation, or
 * disassembly is strictly prohibited and may result in legal action.
 */

/**
 * Database Module Index
 *
 * Re-exports focused, cohesive database modules to maintain
 * backward compatibility while improving code organization.
 */

// Database health & configuration
export { createAuditLog, listAuditLogs } from "./audit";

// API key management
export {
  createApiKey,
  listApiKeys,
  getApiKeyByKey,
  updateApiKeyLastUsed,
  deactivateApiKey,
  deleteApiKey,
} from "./api-keys";

// Refund handling
export {
  createRefundRequest,
  getRefundRequest,
  listRefundRequests,
  listRefundRequestsByPurchase,
  approveRefund,
  denyRefund,
  markRefundAsRefunded,
} from "./refund-handler";

// AI mixes
export { createAIMix, listAIMixes } from "./mixes";

export async function getReferralStats(userId: number) {
  return { totalReferrals: 0, earnings: 0, activeReferrals: 0 };
}

export async function listReferralCodes(userId?: number) {
  return [];
}

export async function getShowEpisodeBySlug(slug: string) {
  return null;
}

export async function updateShowEpisode(id: number, updates: Record<string, unknown>) {
  throw new Error("Show episodes not yet implemented");
}

export async function listWallets(limit?: number) {
  return [];
}

export async function setPrimaryShowPhase9(showId: number) {
  throw new Error("Show phases not yet implemented");
}
