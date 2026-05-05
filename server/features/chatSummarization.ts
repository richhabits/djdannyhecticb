/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Chat Summarization Feature - Powered by Claude AI
 * Summarizes chat during streams, extracts topics, identifies engagement peaks
 */

import Anthropic from "@anthropic-ai/sdk";
import { chatMessages, liveSessions } from "../../drizzle/engagement-schema";
import { chatSummaries, InsertChatSummary } from "../../drizzle/ai-features-schema";
import { eq, and, gte, lte, desc, lt } from "drizzle-orm";
import { ENV } from "../_core/env";

const client = new Anthropic({
  apiKey: ENV.claudeApiKey,
});

interface SummarizationResult {
  summary: string;
  topics: string[];
  sentiment: "positive" | "negative" | "neutral";
  topMoments: Array<{
    time: string;
    description: string;
    engagement: number;
  }>;
  viewerSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

/**
 * Fetch chat messages from the last 30 minutes
 */
async function fetchRecentChatMessages(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  fromTime: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.liveSessionId, liveSessionId),
        gte(chatMessages.createdAt, fromTime),
        eq(chatMessages.isDeleted, false)
      )
    )
    .orderBy(chatMessages.createdAt);
}

/**
 * Summarize chat using Claude AI
 */
async function summarizeChatWithClaude(
  messages: Array<{ message: string; createdAt: Date }>
): Promise<SummarizationResult> {
  if (messages.length === 0) {
    return {
      summary: "No messages during this period",
      topics: [],
      sentiment: "neutral",
      topMoments: [],
      viewerSentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }

  // Format messages for Claude
  const chatContent = messages
    .map((m) => `[${m.createdAt.toISOString().split("T")[1]}] ${m.message}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: `You are analyzing a DJ live stream chat. Provide concise, entertaining insights.
Focus on:
1. What viewers are excited about
2. Main topics discussed
3. Overall sentiment (positive/negative/neutral)
4. Peak engagement moments

Respond in JSON format:
{
  "summary": "2-3 sentence summary focusing on entertainment value",
  "topics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive|negative|neutral",
  "topMoments": [
    {"time": "HH:MM:SS", "description": "what happened", "engagement": 0.8}
  ],
  "sentimentBreakdown": {
    "positive": 60,
    "neutral": 30,
    "negative": 10
  }
}`,
    messages: [
      {
        role: "user",
        content: `Analyze this DJ stream chat:\n\n${chatContent}`,
      },
    ],
  });

  try {
    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || "No summary available",
      topics: parsed.topics || [],
      sentiment: parsed.sentiment || "neutral",
      topMoments: parsed.topMoments || [],
      viewerSentiment: {
        positive: parsed.sentimentBreakdown?.positive || 0,
        neutral: parsed.sentimentBreakdown?.neutral || 0,
        negative: parsed.sentimentBreakdown?.negative || 0,
      },
    };
  } catch (error) {
    console.error("[ChatSummarization] Failed to parse Claude response:", error);
    return {
      summary: "Failed to generate summary",
      topics: [],
      sentiment: "neutral",
      topMoments: [],
      viewerSentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }
}

/**
 * Create a chat summary every 30 minutes during a live stream
 */
export async function generateChatSummary(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  startTime?: Date
): Promise<InsertChatSummary | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!ENV.claudeApiKey) {
    console.warn("[ChatSummarization] Claude API key not configured");
    return null;
  }

  try {
    // Determine time window (last 30 minutes or from provided start time)
    const endTime = new Date();
    const summaryStartTime = startTime || new Date(endTime.getTime() - 30 * 60 * 1000);

    // Fetch messages
    const messages = await fetchRecentChatMessages(liveSessionId, summaryStartTime);

    if (messages.length === 0) {
      return null;
    }

    // Generate summary using Claude
    const result = await summarizeChatWithClaude(
      messages.map((m) => ({
        message: m.message,
        createdAt: m.createdAt,
      }))
    );

    // Store in database
    const summary: InsertChatSummary = {
      liveSessionId,
      startTime: summaryStartTime,
      endTime,
      summary: result.summary,
      topics: result.topics,
      sentiment: result.sentiment,
      topMoments: result.topMoments,
      messageCount: messages.length,
      viewerSentiment: result.viewerSentiment,
    };

    const [inserted] = await db.insert(chatSummaries).values(summary).returning();

    console.log(`[ChatSummarization] Created summary for session ${liveSessionId}`);
    return inserted || summary;
  } catch (error) {
    console.error("[ChatSummarization] Error generating summary:", error);
    throw error;
  }
}

/**
 * Get all summaries for a live session
 */
export async function getSessionSummaries(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(chatSummaries)
    .where(eq(chatSummaries.liveSessionId, liveSessionId))
    .orderBy(desc(chatSummaries.createdAt));
}

/**
 * Generate post-stream report
 */
export async function generateStreamReport(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const summaries = await getSessionSummaries(liveSessionId);
  const session = await db
    .select()
    .from(liveSessions)
    .where(eq(liveSessions.id, liveSessionId))
    .then((rows) => rows[0]);

  if (!session || !summaries.length) {
    return null;
  }

  // Aggregate data
  const totalMessages = summaries.reduce((sum, s) => sum + s.messageCount, 0);
  const allTopics = Array.from(
    new Set(summaries.flatMap((s) => s.topics))
  );
  const avgSentiment = {
    positive: Math.round(
      summaries.reduce((sum, s) => sum + s.viewerSentiment.positive, 0) /
        summaries.length
    ),
    neutral: Math.round(
      summaries.reduce((sum, s) => sum + s.viewerSentiment.neutral, 0) /
        summaries.length
    ),
    negative: Math.round(
      summaries.reduce((sum, s) => sum + s.viewerSentiment.negative, 0) /
        summaries.length
    ),
  };

  return {
    liveSessionId,
    title: session.title,
    duration: session.endedAt
      ? Math.round(
          (session.endedAt.getTime() - session.startedAt.getTime()) / 60000
        )
      : 0,
    totalMessages,
    summaryCount: summaries.length,
    mainTopics: allTopics,
    overallSentiment: avgSentiment,
    summaries,
  };
}

/**
 * Export summary as text for sharing
 */
export async function exportStreamSummaryAsText(liveSessionId: number): Promise<string> {
  const report = await generateStreamReport(liveSessionId);

  if (!report) {
    return "No summaries available for this stream";
  }

  const lines = [
    `# Stream Summary: ${report.title}`,
    `Duration: ${report.duration} minutes`,
    `Total Chat Messages: ${report.totalMessages}`,
    ``,
    `## Main Topics`,
    report.mainTopics.map((t) => `- ${t}`).join("\n"),
    ``,
    `## Audience Sentiment`,
    `- Positive: ${report.overallSentiment.positive}%`,
    `- Neutral: ${report.overallSentiment.neutral}%`,
    `- Negative: ${report.overallSentiment.negative}%`,
    ``,
    `## Chat Summaries (by 30-min segment)`,
    report.summaries
      .map(
        (s, i) =>
          `\n### Segment ${i + 1}\n${s.summary}\n\nTopics: ${s.topics.join(", ")}`
      )
      .join("\n"),
  ];

  return lines.join("\n");
}
