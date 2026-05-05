/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { userProfiles, follows, reputationScores, reputationBadges, donations, chatMessages, clipComments } from "../../drizzle/engagement-schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const profileUpdateSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  pronouns: z.string().max(50).optional(),
  location: z.string().max(255).optional(),
});

export const profileRouter = router({
  // Get a user's profile
  getProfile: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [profile] = await ctx.db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, input.userId))
        .limit(1);

      if (!profile) {
        // Return minimal profile if doesn't exist
        return {
          userId: input.userId,
          bio: null,
          avatarUrl: null,
          bannerUrl: null,
          pronouns: null,
          location: null,
          verified: false,
          verificationBadge: null,
        };
      }

      return profile;
    }),

  // Get user's follower count
  getFollowerCount: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const followerCount = await ctx.db
        .select()
        .from(follows)
        .where(eq(follows.followingId, input.userId));

      return { count: followerCount.length };
    }),

  // Get user's following count
  getFollowingCount: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const followingCount = await db
        .select()
        .from(follows)
        .where(eq(follows.followerId, input.userId));

      return { count: followingCount.length };
    }),

  // Get user's followers
  getFollowers: publicProcedure
    .input(z.object({
      userId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const followers = await db
        .select()
        .from(follows)
        .where(eq(follows.followingId, input.userId))
        .limit(input.limit)
        .offset(input.offset);

      return followers;
    }),

  // Get user's following list
  getFollowing: publicProcedure
    .input(z.object({
      userId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const following = await db
        .select()
        .from(follows)
        .where(eq(follows.followerId, input.userId))
        .limit(input.limit)
        .offset(input.offset);

      return following;
    }),

  // Get profile stats (clips, followers, donations)
  getProfileStats: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get reputation score
      const [reputation] = await db
        .select()
        .from(reputationScores)
        .where(eq(reputationScores.userId, input.userId))
        .limit(1);

      // Get follower count
      const followersList = await db
        .select()
        .from(follows)
        .where(eq(follows.followingId, input.userId));

      // Get badges
      const badges = await db
        .select()
        .from(reputationBadges)
        .where(eq(reputationBadges.userId, input.userId));

      // Get donations received
      const donationsList = await db
        .select()
        .from(donations)
        .where(eq(donations.userId, input.userId));

      return {
        reputation: reputation?.score || 0,
        trustLevel: reputation?.trustLevel || "new",
        followerCount: followersList.length,
        badges: badges.map(b => b.badgeType),
        totalDonationsReceived: donationsList.reduce((sum, d) => sum + parseFloat(d.amount), 0),
        messagesCount: reputation?.messagesCount || 0,
        clipsCount: reputation?.clipsCount || 0,
      };
    }),

  // Update own profile
  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Check if profile exists
      const [existing] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (existing) {
        // Update existing profile
        await db
          .update(userProfiles)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, userId));
      } else {
        // Create new profile
        await db.insert(userProfiles).values({
          userId,
          ...input,
          verified: false,
        });
      }

      // Return updated profile
      const [updated] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      return updated;
    }),

  // Check if current user follows someone
  isFollowing: protectedProcedure
    .input(z.object({ targetUserId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const [follow] = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.followerId, userId),
            eq(follows.followingId, input.targetUserId)
          )
        )
        .limit(1);

      return { isFollowing: !!follow };
    }),

  // Follow a user
  followUser: protectedProcedure
    .input(z.object({ targetUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (userId === input.targetUserId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot follow yourself" });
      }

      try {
        await db.insert(follows).values({
          followerId: userId,
          followingId: input.targetUserId,
        });
      } catch (error) {
        // Already following
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already following this user" });
      }

      return { success: true };
    }),

  // Unfollow a user
  unfollowUser: protectedProcedure
    .input(z.object({ targetUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const userId = ctx.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, userId),
            eq(follows.followingId, input.targetUserId)
          )
        );

      return { success: true };
    }),

  // Get trending users
  getTrendingUsers: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get top users by reputation score
      const topUsers = await db
        .select()
        .from(reputationScores)
        .orderBy(desc(reputationScores.score))
        .limit(input.limit);

      return topUsers;
    }),

  // Admin: Verify user
  verifyUser: adminProcedure
    .input(z.object({
      userId: z.number(),
      badge: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, input.userId))
        .limit(1);

      if (existing) {
        await db
          .update(userProfiles)
          .set({
            verified: true,
            verificationBadge: input.badge,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, input.userId));
      } else {
        await db.insert(userProfiles).values({
          userId: input.userId,
          verified: true,
          verificationBadge: input.badge,
        });
      }

      return { success: true };
    }),
});
