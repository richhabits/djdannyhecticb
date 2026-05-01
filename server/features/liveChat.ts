/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Chat Handler - Real-time message processing with rate limiting
 */

import { getDb } from "../db";
import { chatMessages, leaderboards } from "../../drizzle/engagement-schema";
import { eq, and } from "drizzle-orm";

interface ChatMessageData {
  message: string;
  color?: string;
}

interface RateLimitState {
  lastMessageTime: number;
  messageCount: number;
  lastResetTime: number;
}

// Track rate limiting per user per session
const userRateLimits = new Map<string, RateLimitState>();

const CHAT_CONFIG = {
  minMessageInterval: 500, // 500ms minimum between messages
  maxMessageLength: 500,
  minMessageLength: 1,
  maxConsecutiveMessages: 5, // Within 5 second window
  messageWindowSize: 5000, // 5 second window
  cleanupInterval: 60000, // Clean rate limit cache every minute
};

/**
 * Initialize rate limit cleanup
 */
export function initializeChatLimiter() {
  setInterval(() => {
    const now = Date.now();
    const maxAge = CHAT_CONFIG.messageWindowSize * 2;
    let cleaned = 0;

    userRateLimits.forEach((value, key) => {
      if (now - value.lastResetTime > maxAge) {
        userRateLimits.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`[ChatLimiter] Cleaned ${cleaned} stale rate limit entries`);
    }
  }, CHAT_CONFIG.cleanupInterval);
}

/**
 * Check if user is rate limited
 */
export function isUserRateLimited(
  userId: number,
  liveSessionId: number
): boolean {
  const key = `${liveSessionId}:${userId}`;
  const now = Date.now();
  const state = userRateLimits.get(key);

  if (!state) return false;

  // Reset counter if window expired
  if (now - state.lastResetTime > CHAT_CONFIG.messageWindowSize) {
    userRateLimits.delete(key);
    return false;
  }

  // Check minimum interval between messages
  if (now - state.lastMessageTime < CHAT_CONFIG.minMessageInterval) {
    return true;
  }

  // Check max consecutive messages in window
  if (state.messageCount >= CHAT_CONFIG.maxConsecutiveMessages) {
    return true;
  }

  return false;
}

/**
 * Update rate limit state for user
 */
function updateRateLimit(userId: number, liveSessionId: number) {
  const key = `${liveSessionId}:${userId}`;
  const now = Date.now();
  const state = userRateLimits.get(key);

  if (!state) {
    userRateLimits.set(key, {
      lastMessageTime: now,
      messageCount: 1,
      lastResetTime: now,
    });
  } else {
    if (now - state.lastResetTime > CHAT_CONFIG.messageWindowSize) {
      // Reset window
      state.messageCount = 1;
      state.lastResetTime = now;
    } else {
      state.messageCount++;
    }
    state.lastMessageTime = now;
  }
}

/**
 * Validate chat message
 */
export function validateChatMessage(data: ChatMessageData): {
  valid: boolean;
  error?: string;
} {
  if (!data.message) {
    return { valid: false, error: "Message cannot be empty" };
  }

  const trimmed = data.message.trim();

  if (trimmed.length < CHAT_CONFIG.minMessageLength) {
    return { valid: false, error: "Message too short" };
  }

  if (trimmed.length > CHAT_CONFIG.maxMessageLength) {
    return {
      valid: false,
      error: `Message exceeds ${CHAT_CONFIG.maxMessageLength} character limit`,
    };
  }

  // Validate color if provided
  if (data.color && !/^#[0-9A-F]{6}$/i.test(data.color)) {
    return { valid: false, error: "Invalid color format" };
  }

  return { valid: true };
}

/**
 * Handle incoming chat message
 * Returns the saved message or error
 */
export async function handleChatMessage(
  data: ChatMessageData,
  userId: number,
  liveSessionId: number
): Promise<{
  success: boolean;
  message?: any;
  error?: string;
}> {
  try {
    // Validate message
    const validation = validateChatMessage(data);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check rate limiting
    if (isUserRateLimited(userId, liveSessionId)) {
      return {
        success: false,
        error: "Message rate limit exceeded. Please wait before sending again.",
      };
    }

    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database unavailable" };
    }

    // Save message to database
    const result = await db
      .insert(chatMessages)
      .values({
        liveSessionId,
        userId,
        message: data.message.trim(),
        usernameColor: data.color || "#ffffff",
      })
      .returning();

    if (!result || result.length === 0) {
      return { success: false, error: "Failed to save message" };
    }

    // Update rate limit state
    updateRateLimit(userId, liveSessionId);

    // Update leaderboard message count
    try {
      await updateLeaderboardMessageCount(userId, liveSessionId);
    } catch (error) {
      console.error("[ChatMessage] Failed to update leaderboard:", error);
      // Don't fail the message save if leaderboard update fails
    }

    return { success: true, message: result[0] };
  } catch (error) {
    console.error("[ChatMessage] Error handling message:", error);
    return { success: false, error: "Internal server error" };
  }
}

/**
 * Update leaderboard message count
 */
async function updateLeaderboardMessageCount(
  userId: number,
  liveSessionId: number
) {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(leaderboards)
    .where(and(eq(leaderboards.userId, userId), eq(leaderboards.liveSessionId, liveSessionId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(leaderboards)
      .set({
        messageCount: existing[0].messageCount + 1,
        updatedAt: new Date(),
      })
      .where(
        and(eq(leaderboards.userId, userId), eq(leaderboards.liveSessionId, liveSessionId))
      );
  } else {
    // Create new leaderboard entry
    await db.insert(leaderboards).values({
      liveSessionId,
      userId,
      messageCount: 1,
      totalDonations: "0",
      reactionCount: 0,
      streakDays: 0,
      rank: 0,
    });
  }
}

/**
 * Delete a chat message (admin only)
 */
export async function deleteChatMessage(
  messageId: number,
  adminUserId: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database unavailable" };
    }

    await db
      .update(chatMessages)
      .set({
        isDeleted: true,
        deletedBy: adminUserId,
        deletedReason: reason || "Moderation",
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, messageId));

    return { success: true };
  } catch (error) {
    console.error("[ChatMessage] Failed to delete message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

/**
 * Pin a chat message
 */
export async function pinChatMessage(messageId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database unavailable" };
    }

    await db
      .update(chatMessages)
      .set({
        isPinned: true,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, messageId));

    return { success: true };
  } catch (error) {
    console.error("[ChatMessage] Failed to pin message:", error);
    return { success: false, error: "Failed to pin message" };
  }
}

/**
 * Unpin a chat message
 */
export async function unpinChatMessage(messageId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database unavailable" };
    }

    await db
      .update(chatMessages)
      .set({
        isPinned: false,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, messageId));

    return { success: true };
  } catch (error) {
    console.error("[ChatMessage] Failed to unpin message:", error);
    return { success: false, error: "Failed to unpin message" };
  }
}

/**
 * Get recent chat messages for a session
 */
export async function getRecentChatMessages(
  liveSessionId: number,
  limit: number = 50
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const messages = await db
      .select()
      .from(chatMessages)
      .where(
        and(eq(chatMessages.liveSessionId, liveSessionId), eq(chatMessages.isDeleted, false))
      )
      .orderBy((t) => t.createdAt)
      .limit(limit);

    return messages;
  } catch (error) {
    console.error("[ChatMessage] Failed to get recent messages:", error);
    return [];
  }
}

export const chatConfig = CHAT_CONFIG;
