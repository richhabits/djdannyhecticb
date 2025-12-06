/**
 * YouTube Data API Integration
 * Documentation: https://developers.google.com/youtube/v3/docs
 */

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  publishedAt: string;
  channelTitle: string;
  viewCount: string;
  likeCount: string;
  duration: string;
}

interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  subscriberCount: string;
  videoCount: string;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  itemCount: number;
}

interface YouTubeLiveStream {
  id: string;
  title: string;
  description: string;
  scheduledStartTime?: string;
  actualStartTime?: string;
  concurrentViewers?: string;
  liveChatId?: string;
}

const API_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YouTube API key not configured");
  }
  return apiKey;
}

function getChannelId(): string {
  return process.env.YOUTUBE_CHANNEL_ID || "";
}

/**
 * Search YouTube videos
 */
export async function searchVideos(
  query: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    q: query,
    maxResults: maxResults.toString(),
    order: "relevance",
  });

  const response = await fetch(`${API_BASE}/search?${params}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YouTube API error: ${error}`);
  }

  const data = await response.json();
  const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

  // Get additional video details
  if (!videoIds) return [];

  const detailsParams = new URLSearchParams({
    key: apiKey,
    part: "snippet,contentDetails,statistics",
    id: videoIds,
  });

  const detailsResponse = await fetch(`${API_BASE}/videos?${detailsParams}`);
  const detailsData = await detailsResponse.json();

  return detailsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    duration: item.contentDetails.duration,
  }));
}

/**
 * Get channel videos
 */
export async function getChannelVideos(
  channelId?: string,
  maxResults: number = 10
): Promise<YouTubeVideo[]> {
  const apiKey = getApiKey();
  const targetChannelId = channelId || getChannelId();

  if (!targetChannelId) {
    throw new Error("Channel ID not provided");
  }

  // First, get the uploads playlist ID
  const channelParams = new URLSearchParams({
    key: apiKey,
    part: "contentDetails",
    id: targetChannelId,
  });

  const channelResponse = await fetch(`${API_BASE}/channels?${channelParams}`);
  const channelData = await channelResponse.json();

  if (!channelData.items?.length) {
    throw new Error("Channel not found");
  }

  const uploadsPlaylistId =
    channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Get videos from the uploads playlist
  const playlistParams = new URLSearchParams({
    key: apiKey,
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: maxResults.toString(),
  });

  const playlistResponse = await fetch(`${API_BASE}/playlistItems?${playlistParams}`);
  const playlistData = await playlistResponse.json();

  const videoIds = playlistData.items
    .map((item: any) => item.contentDetails.videoId)
    .join(",");

  // Get video statistics
  const statsParams = new URLSearchParams({
    key: apiKey,
    part: "snippet,contentDetails,statistics",
    id: videoIds,
  });

  const statsResponse = await fetch(`${API_BASE}/videos?${statsParams}`);
  const statsData = await statsResponse.json();

  return statsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    duration: item.contentDetails.duration,
  }));
}

/**
 * Get video by ID
 */
export async function getVideo(videoId: string): Promise<YouTubeVideo | null> {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet,contentDetails,statistics",
    id: videoId,
  });

  const response = await fetch(`${API_BASE}/videos?${params}`);
  const data = await response.json();

  if (!data.items?.length) {
    return null;
  }

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle,
    viewCount: item.statistics.viewCount,
    likeCount: item.statistics.likeCount,
    duration: item.contentDetails.duration,
  };
}

/**
 * Get channel info
 */
export async function getChannelInfo(channelId?: string): Promise<YouTubeChannel | null> {
  const apiKey = getApiKey();
  const targetChannelId = channelId || getChannelId();

  if (!targetChannelId) {
    throw new Error("Channel ID not provided");
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet,statistics",
    id: targetChannelId,
  });

  const response = await fetch(`${API_BASE}/channels?${params}`);
  const data = await response.json();

  if (!data.items?.length) {
    return null;
  }

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
    subscriberCount: item.statistics.subscriberCount,
    videoCount: item.statistics.videoCount,
  };
}

/**
 * Get channel playlists
 */
export async function getChannelPlaylists(
  channelId?: string,
  maxResults: number = 10
): Promise<YouTubePlaylist[]> {
  const apiKey = getApiKey();
  const targetChannelId = channelId || getChannelId();

  if (!targetChannelId) {
    throw new Error("Channel ID not provided");
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet,contentDetails",
    channelId: targetChannelId,
    maxResults: maxResults.toString(),
  });

  const response = await fetch(`${API_BASE}/playlists?${params}`);
  const data = await response.json();

  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnails: item.snippet.thumbnails,
    itemCount: item.contentDetails.itemCount,
  }));
}

/**
 * Get active live streams for a channel
 */
export async function getLiveStreams(channelId?: string): Promise<YouTubeLiveStream[]> {
  const apiKey = getApiKey();
  const targetChannelId = channelId || getChannelId();

  if (!targetChannelId) {
    throw new Error("Channel ID not provided");
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    channelId: targetChannelId,
    type: "video",
    eventType: "live",
  });

  const response = await fetch(`${API_BASE}/search?${params}`);
  const data = await response.json();

  if (!data.items?.length) {
    return [];
  }

  const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

  // Get live streaming details
  const detailsParams = new URLSearchParams({
    key: apiKey,
    part: "snippet,liveStreamingDetails",
    id: videoIds,
  });

  const detailsResponse = await fetch(`${API_BASE}/videos?${detailsParams}`);
  const detailsData = await detailsResponse.json();

  return detailsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    scheduledStartTime: item.liveStreamingDetails?.scheduledStartTime,
    actualStartTime: item.liveStreamingDetails?.actualStartTime,
    concurrentViewers: item.liveStreamingDetails?.concurrentViewers,
    liveChatId: item.liveStreamingDetails?.activeLiveChatId,
  }));
}

/**
 * Get upcoming live streams
 */
export async function getUpcomingStreams(channelId?: string): Promise<YouTubeLiveStream[]> {
  const apiKey = getApiKey();
  const targetChannelId = channelId || getChannelId();

  if (!targetChannelId) {
    throw new Error("Channel ID not provided");
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    channelId: targetChannelId,
    type: "video",
    eventType: "upcoming",
  });

  const response = await fetch(`${API_BASE}/search?${params}`);
  const data = await response.json();

  if (!data.items?.length) {
    return [];
  }

  const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

  const detailsParams = new URLSearchParams({
    key: apiKey,
    part: "snippet,liveStreamingDetails",
    id: videoIds,
  });

  const detailsResponse = await fetch(`${API_BASE}/videos?${detailsParams}`);
  const detailsData = await detailsResponse.json();

  return detailsData.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    scheduledStartTime: item.liveStreamingDetails?.scheduledStartTime,
  }));
}

/**
 * Parse ISO 8601 duration to seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format duration for display
 */
export function formatDuration(duration: string): string {
  const seconds = parseDuration(duration);
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default {
  searchVideos,
  getChannelVideos,
  getVideo,
  getChannelInfo,
  getChannelPlaylists,
  getLiveStreams,
  getUpcomingStreams,
  parseDuration,
  formatDuration,
};
