/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Smart Moderation Feature - Powered by Claude AI
 * Detects toxic messages: profanity, harassment, hate speech, spam, threats
 */

import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "../db";
import { moderationFlags, InsertModerationFlag } from "../../drizzle/ai-features-schema";
import { eq, desc } from "drizzle-orm";
import { ENV } from "../_core/env";

const client = new Anthropic({
  apiKey: ENV.claudeApiKey,
});

// Known profanity list (can be expanded)
const profanityList = [
  "damn",
  "hell",
  "crap",
  "ass",
  "piss",
  "shit",
  "fuck",
  "bitch",
  "bastard",
  "dammit",
  "asshole",
  "dickhead",
];

interface ModerationResult {
  isToxic: boolean;
  violationType: string;
  confidence: number;
  reason: string;
}

/**
 * Quick heuristic checks (fast path)
 */
function quickModerationCheck(message: string): ModerationResult | null {
  const lowerMessage = message.toLowerCase();

  // Check for profanity
  for (const word of profanityList) {
    if (lowerMessage.includes(word)) {
      return {
        isToxic: true,
        violationType: "profanity",
        confidence: 0.7,
        reason: `Contains profanity: ${word}`,
      };
    }
  }

  // Check for targeted harassment patterns
  const harassmentPatterns = [
    /you.*stupid/i,
    /you.*idiot/i,
    /you.*dumb/i,
    /kill yourself/i,
    /f*** off/i,
    /go die/i,
  ];

  for (const pattern of harassmentPatterns) {
    if (pattern.test(message)) {
      return {
        isToxic: true,
        violationType: "harassment",
        confidence: 0.85,
        reason: "Targeted harassment detected",
      };
    }
  }

  // Check for hate speech indicators
  const hateSpeechPatterns = [
    /all.*are.*evil/i,
    /\bnword\b/i, // Placeholder
    /inferior.*race/i,
    /supremacist/i,
  ];

  for (const pattern of hateSpeechPatterns) {
    if (pattern.test(message)) {
      return {
        isToxic: true,
        violationType: "hate_speech",
        confidence: 0.9,
        reason: "Hate speech indicators detected",
      };
    }
  }

  return null;
}

/**
 * Use Claude AI for complex toxicity detection
 */
async function claudeModerationCheck(message: string): Promise<ModerationResult> {
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 256,
      system: `You are a content moderation expert for a DJ live stream chat.
Analyze messages in context of a fun, casual DJ stream environment.
Detect: profanity, harassment (personal attacks), hate speech, threats, and misinformation.
Do NOT flag casual swearing, jokes, or friendly banter.
Only flag if the message is genuinely harmful or disruptive.

Respond in JSON:
{
  "isToxic": boolean,
  "violationType": "profanity|harassment|hate_speech|threats|misinformation|safe",
  "confidence": 0.0-1.0,
  "reason": "explanation"
}`,
      messages: [
        {
          role: "user",
          content: `Analyze this DJ stream chat message for toxicity:\n"${message}"`,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(content);

    return {
      isToxic: parsed.isToxic || false,
      violationType: parsed.violationType || "safe",
      confidence: parsed.confidence || 0,
      reason: parsed.reason || "",
    };
  } catch (error) {
    console.error("[SmartModeration] Claude error:", error);
    throw error;
  }
}

/**
 * Main moderation check function
 */
export async function moderateMessage(message: string): Promise<ModerationResult> {
  // First, try quick heuristic checks
  const quickResult = quickModerationCheck(message);
  if (quickResult) {
    return quickResult;
  }

  // If not caught by quick checks and Claude API available, use AI
  if (!ENV.claudeApiKey) {
    return {
      isToxic: false,
      violationType: "safe",
      confidence: 1.0,
      reason: "No Claude API configured, using quick checks only",
    };
  }

  return await claudeModerationCheck(message);
}

/**
 * Flag a message for moderation
 */
export async function flagModerationViolation(
  chatMessageId: number,
  liveSessionId: number,
  userId: number,
  violationType: string,
  confidence: number,
  reason: string
): Promise<InsertModerationFlag> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const flag: InsertModerationFlag = {
    chatMessageId,
    liveSessionId,
    userId,
    violationType,
    confidence: confidence.toString(),
    reason,
    status: confidence > 0.8 ? "toxic" : "flagged",
  };

  const [inserted] = await db
    .insert(moderationFlags)
    .values(flag)
    .returning();

  return inserted || flag;
}

/**
 * Get flagged messages for moderator review
 */
export async function getModeratorQueue(
  liveSessionId: number,
  limit: number = 50
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(moderationFlags)
    .where(eq(moderationFlags.liveSessionId, liveSessionId))
    .orderBy(desc(moderationFlags.createdAt))
    .limit(limit);
}

/**
 * Approve a message (moderator decision)
 */
export async function approveModerationDecision(
  flagId: number,
  moderatorId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(moderationFlags)
    .set({
      status: "approved",
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
    })
    .where(eq(moderationFlags.id, flagId))
    .returning();
}

/**
 * Delete a message and update moderation record
 */
export async function deleteModerationViolation(
  flagId: number,
  moderatorId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(moderationFlags)
    .set({
      status: "deleted",
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
    })
    .where(eq(moderationFlags.id, flagId))
    .returning();
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allFlags = await db
    .select()
    .from(moderationFlags)
    .where(eq(moderationFlags.liveSessionId, liveSessionId));

  const stats = {
    totalFlagged: allFlags.length,
    byViolationType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    avgConfidence:
      allFlags.length > 0
        ? (
            allFlags.reduce((sum, f) => sum + parseFloat(f.confidence), 0) /
            allFlags.length
          ).toFixed(2)
        : "0",
    accuracyTrend: {
      improved: 0,
      consistent: 0,
      declined: 0,
    },
  };

  for (const flag of allFlags) {
    stats.byViolationType[flag.violationType] =
      (stats.byViolationType[flag.violationType] || 0) + 1;
    stats.byStatus[flag.status] = (stats.byStatus[flag.status] || 0) + 1;
  }

  return stats;
}

/**
 * Train moderation model with moderator decisions
 * Tracks moderator approvals/rejections to improve accuracy
 */
export async function recordModerationDecision(
  flagId: number,
  wasCorrect: boolean,
  modelVersion: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // In production, this would update model weights or confidence scores
  // For now, we log the decision for analysis
  console.log(
    `[SmartModeration] Decision recorded - Flag ${flagId}: ${wasCorrect ? "correct" : "incorrect"}`
  );

  // Could store training data for retraining
  return { recorded: true };
}

/**
 * Sensitivity adjustment (per stream or global)
 */
export async function adjustModerationSensitivity(
  liveSessionId: number,
  newThreshold: number // 0.5 = moderate, 0.7 = strict, 0.3 = lenient
) {
  // In production, this would update the threshold used for auto-filtering
  console.log(
    `[SmartModeration] Adjusted sensitivity for session ${liveSessionId} to ${newThreshold}`
  );
  return { updated: true, threshold: newThreshold };
}
