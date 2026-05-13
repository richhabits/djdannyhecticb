/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Community Safety, Moderation, and Reputation Management
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  reports,
  userBans,
  reputationScores,
  reputationBadges,
  communityHighlights,
  donations,
  chatMessages,
  clipComments,
} from "../../drizzle/engagement-schema";
import { eq, and, desc, gt, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const reportSchema = z.object({
  reportedUserId: z.number().optional(),
  reportedCommentId: z.number().optional(),
  reason: z.enum([
    "spam",
    "harassment",
    "hate_speech",
    "inappropriate_content",
    "misinformation",
    "impersonation",
    "scam",
    "other",
  ]),
  description: z.string().max(1000).optional(),
});

const appealSchema = z.object({
  banId: z.number(),
  reason: z.string().min(10).max(1000),
});

export const communityRouter = router({
  // Report a user or comment
  createReport: protectedProcedure
    .input(reportSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (!input.reportedUserId && !input.reportedCommentId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Must report either a user or comment" });
      }

      const [report] = await ctx.db
        .insert(reports)
        .values({
          reporterId: userId,
          reportedUserId: input.reportedUserId,
          reportedCommentId: input.reportedCommentId,
          reason: input.reason,
          description: input.description,
          status: "open",
        })
        .returning();

      return report;
    }),

  // Get community guidelines
  getCommunityGuidelines: publicProcedure.query(async () => {
    return {
      title: "DJ Danny Hectic B Community Guidelines",
      sections: [
        {
          title: "Be Respectful",
          description: "Treat all community members with respect. No harassment, hate speech, or personal attacks.",
        },
        {
          title: "No Spam",
          description: "Don't flood the chat with repeated messages, excessive links, or promotional content.",
        },
        {
          title: "Keep It Clean",
          description: "Avoid explicit content, NSFW material, and offensive language.",
        },
        {
          title: "No Misinformation",
          description: "Don't spread false information or misleading content.",
        },
        {
          title: "Respect Privacy",
          description: "Don't share personal information about others without consent.",
        },
        {
          title: "Constructive Feedback",
          description: "Give feedback that's helpful and constructive, not just criticism.",
        },
      ],
    };
  }),

  // Get reputation score
  getReputation: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [reputation] = await ctx.db
        .select()
        .from(reputationScores)
        .where(eq(reputationScores.userId, input.userId))
        .limit(1);

      return (
        reputation || {
          userId: input.userId,
          score: 0,
          trustLevel: "new",
          messagesCount: 0,
          clipsCount: 0,
          donationsCount: 0,
          violationsCount: 0,
        }
      );
    }),

  // Get user's badges
  getUserBadges: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const badges = await ctx.db
        .select()
        .from(reputationBadges)
        .where(eq(reputationBadges.userId, input.userId));

      return badges;
    }),

  // Update reputation (system call)
  updateReputation: protectedProcedure
    .input(z.object({
      userId: z.number(),
      scoreChange: z.number(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Only allow self-updates or admin updates
      const userId = ctx.user?.id;
      if (userId !== input.userId && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [existing] = await ctx.db
        .select()
        .from(reputationScores)
        .where(eq(reputationScores.userId, input.userId))
        .limit(1);

      const newScore = (existing?.score || 0) + input.scoreChange;

      if (existing) {
        await ctx.db
          .update(reputationScores)
          .set({
            score: newScore,
            lastUpdatedAt: new Date(),
          })
          .where(eq(reputationScores.userId, input.userId));
      } else {
        await ctx.db.insert(reputationScores).values({
          userId: input.userId,
          score: newScore,
        });
      }

      return { success: true, newScore };
    }),

  // Award badge to user
  awardBadge: adminProcedure
    .input(z.object({
      userId: z.number(),
      badgeType: z.enum([
        "trusted",
        "contributor",
        "influencer",
        "moderator",
        "verified",
        "early_supporter",
        "community_champion",
      ]),
    }))
    .mutation(async ({ input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      try {
        const [badge] = await db
          .insert(reputationBadges)
          .values({
            userId: input.userId,
            badgeType: input.badgeType,
          })
          .returning();

        return badge;
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Badge already awarded" });
      }
    }),

  // Admin: View pending reports
  getPendingReports: adminProcedure
    .input(z.object({
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const pending = await db
        .select()
        .from(reports)
        .where(eq(reports.status, "open"))
        .orderBy(desc(reports.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return pending;
    }),

  // Admin: Handle report
  handleReport: adminProcedure
    .input(z.object({
      reportId: z.number(),
      action: z.enum(["dismiss", "warn", "mute", "ban"]),
      duration: z.number().optional(), // in days for mutes/bans
      note: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const adminId = ctx.user?.id;
      if (!adminId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [report] = await ctx.db
        .select()
        .from(reports)
        .where(eq(reports.id, input.reportId))
        .limit(1);

      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      // Take action based on type
      if (input.action === "ban" && report.reportedUserId) {
        const endDate = input.duration ? new Date(Date.now() + input.duration * 24 * 60 * 60 * 1000) : null;

        await ctx.db.insert(userBans).values({
          userId: report.reportedUserId,
          reason: report.reason,
          bannedBy: adminId,
          startDate: new Date(),
          endDate,
        });
      }

      // Update report status
      await db
        .update(reports)
        .set({
          status: "resolved",
          reviewedBy: adminId,
          reviewNote: input.note,
          resolvedAt: new Date(),
        })
        .where(eq(reports.id, input.reportId));

      return { success: true };
    }),

  // Check if user is banned
  isBanned: publicProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .query(async ({ input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const now = new Date();
      const [ban] = await db
        .select()
        .from(userBans)
        .where(
          and(
            eq(userBans.userId, input.userId),
            or(eq(userBans.endDate, null), gt(userBans.endDate, now))
          )
        )
        .limit(1);

      return { banned: !!ban, banInfo: ban || null };
    }),

  // Appeal a ban
  appealBan: protectedProcedure
    .input(appealSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Verify ban exists and belongs to user
      const [ban] = await db
        .select()
        .from(userBans)
        .where(eq(userBans.id, input.banId))
        .limit(1);

      if (!ban || ban.userId !== userId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db
        .update(userBans)
        .set({
          appealedAt: new Date(),
          appealReason: input.reason,
          appealStatus: "pending",
        })
        .where(eq(userBans.id, input.banId));

      return { success: true };
    }),

  // Feature content as highlight
  createHighlight: adminProcedure
    .input(z.object({
      type: z.enum(["clip_of_week", "top_contributor", "comment_of_day", "top_donor"]),
      featuredUserId: z.number().optional(),
      featuredCommentId: z.number().optional(),
      featuredClipId: z.number().optional(),
      title: z.string(),
      description: z.string().optional(),
      reason: z.string().optional(),
      durationDays: z.number().default(7),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const adminId = ctx.user?.id;
      if (!adminId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const endDate = new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000);

      const [highlight] = await db
        .insert(communityHighlights)
        .values({
          type: input.type,
          featuredUserId: input.featuredUserId,
          featuredCommentId: input.featuredCommentId,
          featuredClipId: input.featuredClipId,
          title: input.title,
          description: input.description,
          reason: input.reason,
          featuredBy: adminId,
          startDate: new Date(),
          endDate,
        })
        .returning();

      return highlight;
    }),

  // Get current highlights
  getHighlights: publicProcedure
    .input(z.object({
      type: z.string().optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const now = new Date();
      const highlights = await db
        .select()
        .from(communityHighlights)
        .where(
          and(
            input.type ? eq(communityHighlights.type, input.type) : undefined,
            or(eq(communityHighlights.endDate, null), gt(communityHighlights.endDate, now))
          )
        )
        .orderBy(desc(communityHighlights.createdAt))
        .limit(input.limit);

      return highlights;
    }),

  // Get top contributors
  getTopContributors: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
      timeframeDays: z.number().default(7),
    }))
    .query(async ({ input }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get top donors in timeframe
      const since = new Date(Date.now() - input.timeframeDays * 24 * 60 * 60 * 1000);

      const topDonors = await db
        .select()
        .from(donations)
        .where(gt(donations.createdAt, since));

      // Aggregate by user
      const donorMap = new Map<number, number>();
      topDonors.forEach((d) => {
        const current = donorMap.get(d.userId) || 0;
        donorMap.set(d.userId, current + parseFloat(d.amount));
      });

      const sorted = Array.from(donorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, input.limit);

      return sorted.map(([userId, totalDonated]) => ({
        userId,
        totalDonated,
      }));
    }),

  // Get community stats
  getCommunityStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const totalDonations = await ctx.db.select().from(donations);
    const totalMessages = await ctx.db.select().from(chatMessages);
    const totalComments = await ctx.db.select().from(clipComments);

    return {
      totalDonationsAmount: totalDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0),
      totalMessages: totalMessages.length,
      totalComments: totalComments.length,
      averageDonation: totalDonations.length > 0 ? totalDonations.reduce((sum, d) => sum + parseFloat(d.amount), 0) / totalDonations.length : 0,
    };
  }),
});

// Helper function for or queries
function or(...conditions: any[]) {
  return conditions.filter(Boolean);
}
