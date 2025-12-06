/**
 * YouTube API Integration
 * Fetches videos, playlists, and channel data from YouTube
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount?: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  videos: YouTubeVideo[];
}

/**
 * Search for videos on YouTube
 */
export async function searchYouTubeVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[YouTube] YOUTUBE_API_KEY not configured");
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("YouTube API error");
    }

    const data = await response.json();
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: "", // Would need separate API call for duration
      viewCount: "", // Would need separate API call for view count
    }));
  } catch (error) {
    console.error("[YouTube] Search failed:", error);
    return [];
  }
}

/**
 * Get video details
 */
export async function getYouTubeVideo(videoId: string): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[YouTube] YOUTUBE_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("YouTube API error");
    }

    const data = await response.json();
    if (data.items.length === 0) return null;

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails.duration,
      viewCount: item.statistics.viewCount,
      likeCount: item.statistics.likeCount,
    };
  } catch (error) {
    console.error("[YouTube] Get video failed:", error);
    return null;
  }
}

/**
 * Get playlist videos
 */
export async function getYouTubePlaylist(playlistId: string): Promise<YouTubePlaylist | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn("[YouTube] YOUTUBE_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("YouTube API error");
    }

    const data = await response.json();
    if (data.items.length === 0) return null;

    const playlist = data.items[0];

    // Get playlist items
    const itemsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${apiKey}`
    );

    const itemsData = await itemsResponse.json();
    const videos = itemsData.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: "",
      viewCount: "",
    }));

    return {
      id: playlistId,
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      thumbnail: playlist.snippet.thumbnails.medium.url,
      itemCount: itemsData.pageInfo.totalResults,
      videos,
    };
  } catch (error) {
    console.error("[YouTube] Get playlist failed:", error);
    return null;
  }
}
