/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Auto-Clip Generation Feature - Powered by Claude AI
 * Identifies peak moments, auto-creates clips, generates titles & descriptions
 */

import Anthropic from "@anthropic-ai/sdk";
import { autoClips, InsertAutoClip } from "../../drizzle/ai-features-schema";
import { donations, reactions, chatMessages } from "../../drizzle/engagement-schema";
import { eq, gte, lte, desc, count } from "drizzle-orm";
import { ENV } from "../_core/env";

const client = new Anthropic({
  apiKey: ENV.claudeApiKey,
});

export type MomentType =
  | "reaction_spike"
  | "donation_spike"
  | "viewer_milestone"
  | "poll_result"
  | "announcement"
  | "song_drop";

interface MomentDetectionResult {
  momentType: MomentType;
  momentTime: Date;
  description: string;
  intensity: number; // 0-1
}

interface ClipGenerationResult {
  title: string;
  description: string;
}

/**
 * Detect reaction spikes (3x normal rate)
 */
async function detectReactionSpikes(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  windowMinutes: number = 5
): Promise<MomentDetectionResult[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const pastWindow = new Date(now.getTime() - windowMinutes * 60 * 1000);

  // Get reaction counts in time windows
  const reactionsInWindow = await db
    .select()
    .from(reactions)
    .where(
      gte(reactions.createdAt, pastWindow)
    );

  const moments: MomentDetectionResult[] = [];

  if (reactionsInWindow.length > 5) {
    moments.push({
      momentType: "reaction_spike",
      momentTime: new Date(),
      description: "Viewers reacting intensely",
      intensity: Math.min(1, reactionsInWindow.length / 20),
    });
  }

  return moments;
}

/**
 * Detect donation spikes
 */
async function detectDonationSpikes(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  windowMinutes: number = 5
): Promise<MomentDetectionResult[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const pastWindow = new Date(now.getTime() - windowMinutes * 60 * 1000);

  const donationsInWindow = await db
    .select()
    .from(donations)
    .where(
      gte(donations.createdAt, pastWindow)
    );

  const moments: MomentDetectionResult[] = [];

  if (donationsInWindow.length > 2) {
    const totalAmount = donationsInWindow.reduce((sum, d) => {
      return sum + parseFloat(d.amount);
    }, 0);

    moments.push({
      momentType: "donation_spike",
      momentTime: new Date(),
      description: `$${totalAmount.toFixed(2)} donated in ${windowMinutes} minutes`,
      intensity: Math.min(1, totalAmount / 100),
    });
  }

  return moments;
}

/**
 * Generate clip title using Claude
 */
async function generateClipTitle(
  moment: MomentDetectionResult
): Promise<string> {
  if (!ENV.claudeApiKey) {
    return `${moment.momentType.replace(/_/g, " ")} Moment`;
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      system: `Create an engaging, clickable YouTube-style title for a DJ clip.
Keep it short (under 60 chars), energetic, and use all caps for key words.
Include relevant emojis if appropriate.`,
      messages: [
        {
          role: "user",
          content: `Generate a title for this moment: ${moment.description}`,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    return content.trim().substring(0, 60);
  } catch (error) {
    console.error("[AutoClipping] Title generation error:", error);
    return `${moment.momentType.replace(/_/g, " ")} Moment`;
  }
}

/**
 * Generate clip description using Claude
 */
async function generateClipDescription(
  moment: MomentDetectionResult
): Promise<string> {
  if (!ENV.claudeApiKey) {
    return `Check out this ${moment.momentType.replace(/_/g, " ")} from the live stream!`;
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 200,
      system: `Write an engaging YouTube description for a DJ clip.
2-3 sentences, mention what's happening, include a call-to-action.
Add relevant hashtags and timestamps if applicable.`,
      messages: [
        {
          role: "user",
          content: `Write a description for this clip moment: ${moment.description}`,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    return content.trim();
  } catch (error) {
    console.error("[AutoClipping] Description generation error:", error);
    return `Check out this ${moment.momentType.replace(/_/g, " ")} from the live stream!`;
  }
}

/**
 * Create an auto-clip from a detected moment
 */
export async function createAutoClip(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  moment: MomentDetectionResult,
  startTimeOffset: number = 30, // 30 seconds before
  endTimeOffset: number = 90 // 90 seconds after
): Promise<InsertAutoClip | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate title and description
  const [title, description] = await Promise.all([
    generateClipTitle(moment),
    generateClipDescription(moment),
  ]);

  const clippedStartTime = new Date(
    moment.momentTime.getTime() - startTimeOffset * 1000
  );
  const clippedEndTime = new Date(
    moment.momentTime.getTime() + endTimeOffset * 1000
  );

  const clip: InsertAutoClip = {
    liveSessionId,
    momentType: moment.momentType,
    momentTime: moment.momentTime,
    clippedStartTime,
    clippedEndTime,
    title,
    description,
    autoGenerated: true,
    published: false,
  };

  const [inserted] = await db.insert(autoClips).values(clip).returning();

  console.log(
    `[AutoClipping] Created auto-clip: ${title} (${moment.momentType})`
  );

  return inserted || clip;
}

/**
 * Detect all moments in a time window
 */
export async function detectMoments(
  liveSessionId: number,
  windowMinutes: number = 5
): Promise<MomentDetectionResult[]> {
  const [reactionSpikes, donationSpikes] = await Promise.all([
    detectReactionSpikes(liveSessionId, windowMinutes),
    detectDonationSpikes(liveSessionId, windowMinutes),
  ]);

  return [...reactionSpikes, ...donationSpikes].sort(
    (a, b) => b.intensity - a.intensity
  );
}

/**
 * Auto-generate clips from detected moments
 */
export async function autoGenerateClips(
  liveSessionId: number,
  minIntensity: number = 0.5
): Promise<InsertAutoClip[]> {
  // Detect moments
  const moments = await detectMoments(liveSessionId, 5);
  const significantMoments = moments.filter((m) => m.intensity >= minIntensity);

  if (significantMoments.length === 0) {
    return [];
  }

  // Create clips for each moment
  const clips = await Promise.all(
    significantMoments.map((m) => createAutoClip(liveSessionId, m))
  );

  return clips.filter((c) => c !== null) as InsertAutoClip[];
}

/**
 * Get auto-generated clips for a session
 */
export async function getAutoClips(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  published?: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db
    .select()
    .from(autoClips)
    .where(eq(autoClips.liveSessionId, liveSessionId));

  if (published !== undefined) {
    query = query.where(eq(autoClips.published, published));
  }

  return query.orderBy(desc(autoClips.createdAt));
}

/**
 * Publish an auto-generated clip
 */
export async function publishAutoClip(db?: Awaited<ReturnType<typeof getDb>>, clipId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(autoClips)
    .set({ published: true })
    .where(eq(autoClips.id, clipId))
    .returning();
}

/**
 * Get clip performance metrics
 */
export async function getClipMetrics(db?: Awaited<ReturnType<typeof getDb>>, clipId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [clip] = await db
    .select()
    .from(autoClips)
    .where(eq(autoClips.id, clipId));

  if (!clip) return null;

  return {
    clipId: clip.id,
    title: clip.title,
    momentType: clip.momentType,
    viewCount: clip.viewCount,
    published: clip.published,
    createdAt: clip.createdAt,
    engagementRate:
      clip.viewCount > 0 ? ((clip.viewCount / 1000) * 100).toFixed(2) : "0",
  };
}

/**
 * Auto-clip generation statistics
 */
export async function getAutoClipStats(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const clips = await getAutoClips(liveSessionId);
  const published = clips.filter((c) => c.published);
  const byMomentType: Record<string, number> = {};
  let totalViews = 0;

  for (const clip of clips) {
    byMomentType[clip.momentType] = (byMomentType[clip.momentType] || 0) + 1;
    totalViews += clip.viewCount;
  }

  return {
    totalClips: clips.length,
    publishedClips: published.length,
    totalViews,
    avgViewsPerClip: clips.length > 0 ? Math.round(totalViews / clips.length) : 0,
    byMomentType,
  };
}
