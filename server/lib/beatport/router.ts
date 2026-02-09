/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */

import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../../_core/trpc";
import { beatportGet } from "./client";
import { beatportCache } from "./cache";
import type {
  BeatportPaginatedResponse,
  BeatportGenre,
  BeatportSubGenre,
  BeatportChart,
  BeatportTrack,
  BeatportSearchResult,
  BeatportArtistType,
  BeatportCommercialModelType,
  BeatportHealthCheck,
} from "./types";

/**
 * tRPC router for Beatport shop endpoints
 * All endpoints are server-side only and use cached tokens
 */
export const beatportRouter = router({
  /**
   * Get all enabled genres
   */
  genres: publicProcedure
    .input(
      z.object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().max(100).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return beatportGet<BeatportPaginatedResponse<BeatportGenre>>(
        "/catalog/genres/",
        {
          enabled: true,
          page: input?.page,
          page_size: input?.pageSize,
        }
      );
    }),

  /**
   * Get all enabled sub-genres
   */
  subGenres: publicProcedure
    .input(
      z.object({
        genreId: z.number().int().positive().optional(),
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().max(100).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return beatportGet<BeatportPaginatedResponse<BeatportSubGenre>>(
        "/catalog/sub-genres/",
        {
          enabled: true,
          genre_id: input?.genreId,
          page: input?.page,
          page_size: input?.pageSize,
        }
      );
    }),

  /**
   * Get published charts
   */
  charts: publicProcedure
    .input(
      z.object({
        genreId: z.number().int().positive().optional(),
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().max(100).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return beatportGet<BeatportPaginatedResponse<BeatportChart>>(
        "/catalog/charts/",
        {
          is_published: true,
          enabled: true,
          genre_id: input?.genreId,
          page: input?.page,
          page_size: input?.pageSize,
        }
      );
    }),

  /**
   * Get tracks for a specific chart
   */
  chartTracks: publicProcedure
    .input(
      z.object({
        chartId: z.number().int().positive(),
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      return beatportGet<BeatportPaginatedResponse<BeatportTrack>>(
        `/catalog/charts/${input.chartId}/tracks/`,
        {
          page: input.page,
          page_size: input.pageSize,
        }
      );
    }),

  /**
   * Browse/filter tracks
   */
  tracks: publicProcedure
    .input(
      z.object({
        genreId: z.number().int().positive().optional(),
        subGenreId: z.number().int().positive().optional(),
        artistId: z.number().int().positive().optional(),
        labelId: z.number().int().positive().optional(),
        releaseId: z.number().int().positive().optional(),
        bpmLow: z.number().int().positive().optional(),
        bpmHigh: z.number().int().positive().optional(),
        keyId: z.number().int().positive().optional(),
        preorder: z.boolean().optional(),
        exclusive: z.boolean().optional(),
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().max(100).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return beatportGet<BeatportPaginatedResponse<BeatportTrack>>(
        "/catalog/tracks/",
        {
          genre_id: input?.genreId,
          sub_genre_id: input?.subGenreId,
          artist_id: input?.artistId,
          label_id: input?.labelId,
          release_id: input?.releaseId,
          bpm_low: input?.bpmLow,
          bpm_high: input?.bpmHigh,
          key_id: input?.keyId,
          preorder: input?.preorder,
          exclusive: input?.exclusive,
          page: input?.page,
          page_size: input?.pageSize,
        }
      );
    }),

  /**
   * Search across catalog
   */
  search: publicProcedure
    .input(
      z.object({
        q: z.string().min(1),
        type: z.enum(["tracks", "artists", "releases", "labels"]).optional(),
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      return beatportGet<BeatportSearchResult>("/catalog/search/", {
        q: input.q,
        type: input.type,
        page: input.page,
        page_size: input.pageSize,
      });
    }),

  /**
   * Get chart images (optional)
   */
  chartImages: publicProcedure
    .input(z.object({ chartId: z.number().int().positive() }))
    .query(async ({ input }) => {
      return beatportGet(`/catalog/charts/${input.chartId}/images/`);
    }),

  /**
   * Get artist types (auxiliary metadata)
   */
  artistTypes: publicProcedure.query(async () => {
    return beatportGet<BeatportPaginatedResponse<BeatportArtistType>>(
      "/auxiliary/artist-types/"
    );
  }),

  /**
   * Get commercial model types (auxiliary metadata)
   */
  commercialModelTypes: publicProcedure.query(async () => {
    return beatportGet<BeatportPaginatedResponse<BeatportCommercialModelType>>(
      "/auxiliary/commercial-model-types/"
    );
  }),

  /**
   * Health check endpoint
   */
  healthCheck: publicProcedure.query(async () => {
    return beatportGet<BeatportHealthCheck>("/health-check/", undefined, {
      useCache: false, // Don't cache health checks
    });
  }),

  /**
   * Database health check endpoint
   */
  dbHealthCheck: publicProcedure.query(async () => {
    return beatportGet<BeatportHealthCheck>("/db-health-check/", undefined, {
      useCache: false, // Don't cache health checks
    });
  }),

  /**
   * Get cache statistics (admin only)
   */
  cacheStats: adminProcedure.query(() => {
    return beatportCache.getStats();
  }),

  /**
   * Clear cache (admin only)
   */
  clearCache: adminProcedure
    .input(z.object({
      pattern: z.string().optional(),
    }).optional())
    .mutation(({ input }) => {
      if (input?.pattern) {
        const count = beatportCache.invalidatePattern(input.pattern);
        return { success: true, cleared: count };
      } else {
        beatportCache.clear();
        return { success: true, cleared: "all" };
      }
    }),

  /**
   * Reset cache statistics (admin only)
   */
  resetCacheStats: adminProcedure.mutation(() => {
    beatportCache.resetStats();
    return { success: true };
  }),
});
