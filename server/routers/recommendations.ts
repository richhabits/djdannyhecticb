import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import {
  getPersonalizedRecommendations,
  getDiscoverWeekly,
  getSimilarMixes,
  getTrendingMixes,
  getMoodBasedRecommendations,
  getCollaborativeRecommendations,
  trackMixPlay,
  indexMix,
  indexAllMixes,
  getUserPreferences,
} from '../_core/recommendations';
import { db } from '../db';
import { mixes } from '../../drizzle/schema';
import { inArray } from 'drizzle-orm';

export const recommendationsRouter = router({
  /**
   * Get personalized recommendations for current user
   */
  forYou: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const recommendations = await getPersonalizedRecommendations(
        ctx.user.id,
        input.limit
      );

      // Get mix details
      const mixIds = recommendations.map(r => r.mixId);
      if (mixIds.length === 0) return [];

      const mixDetails = await db.query.mixes.findMany({
        where: inArray(mixes.id, mixIds),
        with: {
          artist: true,
          genre: true,
        },
      });

      // Merge recommendations with mix details
      return recommendations.map(rec => {
        const mix = mixDetails.find(m => m.id === rec.mixId);
        return {
          ...rec,
          mix,
        };
      });
    }),

  /**
   * Get weekly discovery playlist
   */
  discoverWeekly: protectedProcedure
    .query(async ({ ctx }) => {
      const mixIds = await getDiscoverWeekly(ctx.user.id);

      const mixDetails = await db.query.mixes.findMany({
        where: inArray(mixes.id, mixIds),
        with: {
          artist: true,
          genre: true,
        },
      });

      return mixDetails;
    }),

  /**
   * Get similar mixes to a specific mix
   */
  similar: publicProcedure
    .input(z.object({
      mixId: z.number(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      const recommendations = await getSimilarMixes(input.mixId, input.limit);

      const mixIds = recommendations.map(r => r.mixId);
      if (mixIds.length === 0) return [];

      const mixDetails = await db.query.mixes.findMany({
        where: inArray(mixes.id, mixIds),
        with: {
          artist: true,
          genre: true,
        },
      });

      return recommendations.map(rec => {
        const mix = mixDetails.find(m => m.id === rec.mixId);
        return {
          ...rec,
          mix,
        };
      });
    }),

  /**
   * Get trending mixes
   */
  trending: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const recommendations = await getTrendingMixes(input.limit);

      const mixIds = recommendations.map(r => r.mixId);
      const mixDetails = await db.query.mixes.findMany({
        where: inArray(mixes.id, mixIds),
        with: {
          artist: true,
          genre: true,
        },
      });

      return recommendations.map(rec => {
        const mix = mixDetails.find(m => m.id === rec.mixId);
        return {
          ...rec,
          mix,
        };
      });
    }),

  /**
   * Get mood-based recommendations
   */
  byMood: publicProcedure
    .input(z.object({
      mood: z.enum(['energetic', 'chill', 'dark', 'uplifting', 'melancholic']),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const recommendations = await getMoodBasedRecommendations(
        input.mood,
        input.limit
      );

      const mixIds = recommendations.map(r => r.mixId);
      const mixDetails = await db.query.mixes.findMany({
        where: inArray(mixes.id, mixIds),
        with: {
          artist: true,
          genre: true,
        },
      });

      return recommendations.map(rec => {
        const mix = mixDetails.find(m => m.id === rec.mixId);
        return {
          ...rec,
          mix,
        };
      });
    }),

  /**
   * Get collaborative filtering recommendations
   */
  collaborative: publicProcedure
    .input(z.object({
      mixId: z.number(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      const recommendations = await getCollaborativeRecommendations(
        input.mixId,
        input.limit
      );

      const mixIds = recommendations.map(r => r.mixId);
      if (mixIds.length === 0) return [];

      const mixDetails = await db.query.mixes.findMany({
        where: inArray(mixes.id, mixIds),
        with: {
          artist: true,
          genre: true,
        },
      });

      return recommendations.map(rec => {
        const mix = mixDetails.find(m => m.id === rec.mixId);
        return {
          ...rec,
          mix,
        };
      });
    }),

  /**
   * Track a mix play
   */
  trackPlay: protectedProcedure
    .input(z.object({
      mixId: z.number(),
      duration: z.number(), // seconds
    }))
    .mutation(async ({ ctx, input }) => {
      await trackMixPlay(ctx.user.id, input.mixId, input.duration);
      return { success: true };
    }),

  /**
   * Get user preferences summary
   */
  preferences: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserPreferences(ctx.user.id);
    }),

  /**
   * Admin: Index a specific mix
   */
  indexMix: protectedProcedure
    .input(z.object({
      mixId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const success = await indexMix(input.mixId);
      return { success };
    }),

  /**
   * Admin: Index all mixes
   */
  indexAll: protectedProcedure
    .mutation(async () => {
      const count = await indexAllMixes();
      return { success: true, count };
    }),
});
