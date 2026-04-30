/**
 * Platform Live Stream Detection Service
 * Checks YouTube and Twitch for live streams and updates database
 */

import axios from "axios";
import { ENV } from "./env";
import * as db from "../db";

export type PlatformLiveResult = {
  isLive: boolean;
  videoId?: string;
  streamTitle?: string;
  streamUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  viewerCount?: number;
  error?: string;
};

/**
 * Check if channel is live on YouTube
 * Uses YouTube Data API v3 to search for live videos
 */
export async function checkYouTubeLive(
  channelId: string
): Promise<PlatformLiveResult> {
  try {
    if (!ENV.youtubeDataApiKey || !channelId) {
      return {
        isLive: false,
        error: "YouTube API key or channel ID not configured",
      };
    }

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "id,snippet",
          channelId: channelId,
          eventType: "live",
          type: "video",
          key: ENV.youtubeDataApiKey,
          maxResults: 1,
        },
        timeout: 5000,
      }
    );

    const items = response.data.items || [];
    if (items.length === 0) {
      return { isLive: false };
    }

    const video = items[0];
    const videoId = video.id.videoId;
    const snippet = video.snippet;

    return {
      isLive: true,
      videoId: videoId,
      streamTitle: snippet.title,
      streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
      thumbnailUrl: snippet.thumbnails?.high?.url,
    };
  } catch (error) {
    console.error("[YouTube Live Check] Error:", error);
    return {
      isLive: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if channel is live on Twitch
 * Uses Twitch Helix API with app access token
 */
export async function checkTwitchLive(
  channelName: string
): Promise<PlatformLiveResult> {
  try {
    if (!ENV.twitchClientId || !ENV.twitchClientSecret || !channelName) {
      return {
        isLive: false,
        error: "Twitch credentials or channel name not configured",
      };
    }

    // Get app access token
    const tokenResponse = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      {
        client_id: ENV.twitchClientId,
        client_secret: ENV.twitchClientSecret,
        grant_type: "client_credentials",
      },
      { timeout: 5000 }
    );

    const accessToken = tokenResponse.data.access_token;

    // Check if channel is live
    const streamsResponse = await axios.get(
      "https://api.twitch.tv/helix/streams",
      {
        params: {
          user_login: channelName,
        },
        headers: {
          "Client-ID": ENV.twitchClientId,
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000,
      }
    );

    const streams = streamsResponse.data.data || [];
    if (streams.length === 0) {
      return { isLive: false };
    }

    const stream = streams[0];
    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

    return {
      isLive: true,
      streamTitle: stream.title,
      streamUrl: `https://www.twitch.tv/${channelName}`,
      embedUrl: `https://player.twitch.tv/?channel=${channelName}&parent=${hostname}`,
      thumbnailUrl: stream.thumbnail_url,
      viewerCount: stream.viewer_count,
    };
  } catch (error) {
    console.error("[Twitch Live Check] Error:", error);
    return {
      isLive: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check all platforms and update database
 * Called by cron job or admin refresh endpoint
 */
export async function checkAllPlatforms(): Promise<void> {
  try {
    console.log("[Platform Live Checker] Starting platform checks...");

    // YouTube check
    if (ENV.youtubeChannelId) {
      const ytResult = await checkYouTubeLive(ENV.youtubeChannelId);
      await db.setPlatformLiveStatus({
        platform: "youtube",
        isLive: ytResult.isLive,
        streamTitle: ytResult.streamTitle,
        streamUrl: ytResult.streamUrl,
        embedUrl: ytResult.embedUrl,
        thumbnailUrl: ytResult.thumbnailUrl,
        manualOverride: false,
      });
      console.log(`[Platform Live Checker] YouTube: ${ytResult.isLive ? "LIVE" : "offline"}`);
    }

    // Twitch check
    if (ENV.twitchChannelName) {
      const twResult = await checkTwitchLive(ENV.twitchChannelName);
      await db.setPlatformLiveStatus({
        platform: "twitch",
        isLive: twResult.isLive,
        streamTitle: twResult.streamTitle,
        streamUrl: twResult.streamUrl,
        embedUrl: twResult.embedUrl,
        thumbnailUrl: twResult.thumbnailUrl,
        viewerCount: twResult.viewerCount,
        manualOverride: false,
      });
      console.log(`[Platform Live Checker] Twitch: ${twResult.isLive ? "LIVE" : "offline"}`);
    }

    console.log("[Platform Live Checker] Platform checks complete");
  } catch (error) {
    console.error("[Platform Live Checker] Fatal error:", error);
  }
}

/**
 * Check a single platform immediately
 * Used for admin refresh button
 */
export async function checkSinglePlatform(
  platform: "youtube" | "twitch"
): Promise<PlatformLiveResult> {
  if (platform === "youtube" && ENV.youtubeChannelId) {
    return checkYouTubeLive(ENV.youtubeChannelId);
  } else if (platform === "twitch" && ENV.twitchChannelName) {
    return checkTwitchLive(ENV.twitchChannelName);
  } else {
    return { isLive: false, error: "Platform not configured" };
  }
}
