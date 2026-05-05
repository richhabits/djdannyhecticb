/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Moderation Router - Chat moderation, bans, mutes, warnings
 */

import { router, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  chatMessages,
  userBadges,
  liveSessions,
} from "../../drizzle/engagement-schema";
import { users } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auditLog } from "../_core/audit";

export const moderationRouter = router({
  // Delete a message
  deleteMessage: adminProcedure
    .input(
      z.object({
        messageId: z.number().positive(),
        reason: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const message = await ctx.db.select()
        .from(chatMessages)
        .where(eq(chatMessages.id, input.messageId))
        .then((rows) => rows[0]);

      if (!message) {
        throw new Error("Message not found");
      }

      await ctx.db.update(chatMessages)
        .set({
          isDeleted: true,
          deletedBy: ctx.user.id,
          deletedReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(chatMessages.id, input.messageId));

      await auditLog("message_deleted", {
        messageId: input.messageId,
        deletedBy: ctx.user.id,
        deletedFrom: message.liveSessionId,
        reason: input.reason,
      });

      return { success: true, messageId: input.messageId };
    }),

  // Get messages for a session (for moderation review)
  getMessages: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        includeDeleted: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const messages = await ctx.db.select({
          message: chatMessages,
          user: users,
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.userId, users.id))
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            input.includeDeleted ? undefined : eq(chatMessages.isDeleted, false)
          )
        )
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return messages;
    }),

  // Ban a user from chat
  banUser: adminProcedure
    .input(
      z.object({
        userId: z.number().positive(),
        liveSessionId: z.number().positive(),
        reason: z.string().max(255),
        duration: z.number().positive().optional(), // minutes, undefined = permanent
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      // Check user exists
      const user = await ctx.db.select()
        .from(users)
        .where(eq(users.id, input.userId))
        .then((rows) => rows[0]);

      if (!user) {
        throw new Error("User not found");
      }

      // Add ban badge
      const expiresAt = input.duration
        ? new Date(Date.now() + input.duration * 60000)
        : null;

      await ctx.db.insert(userBadges).values({
        userId: input.userId,
        badgeType: "banned",
        liveSessionId: input.liveSessionId,
        earnedAt: new Date(),
        expiresAt,
        metadata: {
          reason: input.reason,
          bannedBy: ctx.user.id,
        },
      });

      // Delete any pending messages from this user in this session
      await ctx.db.update(chatMessages)
        .set({
          isDeleted: true,
          deletedBy: ctx.user.id,
          deletedReason: `User banned: ${input.reason}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(chatMessages.userId, input.userId),
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        );

      await auditLog("user_banned", {
        userId: input.userId,
        liveSessionId: input.liveSessionId,
        reason: input.reason,
        duration: input.duration,
        bannedBy: ctx.user.id,
      });

      return { success: true, userId: input.userId };
    }),

  // Mute a user temporarily
  muteUser: adminProcedure
    .input(
      z.object({
        userId: z.number().positive(),
        liveSessionId: z.number().positive(),
        duration: z.number().positive(), // minutes
        reason: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      // Check user exists
      const user = await ctx.db.select()
        .from(users)
        .where(eq(users.id, input.userId))
        .then((rows) => rows[0]);

      if (!user) {
        throw new Error("User not found");
      }

      const expiresAt = new Date(Date.now() + input.duration * 60000);

      await ctx.db.insert(userBadges).values({
        userId: input.userId,
        badgeType: "muted",
        liveSessionId: input.liveSessionId,
        earnedAt: new Date(),
        expiresAt,
        metadata: {
          reason: input.reason,
          mutedBy: ctx.user.id,
        },
      });

      await auditLog("user_muted", {
        userId: input.userId,
        liveSessionId: input.liveSessionId,
        duration: input.duration,
        reason: input.reason,
        mutedBy: ctx.user.id,
      });

      return { success: true, userId: input.userId };
    }),

  // Warn a user (for repeated violations)
  warnUser: adminProcedure
    .input(
      z.object({
        userId: z.number().positive(),
        liveSessionId: z.number().positive(),
        reason: z.string().max(255),
        severity: z.enum(["low", "medium", "high"]).default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      // Check user exists
      const user = await ctx.db.select()
        .from(users)
        .where(eq(users.id, input.userId))
        .then((rows) => rows[0]);

      if (!user) {
        throw new Error("User not found");
      }

      await ctx.db.insert(userBadges).values({
        userId: input.userId,
        badgeType: "warned",
        liveSessionId: input.liveSessionId,
        earnedAt: new Date(),
        metadata: {
          reason: input.reason,
          severity: input.severity,
          warnedBy: ctx.user.id,
        },
      });

      await auditLog("user_warned", {
        userId: input.userId,
        liveSessionId: input.liveSessionId,
        reason: input.reason,
        severity: input.severity,
        warnedBy: ctx.user.id,
      });

      return { success: true, userId: input.userId };
    }),

  // Get user violation history
  getUserViolations: adminProcedure
    .input(
      z.object({
        userId: z.number().positive(),
        liveSessionId: z.number().positive().optional(),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const badges = await ctx.db.select()
        .from(userBadges)
        .where(
          and(
            eq(userBadges.userId, input.userId),
            input.liveSessionId
              ? eq(userBadges.liveSessionId, input.liveSessionId)
              : undefined,
            sql`badge_type IN ('banned', 'muted', 'warned')`
          )
        )
        .orderBy(desc(userBadges.earnedAt));

      return badges;
    }),

  // Get active bans/mutes for a session
  getActiveModerationActions: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const now = new Date();

      const actions = await ctx.db.select({
          badge: userBadges,
          user: users,
        })
        .from(userBadges)
        .leftJoin(users, eq(userBadges.userId, users.id))
        .where(
          and(
            eq(userBadges.liveSessionId, input.liveSessionId),
            sql`badge_type IN ('banned', 'muted')`,
            sql`(expires_at IS NULL OR expires_at > ${now})`
          )
        )
        .orderBy(desc(userBadges.earnedAt));

      return actions;
    }),

  // Unban/unmute a user
  removeModeration: adminProcedure
    .input(
      z.object({
        badgeId: z.number().positive(),
        reason: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const badge = await ctx.db.select()
        .from(userBadges)
        .where(eq(userBadges.id, input.badgeId))
        .then((rows) => rows[0]);

      if (!badge) {
        throw new Error("Moderation action not found");
      }

      // Mark as expired
      await ctx.db.update(userBadges)
        .set({
          expiresAt: new Date(),
          metadata: {
            ...badge.metadata,
            removedBy: ctx.user.id,
            removedAt: new Date().toISOString(),
            removalReason: input.reason,
          },
        })
        .where(eq(userBadges.id, input.badgeId));

      await auditLog("moderation_removed", {
        badgeId: input.badgeId,
        userId: badge.userId,
        badgeType: badge.badgeType,
        reason: input.reason,
        removedBy: ctx.user.id,
      });

      return { success: true, badgeId: input.badgeId };
    }),
});
