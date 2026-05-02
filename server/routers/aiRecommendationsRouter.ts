/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * AI Recommendations Router
 * Handles: Content recommendations, trending content, personalization
 */

import { Router, Request, Response } from "express";
import { getDb } from "../db";
import {
  recommendations,
  InsertRecommendation,
} from "../../drizzle/ai-features-schema";
import { eq, desc, and, ne, gt, inArray, sql } from "drizzle-orm";

const router = Router();

/**
 * POST /api/recommendations/track-impression
 * Track when a recommendation is shown to a user
 */
router.post(
  "/track-impression",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { recommendationId } = req.body;

      if (!recommendationId) {
        return res.status(400).json({
          error: "recommendationId is required",
        });
      }

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Increment impressions
      await db
        .update(recommendations)
        .set({
          impressions: sql`impressions + 1`,
        })
        .where(eq(recommendations.id, recommendationId));

      return res.status(200).json({
        success: true,
        recommendationId,
      });
    } catch (error) {
      console.error("[Recommendation Impression] Error:", error);
      return res.status(500).json({
        error: "Failed to track impression",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * POST /api/recommendations/track-click
 * Track when a recommendation is clicked
 */
router.post(
  "/track-click",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { recommendationId } = req.body;

      if (!recommendationId) {
        return res.status(400).json({
          error: "recommendationId is required",
        });
      }

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Mark as clicked
      await db
        .update(recommendations)
        .set({
          clicked: true,
        })
        .where(eq(recommendations.id, recommendationId));

      return res.status(200).json({
        success: true,
        recommendationId,
      });
    } catch (error) {
      console.error("[Recommendation Click] Error:", error);
      return res.status(500).json({
        error: "Failed to track click",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/recommendations/trending
 * Get trending content
 */
router.get(
  "/trending",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { period = "7d", limit = 20, genre } = req.query;

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Simplified trending: recent items with high scores
      // In production, would use more sophisticated trending algorithms
      const trendingRecs = await db
        .select()
        .from(recommendations)
        .where(eq(recommendations.recommendationType, "trending"))
        .orderBy(desc(recommendations.score))
        .limit(parseInt(limit as string));

      return res.status(200).json({
        success: true,
        period,
        trendingContent: trendingRecs.map((rec) => ({
          id: rec.id,
          contentId: rec.recommendedContentId,
          contentType: rec.contentType,
          score: rec.score,
          reason: rec.reason,
          impressions: rec.impressions,
        })),
      });
    } catch (error) {
      console.error("[Trending Content] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve trending content",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/recommendations/personalized/:userId
 * Get personalized recommendations for a user
 */
router.get(
  "/personalized/:userId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.params;
      const { limit = 10, type = "all" } = req.query;

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Get personalized recommendations for user
      let query = db
        .select()
        .from(recommendations)
        .where(eq(recommendations.userId, parseInt(userId)));

      if (type !== "all") {
        query = query.where(
          eq(recommendations.recommendationType, type as string)
        );
      }

      const recs = await query
        .orderBy(desc(recommendations.score))
        .limit(parseInt(limit as string));

      // Enrich with CTR
      const enriched = recs.map((rec) => {
        const ctr =
          rec.impressions > 0 ? (Number(rec.clicked ? 1 : 0) / rec.impressions) * 100 : 0;
        return {
          id: rec.id,
          contentId: rec.recommendedContentId,
          contentType: rec.contentType,
          type: rec.recommendationType,
          score: rec.score,
          reason: rec.reason,
          ctr: ctr.toFixed(2),
          impressions: rec.impressions,
          clicked: rec.clicked,
        };
      });

      return res.status(200).json({
        success: true,
        userId,
        limit,
        type,
        recommendations: enriched,
      });
    } catch (error) {
      console.error("[Personalized Recommendations] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve personalized recommendations",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/recommendations/related/:contentId
 * Get content related to a specific clip/stream
 */
router.get(
  "/related/:contentId",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { contentId } = req.params;
      const { limit = 10, contentType = "clip" } = req.query;

      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      // Get recommendations pointing to this content
      // (i.e., other content similar to this one)
      const related = await db
        .select()
        .from(recommendations)
        .where(
          and(
            ne(recommendations.recommendedContentId, parseInt(contentId)),
            eq(recommendations.contentType, contentType as string),
            eq(recommendations.recommendationType, "content_based")
          )
        )
        .orderBy(desc(recommendations.score))
        .limit(parseInt(limit as string));

      // Also get trending similar content
      const trending = await db
        .select()
        .from(recommendations)
        .where(
          and(
            ne(recommendations.recommendedContentId, parseInt(contentId)),
            eq(recommendations.contentType, contentType as string),
            eq(recommendations.recommendationType, "trending")
          )
        )
        .orderBy(desc(recommendations.score))
        .limit(3);

      const allRelated = [...related, ...trending].slice(0, parseInt(limit as string));

      return res.status(200).json({
        success: true,
        contentId,
        contentType,
        relatedContent: allRelated.map((rec) => ({
          id: rec.id,
          contentId: rec.recommendedContentId,
          type: rec.recommendationType,
          score: rec.score,
          reason: rec.reason,
        })),
      });
    } catch (error) {
      console.error("[Related Content] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve related content",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * POST /api/recommendations/generate
 * Generate recommendations for a user
 */
router.post(
  "/generate",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const {
        userId,
        contentType = "clip",
        algorithm = "collaborative",
        limit = 10,
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

      // Simulate recommendation generation
      // In production, would run actual ML algorithms
      const recommendations_list: InsertRecommendation[] = [];

      // Generate 5 mock recommendations
      for (let i = 0; i < Math.min(limit, 5); i++) {
        const mockContentId = 1000 + Math.floor(Math.random() * 10000);
        const score = (0.95 - i * 0.1).toFixed(4);

        recommendations_list.push({
          userId,
          recommendedContentId: mockContentId,
          contentType,
          recommendationType:
            algorithm === "collaborative"
              ? "collaborative"
              : algorithm === "trending"
                ? "trending"
                : "content_based",
          score: parseFloat(score),
          reason: `Based on your ${contentType} preferences`,
          clicked: false,
          impressions: 0,
        });
      }

      // Store recommendations
      if (recommendations_list.length > 0) {
        await db.insert(recommendations).values(recommendations_list);
      }

      return res.status(200).json({
        success: true,
        userId,
        algorithm,
        contentType,
        count: recommendations_list.length,
        recommendations: recommendations_list.map((r, idx) => ({
          ...r,
          id: 1000 + idx, // Mock ID
        })),
      });
    } catch (error) {
      console.error("[Generate Recommendations] Error:", error);
      return res.status(500).json({
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/recommendations/stats
 * Get recommendation performance stats
 */
router.get(
  "/stats",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(503).json({ error: "Database not available" });
      }

      const allRecs = await db.select().from(recommendations);

      // Calculate stats
      const totalRecs = allRecs.length;
      const clickedRecs = allRecs.filter((r) => r.clicked).length;
      const totalImpressions = allRecs.reduce((sum, r) => sum + r.impressions, 0);
      const avgCTR = totalImpressions > 0 ? (clickedRecs / totalImpressions) * 100 : 0;

      // By type
      const byType: Record<string, any> = {};
      for (const rec of allRecs) {
        if (!byType[rec.recommendationType]) {
          byType[rec.recommendationType] = {
            count: 0,
            clicked: 0,
            impressions: 0,
          };
        }
        byType[rec.recommendationType].count++;
        if (rec.clicked) byType[rec.recommendationType].clicked++;
        byType[rec.recommendationType].impressions += rec.impressions;
      }

      return res.status(200).json({
        success: true,
        stats: {
          total: totalRecs,
          clicked: clickedRecs,
          ctr: avgCTR.toFixed(2),
          totalImpressions,
          byType,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("[Recommendation Stats] Error:", error);
      return res.status(500).json({
        error: "Failed to retrieve stats",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default router;
