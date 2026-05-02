/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * AI Moderation Router
 * Handles: Spam detection, toxicity analysis, moderation suggestions
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import {
  spamFlags,
  InsertSpamFlag,
  moderationFlags,
  InsertModerationFlag,
} from "../../drizzle/ai-features-schema";
import { chatMessages } from "../../drizzle/engagement-schema";
import { eq, desc, and, inArray } from "drizzle-orm";

const router = Router();

/**
 * Spam detection rules
 */
interface SpamRule {
  type: string;
  pattern: RegExp | ((msg: string, recentMsgs: string[]) => boolean);
  confidence: number;
  action: "flag" | "hide" | "delete";
  escalation: "warn" | "mute" | "timeout" | "ban";
}

const SPAM_RULES: SpamRule[] = [
  {
    type: "suspicious_link",
    pattern:
      /(?:https?:\/\/)?(?:www\.)?(?:bit\.ly|tinyurl|short\.link|goo\.gl|[a-z0-9]+\.su|discord\.gg|twitch\.tv\/[a-z0-9]+\/subscribe)/gi,
    confidence: 0.85,
    action: "flag",
    escalation: "warn",
  },
  {
    type: "caps_spam",
    pattern: (msg) => {
      if (msg.length < 10) return false;
      const capsRatio = (msg.match(/[A-Z]/g) || []).length / msg.length;
      return capsRatio > 0.7;
    },
    confidence: 0.6,
    action: "flag",
    escalation: "warn",
  },
  {
    type: "hashtag_spam",
    pattern: (msg) => (msg.match(/#/g) || []).length > 5,
    confidence: 0.75,
    action: "flag",
    escalation: "mute",
  },
  {
    type: "excessive_emojis",
    pattern: (msg) => {
      const emojiRegex =
        /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
      const emojiCount = (msg.match(emojiRegex) || []).length;
      return emojiCount > 5 && emojiCount / msg.length > 0.3;
    },
    confidence: 0.6,
    action: "flag",
    escalation: "warn",
  },
  {
    type: "referral_spam",
    pattern:
      /(?:click here|join my|subscribe|referral|promo code|use code|sign up|my link|my server)/gi,
    confidence: 0.75,
    action: "flag",
    escalation: "warn",
  },
];

/**
 * Check if text contains profanity (simple heuristic)
 */
function containsProfanity(text: string): boolean {
  const profanityList = [
    "f**k",
    "sh*t",
    "b*tch",
    "a**hole",
    "d**n",
    "hell",
  ];

  const lowerText = text.toLowerCase();
  for (const word of profanityList) {
    if (lowerText.includes(word)) return true;
  }

  return false;
}

/**
 * Detect spam in a single message
 */
function detectSpam(
  message: string,
  recentMessages: string[] = []
): Array<{
  type: string;
  confidence: number;
  action: "flag" | "hide" | "delete";
  escalation: "warn" | "mute" | "timeout" | "ban";
}> {
  const detections: any[] = [];

  for (const rule of SPAM_RULES) {
    let matches = false;

    if (typeof rule.pattern === "function") {
      matches = rule.pattern(message, recentMessages);
    } else {
      matches = rule.pattern.test(message);
    }

    if (matches) {
      detections.push({
        type: rule.type,
        confidence: rule.confidence,
        action: rule.action,
        escalation: rule.escalation,
      });
    }
  }

  // Check for copy-paste spam
  const recentText = recentMessages.join(" ");
  if (
    recentMessages.length > 0 &&
    recentText.includes(message) &&
    message.length > 10
  ) {
    detections.push({
      type: "repeat_copy_paste",
      confidence: 0.9,
      action: "hide",
      escalation: "mute",
    });
  }

  return detections;
}

/**
 * Simulate toxicity detection (would use Perspective API in production)
 */
function analyzeToxicity(message: string): {
  TOXICITY: number;
  SEVERE_TOXICITY: number;
  IDENTITY_ATTACK: number;
  INSULT: number;
  PROFANITY: number;
  THREAT: number;
} {
  let toxicityScore = 0;
  let severeToxicityScore = 0;
  let insultScore = 0;
  let profanityScore = 0;
  let threatScore = 0;

  // Check for profanity
  if (containsProfanity(message)) {
    profanityScore = 0.8;
    toxicityScore += 0.4;
  }

  // Check for aggressive all-caps
  if (message.length > 5 && message.match(/[A-Z]/g)!.length / message.length > 0.7) {
    insultScore = 0.5;
    toxicityScore += 0.2;
  }

  // Check for threat indicators
  if (
    /kill|die|kys|hurt|attack|destroy|worse/.test(message.toLowerCase())
  ) {
    threatScore = 0.7;
    severeToxicityScore += 0.5;
    toxicityScore += 0.4;
  }

  // Check for identity attacks
  if (/\b(?:n-word|gay|lesbian|trans|jewish|muslim|christian)\b/i.test(message)) {
    // Simplified check
    insultScore = 0.8;
    severeToxicityScore += 0.6;
    toxicityScore += 0.5;
  }

  return {
    TOXICITY: Math.min(toxicityScore, 1.0),
    SEVERE_TOXICITY: Math.min(severeToxicityScore, 1.0),
    IDENTITY_ATTACK: insultScore > 0.5 ? 0.7 : 0.1,
    INSULT: insultScore,
    PROFANITY: profanityScore,
    THREAT: threatScore,
  };
}

/**
 * POST /api/moderation/analyze
 * Analyze message for spam and toxicity
 */
router.post(
  "/analyze",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        chatMessageId,
        liveSessionId,
        userId,
        message,
        recentMessages = [],
        streamTone = "casual",
      } = req.body;

      if (!message) {
        return res.status(400).json({
          error: "Message content is required",
        });
      }

      // Detect spam
      const spamDetections = detectSpam(message, recentMessages);

      // Analyze toxicity
      const toxicityScores = analyzeToxicity(message);

      // Determine if should flag for moderation
      let shouldFlag = false;
      let violationType = "";
      let confidence = 0;

      if (toxicityScores.TOXICITY > 0.75) {
        shouldFlag = true;
        violationType = "toxicity";
        confidence = toxicityScores.TOXICITY;
      } else if (toxicityScores.SEVERE_TOXICITY > 0.6) {
        shouldFlag = true;
        violationType = "severe_toxicity";
        confidence = toxicityScores.SEVERE_TOXICITY;
      } else if (spamDetections.length > 0) {
        const topSpam = spamDetections.reduce((prev, curr) =>
          curr.confidence > prev.confidence ? curr : prev
        );
        shouldFlag = topSpam.confidence > 0.8;
        violationType = topSpam.type;
        confidence = topSpam.confidence;
      }

      // Adjust for stream tone
      if (streamTone === "competitive" && violationType === "insult") {
        // Gaming/competitive streams allow more banter
        shouldFlag = confidence > 0.85;
      }

      if (
        streamTone === "family-friendly" &&
        toxicityScores.PROFANITY > 0.5
      ) {
        shouldFlag = true;
        violationType = "profanity";
        confidence = toxicityScores.PROFANITY;
      }

      const response: any = {
        success: true,
        message: message.substring(0, 200),
        analysis: {
          spam: spamDetections,
          toxicity: toxicityScores,
          shouldFlag,
        },
      };

      // Store in database if should flag
      if (shouldFlag && liveSessionId && userId && chatMessageId) {
        const db = await getDb();
        if (db) {
          const flag = await db
            .insert(moderationFlags)
            .values({
              chatMessageId,
              liveSessionId,
              userId,
              violationType,
              confidence: confidence as any,
              reason: `${violationType}: confidence ${(confidence * 100).toFixed(0)}%`,
              status: "flagged",
              modelVersion: "1.0",
            })
            .returning();

          response.flagId = flag[0]?.id;
          response.flagged = true;
        }
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error("[Moderation Analysis] Error:", error);
      return res.status(500).json({
        error: "Failed to analyze message",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/moderation/queue
 * Get moderation review queue
 */
router.get(
  "/queue",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { status = "flagged", limit = 20, offset = 0 } = req.query;

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Get flagged messages
      const flags = await db
        .select()
        .from(moderationFlags)
        .where(eq(moderationFlags.status, status as string))
        .orderBy(desc(moderationFlags.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      // Get total count
      const totalFlags = await db
        .select()
        .from(moderationFlags)
        .where(eq(moderationFlags.status, status as string));

      return res.status(200).json({
        success: true,
        total: totalFlags.length,
        status,
        items: flags.map((flag) => ({
          id: flag.id,
          violationType: flag.violationType,
          confidence: flag.confidence,
          reason: flag.reason,
          timestamp: flag.createdAt,
          actions: ["approve", "delete", "mute", "timeout", "ban"],
        })),
      });
    } catch (error) {
      console.error("[Moderation Queue] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve moderation queue",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * POST /api/moderation/review
 * Review a moderation flag
 */
router.post(
  "/review",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        flagId,
        action,
        reviewedBy,
        reason,
      } = req.body;

      if (!flagId || !action) {
        return res.status(400).json({
          error: "Missing required fields: flagId, action",
        });
      }

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Valid actions
      const validActions = [
        "approve",
        "delete",
        "mute",
        "timeout",
        "ban",
        "false_positive",
      ];
      if (!validActions.includes(action)) {
        return res.status(400).json({
          error: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        });
      }

      // Update flag status
      const statusMap: Record<string, string> = {
        approve: "approved",
        delete: "deleted",
        mute: "approved",
        timeout: "approved",
        ban: "approved",
        false_positive: "safe",
      };

      const updated = await db
        .update(moderationFlags)
        .set({
          status: statusMap[action],
          reviewedBy: reviewedBy || undefined,
          reviewedAt: new Date(),
        })
        .where(eq(moderationFlags.id, flagId))
        .returning();

      if (!updated || updated.length === 0) {
        return res.status(404).json({
          error: "Flag not found",
        });
      }

      return res.status(200).json({
        success: true,
        flagId,
        action,
        status: statusMap[action],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Moderation Review] Error:", error);
      return res.status(500).json({
        error: "Failed to review flag",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/moderation/dashboard
 * Get moderation dashboard stats
 */
router.get(
  "/dashboard",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Get stats for last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const allFlags = await db
        .select()
        .from(moderationFlags)
        .where(
          and(
            // After 7 days ago
          )
        );

      const recentFlags = allFlags.filter(
        (f) => new Date(f.createdAt) > sevenDaysAgo
      );

      const flaggedCount = allFlags.filter(
        (f) => f.status === "flagged"
      ).length;
      const approvedCount = allFlags.filter(
        (f) => f.status === "approved"
      ).length;
      const deletedCount = allFlags.filter(
        (f) => f.status === "deleted"
      ).length;

      // Group by violation type
      const byType: Record<string, number> = {};
      for (const flag of recentFlags) {
        byType[flag.violationType] = (byType[flag.violationType] || 0) + 1;
      }

      return res.status(200).json({
        success: true,
        period: "7 days",
        stats: {
          total: allFlags.length,
          recent: recentFlags.length,
          pending: flaggedCount,
          approved: approvedCount,
          deleted: deletedCount,
          byType,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Moderation Dashboard] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve dashboard stats",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;
