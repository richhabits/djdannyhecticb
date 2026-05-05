/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Spam Detection & Filtering Feature
 * Real-time detection: copy-paste spam, suspicious links, caps spam, referral spam
 */

import { chatMessages } from "../../drizzle/engagement-schema";
import { spamFlags, InsertSpamFlag } from "../../drizzle/ai-features-schema";
import { eq, and, gte, desc } from "drizzle-orm";

interface SpamCheckResult {
  isSpam: boolean;
  flags: Array<{
    type: string;
    confidence: number;
    reason: string;
  }>;
  highestConfidence: number;
}

/**
 * Check for repeated identical messages (copy-paste spam)
 */
function checkRepeatSpam(
  message: string,
  userId: number,
  recentMessages: typeof chatMessages.$inferSelect[]
): { isSpam: boolean; confidence: number; reason: string } {
  const userMessages = recentMessages
    .filter((m) => m.userId === userId)
    .slice(0, 5);

  const duplicateCount = userMessages.filter(
    (m) => m.message.toLowerCase() === message.toLowerCase()
  ).length;

  if (duplicateCount >= 2) {
    return {
      isSpam: true,
      confidence: Math.min(0.95, 0.5 + duplicateCount * 0.1),
      reason: `Repeated message ${duplicateCount} times in last 5 messages`,
    };
  }

  return { isSpam: false, confidence: 0, reason: "" };
}

/**
 * Check for suspicious links
 */
function checkSuspiciousLinks(message: string): {
  isSpam: boolean;
  confidence: number;
  reason: string;
} {
  const urlPattern = /(https?:\/\/|www\.)\S+/gi;
  const urls = message.match(urlPattern) || [];

  if (urls.length === 0) {
    return { isSpam: false, confidence: 0, reason: "" };
  }

  // Suspicious patterns
  const suspiciousPatterns = [
    /bit\.ly/i,
    /tinyurl/i,
    /short\.link/i,
    /goo\.gl/i,
    /bit\.link/i,
    /getfollowers/i,
    /buyfollowers/i,
    /followersboost/i,
    /freevbucks/i,
    /discord\.gg\/[a-z0-9]{2,6}$/i, // Discord invites with very short codes
  ];

  let suspiciousCount = 0;
  let reason = "";

  for (const url of urls) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        suspiciousCount++;
        reason = `Suspicious URL: ${url}`;
      }
    }
  }

  if (suspiciousCount > 0) {
    return {
      isSpam: true,
      confidence: 0.85,
      reason,
    };
  }

  return { isSpam: false, confidence: 0, reason: "" };
}

/**
 * Check for ALL CAPS spam
 */
function checkCapsSpam(message: string): {
  isSpam: boolean;
  confidence: number;
  reason: string;
} {
  if (message.length < 5) {
    return { isSpam: false, confidence: 0, reason: "" };
  }

  const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;

  if (capsRatio > 0.8) {
    return {
      isSpam: true,
      confidence: 0.7,
      reason: `${Math.round(capsRatio * 100)}% ALL CAPS`,
    };
  }

  return { isSpam: false, confidence: 0, reason: "" };
}

/**
 * Check for hashtag spam
 */
function checkHashtagSpam(message: string): {
  isSpam: boolean;
  confidence: number;
  reason: string;
} {
  const hashtags = (message.match(/#\w+/g) || []).length;
  const words = message.split(/\s+/).length;

  if (hashtags > 5 || hashtags / words > 0.3) {
    return {
      isSpam: true,
      confidence: 0.75,
      reason: `Too many hashtags (${hashtags} in ${words} words)`,
    };
  }

  return { isSpam: false, confidence: 0, reason: "" };
}

/**
 * Check for referral/promotion spam
 */
function checkReferralSpam(message: string): {
  isSpam: boolean;
  confidence: number;
  reason: string;
} {
  const referralPatterns = [
    /buy.*followers/i,
    /get.*free.*views/i,
    /click.*link/i,
    /join.*server/i,
    /follow.*@/i,
    /subscribers.*only/i,
    /exclusive.*link/i,
    /money.*fast/i,
    /free.*crypto/i,
    /earn.*today/i,
  ];

  for (const pattern of referralPatterns) {
    if (pattern.test(message)) {
      return {
        isSpam: true,
        confidence: 0.8,
        reason: `Likely referral/promotion spam`,
      };
    }
  }

  return { isSpam: false, confidence: 0, reason: "" };
}

/**
 * Main spam detection function
 */
export async function checkSpam(
  db?: Awaited<ReturnType<typeof getDb>>, message: string,
  userId: number,
  liveSessionId: number
): Promise<SpamCheckResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch recent messages from this user
  const recentMessages = await db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.liveSessionId, liveSessionId),
        eq(chatMessages.userId, userId),
        eq(chatMessages.isDeleted, false)
      )
    )
    .orderBy(desc(chatMessages.createdAt))
    .limit(10);

  const checks = [
    checkRepeatSpam(message, userId, recentMessages),
    checkSuspiciousLinks(message),
    checkCapsSpam(message),
    checkHashtagSpam(message),
    checkReferralSpam(message),
  ];

  const flaggedChecks = checks.filter((c) => c.isSpam);
  const highestConfidence = Math.max(
    0,
    ...flaggedChecks.map((c) => c.confidence)
  );

  return {
    isSpam: flaggedChecks.length > 0 && highestConfidence > 0.5,
    flags: flaggedChecks,
    highestConfidence,
  };
}

/**
 * Flag a message as spam in the database
 */
export async function flagSpamMessage(
  db?: Awaited<ReturnType<typeof getDb>>, chatMessageId: number,
  liveSessionId: number,
  userId: number,
  flagType: string,
  confidence: number,
  reason: string
): Promise<InsertSpamFlag> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const flag: InsertSpamFlag = {
    chatMessageId,
    liveSessionId,
    userId,
    flagType,
    confidence: confidence.toString(),
    reason,
    status: confidence > 0.8 ? "flagged" : "flagged",
  };

  const [inserted] = await db.insert(spamFlags).values(flag).returning();
  return inserted || flag;
}

/**
 * Get flagged messages for moderator review
 */
export async function getFlaggedMessages(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  status?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(spamFlags);

  if (status) {
    query = query.where(
      and(
        eq(spamFlags.liveSessionId, liveSessionId),
        eq(spamFlags.status, status as any)
      )
    );
  } else {
    query = query.where(eq(spamFlags.liveSessionId, liveSessionId));
  }

  return query.orderBy(desc(spamFlags.createdAt));
}

/**
 * Approve a flagged message (mark as clean)
 */
export async function approveFlaggedMessage(
  db?: Awaited<ReturnType<typeof getDb>>, flagId: number,
  moderatorId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(spamFlags)
    .set({
      status: "approved",
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
      moderatorReview: true,
    })
    .where(eq(spamFlags.id, flagId))
    .returning();
}

/**
 * Delete a flagged message
 */
export async function deleteFlaggedMessage(
  db?: Awaited<ReturnType<typeof getDb>>, flagId: number,
  moderatorId: number,
  chatMessageId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update flag status
  await db
    .update(spamFlags)
    .set({
      status: "deleted",
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
      moderatorReview: true,
    })
    .where(eq(spamFlags.id, flagId));

  // Mark chat message as deleted
  return db
    .update(chatMessages)
    .set({
      isDeleted: true,
      deletedBy: moderatorId,
      deletedReason: "Spam",
    })
    .where(eq(chatMessages.id, chatMessageId));
}

/**
 * Get spam statistics
 */
export async function getSpamStats(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allFlags = await db
    .select()
    .from(spamFlags)
    .where(eq(spamFlags.liveSessionId, liveSessionId));

  const stats = {
    totalFlagged: allFlags.length,
    byType: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    avgConfidence:
      allFlags.length > 0
        ? (
            allFlags.reduce((sum, f) => sum + parseFloat(f.confidence), 0) /
            allFlags.length
          ).toFixed(2)
        : "0",
  };

  for (const flag of allFlags) {
    stats.byType[flag.flagType] = (stats.byType[flag.flagType] || 0) + 1;
    stats.byStatus[flag.status] = (stats.byStatus[flag.status] || 0) + 1;
  }

  return stats;
}
