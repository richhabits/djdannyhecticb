/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Reactions Handler - Real-time reaction tracking with combo streaks
 */

import { getDb } from "../db";
import { reactions, leaderboards } from "../../drizzle/engagement-schema";
import { eq, and, desc, gt } from "drizzle-orm";

interface ReactionData {
  reactionType: "fire" | "love" | "hype" | "laugh" | "sad" | "angry" | "thinking";
}

interface ReactionRateLimit {
  lastReactionTime: number;
  reactionType?: string;
}

// Track reaction rate limiting per user per session
const userReactionLimits = new Map<string, ReactionRateLimit>();

const REACTION_CONFIG = {
  minReactionInterval: 1000, // 1 second cooldown per user
  comboWindow: 3000, // 3 second window for combo streaks
  comboThreshold: 3, // Need 3 reactions of same type within window to trigger combo
  cleanupInterval: 120000, // Clean rate limit cache every 2 minutes
};

/**
 * Initialize reaction cleanup
 */
export function initializeReactionLimiter() {
  setInterval(() => {
    const now = Date.now();
    const maxAge = REACTION_CONFIG.comboWindow * 2;
    let cleaned = 0;

    userReactionLimits.forEach((value, key) => {
      if (now - value.lastReactionTime > maxAge) {
        userReactionLimits.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(
        `[ReactionLimiter] Cleaned ${cleaned} stale reaction limit entries`
      );
    }
  }, REACTION_CONFIG.cleanupInterval);
}

/**
 * Check if user is rate limited for reactions
 */
export function isUserReactionLimited(
  userId: number,
  liveSessionId: number
): boolean {
  const key = `${liveSessionId}:${userId}`;
  const now = Date.now();
  const state = userReactionLimits.get(key);

  if (!state) return false;

  // Check minimum interval between reactions
  if (now - state.lastReactionTime < REACTION_CONFIG.minReactionInterval) {
    return true;
  }

  return false;
}

/**
 * Update reaction rate limit state
 */
function updateReactionRateLimit(
  userId: number,
  liveSessionId: number,
  reactionType: string
) {
  const key = `${liveSessionId}:${userId}`;
  const now = Date.now();

  userReactionLimits.set(key, {
    lastReactionTime: now,
    reactionType,
  });
}

/**
 * Validate reaction
 */
export function validateReaction(data: ReactionData): {
  valid: boolean;
  error?: string;
} {
  const validTypes = ["fire", "love", "hype", "laugh", "sad", "angry", "thinking"];

  if (!data.reactionType) {
    return { valid: false, error: "Reaction type is required" };
  }

  if (!validTypes.includes(data.reactionType)) {
    return { valid: false, error: "Invalid reaction type" };
  }

  return { valid: true };
}

/**
 * Check for combo streak
 */
async function checkComboStreak(
  userId: number,
  liveSessionId: number,
  reactionType: string
): Promise<{ isCombo: boolean; streakCount: number }> {
  const db = await getDb();
  if (!db) return { isCombo: false, streakCount: 0 };

  try {
    const recentReactions = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.liveSessionId, liveSessionId),
          eq(reactions.reactionType, reactionType),
          gt(
            reactions.createdAt,
            new Date(Date.now() - REACTION_CONFIG.comboWindow)
          )
        )
      )
      .orderBy(desc(reactions.createdAt))
      .limit(5);

    const streakCount = recentReactions.length + 1; // +1 for the current reaction
    const isCombo = streakCount >= REACTION_CONFIG.comboThreshold;

    return { isCombo, streakCount };
  } catch (error) {
    console.error("[ReactionCombo] Error checking combo streak:", error);
    return { isCombo: false, streakCount: 0 };
  }
}

/**
 * Handle incoming reaction
 */
export async function handleReaction(
  data: ReactionData,
  userId: number,
  liveSessionId: number
): Promise<{
  success: boolean;
  reaction?: any;
  combo?: { isCombo: boolean; streakCount: number };
  error?: string;
}> {
  try {
    // Validate reaction
    const validation = validateReaction(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check rate limiting
    if (isUserReactionLimited(userId, liveSessionId)) {
      return {
        success: false,
        error: "Reaction rate limit exceeded. Please wait before reacting again.",
      };
    }

    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database unavailable" };
    }

    // Check for combo streak
    const comboInfo = await checkComboStreak(
      userId,
      liveSessionId,
      data.reactionType
    );

    // Save reaction to database
    const result = await db
      .insert(reactions)
      .values({
        liveSessionId,
        userId,
        reactionType: data.reactionType,
        count: 1,
        comboStreak: comboInfo.isCombo ? comboInfo.streakCount : 0,
      })
      .returning();

    if (!result || result.length === 0) {
      return { success: false, error: "Failed to save reaction" };
    }

    // Update rate limit state
    updateReactionRateLimit(userId, liveSessionId, data.reactionType);

    // Update leaderboard reaction count
    try {
      await updateLeaderboardReactionCount(userId, liveSessionId);
    } catch (error) {
      console.error("[Reaction] Failed to update leaderboard:", error);
      // Don't fail the reaction if leaderboard update fails
    }

    return {
      success: true,
      reaction: result[0],
      combo: comboInfo,
    };
  } catch (error) {
    console.error("[Reaction] Error handling reaction:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * Update leaderboard reaction count
 */
async function updateLeaderboardReactionCount(
  userId: number,
  liveSessionId: number
) {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(leaderboards)
    .where(
      and(
        eq(leaderboards.userId, userId),
        eq(leaderboards.liveSessionId, liveSessionId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(leaderboards)
      .set({
        reactionCount: existing[0].reactionCount + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(leaderboards.userId, userId),
          eq(leaderboards.liveSessionId, liveSessionId)
        )
      );
  } else {
    // Create new leaderboard entry
    await db.insert(leaderboards).values({
      liveSessionId,
      userId,
      messageCount: 0,
      totalDonations: "0",
      reactionCount: 1,
      streakDays: 0,
      rank: 0,
    });
  }
}

/**
 * Get reaction counts for a session
 */
export async function getReactionCounts(
  liveSessionId: number
): Promise<Record<string, number>> {
  try {
    const db = await getDb();
    if (!db) return {};

    const reactionData = await db
      .select({
        type: reactions.reactionType,
        count: reactions.count,
      })
      .from(reactions)
      .where(eq(reactions.liveSessionId, liveSessionId));

    const counts: Record<string, number> = {};
    reactionData.forEach(({ type, count }) => {
      counts[type] = (counts[type] || 0) + count;
    });

    return counts;
  } catch (error) {
    console.error("[Reaction] Failed to get reaction counts:", error);
    return {};
  }
}

/**
 * Get top reactions for a session
 */
export async function getTopReactions(
  liveSessionId: number,
  limit: number = 5
): Promise<
  Array<{ type: string; count: number; percentage: number; topUsers: any[] }>
> {
  try {
    const db = await getDb();
    if (!db) return [];

    // Get total reactions
    const allReactions = await db
      .select({
        type: reactions.reactionType,
        count: reactions.count,
      })
      .from(reactions)
      .where(eq(reactions.liveSessionId, liveSessionId));

    const totalCount = allReactions.reduce((sum, r) => sum + r.count, 0);

    // Group by type
    const grouped: Record<string, { count: number; reactions: any[] }> = {};
    allReactions.forEach(({ type, count }) => {
      if (!grouped[type]) {
        grouped[type] = { count: 0, reactions: [] };
      }
      grouped[type].count += count;
    });

    // Convert to array and sort
    const sorted = Object.entries(grouped)
      .map(([type, data]) => ({
        type,
        count: data.count,
        percentage: totalCount > 0 ? (data.count / totalCount) * 100 : 0,
        topUsers: [], // Could be populated with user data if needed
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  } catch (error) {
    console.error("[Reaction] Failed to get top reactions:", error);
    return [];
  }
}

export const reactionConfig = REACTION_CONFIG;
