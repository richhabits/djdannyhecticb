/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Highlights Router - Auto-generated highlight reels from streaming metrics
 */

import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";
import {
  highlights,
  highlightMoments,
  Highlight,
  InsertHighlight,
  InsertHighlightMoment,
} from "../../drizzle/content-schema";
import { clips } from "../../drizzle/content-schema";
import { nanoid } from "nanoid";

// ==========================================
// INPUT VALIDATORS
// ==========================================
const GenerateHighlightInput = z.object({
  sessionId: z.number().positive(),
  title: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  minMoments: z.number().min(5).default(5),
  maxMoments: z.number().min(1).max(20).default(10),
});

const GetHighlightsInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  sessionId: z.number().optional(),
});

const PublishHighlightInput = z.object({
  highlightId: z.string(),
});

/**
 * Scoring algorithm for highlight moments
 * Combines multiple engagement signals
 */
interface HighlightMomentScore {
  startTime: number;
  endTime: number;
  score: number;
  type: string;
  metrics: {
    reactions: number;
    donations: number;
    chatSpikes: number;
    pollParticipation: number;
    viewerCount: number;
  };
}

// ==========================================
// HIGHLIGHTS PROCEDURES
// ==========================================
const highlightsRouter = router({
  // Generate highlight reel from session metrics
  generate: adminProcedure
    .input(GenerateHighlightInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const highlightId = nanoid();
      const now = new Date();

      // TODO: Integrate with metrics/engagement data to score moments
      // For now, create the highlight placeholder
      const highlight: InsertHighlight = {
        id: highlightId,
        sessionId: input.sessionId,
        title: input.title,
        description: input.description || null,
        status: "generating",
        score: null,
        videoUrl: null,
        thumbnailUrl: null,
        duration: null,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(highlights).values(highlight);

      // Schedule async processing job
      // This would typically be queued for background processing
      // setImmediate(() => processHighlightGeneration(highlightId, input.sessionId));

      return { id: highlightId, status: "generating" };
    }),

  // Get highlights (public view)
  list: publicProcedure
    .input(GetHighlightsInput)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [eq(highlights.status, "published")];
      if (input.sessionId) {
        conditions.push(eq(highlights.sessionId, input.sessionId));
      }

      return await db
        .select()
        .from(highlights)
        .where(and(...conditions))
        .orderBy(desc(highlights.publishedAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // Get highlight by ID with moments
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const highlight = await db.query.highlights.findFirst({
        where: eq(highlights.id, input.id),
      });

      if (!highlight) return null;

      const moments = await db
        .select()
        .from(highlightMoments)
        .where(eq(highlightMoments.highlightId, input.id))
        .orderBy(sql`${highlightMoments.startTime}`);

      return {
        ...highlight,
        moments,
      };
    }),

  // Get weekly/monthly highlights
  weekly: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return await db
      .select()
      .from(highlights)
      .where(
        and(
          eq(highlights.status, "published"),
          gte(highlights.publishedAt, sevenDaysAgo)
        )
      )
      .orderBy(desc(highlights.publishedAt));
  }),

  monthly: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return await db
      .select()
      .from(highlights)
      .where(
        and(
          eq(highlights.status, "published"),
          gte(highlights.publishedAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(highlights.publishedAt));
  }),

  // Publish a generated highlight
  publish: adminProcedure
    .input(PublishHighlightInput)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(highlights)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(highlights.id, input.highlightId));

      return { success: true };
    }),

  // Archive a highlight
  archive: adminProcedure
    .input(z.object({ highlightId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(highlights)
        .set({
          status: "archived",
          updatedAt: new Date(),
        })
        .where(eq(highlights.id, input.highlightId));

      return { success: true };
    }),

  // Get highlight statistics
  stats: adminProcedure
    .input(z.object({ highlightId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const highlight = await db.query.highlights.findFirst({
        where: eq(highlights.id, input.highlightId),
      });

      if (!highlight) throw new Error("Highlight not found");

      // TODO: Fetch view counts, engagement metrics from analytics
      return {
        highlightId: input.highlightId,
        views: 0,
        engagement: 0,
        sharers: 0,
        avgWatchTime: 0,
      };
    }),
});

export { highlightsRouter };
