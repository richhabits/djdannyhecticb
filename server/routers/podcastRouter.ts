/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Podcast Router - Episode management and multi-platform distribution
 */

import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, and, gte, isNull } from "drizzle-orm";
import {
  podcastEpisodes,
  podcastDistributions,
  podcastStats,
  InsertPodcastEpisode,
  InsertPodcastDistribution,
  InsertPodcastStat,
} from "../../drizzle/content-schema";
import { nanoid } from "nanoid";

// ==========================================
// INPUT VALIDATORS
// ==========================================
const CreatePodcastInput = z.object({
  sessionId: z.number().positive(),
  title: z.string().min(3).max(255),
  description: z.string().max(1000),
});

const UpdatePodcastInput = z.object({
  episodeId: z.string(),
  title: z.string().min(3).max(255).optional(),
  description: z.string().max(1000).optional(),
  transcript: z.string().optional(),
});

const PublishPodcastInput = z.object({
  episodeId: z.string(),
  platforms: z.array(
    z.enum(["spotify", "apple_podcasts", "youtube_music", "amazon_music", "rss"])
  ),
});

const GetEpisodesInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// ==========================================
// PODCAST PROCEDURES
// ==========================================
const podcastRouter = router({
  // Create podcast episode from session
  create: adminProcedure
    .input(CreatePodcastInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const episodeId = nanoid();
      const now = new Date();

      const episode: InsertPodcastEpisode = {
        id: episodeId,
        sessionId: input.sessionId,
        title: input.title,
        description: input.description,
        audioUrl: null,
        transcript: null,
        duration: null,
        episodeNumber: null,
        status: "draft",
        publishedAt: null,
        createdAt: now,
        updatedAt: now,
      };

      await ctx.db.insert(podcastEpisodes).values(episode);

      // Create stats entry
      const stats: InsertPodcastStat = {
        episodeId,
        downloads: 0,
        plays: 0,
        completionRate: null,
        reviews: 0,
        rating: null,
        updatedAt: now,
      };

      await ctx.db.insert(podcastStats).values(stats);

      return { id: episodeId };
    }),

  // Update episode details
  update: adminProcedure
    .input(UpdatePodcastInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.title) updates.title = input.title;
      if (input.description) updates.description = input.description;
      if (input.transcript) updates.transcript = input.transcript;

      await ctx.db.update(podcastEpisodes)
        .set(updates)
        .where(eq(podcastEpisodes.id, input.episodeId));

      return { success: true };
    }),

  // Get all episodes
  list: publicProcedure
    .input(GetEpisodesInput)
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const conditions = [];

      // Only show published episodes to public
      conditions.push(eq(podcastEpisodes.status, "published"));

      if (input.status) {
        conditions[0] = eq(podcastEpisodes.status, input.status);
      }

      return await ctx.db.select()
        .from(podcastEpisodes)
        .where(and(...conditions))
        .orderBy(desc(podcastEpisodes.publishedAt))
        .limit(input.limit)
        .offset(input.offset);
    }),

  // Get episode by ID with stats
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const episode = await ctx.db.query.podcastEpisodes.findFirst({
        where: eq(podcastEpisodes.id, input.id),
      });

      if (!episode) return null;

      const stats = await ctx.db.query.podcastStats.findFirst({
        where: eq(podcastStats.episodeId, input.id),
      });

      return {
        ...episode,
        stats,
      };
    }),

  // Get distributions for episode
  distributions: adminProcedure
    .input(z.object({ episodeId: z.string() }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return await ctx.db.select()
        .from(podcastDistributions)
        .where(eq(podcastDistributions.episodeId, input.episodeId))
        .orderBy(desc(podcastDistributions.createdAt));
    }),

  // Publish to platforms
  publish: adminProcedure
    .input(PublishPodcastInput)
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const episode = await ctx.db.query.podcastEpisodes.findFirst({
        where: eq(podcastEpisodes.id, input.episodeId),
      });

      if (!episode) throw new Error("Episode not found");
      if (!episode.audioUrl) throw new Error("Episode missing audio URL");

      // Mark episode as published
      await ctx.db.update(podcastEpisodes)
        .set({
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(podcastEpisodes.id, input.episodeId));

      // Create distribution records for each platform
      const distributions: InsertPodcastDistribution[] = input.platforms.map(
        (platform) => ({
          episodeId: input.episodeId,
          platform: platform as any,
          platformId: null,
          status: "pending" as const,
          url: null,
          submittedAt: new Date(),
          approvedAt: null,
        })
      );

      await ctx.db.insert(podcastDistributions).values(distributions);

      // TODO: Queue actual platform submissions
      // Each platform (Spotify, Apple, etc) has different submission requirements

      return { success: true, platforms: input.platforms };
    }),

  // Get latest episodes (RSS feed compatible)
  latest: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      return await ctx.db.select()
        .from(podcastEpisodes)
        .where(eq(podcastEpisodes.status, "published"))
        .orderBy(desc(podcastEpisodes.publishedAt))
        .limit(input.limit);
    }),

  // Update distribution status
  updateDistribution: adminProcedure
    .input(
      z.object({
        distributionId: z.number(),
        status: z.enum(["pending", "submitted", "approved", "rejected", "removed"]),
        platformId: z.string().optional(),
        url: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const updates: Record<string, unknown> = {
        status: input.status,
      };

      if (input.platformId) updates.platformId = input.platformId;
      if (input.url) updates.url = input.url;

      if (input.status === "approved") {
        updates.approvedAt = new Date();
      }

      await ctx.db.update(podcastDistributions)
        .set(updates)
        .where(eq(podcastDistributions.id, input.distributionId));

      return { success: true };
    }),

  // Update episode stats (called by analytics/background jobs)
  updateStats: adminProcedure
    .input(
      z.object({
        episodeId: z.string(),
        downloads: z.number().optional(),
        plays: z.number().optional(),
        completionRate: z.number().min(0).max(100).optional(),
        reviews: z.number().optional(),
        rating: z.number().min(0).max(5).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      const updates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.downloads !== undefined) updates.downloads = input.downloads;
      if (input.plays !== undefined) updates.plays = input.plays;
      if (input.completionRate !== undefined)
        updates.completionRate = input.completionRate;
      if (input.reviews !== undefined) updates.reviews = input.reviews;
      if (input.rating !== undefined) updates.rating = input.rating;

      await ctx.db.update(podcastStats)
        .set(updates)
        .where(eq(podcastStats.episodeId, input.episodeId));

      return { success: true };
    }),

  // Archive episode
  archive: adminProcedure
    .input(z.object({ episodeId: z.string() }))
    .mutation(async ({ input, ctx }) => {      if (!ctx.db) throw new Error("Database not available");

      await ctx.db.update(podcastEpisodes)
        .set({
          status: "archived",
          updatedAt: new Date(),
        })
        .where(eq(podcastEpisodes.id, input.episodeId));

      return { success: true };
    }),
});

export { podcastRouter };
