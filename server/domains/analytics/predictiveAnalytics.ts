/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Predictive Analytics Feature - Powered by Claude AI
 * Predicts churn, content performance, revenue trends
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  churnPredictions,
  contentAnalytics,
  InsertChurnPrediction,
  InsertContentAnalytics,
} from "../../drizzle/ai-features-schema";
import { donations, reactions, chatMessages } from "../../drizzle/engagement-schema";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { ENV } from "../_core/env";

const client = new Anthropic({
  apiKey: ENV.claudeApiKey,
});

interface UserEngagementMetrics {
  userId: number;
  lastEngagementDays: number;
  messageCount7d: number;
  donationAmount30d: number;
  reactionCount7d: number;
  streakDays: number;
}

/**
 * Calculate user engagement metrics
 */
async function getUserEngagementMetrics(db?: Awaited<ReturnType<typeof getDb>>, userId: number): Promise<UserEngagementMetrics> {
  const db = await getDb();
  if (!db) return {
    userId,
    lastEngagementDays: 999,
    messageCount7d: 0,
    donationAmount30d: 0,
    reactionCount7d: 0,
    streakDays: 0,
  };

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get recent activity
  const [recentMessages, recentDonations, recentReactions] = await Promise.all([
    db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          gte(chatMessages.createdAt, sevenDaysAgo)
        )
      ),
    db
      .select()
      .from(donations)
      .where(
        and(
          eq(donations.userId, userId),
          gte(donations.createdAt, thirtyDaysAgo)
        )
      ),
    db
      .select()
      .from(reactions)
      .where(
        and(eq(reactions.userId, userId), gte(reactions.createdAt, sevenDaysAgo))
      ),
  ]);

  const lastMessage = recentMessages[0];
  const lastEngagementDays = lastMessage
    ? Math.floor((now.getTime() - lastMessage.createdAt.getTime()) / (24 * 60 * 60 * 1000))
    : 999;

  const donationAmount30d = recentDonations.reduce((sum, d) => {
    return sum + parseFloat(d.amount);
  }, 0);

  return {
    userId,
    lastEngagementDays,
    messageCount7d: recentMessages.length,
    donationAmount30d,
    reactionCount7d: recentReactions.length,
    streakDays: 0, // Would track actual streak data
  };
}

/**
 * Predict churn risk for a user
 */
export async function predictChurnRisk(db?: Awaited<ReturnType<typeof getDb>>, userId: number): Promise<InsertChurnPrediction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metrics = await getUserEngagementMetrics(userId);

  // Heuristic scoring
  let riskScore = 0;
  const riskFactors: string[] = [];

  if (metrics.lastEngagementDays > 14) {
    riskScore += 0.3;
    riskFactors.push("No activity for 2+ weeks");
  } else if (metrics.lastEngagementDays > 7) {
    riskScore += 0.15;
    riskFactors.push("No activity for 1+ week");
  }

  if (metrics.messageCount7d === 0) {
    riskScore += 0.2;
    riskFactors.push("No messages in 7 days");
  }

  if (metrics.donationAmount30d === 0) {
    riskScore += 0.1;
    riskFactors.push("No donations in 30 days");
  }

  if (metrics.reactionCount7d === 0) {
    riskScore += 0.1;
    riskFactors.push("No reactions in 7 days");
  }

  // Normalized score
  riskScore = Math.min(1, riskScore);

  let recommendedAction = "Continue monitoring";
  if (riskScore > 0.7) {
    recommendedAction = "Engage with personalized content or special offer";
  } else if (riskScore > 0.5) {
    recommendedAction = "Send reminder notification about upcoming streams";
  }

  const prediction: InsertChurnPrediction = {
    userId,
    riskScore: riskScore.toString(),
    riskFactors,
    lastEngagementDays: metrics.lastEngagementDays,
    recommendedAction,
    modelVersion: "1.0",
  };

  // Store in database
  const [inserted] = await db
    .insert(churnPredictions)
    .values(prediction)
    .returning();

  return inserted || prediction;
}

/**
 * Get high-risk churn users
 */
export async function getChurnRiskUsers(db?: Awaited<ReturnType<typeof getDb>>, threshold: number = 0.7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(churnPredictions)
    .where(gte(churnPredictions.riskScore, threshold.toString()))
    .orderBy(desc(churnPredictions.riskScore));
}

/**
 * Analyze content performance
 */
export async function analyzeContentPerformance(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number
): Promise<InsertContentAnalytics> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get engagement metrics for this stream
  const [messages, donations, reactions] = await Promise.all([
    db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.liveSessionId, liveSessionId)),
    db
      .select()
      .from(donations)
      .where(eq(donations.liveSessionId, liveSessionId)),
    db
      .select()
      .from(reactions)
      .where(eq(reactions.liveSessionId, liveSessionId)),
  ]);

  const totalRevenue = donations.reduce((sum, d) => {
    return sum + parseFloat(d.amount);
  }, 0);

  // Calculate engagement score
  const engagementScore =
    (messages.length * 0.3 + reactions.length * 0.3 + donations.length * 0.4) / 100;

  // Simple revenue prediction based on engagement
  const revenuePrediction = engagementScore * 500; // Scale to estimated revenue

  const analytics: InsertContentAnalytics = {
    liveSessionId,
    contentType: "stream",
    viewerRetention: [], // Would populate with minute-by-minute data
    engagementScore: Math.min(1, engagementScore).toString(),
    revenuePrediction: revenuePrediction.toFixed(2),
    revenueActual: totalRevenue.toFixed(2),
    predictions: {
      estimatedViralScore: Math.random().toFixed(2), // Placeholder
      retentionTrend: "stable",
    },
  };

  // Store in database
  const [inserted] = await db
    .insert(contentAnalytics)
    .values(analytics)
    .returning();

  return inserted || analytics;
}

/**
 * Predict content performance using Claude
 */
export async function predictContentPerformanceAI(
  liveSessionId: number,
  contentDescription: string
): Promise<{ prediction: string; confidence: number }> {
  if (!ENV.claudeApiKey) {
    return {
      prediction: "Unable to generate prediction without Claude API",
      confidence: 0,
    };
  }

  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      system: `You are a DJ streaming analytics expert.
Predict how well this content will perform based on the description.
Consider engagement factors, timing, content type, etc.
Provide a JSON response:
{
  "prediction": "Will perform well/moderately/poorly",
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "recommendations": ["recommendation1", "recommendation2"]
}`,
      messages: [
        {
          role: "user",
          content: `Predict performance for this stream: ${contentDescription}`,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(content);

    return {
      prediction: parsed.prediction || "Unknown",
      confidence: parsed.confidence || 0,
    };
  } catch (error) {
    console.error("[PredictiveAnalytics] AI prediction error:", error);
    return { prediction: "Unable to generate prediction", confidence: 0 };
  }
}

/**
 * Get revenue forecast
 */
export async function getRevenueForecast(
  db?: Awaited<ReturnType<typeof getDb>>, period: "7d" | "30d" | "90d" = "30d"
): Promise<{
  period: string;
  forecast: number;
  trend: string;
  confidence: number;
}> {
  const db = await getDb();
  if (!db)
    return { period: "30d", forecast: 0, trend: "unknown", confidence: 0 };

  const now = new Date();
  const periodMs =
    period === "7d" ? 7 * 24 * 60 * 60 * 1000 : period === "30d" ? 30 * 24 * 60 * 60 * 1000 : 90 * 24 * 60 * 60 * 1000;
  const periodStart = new Date(now.getTime() - periodMs);

  const recentDonations = await db
    .select()
    .from(donations)
    .where(gte(donations.createdAt, periodStart));

  const totalRevenue = recentDonations.reduce((sum, d) => {
    return sum + parseFloat(d.amount);
  }, 0);

  const avgDaily = totalRevenue / (parseInt(period) || 30);

  return {
    period,
    forecast: parseFloat((avgDaily * 30).toFixed(2)),
    trend: totalRevenue > 1000 ? "up" : "stable",
    confidence: 0.7,
  };
}

/**
 * Generate predictive insights dashboard
 */
export async function getPredictiveInsights() {
  const [churnRisks, forecast] = await Promise.all([
    getChurnRiskUsers(0.6),
    getRevenueForecast("30d"),
  ]);

  return {
    churnRisks: churnRisks.length,
    highestRiskUsers: churnRisks.slice(0, 5),
    revenueForecast: forecast,
    insights: [
      `${churnRisks.length} users at risk of churn`,
      `Predicted monthly revenue: $${forecast.forecast}`,
      "Engagement trending stable",
    ],
  };
}

/**
 * Get user engagement trend
 */
export async function getUserEngagementTrend(db?: Awaited<ReturnType<typeof getDb>>, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const messages = await db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        gte(chatMessages.createdAt, thirtyDaysAgo)
      )
    );

  const donations = await db
    .select()
    .from(donations)
    .where(
      and(
        eq(donations.userId, userId),
        gte(donations.createdAt, thirtyDaysAgo)
      )
    );

  // Group by week
  const weeks = [0, 0, 0, 0];
  const now_ms = now.getTime();

  for (const msg of messages) {
    const weeksDiff = Math.floor(
      (now_ms - msg.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    if (weeksDiff < 4) weeks[weeksDiff]++;
  }

  const trend = weeks[0] >= weeks[1] ? "up" : "down";

  return {
    userId,
    messagesByWeek: weeks,
    donationsByWeek: [donations.length, 0, 0, 0],
    overallTrend: trend,
  };
}
