/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * AI Summarization Router
 * Handles: Chat summarization, clip metadata generation, transcription, etc.
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { getClaudeClient } from "../_core/ai-client";
import {
  chatSummaries,
  InsertChatSummary,
  autoClips,
  InsertAutoClip,
  streamTranscripts,
  streamTags,
} from "../../drizzle/ai-features-schema";
import { liveSessions } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { MessageParam } from "@anthropic-ai/sdk/resources/messages.mjs";

const router = Router();
const claude = getClaudeClient();

/**
 * Chat message interface
 */
interface ChatMessageData {
  username: string;
  message: string;
  timestamp: string;
  isModeratorOrStreamer?: boolean;
  isSubscriber?: boolean;
  isDonation?: boolean;
  donationAmount?: number;
  emoji?: string;
}

/**
 * Format chat messages for Claude analysis
 */
function formatChatForClaude(messages: ChatMessageData[]): string {
  return messages
    .map((msg, idx) => {
      let prefix = "";
      if (msg.isModeratorOrStreamer) prefix += "[MOD] ";
      if (msg.isSubscriber) prefix += "[SUB] ";
      if (msg.isDonation) prefix += `[DONATION $${msg.donationAmount}] `;

      return `${msg.timestamp} ${prefix}${msg.username}: ${msg.message}`;
    })
    .join("\n");
}

/**
 * Validate summary output format
 */
function validateSummary(summary: any): boolean {
  if (!summary) return false;

  return (
    typeof summary.summary === "string" &&
    summary.summary.length >= 20 &&
    summary.summary.length <= 300 &&
    Array.isArray(summary.topics) &&
    summary.topics.length > 0 &&
    summary.topics.length <= 10 &&
    ["positive", "neutral", "negative"].includes(summary.sentiment) &&
    Array.isArray(summary.topMoments) &&
    summary.topMoments.length >= 1 &&
    summary.topMoments.length <= 10 &&
    typeof summary.viewerSentiment === "object" &&
    typeof summary.viewerSentiment.positive === "number" &&
    typeof summary.viewerSentiment.neutral === "number" &&
    typeof summary.viewerSentiment.negative === "number"
  );
}

/**
 * Fallback summary generation (if Claude API fails)
 */
function generateFallbackSummary(
  messages: ChatMessageData[],
  messageCount: number
): Omit<InsertChatSummary, "liveSessionId" | "startTime" | "endTime"> {
  const positiveEmojis = ["😂", "😍", "🔥", "👏", "✨", "💯", "🤩"];
  const negativeEmojis = ["😭", "😤", "💀", "😡"];

  let positiveCount = 0;
  let negativeCount = 0;

  for (const msg of messages) {
    for (const emoji of positiveEmojis) {
      if (msg.message.includes(emoji) || msg.emoji?.includes(emoji)) {
        positiveCount++;
      }
    }
    for (const emoji of negativeEmojis) {
      if (msg.message.includes(emoji) || msg.emoji?.includes(emoji)) {
        negativeCount++;
      }
    }
  }

  const sentiment = positiveCount > negativeCount ? "positive" : "neutral";
  const topWords = extractFrequentWords(messages, 5);

  return {
    summary: `Stream had ${messageCount} messages with ${sentiment} sentiment. Most discussed: ${topWords.join(", ")}.`,
    topics: topWords,
    sentiment,
    topMoments: findLargestDonations(messages).slice(0, 3),
    messageCount,
    viewerSentiment: {
      positive: positiveCount,
      neutral: messageCount - positiveCount - negativeCount,
      negative: negativeCount,
    },
  };
}

/**
 * Extract frequently mentioned words
 */
function extractFrequentWords(messages: ChatMessageData[], count: number): string[] {
  const wordFreq: Record<string, number> = {};
  const stopwords = new Set([
    "the",
    "a",
    "is",
    "are",
    "to",
    "of",
    "and",
    "or",
    "in",
    "on",
    "at",
    "it",
    "be",
  ]);

  for (const msg of messages) {
    const words = msg.message.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 3 && !stopwords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    }
  }

  return Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Find largest donations in messages
 */
function findLargestDonations(
  messages: ChatMessageData[]
): Array<{ time: string; description: string; engagement: number }> {
  return messages
    .filter((m) => m.isDonation && m.donationAmount)
    .map((m) => ({
      time: m.timestamp,
      description: `${m.username} donated $${m.donationAmount}`,
      engagement: Math.min(m.donationAmount / 10, 100), // Normalize to 0-100
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5);
}

/**
 * POST /api/ai/summarize-chat
 * Generate AI-powered chat summary
 */
router.post(
  "/summarize-chat",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { liveSessionId, chatMessages, startTime, endTime } = req.body;

      if (!liveSessionId || !Array.isArray(chatMessages)) {
        return res.status(400).json({
          error: "Missing required fields: liveSessionId, chatMessages",
        });
      }

      if (chatMessages.length === 0) {
        return res.status(400).json({
          error: "Chat messages cannot be empty",
        });
      }

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Format chat for Claude
      const formattedChat = formatChatForClaude(chatMessages);
      const messageCount = chatMessages.length;

      // Create Claude prompt
      const systemPrompt = `You are an expert live chat analyst specializing in streaming platforms. Your task is to analyze chat messages from a live stream and provide:

1. A 2-3 sentence summary capturing the overall vibe, key announcements, and what happened
2. 3-5 main topics discussed (e.g., song_requests, technical_difficulty, charity_moment)
3. Overall sentiment (positive, neutral, or negative)
4. Top 3 most engaging moments with timestamps and descriptions
5. Sentiment breakdown with counts

Respond ONLY with valid JSON in this exact format:
{
  "summary": "...",
  "topics": ["topic1", "topic2"],
  "sentiment": "positive|neutral|negative",
  "topMoments": [{"time": "HH:MM:SS", "description": "...", "engagement": 95}],
  "viewerSentiment": {"positive": 120, "neutral": 80, "negative": 5}
}`;

      const userMessage = `Analyze this stream chat:

${formattedChat}`;

      // Call Claude API
      let summaryData;
      try {
        const response = await claude.call(
          [
            {
              role: "user",
              content: userMessage,
            },
          ],
          systemPrompt,
          {
            maxTokens: 1024,
            temperature: 0.3, // Lower temperature for consistency
          }
        );

        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Claude response did not contain valid JSON");
        }

        summaryData = JSON.parse(jsonMatch[0]);

        // Validate summary
        if (!validateSummary(summaryData)) {
          throw new Error("Generated summary failed validation");
        }
      } catch (error) {
        console.error("[AI Summarization] Claude API failed, using fallback", error);

        // Fallback to simple analysis
        summaryData = generateFallbackSummary(chatMessages, messageCount);
      }

      // Store in database
      const summary = await db
        .insert(chatSummaries)
        .values({
          liveSessionId,
          startTime: new Date(startTime || Date.now()),
          endTime: new Date(endTime || Date.now()),
          summary: summaryData.summary,
          topics: summaryData.topics,
          sentiment: summaryData.sentiment,
          topMoments: summaryData.topMoments,
          messageCount,
          viewerSentiment: summaryData.viewerSentiment,
        })
        .returning();

      return res.status(200).json({
        success: true,
        chatSummaryId: summary[0]?.id,
        summary: summaryData,
        messageCount,
      });
    } catch (error) {
      console.error("[AI Summarization] Error:", error);
      return res.status(500).json({
        error: "Failed to generate chat summary",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * POST /api/ai/generate-clip-metadata
 * Generate AI-powered clip title, description, and tags
 */
router.post(
  "/generate-clip-metadata",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { clipId, momentType, streamContext, existingTitle, existingDescription } =
        req.body;

      if (!clipId || !momentType || !streamContext) {
        return res.status(400).json({
          error: "Missing required fields: clipId, momentType, streamContext",
        });
      }

      // Generate title (max 60 chars)
      const titlePrompt = `Generate a punchy, clickable YouTube/TikTok title for a DJ clip (max 60 chars).
Context:
- Stream: ${streamContext.streamTitle}
- Genre: ${streamContext.genre}
- Moment: ${momentType}
- Date: ${streamContext.streamDate}

Respond with ONLY the title, no quotes, no explanation.`;

      const titleResponse = await claude.call(
        [{ role: "user", content: titlePrompt }],
        undefined,
        { maxTokens: 100, temperature: 0.7 }
      );

      const title = titleResponse
        .trim()
        .replace(/^["']|["']$/g, "")
        .substring(0, 60);

      // Generate description
      const descriptionPrompt = `Write an engaging YouTube/TikTok description for this DJ clip (150-250 words).
Title: ${title}
Genre: ${streamContext.genre}
Moment: ${momentType}

Include: What happened, why it's cool, call-to-action.
Tone: Hype, energetic, authentic to DJ culture.
Format: Just the description, no title.`;

      const descriptionResponse = await claude.call(
        [{ role: "user", content: descriptionPrompt }],
        undefined,
        { maxTokens: 500, temperature: 0.7 }
      );

      const description = descriptionResponse.trim().substring(0, 2000);

      // Generate tags
      const tagsPrompt = `Generate 5-10 relevant tags for a DJ clip.
Title: ${title}
Genre: ${streamContext.genre}
Moment type: ${momentType}

Include tags about: music genre, mood, technique, audience, vibe.
Format: comma-separated, no hashtags, lowercase.
Example: house_music, energetic, turntables, scratching, dance`;

      const tagsResponse = await claude.call(
        [{ role: "user", content: tagsPrompt }],
        undefined,
        { maxTokens: 200, temperature: 0.6 }
      );

      const tags = tagsResponse
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 10);

      // Generate hashtags
      const hashtagsPrompt = `Generate 5-10 TikTok/Instagram hashtags for a DJ clip (max 30 chars total).
Title: ${title}
Genre: ${streamContext.genre}

Make them trending and relevant to DJ culture.
Format: #tag1 #tag2 #tag3 ...`;

      const hashtagsResponse = await claude.call(
        [{ role: "user", content: hashtagsPrompt }],
        undefined,
        { maxTokens: 150, temperature: 0.6 }
      );

      const hashtags = hashtagsResponse.trim().split(/\s+/).slice(0, 10);

      // Generate thumbnail prompt
      const thumbnailPromptText = `Visual concept for a DJ clip thumbnail:
Title: ${title}
Genre: ${streamContext.genre}
Mood: ${momentType}

Describe a high-contrast, eye-catching thumbnail. Include colors, elements, and text.`;

      const thumbnailResponse = await claude.call(
        [{ role: "user", content: thumbnailPromptText }],
        undefined,
        { maxTokens: 150, temperature: 0.7 }
      );

      return res.status(200).json({
        success: true,
        title,
        description,
        tags,
        hashtags,
        thumbnailPrompt: thumbnailResponse.trim(),
        callToAction: `Check out this ${streamContext.genre} moment! 🔥 Follow for more clips.`,
      });
    } catch (error) {
      console.error("[Clip Metadata Generation] Error:", error);
      return res.status(500).json({
        error: "Failed to generate clip metadata",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/ai/chat-summary/:liveSessionId
 * Retrieve chat summary for a live session
 */
router.get(
  "/chat-summary/:liveSessionId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { liveSessionId } = req.params;

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      const summary = await db
        .select()
        .from(chatSummaries)
        .where(eq(chatSummaries.liveSessionId, parseInt(liveSessionId)))
        .orderBy(desc(chatSummaries.createdAt))
        .limit(1);

      if (!summary || summary.length === 0) {
        return res.status(404).json({ error: "Chat summary not found" });
      }

      return res.status(200).json({
        success: true,
        summary: summary[0],
      });
    } catch (error) {
      console.error("[Chat Summary Retrieval] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve chat summary",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/ai/status
 * Get Claude API rate limit status
 */
router.get("/status", (req: Request, res: Response) => {
  const status = claude.getStatus();
  return res.status(200).json({
    success: true,
    aiService: "Claude API",
    rateLimit: {
      requestsUsed: status.requestsUsed,
      requestsLimit: status.requestsLimit,
      tokensBucket: status.tokenBucketTokens,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
