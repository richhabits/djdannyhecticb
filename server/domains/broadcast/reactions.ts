/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Reactions Handler - Real-time reaction processing with rate limiting
 */

interface ReactionData {
  reactionType: string;
}

interface RateLimitState {
  lastReactionTime: number;
  reactionCount: number;
  lastResetTime: number;
}

// Track rate limiting per user per session
const userReactionLimits = new Map<string, RateLimitState>();

const REACTION_CONFIG = {
  minReactionInterval: 300, // 300ms minimum between reactions
  maxConsecutiveReactions: 10, // Within 5 second window
  reactionWindowSize: 5000, // 5 second window
  cleanupInterval: 60000, // Clean rate limit cache every minute
};

const VALID_REACTIONS = new Set([
  "like",
  "love",
  "laugh",
  "wow",
  "fire",
  "party",
  "clap",
  "thumbsup",
]);

/**
 * Initialize reaction rate limit cleanup
 */
export function initializeReactionLimiter() {
  setInterval(() => {
    const now = Date.now();
    const maxAge = REACTION_CONFIG.reactionWindowSize * 2;
    let cleaned = 0;

    userReactionLimits.forEach((value, key) => {
      if (now - value.lastResetTime > maxAge) {
        userReactionLimits.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`[ReactionLimiter] Cleaned ${cleaned} stale rate limit entries`);
    }
  }, REACTION_CONFIG.cleanupInterval);
}

/**
 * Check if user is reaction rate limited
 */
export function isUserReactionLimited(
  userId: number,
  liveSessionId: number
): boolean {
  const key = `${liveSessionId}:${userId}`;
  const now = Date.now();
  const state = userReactionLimits.get(key);

  if (!state) return false;

  // Reset counter if window expired
  if (now - state.lastResetTime > REACTION_CONFIG.reactionWindowSize) {
    userReactionLimits.delete(key);
    return false;
  }

  // Check minimum interval between reactions
  if (now - state.lastReactionTime < REACTION_CONFIG.minReactionInterval) {
    return true;
  }

  // Check max consecutive reactions
  if (state.reactionCount >= REACTION_CONFIG.maxConsecutiveReactions) {
    return true;
  }

  return false;
}

/**
 * Update reaction rate limit state
 */
function updateReactionLimit(userId: number, liveSessionId: number) {
  const key = `${liveSessionId}:${userId}`;
  const now = Date.now();
  const state = userReactionLimits.get(key);

  if (!state) {
    userReactionLimits.set(key, {
      lastReactionTime: now,
      reactionCount: 1,
      lastResetTime: now,
    });
  } else {
    // Reset counter if window expired
    if (now - state.lastResetTime > REACTION_CONFIG.reactionWindowSize) {
      state.reactionCount = 1;
      state.lastResetTime = now;
    } else {
      state.reactionCount++;
    }
    state.lastReactionTime = now;
  }
}

/**
 * Handle incoming reaction
 */
export async function handleReaction(
  data: ReactionData,
  userId: number,
  liveSessionId: number
): Promise<{ success: boolean; error?: string }> {
  // Validate reaction type
  if (!VALID_REACTIONS.has(data.reactionType)) {
    return {
      success: false,
      error: `Invalid reaction type: ${data.reactionType}`,
    };
  }

  // Check rate limit
  if (isUserReactionLimited(userId, liveSessionId)) {
    return {
      success: false,
      error: "You are reacting too fast. Please slow down.",
    };
  }

  // Update rate limit state
  updateReactionLimit(userId, liveSessionId);

  return { success: true };
}
