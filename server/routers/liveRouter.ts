/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Streaming Engagement Features - tRPC Router
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  chatMessages,
  donations,
  reactions,
  polls,
  pollVotes,
  leaderboards,
  notifications,
  userBadges,
  liveSessions,
  streamerStats,
  customEmotes,
  raids,
  socialLinks,
  userBadgeTypeEnum,
  reactionTypeEnum,
  notificationTypeEnum,
} from "../../drizzle/engagement-schema";
import { users } from "../../drizzle/schema";
import { eq, desc, and, or, sql, gt, lt, gte, isNull } from "drizzle-orm";
import Stripe from "stripe";
import { ENV } from "../_core/env";

// Initialize Stripe
const stripe = new Stripe(ENV.stripeSecretKey || "");

// ==========================================
// INPUT VALIDATORS
// ==========================================
const ChatMessageInput = z.object({
  liveSessionId: z.number().positive(),
  message: z.string().min(1).max(500),
  usernameColor: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  emotes: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string().url(),
      })
    )
    .max(10)
    .optional(),
});

const DonationInput = z.object({
  liveSessionId: z.number().positive(),
  amount: z.number().min(5).max(10000),
  message: z.string().max(500).optional(),
  anonymous: z.boolean().optional(),
  paymentMethodId: z.string().optional(),
});

const ReactionInput = z.object({
  liveSessionId: z.number().positive(),
  reactionType: z.enum([
    "fire",
    "love",
    "hype",
    "laugh",
    "sad",
    "angry",
    "thinking",
  ]),
});

const PollInput = z.object({
  liveSessionId: z.number().positive(),
  question: z.string().min(3).max(255),
  options: z.array(z.string().min(1).max(100)).min(2).max(10),
  durationSeconds: z.number().min(10).max(3600).default(60),
});

const PollVoteInput = z.object({
  pollId: z.number().positive(),
  optionIndex: z.number().min(0),
});

// ==========================================
// CHAT PROCEDURES
// ==========================================
const chatRouter = router({
  send: protectedProcedure
    .input(ChatMessageInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const rateLimitKey = `chat:${ctx.user.id}:${input.liveSessionId}`;
      const isRateLimited = false; // TODO: Implement rate limiting with Redis

      if (isRateLimited) {
        throw new Error("Rate limited - please slow down");
      }

      const msg = await ctx.db.insert(chatMessages)
        .values({
          liveSessionId: input.liveSessionId,
          userId: ctx.user.id,
          message: input.message,
          usernameColor: input.usernameColor || "#ffffff",
          emotes: input.emotes || [],
        })
        .returning();

      // Get user with badges
      const userWithBadges = await ctx.db.select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .leftJoin(userBadges, eq(userBadges.userId, users.id))
        .then((rows) => {
          if (rows.length === 0) return null;
          const user = rows[0].users;
          const badges = rows.map((r) => r.user_badges).filter(Boolean);
          return { user, badges };
        });

      return {
        ...msg[0],
        user: userWithBadges?.user,
        badges: userWithBadges?.badges || [],
      };
    }),

  messages: publicProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const messages = await ctx.db.select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit)
        .offset(input.offset)
        .leftJoin(users, eq(chatMessages.userId, users.id))
        .leftJoin(
          userBadges,
          and(
            eq(userBadges.userId, chatMessages.userId),
            eq(userBadges.liveSessionId, input.liveSessionId)
          )
        );

      return messages.map((m) => ({
        ...m.chat_messages,
        user: m.users,
        badges: m.user_badges ? [m.user_badges] : [],
      }));
    }),

  delete: adminProcedure
    .input(
      z.object({
        messageId: z.number().positive(),
        reason: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const result = await ctx.db.update(chatMessages)
        .set({
          isDeleted: true,
          deletedBy: ctx.user.id,
          deletedReason: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(chatMessages.id, input.messageId))
        .returning();

      return result[0];
    }),

  pinMessage: adminProcedure
    .input(z.object({ messageId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const result = await ctx.db.update(chatMessages)
        .set({ isPinned: true, updatedAt: new Date() })
        .where(eq(chatMessages.id, input.messageId))
        .returning();

      return result[0];
    }),

  unpinMessage: adminProcedure
    .input(z.object({ messageId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const result = await ctx.db.update(chatMessages)
        .set({ isPinned: false, updatedAt: new Date() })
        .where(eq(chatMessages.id, input.messageId))
        .returning();

      return result[0];
    }),

  pinnedMessages: publicProcedure
    .input(z.object({ liveSessionId: z.number().positive() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isPinned, true),
            eq(chatMessages.isDeleted, false)
          )
        )
        .orderBy(desc(chatMessages.createdAt))
        .leftJoin(users, eq(chatMessages.userId, users.id));
    }),
});

// ==========================================
// DONATION PROCEDURES
// ==========================================
const donationRouter = router({
  create: protectedProcedure
    .input(DonationInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      if (!stripe) throw new Error("Stripe not configured");

      try {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(input.amount * 100), // Convert to cents
          currency: "usd",
          metadata: {
            liveSessionId: input.liveSessionId,
            userId: ctx.user.id,
            message: input.message || "",
          },
        });

        // Create donation record with pending status
        const donation = await ctx.db.insert(donations)
          .values({
            liveSessionId: input.liveSessionId,
            userId: ctx.user.id,
            amount: input.amount.toString(),
            message: input.message,
            anonymous: input.anonymous || false,
            stripePaymentId: paymentIntent.id,
            status: "pending",
          })
          .returning();

        return {
          donation: donation[0],
          clientSecret: paymentIntent.client_secret,
        };
      } catch (error) {
        console.error("Donation creation error:", error);
        throw new Error("Failed to create donation");
      }
    }),

  confirm: protectedProcedure
    .input(
      z.object({
        donationId: z.number().positive(),
        paymentIntentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const donation = await ctx.db.select()
        .from(donations)
        .where(eq(donations.id, input.donationId));

      if (!donation.length || donation[0].userId !== ctx.user.id) {
        throw new Error("Donation not found");
      }

      // Update donation status to completed
      const updated = await ctx.db.update(donations)
        .set({
          status: "completed",
          stripeChargeId: input.paymentIntentId,
          updatedAt: new Date(),
        })
        .where(eq(donations.id, input.donationId))
        .returning();

      // Award badge if applicable
      const amount = parseFloat(donation[0].amount);
      let badgeType = null;
      if (amount >= 100) badgeType = "donation_100";
      if (amount >= 500) badgeType = "donation_500";
      if (amount >= 1000) badgeType = "donation_1000";

      if (badgeType) {
        await ctx.db.insert(userBadges)
          .values({
            userId: ctx.user.id,
            badgeType: badgeType as any,
            liveSessionId: donation[0].liveSessionId,
            earnedAt: new Date(),
          })
          .onConflictDoNothing();
      }

      // Create notification
      await ctx.db.insert(notifications).values({
        liveSessionId: donation[0].liveSessionId,
        userId: ctx.user.id,
        notificationType: "donation",
        title: "Donation Received",
        message: `${ctx.user.name || "Anonymous"} donated $${amount}!`,
        metadata: { donationId: input.donationId },
      });

      return updated[0];
    }),

  history: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.select()
        .from(donations)
        .where(
          and(
            eq(donations.userId, ctx.user.id),
            eq(donations.status, "completed")
          )
        )
        .orderBy(desc(donations.createdAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  sessionTop: publicProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.select({
          userId: donations.userId,
          userName: users.displayName,
          avatar: users.avatarUrl,
          total: sql`CAST(SUM(amount) AS NUMERIC)`.as("total"),
          count: sql`COUNT(*)`.as("count"),
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .where(
          and(
            eq(donations.liveSessionId, input.liveSessionId),
            eq(donations.status, "completed")
          )
        )
        .groupBy(donations.userId, users.id)
        .orderBy(sql`CAST(SUM(amount) AS NUMERIC) DESC`)
        .limit(input.limit);
    }),
});

// ==========================================
// REACTION PROCEDURES
// ==========================================
const reactionRouter = router({
  add: protectedProcedure
    .input(ReactionInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      // Check for recent same reaction from user (combo tracking)
      const recentReaction = await ctx.db.select()
        .from(reactions)
        .where(
          and(
            eq(reactions.userId, ctx.user.id),
            eq(reactions.liveSessionId, input.liveSessionId),
            eq(reactions.reactionType, input.reactionType),
            gt(
              reactions.createdAt,
              new Date(Date.now() - 5000) // Within 5 seconds
            )
          )
        )
        .orderBy(desc(reactions.createdAt))
        .limit(1);

      const comboStreak = recentReaction.length > 0 ? recentReaction[0].comboStreak + 1 : 1;

      // Trigger combo milestone notifications
      let comboMilestone = false;
      if (comboStreak === 3 || comboStreak === 5 || comboStreak === 10) {
        comboMilestone = true;
        await ctx.db.insert(notifications).values({
          liveSessionId: input.liveSessionId,
          userId: ctx.user.id,
          notificationType: "follower",
          title: "Combo Streak!",
          message: `${ctx.user.name} hit a ${comboStreak}x combo!`,
          metadata: { comboStreak, reactionType: input.reactionType },
        });
      }

      const reaction = await ctx.db.insert(reactions)
        .values({
          liveSessionId: input.liveSessionId,
          userId: ctx.user.id,
          reactionType: input.reactionType,
          comboStreak,
        })
        .returning();

      return {
        ...reaction[0],
        isComboMilestone: comboMilestone,
      };
    }),

  counts: publicProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
        timeWindowSeconds: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const cutoff = new Date(Date.now() - input.timeWindowSeconds * 1000);

      const counts = await ctx.db.select({
          reactionType: reactions.reactionType,
          count: sql`COUNT(*)`.as("count"),
        })
        .from(reactions)
        .where(
          and(
            eq(reactions.liveSessionId, input.liveSessionId),
            gt(reactions.createdAt, cutoff)
          )
        )
        .groupBy(reactions.reactionType);

      return counts;
    }),

  topCombos: publicProcedure
    .input(z.object({ liveSessionId: z.number().positive() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.select({
          userId: reactions.userId,
          userName: users.displayName,
          avatar: users.avatarUrl,
          reactionType: reactions.reactionType,
          maxCombo: sql`MAX(combo_streak)`.as("maxCombo"),
          totalReactions: sql`COUNT(*)`.as("totalReactions"),
        })
        .from(reactions)
        .leftJoin(users, eq(reactions.userId, users.id))
        .where(eq(reactions.liveSessionId, input.liveSessionId))
        .groupBy(reactions.userId, reactions.reactionType, users.id)
        .orderBy(sql`MAX(combo_streak) DESC`)
        .limit(10);
    }),
});

// ==========================================
// POLL PROCEDURES
// ==========================================
const pollRouter = router({
  create: adminProcedure
    .input(PollInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const expiresAt = new Date(Date.now() + input.durationSeconds * 1000);

      const voteCounts: Record<string, number> = {};
      input.options.forEach((_, index) => {
        voteCounts[index.toString()] = 0;
      });

      const poll = await ctx.db.insert(polls)
        .values({
          liveSessionId: input.liveSessionId,
          createdBy: ctx.user.id,
          question: input.question,
          options: input.options,
          voteCounts,
          expiresAt,
          status: "active",
        })
        .returning();

      // Notify all viewers
      await ctx.db.insert(notifications).values({
        liveSessionId: input.liveSessionId,
        notificationType: "follower",
        title: "New Poll",
        message: input.question,
        metadata: { pollId: poll[0].id },
      });

      return poll[0];
    }),

  vote: protectedProcedure
    .input(PollVoteInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      // Check if poll is still active
      const poll = await ctx.db.select()
        .from(polls)
        .where(eq(polls.id, input.pollId));

      if (!poll.length || poll[0].status !== "active") {
        throw new Error("Poll is not active");
      }

      if (input.optionIndex >= poll[0].options.length) {
        throw new Error("Invalid option index");
      }

      // Check if user already voted
      const existing = await ctx.db.select()
        .from(pollVotes)
        .where(
          and(
            eq(pollVotes.pollId, input.pollId),
            eq(pollVotes.userId, ctx.user.id)
          )
        );

      if (existing.length > 0) {
        throw new Error("You have already voted on this poll");
      }

      // Record vote
      const vote = await ctx.db.insert(pollVotes)
        .values({
          pollId: input.pollId,
          userId: ctx.user.id,
          optionIndex: input.optionIndex,
        })
        .returning();

      // Update vote counts in poll
      const voteCounts = { ...poll[0].voteCounts };
      voteCounts[input.optionIndex.toString()] =
        (voteCounts[input.optionIndex.toString()] || 0) + 1;

      await ctx.db.update(polls)
        .set({
          voteCounts,
          totalVotes: poll[0].totalVotes + 1,
          updatedAt: new Date(),
        })
        .where(eq(polls.id, input.pollId));

      return vote[0];
    }),

  getActive: publicProcedure
    .input(z.object({ liveSessionId: z.number().positive() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.select()
        .from(polls)
        .where(
          and(
            eq(polls.liveSessionId, input.liveSessionId),
            eq(polls.status, "active")
          )
        )
        .orderBy(desc(polls.createdAt))
        .limit(1);
    }),

  close: adminProcedure
    .input(z.object({ pollId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const result = await ctx.db.update(polls)
        .set({ status: "closed", closedAt: new Date(), updatedAt: new Date() })
        .where(eq(polls.id, input.pollId))
        .returning();

      return result[0];
    }),
});

// ==========================================
// LEADERBOARD PROCEDURES
// ==========================================
const leaderboardRouter = router({
  topDonors: publicProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
        period: z.enum(["24h", "7d", "alltime"]).default("alltime"),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      let timeFilter = null;
      if (input.period === "24h") {
        timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
      } else if (input.period === "7d") {
        timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      let query = ctx.db.select({
          userId: donations.userId,
          userName: users.displayName,
          avatar: users.avatarUrl,
          totalDonated: sql`CAST(SUM(amount) AS NUMERIC)`.as("totalDonated"),
          donationCount: sql`COUNT(*)`.as("donationCount"),
        })
        .from(donations)
        .leftJoin(users, eq(donations.userId, users.id))
        .where(
          and(
            eq(donations.liveSessionId, input.liveSessionId),
            eq(donations.status, "completed"),
            timeFilter ? gt(donations.createdAt, timeFilter) : undefined
          )
        )
        .groupBy(donations.userId, users.id)
        .orderBy(sql`CAST(SUM(amount) AS NUMERIC) DESC`)
        .limit(input.limit);

      return query;
    }),

  topChatters: publicProcedure
    .input(
      z.object({
        liveSessionId: z.number().positive(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.select({
          userId: chatMessages.userId,
          userName: users.displayName,
          avatar: users.avatarUrl,
          messageCount: sql`COUNT(*)`.as("messageCount"),
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.userId, users.id))
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .groupBy(chatMessages.userId, users.id)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(input.limit);
    }),

  sync: adminProcedure
    .input(z.object({ liveSessionId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      // Get all contributors
      const donors = await ctx.db.select({
          userId: donations.userId,
          total: sql`CAST(SUM(amount) AS NUMERIC)`,
        })
        .from(donations)
        .where(
          and(
            eq(donations.liveSessionId, input.liveSessionId),
            eq(donations.status, "completed")
          )
        )
        .groupBy(donations.userId);

      const chatters = await ctx.db.select({
          userId: chatMessages.userId,
          count: sql`COUNT(*)`,
        })
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.liveSessionId, input.liveSessionId),
            eq(chatMessages.isDeleted, false)
          )
        )
        .groupBy(chatMessages.userId);

      const reactioners = await ctx.db.select({
          userId: reactions.userId,
          count: sql`COUNT(*)`,
        })
        .from(reactions)
        .where(eq(reactions.liveSessionId, input.liveSessionId))
        .groupBy(reactions.userId);

      // Update leaderboards
      const allUserIds = new Set<number>();
      donors.forEach((d) => allUserIds.add(d.userId));
      chatters.forEach((c) => allUserIds.add(c.userId));
      reactioners.forEach((r) => allUserIds.add(r.userId));

      for (const userId of allUserIds) {
        const donorData = donors.find((d) => d.userId === userId);
        const chatterData = chatters.find((c) => c.userId === userId);
        const reactionerData = reactioners.find((r) => r.userId === userId);

        await ctx.db.insert(leaderboards)
          .values({
            liveSessionId: input.liveSessionId,
            userId,
            totalDonations: donorData?.total || "0",
            messageCount: parseInt(chatterData?.count as any) || 0,
            reactionCount: parseInt(reactionerData?.count as any) || 0,
          })
          .onConflictDoNothing();
      }

      return { synced: allUserIds.size };
    }),
});

// ==========================================
// STREAMER STATS PROCEDURES
// ==========================================
const statsRouter = router({
  get: publicProcedure
    .input(z.object({ streamerId: z.number().positive() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const stats = await ctx.db.select()
        .from(streamerStats)
        .where(eq(streamerStats.streamerUserId, input.streamerId));

      if (!stats.length) {
        return {
          streamerUserId: input.streamerId,
          totalViewers: 0,
          totalTips24h: "0",
          totalTipsAllTime: "0",
          totalFollowers: 0,
          totalSubscribers: 0,
          level: 1,
          experience: 0,
          badges: [],
        };
      }

      return stats[0];
    }),

  update: adminProcedure
    .input(
      z.object({
        streamerId: z.number().positive(),
        updates: z.object({
          totalViewers: z.number().optional(),
          totalFollowers: z.number().optional(),
          totalSubscribers: z.number().optional(),
          experience: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      // Calculate level from experience
      let level = 1;
      if (input.updates.experience) {
        level = Math.floor(input.updates.experience / 1000) + 1;
      }

      const result = await ctx.db.insert(streamerStats)
        .values({
          streamerUserId: input.streamerId,
          ...input.updates,
          level,
        })
        .onConflictDoUpdate({
          target: streamerStats.streamerUserId,
          set: {
            ...input.updates,
            level,
            lastUpdatedAt: new Date(),
          },
        })
        .returning();

      return result[0];
    }),
});

// ==========================================
// NOTIFICATION PROCEDURES
// ==========================================
const notificationRouter = router({
  getUnread: protectedProcedure
    .input(z.object({ liveSessionId: z.number().positive() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.select()
        .from(notifications)
        .where(
          and(
            eq(notifications.liveSessionId, input.liveSessionId),
            or(
              eq(notifications.userId, ctx.user.id),
              isNull(notifications.userId)
            ),
            eq(notifications.isRead, false)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }),

  markRead: protectedProcedure
    .input(z.object({ notificationId: z.number().positive() }))
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, input.notificationId))
        .returning();
    }),
});

// ==========================================
// SOCIAL PROCEDURES
// ==========================================
const socialRouter = router({
  getLinks: publicProcedure
    .input(z.object({ userId: z.number().positive() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const links = await ctx.db.select()
        .from(socialLinks)
        .where(eq(socialLinks.userId, input.userId));

      return links[0] || null;
    }),

  updateLinks: protectedProcedure
    .input(
      z.object({
        twitterUrl: z.string().url().optional(),
        instagramUrl: z.string().url().optional(),
        tiktokUrl: z.string().url().optional(),
        youtubeUrl: z.string().url().optional(),
        discordUrl: z.string().url().optional(),
        twitchUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return ctx.db.insert(socialLinks)
        .values({
          userId: ctx.user.id,
          ...input,
        })
        .onConflictDoUpdate({
          target: socialLinks.userId,
          set: {
            ...input,
            updatedAt: new Date(),
          },
        })
        .returning();
    }),

  raid: protectedProcedure
    .input(
      z.object({
        toStreamerId: z.number().positive(),
        viewersCount: z.number().min(1),
        message: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const raid = await ctx.db.insert(raids)
        .values({
          fromStreamerId: ctx.user.id,
          toStreamerId: input.toStreamerId,
          viewersRaided: input.viewersCount,
          message: input.message,
        })
        .returning();

      // Notify raid target
      await ctx.db.insert(notifications).values({
        liveSessionId: 0, // Will be set by app
        userId: input.toStreamerId,
        notificationType: "raid",
        title: "You got raided!",
        message: `${ctx.user.name} is raiding with ${input.viewersCount} viewers!`,
        metadata: { raidId: raid[0].id },
      });

      return raid[0];
    }),
});

// ==========================================
// EXPORT ROUTER
// ==========================================
export const liveRouter = router({
  chat: chatRouter,
  donations: donationRouter,
  reactions: reactionRouter,
  polls: pollRouter,
  leaderboard: leaderboardRouter,
  stats: statsRouter,
  notifications: notificationRouter,
  social: socialRouter,
});
