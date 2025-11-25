import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { CacheManager, CACHE_PREFIXES, CACHE_TTL } from '../_core/cache';
import axios from 'axios';

/**
 * Social Media Integration Router
 * Fetches and aggregates content from multiple social platforms
 */

// Platform API configurations
const PLATFORM_APIS = {
  instagram: {
    baseUrl: 'https://graph.instagram.com',
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN,
  },
  facebook: {
    baseUrl: 'https://graph.facebook.com/v18.0',
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
  },
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    apiKey: process.env.YOUTUBE_API_KEY,
  },
  twitter: {
    baseUrl: 'https://api.twitter.com/2',
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
  },
  tiktok: {
    baseUrl: 'https://open-api.tiktok.com',
    accessToken: process.env.TIKTOK_ACCESS_TOKEN,
  },
};

export const socialRouter = router({
  /**
   * Get aggregated social media feed
   */
  getFeed: publicProcedure
    .input(z.object({
      platform: z.enum(['instagram', 'facebook', 'twitter', 'youtube', 'tiktok']).optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const cacheKey = `${CACHE_PREFIXES.SOCIAL}feed_${input.platform || 'all'}_${input.limit}_${input.offset}`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          const posts = [];
          
          // Fetch from each platform if no specific platform is selected
          const platforms = input.platform ? [input.platform] : Object.keys(PLATFORM_APIS);
          
          for (const platform of platforms) {
            try {
              const platformPosts = await fetchPlatformPosts(platform as any, input.limit);
              posts.push(...platformPosts);
            } catch (error) {
              console.error(`Error fetching ${platform} posts:`, error);
              // Continue with other platforms even if one fails
            }
          }
          
          // Sort by creation date (newest first)
          posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
          // Apply pagination
          return posts.slice(input.offset, input.offset + input.limit);
        },
        CACHE_TTL.SHORT // Cache for 1 minute
      );
    }),

  /**
   * Get platform statistics
   */
  getStats: publicProcedure
    .query(async () => {
      const cacheKey = `${CACHE_PREFIXES.SOCIAL}stats`;
      
      return await CacheManager.getOrSet(
        cacheKey,
        async () => {
          const stats = {
            instagram: { followers: 0, posts: 0 },
            facebook: { followers: 0, likes: 0 },
            youtube: { subscribers: 0, videos: 0, views: 0 },
            twitter: { followers: 0, tweets: 0 },
            tiktok: { followers: 0, likes: 0, videos: 0 },
            total: { followers: 0, engagement: 0 },
          };
          
          // Fetch stats from each platform
          try {
            // Instagram stats
            if (PLATFORM_APIS.instagram.accessToken) {
              const igResponse = await axios.get(
                `${PLATFORM_APIS.instagram.baseUrl}/me`,
                {
                  params: {
                    fields: 'followers_count,media_count',
                    access_token: PLATFORM_APIS.instagram.accessToken,
                  },
                }
              );
              stats.instagram.followers = igResponse.data.followers_count || 0;
              stats.instagram.posts = igResponse.data.media_count || 0;
            }
          } catch (error) {
            console.error('Error fetching Instagram stats:', error);
          }
          
          // Calculate totals
          stats.total.followers = 
            stats.instagram.followers +
            stats.facebook.followers +
            stats.youtube.subscribers +
            stats.twitter.followers +
            stats.tiktok.followers;
          
          return stats;
        },
        CACHE_TTL.LONG // Cache for 1 hour
      );
    }),

  /**
   * Post to multiple platforms
   */
  createPost: publicProcedure
    .input(z.object({
      content: z.string(),
      platforms: z.array(z.enum(['instagram', 'facebook', 'twitter'])),
      mediaUrl: z.string().optional(),
      scheduledTime: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const results = [];
      
      for (const platform of input.platforms) {
        try {
          const result = await postToPlatform(platform, input.content, input.mediaUrl);
          results.push({ platform, success: true, postId: result.id });
        } catch (error) {
          console.error(`Error posting to ${platform}:`, error);
          results.push({ platform, success: false, error: (error as Error).message });
        }
      }
      
      // Invalidate feed cache after posting
      await CacheManager.deleteByPattern(`${CACHE_PREFIXES.SOCIAL}feed_*`);
      
      return results;
    }),
});

/**
 * Fetch posts from a specific platform
 */
async function fetchPlatformPosts(platform: string, limit: number) {
  const posts = [];
  
  switch (platform) {
    case 'instagram':
      if (PLATFORM_APIS.instagram.accessToken) {
        try {
          const response = await axios.get(
            `${PLATFORM_APIS.instagram.baseUrl}/me/media`,
            {
              params: {
                fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
                limit,
                access_token: PLATFORM_APIS.instagram.accessToken,
              },
            }
          );
          
          posts.push(...response.data.data.map((item: any) => ({
            id: item.id,
            platform: 'instagram',
            type: item.media_type === 'VIDEO' ? 'video' : 'post',
            content: item.caption || '',
            mediaUrl: item.media_url,
            thumbnailUrl: item.thumbnail_url,
            permalink: item.permalink,
            likes: item.like_count || 0,
            comments: item.comments_count || 0,
            createdAt: item.timestamp,
            author: {
              name: 'DJ Danny Hectic B',
              username: 'djdannyhectib',
            },
          })));
        } catch (error) {
          console.error('Instagram API error:', error);
        }
      }
      break;
      
    case 'youtube':
      if (PLATFORM_APIS.youtube.apiKey) {
        try {
          // First get channel ID
          const channelResponse = await axios.get(
            `${PLATFORM_APIS.youtube.baseUrl}/channels`,
            {
              params: {
                part: 'contentDetails',
                forUsername: 'DJDannyHecticB', // Replace with actual username
                key: PLATFORM_APIS.youtube.apiKey,
              },
            }
          );
          
          if (channelResponse.data.items && channelResponse.data.items.length > 0) {
            const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
            
            // Get videos from uploads playlist
            const videosResponse = await axios.get(
              `${PLATFORM_APIS.youtube.baseUrl}/playlistItems`,
              {
                params: {
                  part: 'snippet',
                  playlistId: uploadsPlaylistId,
                  maxResults: limit,
                  key: PLATFORM_APIS.youtube.apiKey,
                },
              }
            );
            
            posts.push(...videosResponse.data.items.map((item: any) => ({
              id: item.snippet.resourceId.videoId,
              platform: 'youtube',
              type: 'video',
              content: item.snippet.title,
              description: item.snippet.description,
              thumbnailUrl: item.snippet.thumbnails.high.url,
              permalink: `https://youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
              createdAt: item.snippet.publishedAt,
              author: {
                name: 'DJ Danny Hectic B',
                username: 'DJDannyHecticB',
              },
            })));
          }
        } catch (error) {
          console.error('YouTube API error:', error);
        }
      }
      break;
      
    case 'twitter':
      if (PLATFORM_APIS.twitter.bearerToken) {
        try {
          const response = await axios.get(
            `${PLATFORM_APIS.twitter.baseUrl}/users/by/username/djdannyhectib/tweets`,
            {
              headers: {
                'Authorization': `Bearer ${PLATFORM_APIS.twitter.bearerToken}`,
              },
              params: {
                'max_results': limit,
                'tweet.fields': 'created_at,public_metrics,attachments',
                'media.fields': 'url,preview_image_url',
              },
            }
          );
          
          if (response.data.data) {
            posts.push(...response.data.data.map((tweet: any) => ({
              id: tweet.id,
              platform: 'twitter',
              type: 'post',
              content: tweet.text,
              permalink: `https://twitter.com/djdannyhectib/status/${tweet.id}`,
              likes: tweet.public_metrics?.like_count || 0,
              comments: tweet.public_metrics?.reply_count || 0,
              shares: tweet.public_metrics?.retweet_count || 0,
              createdAt: tweet.created_at,
              author: {
                name: 'DJ Danny Hectic B',
                username: '@djdannyhectib',
              },
            })));
          }
        } catch (error) {
          console.error('Twitter API error:', error);
        }
      }
      break;
  }
  
  return posts;
}

/**
 * Post content to a specific platform
 */
async function postToPlatform(platform: string, content: string, mediaUrl?: string) {
  switch (platform) {
    case 'facebook':
      if (PLATFORM_APIS.facebook.accessToken) {
        const response = await axios.post(
          `${PLATFORM_APIS.facebook.baseUrl}/me/feed`,
          {
            message: content,
            link: mediaUrl,
            access_token: PLATFORM_APIS.facebook.accessToken,
          }
        );
        return { id: response.data.id };
      }
      break;
      
    case 'twitter':
      if (PLATFORM_APIS.twitter.bearerToken) {
        const response = await axios.post(
          `${PLATFORM_APIS.twitter.baseUrl}/tweets`,
          {
            text: content,
          },
          {
            headers: {
              'Authorization': `Bearer ${PLATFORM_APIS.twitter.bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return { id: response.data.data.id };
      }
      break;
      
    // Instagram requires Instagram Business API which is more complex
    // TikTok requires approved app with specific permissions
  }
  
  throw new Error(`Posting to ${platform} is not configured`);
}