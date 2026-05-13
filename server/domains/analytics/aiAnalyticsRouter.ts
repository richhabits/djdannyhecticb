/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * AI Predictive Analytics Router
 * Handles: Audience prediction, churn prediction, content performance forecasting
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import {
  churnPredictions,
  contentAnalytics,
  InsertChurnPrediction,
  InsertContentAnalytics,
} from "../../drizzle/ai-features-schema";
import { eq, desc, gt } from "drizzle-orm";

const router = Router();

/**
 * Predict audience size for a stream
 */
interface AudiencePredictionInput {
  genre: string;
  dayOfWeek: number; // 0-6
  hour: number; // 0-23
  isWeekend: boolean;
  recentAverageViewers: number;
  followerCount: number;
  trendingScore?: number; // 0-1
}

function getGenreMultiplier(genre: string): number {
  const multipliers: Record<string, number> = {
    edm: 1.3,
    house: 1.2,
    hiphop: 1.1,
    drum_and_bass: 1.0,
    amapiano: 1.25,
    grime: 0.95,
    techno: 1.15,
    "uk_garage": 1.05,
  };

  return multipliers[genre.toLowerCase()] || 1.0;
}

function getDayOfWeekMultiplier(dayOfWeek: number): number {
  // 0 = Sunday, 6 = Saturday
  const multipliers = [1.1, 0.8, 0.85, 0.9, 0.95, 1.05, 1.15];
  return multipliers[dayOfWeek];
}

function getHourOfDayMultiplier(hour: number): number {
  // Peak hours are evening (18-23) and late night (23-01)
  const multipliers: Record<number, number> = {
    0: 1.0,
    1: 0.8,
    2: 0.6,
    3: 0.5,
    4: 0.4,
    5: 0.5,
    6: 0.6,
    7: 0.8,
    8: 0.9,
    9: 0.95,
    10: 1.0,
    11: 1.05,
    12: 1.1,
    13: 1.05,
    14: 1.0,
    15: 1.05,
    16: 1.1,
    17: 1.2,
    18: 1.3,
    19: 1.35,
    20: 1.4,
    21: 1.35,
    22: 1.25,
    23: 1.15,
  };

  return multipliers[hour] || 1.0;
}

/**
 * POST /api/analytics/predict-audience
 * Predict audience size for an upcoming stream
 */
router.post(
  "/predict-audience",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        genre = "edm",
        dayOfWeek = new Date().getDay(),
        hour = new Date().getHours(),
        recentAverageViewers = 100,
        followerCount = 1000,
        trendingScore = 0.5,
      } = req.body;

      // Calculate multipliers
      const genreMultiplier = getGenreMultiplier(genre);
      const dayMultiplier = getDayOfWeekMultiplier(dayOfWeek);
      const hourMultiplier = getHourOfDayMultiplier(hour);
      const followerMultiplier = Math.log(followerCount) / Math.log(1000); // Logarithmic growth

      // Combine factors
      const baseAudience = recentAverageViewers;
      const predicted =
        baseAudience *
        genreMultiplier *
        dayMultiplier *
        hourMultiplier *
        (1 + trendingScore * 0.5) *
        Math.max(0.5, followerMultiplier);

      const confidence = 0.75 + trendingScore * 0.15; // Higher trending = higher confidence

      return res.status(200).json({
        success: true,
        prediction: {
          predictedViewers: Math.round(predicted),
          confidence: parseFloat(confidence.toFixed(3)),
          factors: [
            {
              factor: "Genre popularity",
              multiplier: parseFloat(genreMultiplier.toFixed(2)),
            },
            {
              factor: "Day of week",
              multiplier: parseFloat(dayMultiplier.toFixed(2)),
            },
            {
              factor: "Hour of day",
              multiplier: parseFloat(hourMultiplier.toFixed(2)),
            },
            {
              factor: "Trending score",
              multiplier: 1 + trendingScore * 0.5,
            },
            {
              factor: "Follower base",
              multiplier: parseFloat(followerMultiplier.toFixed(2)),
            },
          ],
          recommendations: [
            confidence > 0.8
              ? "High confidence prediction - expect strong turnout"
              : "Moderate confidence - consider promotional push",
            hour >= 18 && hour <= 23 ? "Optimal broadcast time" : "Consider streaming during peak hours (6-11 PM)",
            trendingScore > 0.7
              ? "Content is trending - good timing"
              : "Content trending lower - might want to highlight unique angle",
          ],
        },
      });
    } catch (error) {
      console.error("[Audience Prediction] Error:", error);
      return res.status(500).json({
        error: "Failed to predict audience",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * POST /api/analytics/predict-churn
 * Predict subscriber churn risk
 */
router.post(
  "/predict-churn",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        userId,
        lastEngagementDays = 0,
        engagementRate = 0.5, // 0-1
        subscriberTenureDays = 180,
        interactionCount = 10,
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          error: "userId is required",
        });
      }

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Calculate risk score
      let riskScore = 0;
      const riskFactors: string[] = [];

      // Factor 1: Engagement recency
      if (lastEngagementDays > 7) {
        riskScore += 0.3;
        riskFactors.push("No engagement in 7+ days");
      } else if (lastEngagementDays > 3) {
        riskScore += 0.15;
        riskFactors.push("Low recent engagement");
      }

      // Factor 2: Engagement rate
      if (engagementRate < 0.2) {
        riskScore += 0.25;
        riskFactors.push("Low engagement rate");
      } else if (engagementRate < 0.5) {
        riskScore += 0.1;
        riskFactors.push("Moderate engagement rate");
      }

      // Factor 3: Tenure (newer subscribers are at risk)
      if (subscriberTenureDays < 30) {
        riskScore += 0.2;
        riskFactors.push("New subscriber (< 30 days)");
      } else if (subscriberTenureDays < 90) {
        riskScore += 0.1;
        riskFactors.push("Early subscriber (< 90 days)");
      }

      // Factor 4: Interaction count
      if (interactionCount < 5) {
        riskScore += 0.15;
        riskFactors.push("Low interaction count");
      }

      // Normalize score
      riskScore = Math.min(riskScore, 1.0);

      const riskLevel = riskScore > 0.7 ? "high" : riskScore > 0.4 ? "medium" : "low";

      let recommendedAction = "";
      if (riskLevel === "high") {
        recommendedAction =
          "Send personalized retention offer, exclusive content preview, or special discount";
      } else if (riskLevel === "medium") {
        recommendedAction =
          "Increase engagement touch points: personalized email, featured content, community highlights";
      } else {
        recommendedAction = "Continue engagement as normal";
      }

      // Store prediction
      const prediction = await db
        .insert(churnPredictions)
        .values({
          userId,
          riskScore: riskScore as any,
          riskFactors,
          lastEngagementDays,
          recommendedAction,
          modelVersion: "1.0",
        })
        .returning();

      return res.status(200).json({
        success: true,
        userId,
        prediction: {
          riskScore: parseFloat(riskScore.toFixed(3)),
          riskLevel,
          riskFactors,
          recommendedAction,
          retentionStrategies: [
            "Send exclusive preview of upcoming content",
            "Offer limited-time subscription discount (10-20%)",
            "Highlight community events and interactions",
            "Personalized stream recommendations based on history",
          ],
        },
        predictionId: prediction[0]?.id,
      });
    } catch (error) {
      console.error("[Churn Prediction] Error:", error);
      return res.status(500).json({
        error: "Failed to predict churn",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * POST /api/analytics/predict-content-performance
 * Predict how well a piece of content will perform
 */
router.post(
  "/predict-content-performance",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        title = "",
        description = "",
        genre = "edm",
        tags = [],
        thumbnailQuality = 0.7, // 0-1
        publishTime = new Date(),
      } = req.body;

      // Analyze title quality
      let titleScore = 0;
      const powerWords = [
        "insane",
        "reaction",
        "epic",
        "fail",
        "best",
        "impossible",
        "crazy",
        "unbelievable",
      ];

      for (const word of powerWords) {
        if (title.toLowerCase().includes(word)) {
          titleScore += 0.2;
        }
      }

      // Optimal title length is 45-60 chars
      if (title.length >= 40 && title.length <= 70) {
        titleScore += 0.3;
      }

      titleScore = Math.min(titleScore, 1.0);

      // Analyze description
      const hasCallToAction = /subscribe|watch|check out|follow|click/i.test(description);
      const hasHashtags = description.includes("#");
      const descriptionLength = description.length;

      let descriptionScore = 0;
      if (hasCallToAction) descriptionScore += 0.3;
      if (hasHashtags) descriptionScore += 0.2;
      if (descriptionLength > 100 && descriptionLength < 1000) descriptionScore += 0.3;
      descriptionScore = Math.min(descriptionScore, 1.0);

      // Analyze tags/metadata
      let metadataScore = tags.length / 10; // 10 tags is ideal
      metadataScore = Math.min(metadataScore, 1.0);

      // Calculate overall content score
      const contentScore = (titleScore * 0.4 + descriptionScore * 0.35 + metadataScore * 0.25);

      // Predict views based on genre baseline
      const genreBaselineViews: Record<string, number> = {
        edm: 500,
        house: 450,
        hiphop: 600,
        drum_and_bass: 350,
        amapiano: 520,
        grime: 300,
        techno: 400,
        uk_garage: 280,
      };

      const baseline = genreBaselineViews[genre.toLowerCase()] || 400;
      const predictedViews = Math.round(
        baseline * contentScore * thumbnailQuality * (1 + Math.random() * 0.3)
      );

      // Estimate engagement rate
      const estimatedEngagementRate = 0.05 + contentScore * 0.08; // 5-13%

      // Estimate revenue
      const estimatedRevenue = (predictedViews * 0.0015).toFixed(2); // $0.0015 CPM

      // Find optimal posting time
      const publishDate = new Date(publishTime);
      const dayOfWeek = publishDate.getDay();
      const hour = publishDate.getHours();
      const isPeakTime =
        hour >= 18 && hour <= 23 && dayOfWeek >= 4 && dayOfWeek <= 6;

      let timingFeedback = "";
      if (isPeakTime) {
        timingFeedback = "Excellent timing - peak hours on weekend evening";
      } else if (hour >= 18 && hour <= 23) {
        timingFeedback = "Good timing - peak hours but not optimal day";
      } else if (dayOfWeek >= 4 && dayOfWeek <= 6) {
        timingFeedback = "Good timing - weekend but not peak hours";
      } else {
        timingFeedback = "Consider scheduling for weekday evening (6-11 PM)";
      }

      return res.status(200).json({
        success: true,
        contentAnalysis: {
          titleScore: parseFloat(titleScore.toFixed(3)),
          descriptionScore: parseFloat(descriptionScore.toFixed(3)),
          metadataScore: parseFloat(metadataScore.toFixed(3)),
          overallScore: parseFloat(contentScore.toFixed(3)),
        },
        performance: {
          predictedViews,
          predictedEngagementRate: parseFloat(estimatedEngagementRate.toFixed(3)),
          estimatedRevenue: `$${estimatedRevenue}`,
        },
        timing: {
          publishTime,
          isPeakTime,
          feedback: timingFeedback,
          suggestedTime: "Friday-Sunday 6-11 PM for maximum reach",
        },
        recommendations: [
          titleScore < 0.5 ? "Consider adding power words to title (EPIC, INSANE, etc.)" : "Title is well-optimized",
          descriptionScore < 0.5 ? "Add clear call-to-action and relevant hashtags" : "Description is well-structured",
          metadataScore < 0.5 ? "Add 8-10 descriptive tags for discoverability" : "Metadata is comprehensive",
          !isPeakTime ? timingFeedback : "Timing is optimal",
          thumbnailQuality < 0.7 ? "Invest in higher-quality thumbnail design" : "Thumbnail quality is good",
        ],
      });
    } catch (error) {
      console.error("[Content Performance Prediction] Error:", error);
      return res.status(500).json({
        error: "Failed to predict content performance",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/analytics/churn-predictions
 * Get recent churn predictions
 */
router.get(
  "/churn-predictions",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { limit = 20, riskLevel = "all" } = req.query;

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      let predictions = await db
        .select()
        .from(churnPredictions)
        .orderBy(desc(churnPredictions.createdAt))
        .limit(parseInt(limit as string));

      // Filter by risk level if specified
      if (riskLevel !== "all") {
        const threshold =
          riskLevel === "high" ? 0.7 : riskLevel === "medium" ? 0.4 : 0;
        predictions = predictions.filter(
          (p) => (p.riskScore as any) >= threshold
        );
      }

      // Categorize
      const byCat = {
        high: predictions.filter((p) => (p.riskScore as any) > 0.7),
        medium: predictions.filter(
          (p) => (p.riskScore as any) > 0.4 && (p.riskScore as any) <= 0.7
        ),
        low: predictions.filter((p) => (p.riskScore as any) <= 0.4),
      };

      return res.status(200).json({
        success: true,
        predictions: predictions.map((p) => ({
          id: p.id,
          userId: p.userId,
          riskScore: p.riskScore,
          riskLevel: (p.riskScore as any) > 0.7 ? "high" : (p.riskScore as any) > 0.4 ? "medium" : "low",
          factors: p.riskFactors,
          recommendedAction: p.recommendedAction,
          createdAt: p.createdAt,
        })),
        summary: {
          total: predictions.length,
          high: byCat.high.length,
          medium: byCat.medium.length,
          low: byCat.low.length,
        },
      });
    } catch (error) {
      console.error("[Churn Predictions] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve churn predictions",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;
