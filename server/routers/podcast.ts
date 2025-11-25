import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { CacheManager, CACHE_PREFIXES, CACHE_TTL, PubSub } from '../_core/cache';
import { db } from '../db';
import { podcasts } from '../../drizzle/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';

/**
 * Enterprise Podcast Management Router
 * Handles episode streaming, analytics, and real-time updates
 */

const episodeSchema = z.object({
  title: z.string(),
  description: z.string(),
  audioUrl: z.string().url(),
  duration: z.number(), // in seconds
  episodeNumber: z.number().optional(),
  season: z.number().optional(),
  imageUrl: z.string().url().optional(),
  transcript: z.string().optional(),
  chapters: z.array(z.object({
    title: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    description: z.string().optional(),
  })).optional(),
  guests: z.array(z.object({
    name: z.string(),
    bio: z.string().optional(),
    imageUrl: z.string().url().optional(),
    social: z.object({
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      website: z.string().url().optional(),
    }).optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  downloadUrl: z.string().url().optional(),
});

export const podcastRouter = router({
  /**
   * Get all podcast episodes with caching
   */
  getEpisodes: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      sortBy: z.enum(['latest', 'oldest', 'popular', 'duration']).default('latest'),
      season: z.number().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const cacheKey = `${CACHE_PREFIXES.SOCIAL}podcast_episodes_${JSON.stringify(input)}`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          let query = db.select().from(podcasts);
          
          // Apply filters
          const conditions = [];
          if (input.search) {
            conditions.push(
              sql`(${podcasts.title} LIKE ${`%${input.search}%`} OR ${podcasts.description} LIKE ${`%${input.search}%`})`
            );
          }
          
          // Apply sorting
          let orderBy;
          switch (input.sortBy) {
            case 'oldest':
              orderBy = asc(podcasts.createdAt);
              break;
            case 'popular':
              // This would require a plays/downloads column
              orderBy = desc(podcasts.createdAt); // Fallback for now
              break;
            case 'duration':
              orderBy = desc(podcasts.duration);
              break;
            case 'latest':
            default:
              orderBy = desc(podcasts.createdAt);
              break;
          }
          
          const episodes = await query
            .orderBy(orderBy)
            .limit(input.limit)
            .offset(input.offset);
          
          // Enrich with mock stats (in production, these would come from an analytics table)
          return episodes.map(ep => ({
            ...ep,
            id: ep.id.toString(),
            publishedAt: ep.createdAt.toISOString(),
            stats: {
              plays: Math.floor(Math.random() * 10000) + 1000,
              likes: Math.floor(Math.random() * 1000) + 100,
              downloads: Math.floor(Math.random() * 500) + 50,
              shares: Math.floor(Math.random() * 200) + 20,
            },
            chapters: [
              {
                title: "Introduction",
                startTime: 0,
                endTime: 180,
                description: "Welcome and overview"
              },
              {
                title: "Main Discussion",
                startTime: 180,
                endTime: ep.duration ? ep.duration - 300 : 1800,
                description: "Deep dive into the topic"
              },
              {
                title: "Closing Thoughts",
                startTime: ep.duration ? ep.duration - 300 : 1800,
                endTime: ep.duration || 2100,
                description: "Wrap up and next episode preview"
              }
            ],
            guests: [],
            tags: ['House', 'Garage', 'DJ', 'Music'],
          }));
        },
        CACHE_TTL.LONG
      );
    }),

  /**
   * Get a single episode by ID
   */
  getEpisode: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const cacheKey = `${CACHE_PREFIXES.SOCIAL}podcast_episode_${input.id}`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          const [episode] = await db
            .select()
            .from(podcasts)
            .where(eq(podcasts.id, parseInt(input.id)))
            .limit(1);
          
          if (!episode) {
            throw new Error('Episode not found');
          }
          
          return {
            ...episode,
            id: episode.id.toString(),
            publishedAt: episode.createdAt.toISOString(),
            stats: {
              plays: Math.floor(Math.random() * 10000) + 1000,
              likes: Math.floor(Math.random() * 1000) + 100,
              downloads: Math.floor(Math.random() * 500) + 50,
              shares: Math.floor(Math.random() * 200) + 20,
            },
          };
        },
        CACHE_TTL.LONG
      );
    }),

  /**
   * Track episode play
   */
  trackPlay: publicProcedure
    .input(z.object({
      episodeId: z.string(),
      timestamp: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Log play event to analytics
        await db.execute(sql`
          INSERT INTO podcast_analytics (
            episodeId,
            userId,
            event,
            timestamp,
            metadata
          ) VALUES (
            ${input.episodeId},
            ${ctx.user?.id || null},
            'play',
            NOW(),
            JSON_OBJECT('timestamp', ${input.timestamp || ''})
          )
        `);
        
        // Increment play count (cached)
        await CacheManager.increment(`podcast_plays_${input.episodeId}`);
        
        // Publish real-time update
        PubSub.publish('podcast:analytics', {
          type: 'play',
          episodeId: input.episodeId,
          userId: ctx.user?.id,
          timestamp: new Date().toISOString(),
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking play:', error);
        return { success: false };
      }
    }),

  /**
   * Track playback progress
   */
  trackProgress: publicProcedure
    .input(z.object({
      episodeId: z.string(),
      progress: z.number().min(0).max(100), // percentage
      currentTime: z.number().optional(), // in seconds
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (ctx.user) {
          // Save user's playback position
          await db.execute(sql`
            INSERT INTO user_podcast_progress (
              userId,
              episodeId,
              progress,
              currentTime,
              updatedAt
            ) VALUES (
              ${ctx.user.id},
              ${input.episodeId},
              ${input.progress},
              ${input.currentTime || 0},
              NOW()
            ) ON DUPLICATE KEY UPDATE
              progress = VALUES(progress),
              currentTime = VALUES(currentTime),
              updatedAt = VALUES(updatedAt)
          `);
        }
        
        // Track completion if progress >= 90%
        if (input.progress >= 90) {
          await db.execute(sql`
            INSERT INTO podcast_analytics (
              episodeId,
              userId,
              event,
              timestamp
            ) VALUES (
              ${input.episodeId},
              ${ctx.user?.id || null},
              'complete',
              NOW()
            )
          `);
        }
        
        return { success: true };
      } catch (error) {
        console.error('Error tracking progress:', error);
        return { success: false };
      }
    }),

  /**
   * Get user's playback history
   */
  getPlaybackHistory: protectedProcedure
    .query(async ({ ctx }) => {
      const cacheKey = `${CACHE_PREFIXES.USER}podcast_history_${ctx.user!.id}`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          const history = await db.execute(sql`
            SELECT 
              p.*,
              upp.progress,
              upp.currentTime,
              upp.updatedAt as lastPlayedAt
            FROM user_podcast_progress upp
            JOIN podcasts p ON upp.episodeId = p.id
            WHERE upp.userId = ${ctx.user!.id}
            ORDER BY upp.updatedAt DESC
            LIMIT 20
          `);
          
          return history.rows;
        },
        CACHE_TTL.SHORT
      );
    }),

  /**
   * Subscribe to real-time episode updates
   */
  subscribeToUpdates: publicProcedure
    .mutation(async ({ ctx }) => {
      // Subscribe to podcast channel for real-time updates
      PubSub.subscribe('podcast:new', (data) => {
        // This would send updates to the client via WebSocket
        console.log('New podcast episode:', data);
      });
      
      PubSub.subscribe('podcast:analytics', (data) => {
        // This would update analytics in real-time
        console.log('Podcast analytics update:', data);
      });
      
      return { subscribed: true };
    }),

  /**
   * Create a new episode (admin only)
   */
  createEpisode: protectedProcedure
    .input(episodeSchema)
    .mutation(async ({ input, ctx }) => {
      // Check admin permission
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      
      const [episode] = await db.insert(podcasts).values({
        title: input.title,
        description: input.description,
        episodeNumber: input.episodeNumber,
        audioUrl: input.audioUrl,
        coverImageUrl: input.imageUrl,
        duration: input.duration,
        spotifyUrl: input.downloadUrl,
        // Store additional data as JSON
        // chapters: JSON.stringify(input.chapters),
        // guests: JSON.stringify(input.guests),
        // tags: JSON.stringify(input.tags),
      });
      
      // Invalidate cache
      await CacheManager.deleteByPattern(`${CACHE_PREFIXES.SOCIAL}podcast_*`);
      
      // Publish new episode notification
      PubSub.publish('podcast:new', {
        episodeId: (episode as any).insertId,
        title: input.title,
        publishedAt: new Date().toISOString(),
      });
      
      return { success: true, episodeId: (episode as any).insertId };
    }),

  /**
   * Update episode (admin only)
   */
  updateEpisode: protectedProcedure
    .input(z.object({
      id: z.string(),
      ...episodeSchema.shape,
    }))
    .mutation(async ({ input, ctx }) => {
      // Check admin permission
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      
      const { id, ...updateData } = input;
      
      await db
        .update(podcasts)
        .set({
          title: updateData.title,
          description: updateData.description,
          episodeNumber: updateData.episodeNumber,
          audioUrl: updateData.audioUrl,
          coverImageUrl: updateData.imageUrl,
          duration: updateData.duration,
          spotifyUrl: updateData.downloadUrl,
          updatedAt: new Date(),
        })
        .where(eq(podcasts.id, parseInt(id)));
      
      // Invalidate cache
      await CacheManager.delete(`${CACHE_PREFIXES.SOCIAL}podcast_episode_${id}`);
      await CacheManager.deleteByPattern(`${CACHE_PREFIXES.SOCIAL}podcast_episodes_*`);
      
      return { success: true };
    }),

  /**
   * Delete episode (admin only)
   */
  deleteEpisode: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check admin permission
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      
      await db.delete(podcasts).where(eq(podcasts.id, parseInt(input.id)));
      
      // Invalidate cache
      await CacheManager.delete(`${CACHE_PREFIXES.SOCIAL}podcast_episode_${input.id}`);
      await CacheManager.deleteByPattern(`${CACHE_PREFIXES.SOCIAL}podcast_episodes_*`);
      
      return { success: true };
    }),

  /**
   * Get episode analytics
   */
  getAnalytics: protectedProcedure
    .input(z.object({
      episodeId: z.string().optional(),
      dateRange: z.object({
        start: z.string(),
        end: z.string(),
      }).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Check admin permission
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      
      const cacheKey = `${CACHE_PREFIXES.ANALYTICS}podcast_${JSON.stringify(input)}`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          // Get analytics data
          let analyticsQuery = `
            SELECT 
              episodeId,
              COUNT(CASE WHEN event = 'play' THEN 1 END) as plays,
              COUNT(CASE WHEN event = 'complete' THEN 1 END) as completions,
              COUNT(DISTINCT userId) as uniqueListeners,
              AVG(CASE WHEN event = 'progress' THEN JSON_EXTRACT(metadata, '$.progress') END) as avgProgress
            FROM podcast_analytics
            WHERE 1=1
          `;
          
          const params = [];
          
          if (input.episodeId) {
            analyticsQuery += ` AND episodeId = ?`;
            params.push(input.episodeId);
          }
          
          if (input.dateRange) {
            analyticsQuery += ` AND timestamp BETWEEN ? AND ?`;
            params.push(input.dateRange.start, input.dateRange.end);
          }
          
          analyticsQuery += ` GROUP BY episodeId`;
          
          const analytics = await db.execute(sql.raw(analyticsQuery, params));
          
          return {
            episodes: analytics.rows || [],
            summary: {
              totalPlays: analytics.rows?.reduce((sum: number, row: any) => sum + row.plays, 0) || 0,
              totalCompletions: analytics.rows?.reduce((sum: number, row: any) => sum + row.completions, 0) || 0,
              avgCompletionRate: analytics.rows?.length 
                ? (analytics.rows.reduce((sum: number, row: any) => sum + (row.completions / row.plays * 100), 0) / analytics.rows.length)
                : 0,
            },
          };
        },
        CACHE_TTL.MEDIUM
      );
    }),
});