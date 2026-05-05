/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Analytics Router - Stream, chat, and donation analytics
 */

import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  chatMessages,
  donations,
  liveSessions,
  reactions,
  streamerStats,
} from "../../drizzle/engagement-schema";
import { users } from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql, count, sum, avg } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const analyticsRouter = router({
  // Get stream metrics for a session
  getStreamMetrics: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const session = await ctx.db
        .select()
        .from(liveSessions)
        .where(eq(liveSessions.id, input.liveSessionId))
        .then((rows) => rows[0]);

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      }

      // Get chat stats
      const chatStats = await ctx.db
        .select({
          messageCount: count(chatMessages.id),
          uniqueUsers: count(chatMessages.userId, { distinct: true }),
        })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .then((rows) => rows[0]);

      // Get donation stats
      const donationStats = await ctx.db
        .select({
          totalDonations: sum(donations.amount),
          donationCount: count(donations.id),
          avgDonation: avg(donations.amount),
        })
        .from(donations)
        .where(eq(donations.liveSessionId, input.liveSessionId))
        .then((rows) => rows[0]);

      // Get reaction stats
      const reactionStats = await ctx.db
        .select({
          reactionCount: count(reactions.id),
        })
        .from(reactions)
        .where(eq(reactions.liveSessionId, input.liveSessionId))
        .then((rows) => rows[0]);

      const duration = session.endedAt
        ? (session.endedAt.getTime() - session.startedAt.getTime()) / 60000 // minutes
        : (Date.now() - session.startedAt.getTime()) / 60000;

      return {
        session,
        chat: {
          totalMessages: chatStats?.messageCount || 0,
          uniqueUsers: chatStats?.uniqueUsers || 0,
          messagesPerMinute:
            duration > 0
              ? ((chatStats?.messageCount || 0) / duration).toFixed(2)
              : 0,
        },
        donations: {
          total: donationStats?.totalDonations
            ? parseFloat(donationStats.totalDonations)
            : 0,
          count: donationStats?.donationCount || 0,
          average: donationStats?.avgDonation
            ? parseFloat(donationStats.avgDonation)
            : 0,
        },
        reactions: {
          total: reactionStats?.reactionCount || 0,
        },
        stream: {
          peakViewers: session.viewerCount,
          duration: Math.ceil(duration),
          startedAt: session.startedAt,
          endedAt: session.endedAt,
        },
      };
    }),

  // Get analytics over a time range
  getAnalyticsRange: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get all sessions in range
      const sessions = await ctx.db
        .select()
        .from(liveSessions)
        .where(
          and(
            gte(liveSessions.startedAt, input.startDate),
            lte(liveSessions.startedAt, input.endDate)
          )
        )
        .orderBy(desc(liveSessions.startedAt))
        .limit(input.limit);

      // For each session, get key metrics
      const sessionMetrics = await Promise.all(
        sessions.map(async (session) => {
          const chatCount = await ctx.db
            .select({ count: count(chatMessages.id) })
            .from(chatMessages)
            .where(eq(chatMessages.liveSessionId, session.id))
            .then((rows) => rows[0]?.count || 0);

          const donationTotal = await ctx.db
            .select({ total: sum(donations.amount) })
            .from(donations)
            .where(eq(donations.liveSessionId, session.id))
            .then(
              (rows) =>
                rows[0]?.total ? parseFloat(rows[0].total) : 0
            );

          return {
            id: session.id,
            title: session.title,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
            peakViewers: session.viewerCount,
            messages: chatCount,
            donationTotal,
          };
        })
      );

      const totals = {
        sessions: sessions.length,
        totalMessages: sessionMetrics.reduce((sum, s) => sum + s.messages, 0),
        totalDonations: sessionMetrics.reduce((sum, s) => sum + s.donationTotal, 0),
        avgViewers:
          sessions.length > 0
            ? (
                sessions.reduce((sum, s) => sum + s.viewerCount, 0) /
                sessions.length
              ).toFixed(0)
            : 0,
      };

      return {
        totals,
        sessions: sessionMetrics,
      };
    }),

  // Get top donors
  getTopDonors: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive().optional(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const topDonors = await ctx.db
        .select({
          userId: donations.userId,
          user: users,
          totalDonated: sum(donations.amount),
          donationCount: count(donations.id),
        })
        .from(donations)
        .where(
          input.liveSessionId
            ? eq(donations.liveSessionId, input.liveSessionId)
            : undefined
        )
        .leftJoin(users, eq(donations.userId, users.id))
        .groupBy(donations.userId, users.id)
        .orderBy(desc(sum(donations.amount)))
        .limit(input.limit);

      return topDonors.map((d) => ({
        userId: d.userId,
        user: d.user,
        totalDonated: d.totalDonated ? parseFloat(d.totalDonated) : 0,
        donationCount: d.donationCount || 0,
      }));
    }),

  // Get most active chatters
  getActiveChatters: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const activeChatters = await ctx.db
        .select({
          userId: chatMessages.userId,
          user: users,
          messageCount: count(chatMessages.id),
        })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .leftJoin(users, eq(chatMessages.userId, users.id))
        .groupBy(chatMessages.userId, users.id)
        .orderBy(desc(count(chatMessages.id)))
        .limit(input.limit);

      return activeChatters;
    }),

  // Get emoji/reaction trends
  getReactionTrends: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const trends = await ctx.db
        .select({
          reactionType: reactions.reactionType,
          count: count(reactions.id),
        })
        .from(reactions)
        .where(eq(reactions.liveSessionId, input.liveSessionId))
        .groupBy(reactions.reactionType)
        .orderBy(desc(count(reactions.id)));

      return trends;
    }),

  // Get geography data (if available)
  getGeographyData: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get geography data from user cities
      const geoData = await ctx.db
        .select({
          city: users.city,
          count: count(chatMessages.userId, { distinct: true }),
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.userId, users.id))
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .groupBy(users.city)
        .orderBy(desc(count(chatMessages.userId)))
        .limit(20);

      return geoData.filter((g) => g.city); // Only include entries with city data
    }),

  // Get hourly message trends
  getMessageTrends: adminProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const trends = await ctx.db
        .select({
          hour: sql<string>`DATE_TRUNC('hour', ${chatMessages.createdAt})`,
          messageCount: count(chatMessages.id),
        })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .groupBy(sql`DATE_TRUNC('hour', ${chatMessages.createdAt})`)
        .orderBy(sql`DATE_TRUNC('hour', ${chatMessages.createdAt})`);

      return trends;
    }),

  // Get dashboard summary
  getDashboardSummary: adminProcedure
    .input(
      z.object({
        daysBack: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.daysBack);

      // Get active sessions
      const activeSessions = await ctx.db
        .select({ count: count(liveSessions.id) })
        .from(liveSessions)
        .where(
          and(
            gte(liveSessions.startedAt, startDate),
            lte(liveSessions.startedAt, new Date())
          )
        )
        .then((rows) => rows[0]?.count || 0);

      // Get total messages
      const totalMessages = await ctx.db
        .select({ count: count(chatMessages.id) })
        .from(chatMessages)
        .leftJoin(
          liveSessions,
          eq(chatMessages.liveSessionId, liveSessions.id)
        )
        .where(
          and(
            gte(liveSessions.startedAt, startDate),
            eq(chatMessages.isDeleted, false)
          )
        )
        .then((rows) => rows[0]?.count || 0);

      // Get total donations
      const totalDonations = await db
        .select({ total: sum(donations.amount) })
        .from(donations)
        .leftJoin(
          liveSessions,
          eq(donations.liveSessionId, liveSessions.id)
        )
        .where(gte(liveSessions.startedAt, startDate))
        .then(
          (rows) =>
            rows[0]?.total ? parseFloat(rows[0].total) : 0
        );

      // Get unique users
      const uniqueUsers = await db
        .select({ count: count(chatMessages.userId, { distinct: true }) })
        .from(chatMessages)
        .leftJoin(
          liveSessions,
          eq(chatMessages.liveSessionId, liveSessions.id)
        )
        .where(
          and(
            gte(liveSessions.startedAt, startDate),
            eq(chatMessages.isDeleted, false)
          )
        )
        .then((rows) => rows[0]?.count || 0);

      return {
        daysBack: input.daysBack,
        activeSessions,
        totalMessages,
        totalDonations,
        uniqueUsers,
        avgMessagesPerSession:
          activeSessions > 0
            ? (totalMessages / activeSessions).toFixed(0)
            : 0,
        avgDonationsPerSession:
          activeSessions > 0
            ? (totalDonations / activeSessions).toFixed(2)
            : 0,
      };
    }),
});
