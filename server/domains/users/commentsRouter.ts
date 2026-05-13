/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { clipComments, commentLikes } from "../../drizzle/engagement-schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const commentSchema = z.object({
  clipId: z.number(),
  content: z.string().min(1).max(1000),
  parentCommentId: z.number().optional(),
});

export const commentsRouter = router({
  // Post a comment on a clip
  createComment: protectedProcedure
    .input(commentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [comment] = await ctx.db
        .insert(clipComments)
        .values({
          clipId: input.clipId,
          userId,
          content: input.content,
          parentCommentId: input.parentCommentId,
        })
        .returning();

      return comment;
    }),

  // Get comments for a clip (threaded)
  getComments: publicProcedure
    .input(z.object({
      clipId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
      sortBy: z.enum(["newest", "popular"]).default("newest"),
    }))
    .query(async ({ input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const orderByField = input.sortBy === "popular" ? clipComments.likeCount : clipComments.createdAt;
      const orderDirection = input.sortBy === "popular" ? desc(orderByField) : desc(orderByField);

      const comments = await db
        .select()
        .from(clipComments)
        .where(
          and(
            eq(clipComments.clipId, input.clipId),
            eq(clipComments.isDeleted, false)
          )
        )
        .orderBy(orderDirection)
        .limit(input.limit)
        .offset(input.offset);

      return comments;
    }),

  // Get replies to a specific comment
  getReplies: publicProcedure
    .input(z.object({
      parentCommentId: z.number(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const replies = await db
        .select()
        .from(clipComments)
        .where(
          and(
            eq(clipComments.parentCommentId, input.parentCommentId),
            eq(clipComments.isDeleted, false)
          )
        )
        .orderBy(desc(clipComments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return replies;
    }),

  // Like a comment
  likeComment: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      try {
        await db.insert(commentLikes).values({
          commentId: input.commentId,
          userId,
        });

        // Increment like count
        await db
          .update(clipComments)
          .set({
            likeCount: (await db.select().from(clipComments).where(eq(clipComments.id, input.commentId)))[0]?.likeCount || 0 + 1,
          })
          .where(eq(clipComments.id, input.commentId));
      } catch (error) {
        // Already liked
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already liked this comment" });
      }

      return { success: true };
    }),

  // Unlike a comment
  unlikeComment: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .delete(commentLikes)
        .where(
          and(
            eq(commentLikes.commentId, input.commentId),
            eq(commentLikes.userId, userId)
          )
        );

      // Decrement like count
      const [comment] = await db
        .select()
        .from(clipComments)
        .where(eq(clipComments.id, input.commentId));

      if (comment) {
        await db
          .update(clipComments)
          .set({
            likeCount: Math.max(0, comment.likeCount - 1),
          })
          .where(eq(clipComments.id, input.commentId));
      }

      return { success: true };
    }),

  // Check if user liked a comment
  isCommentLiked: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [like] = await db
        .select()
        .from(commentLikes)
        .where(
          and(
            eq(commentLikes.commentId, input.commentId),
            eq(commentLikes.userId, userId)
          )
        )
        .limit(1);

      return { liked: !!like };
    }),

  // Delete a comment (soft delete)
  deleteComment: protectedProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify ownership
      const [comment] = await db
        .select()
        .from(clipComments)
        .where(eq(clipComments.id, input.commentId))
        .limit(1);

      if (!comment || comment.userId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot delete this comment" });
      }

      await db
        .update(clipComments)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(eq(clipComments.id, input.commentId));

      return { success: true };
    }),

  // Admin: Delete comment for moderation
  adminDeleteComment: adminProcedure
    .input(z.object({
      commentId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db
        .update(clipComments)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(eq(clipComments.id, input.commentId));

      return { success: true };
    }),

  // Get comment count for a clip
  getCommentCount: publicProcedure
    .input(z.object({
      clipId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const comments = await ctx.db
        .select()
        .from(clipComments)
        .where(
          and(
            eq(clipComments.clipId, input.clipId),
            eq(clipComments.isDeleted, false)
          )
        );

      return { count: comments.length };
    }),
});
