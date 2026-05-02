/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Clips Router - VOD clip extraction, management, and sharing
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { eq, desc, and, isNull, gte, lte, sql, count } from "drizzle-orm";
import { clips, clipComments, clipLikes, clipViews } from "../../drizzle/content-schema";
import { users } from "../../drizzle/schema";
import { nanoid } from "nanoid";

// ==========================================
// INPUT VALIDATORS
// ==========================================
const CreateClipInput = z.object({
  sessionId: z.number().positive(),
  startTime: z.number().min(0),
  endTime: z.number().min(0),
  title: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
});

const PublishClipInput = z.object({
  clipId: z.string(),
});

const LikeClipInput = z.object({
  clipId: z.string(),
});

const CommentOnClipInput = z.object({
  clipId: z.string(),
  comment: z.string().min(1).max(500),
});

const GetClipsInput = z.object({
  userId: z.number().optional(),
  sessionId: z.number().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const GetPopularClipsInput = z.object({
  limit: z.number().min(1).max(50).default(10),
  days: z.number().min(1).max(90).default(7),
});

const ViewClipInput = z.object({
  clipId: z.string(),
});

// ==========================================
// CLIPS PROCEDURES
// ==========================================
const clipsRouter = router({
  // Create a new clip from VOD session
  create: protectedProcedure
    .input(CreateClipInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const clipId = nanoid();
      const now = new Date();

      await db.insert(clips).values({
        id: clipId,
        sessionId: input.sessionId,
        userId: ctx.user.id,
        startTime: input.startTime,
        endTime: input.endTime,
        title: input.title,
        description: input.description || null,
        duration: input.endTime - input.startTime,
        status: "processing",
        createdAt: now,
        updatedAt: now,
      });

      return { id: clipId };
    }),

  // Get clips (user's own or from specific session)
  list: publicProcedure
    .input(GetClipsInput)
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];

      if (input.userId) {
        conditions.push(eq(clips.userId, input.userId));
      }
      if (input.sessionId) {
        conditions.push(eq(clips.sessionId, input.sessionId));
      }

      // Only show published clips to public, or own clips to user
      if (!ctx.user || ctx.user.id !== input.userId) {
        conditions.push(eq(clips.publishedAt, isNull(false)));
      }

      const results = await db
        .select({
          clip: clips,
          creator: {
            id: users.id,
            name: users.name,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(clips)
        .leftJoin(users, eq(clips.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(clips.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return results.map(r => ({
        ...r.clip,
        creator: r.creator,
      }));
    }),

  // Publish a clip (make it public)
  publish: protectedProcedure
    .input(PublishClipInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const clip = await db.query.clips.findFirst({
        where: eq(clips.id, input.clipId),
      });

      if (!clip) throw new Error("Clip not found");
      if (clip.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db
        .update(clips)
        .set({
          publishedAt: new Date(),
          status: "published",
          updatedAt: new Date(),
        })
        .where(eq(clips.id, input.clipId));

      return { success: true };
    }),

  // Get popular/trending clips
  trending: publicProcedure
    .input(GetPopularClipsInput)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const cutoffDate = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      const results = await db
        .select({
          clip: clips,
          likesCount: count(clipLikes.id),
          viewsCount: count(clipViews.id),
          creator: {
            id: users.id,
            name: users.name,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(clips)
        .leftJoin(users, eq(clips.userId, users.id))
        .leftJoin(clipLikes, eq(clips.id, clipLikes.clipId))
        .leftJoin(clipViews, eq(clips.id, clipViews.clipId))
        .where(
          and(
            isNull(false, clips.publishedAt),
            gte(clips.publishedAt, cutoffDate),
            eq(clips.status, "published")
          )
        )
        .groupBy(clips.id, users.id)
        .orderBy(
          desc(
            sql`COUNT(${clipLikes.id}) * 3 + COUNT(${clipViews.id}) * 0.1`
          )
        )
        .limit(input.limit);

      return results.map(r => ({
        ...r.clip,
        creator: r.creator,
        likesCount: r.likesCount,
        viewsCount: r.viewsCount,
      }));
    }),

  // Get clip by ID with stats
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select({
          clip: clips,
          creator: {
            id: users.id,
            name: users.name,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
          likesCount: count(clipLikes.id),
          viewsCount: count(clipViews.id),
          commentsCount: count(clipComments.id),
        })
        .from(clips)
        .leftJoin(users, eq(clips.userId, users.id))
        .leftJoin(clipLikes, eq(clips.id, clipLikes.clipId))
        .leftJoin(clipViews, eq(clips.id, clipViews.clipId))
        .leftJoin(clipComments, eq(clips.id, clipComments.clipId))
        .where(eq(clips.id, input.id))
        .groupBy(clips.id, users.id);

      if (!result.length) return null;

      const row = result[0];
      return {
        ...row.clip,
        creator: row.creator,
        likesCount: row.likesCount,
        viewsCount: row.viewsCount,
        commentsCount: row.commentsCount,
      };
    }),

  // Record view
  view: publicProcedure
    .input(ViewClipInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user?.id;
      const now = new Date();

      // Check if user already viewed in last 24 hours
      if (userId) {
        const recentView = await db.query.clipViews.findFirst({
          where: and(
            eq(clipViews.clipId, input.clipId),
            eq(clipViews.userId, userId),
            gte(
              clipViews.viewedAt,
              new Date(Date.now() - 24 * 60 * 60 * 1000)
            )
          ),
        });

        if (recentView) return { success: true };
      }

      await db.insert(clipViews).values({
        clipId: input.clipId,
        userId: userId || null,
        viewedAt: now,
      });

      return { success: true };
    }),

  // Like/unlike a clip
  toggleLike: protectedProcedure
    .input(LikeClipInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db.query.clipLikes.findFirst({
        where: and(
          eq(clipLikes.clipId, input.clipId),
          eq(clipLikes.userId, ctx.user.id)
        ),
      });

      if (existing) {
        await db
          .delete(clipLikes)
          .where(
            and(
              eq(clipLikes.clipId, input.clipId),
              eq(clipLikes.userId, ctx.user.id)
            )
          );
        return { liked: false };
      } else {
        await db.insert(clipLikes).values({
          clipId: input.clipId,
          userId: ctx.user.id,
          likedAt: new Date(),
        });
        return { liked: true };
      }
    }),

  // Comment on clip
  addComment: protectedProcedure
    .input(CommentOnClipInput)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const commentId = nanoid();
      const now = new Date();

      await db.insert(clipComments).values({
        id: commentId,
        clipId: input.clipId,
        userId: ctx.user.id,
        comment: input.comment,
        createdAt: now,
      });

      return { id: commentId };
    }),

  // Get comments for a clip
  getComments: publicProcedure
    .input(z.object({
      clipId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      return await db
        .select({
          comment: clipComments,
          author: {
            id: users.id,
            name: users.name,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
          },
        })
        .from(clipComments)
        .leftJoin(users, eq(clipComments.userId, users.id))
        .where(eq(clipComments.clipId, input.clipId))
        .orderBy(desc(clipComments.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // Delete a clip (owner only)
  delete: protectedProcedure
    .input(z.object({ clipId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const clip = await db.query.clips.findFirst({
        where: eq(clips.id, input.clipId),
      });

      if (!clip) throw new Error("Clip not found");
      if (clip.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await db.delete(clips).where(eq(clips.id, input.clipId));
      return { success: true };
    }),
});

export { clipsRouter };
