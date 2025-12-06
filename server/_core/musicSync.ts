import {
  InsertSpotifyEpisode,
  InsertSpotifyPlaylist,
  InsertYouTubeVideo,
} from "../../drizzle/schema";
import {
  replaceSpotifyEpisodes,
  replaceSpotifyPlaylists,
  replaceYouTubeVideos,
} from "../db";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

export async function syncSpotifyContent() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const playlistIds = (process.env.SPOTIFY_PLAYLIST_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const showId = process.env.SPOTIFY_SHOW_ID?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.");
  }

  if (playlistIds.length === 0 && !showId) {
    throw new Error("Set SPOTIFY_PLAYLIST_IDS (comma separated) and/or SPOTIFY_SHOW_ID to sync Spotify content.");
  }

  const accessToken = await getSpotifyAccessToken(clientId, clientSecret);

  const [playlists, episodes] = await Promise.all([
    playlistIds.length ? fetchSpotifyPlaylists(accessToken, playlistIds) : [],
    showId ? fetchSpotifyEpisodes(accessToken, showId) : [],
  ]);

  await replaceSpotifyPlaylists(playlists);
  await replaceSpotifyEpisodes(episodes);

  return {
    playlistsSynced: playlists.length,
    episodesSynced: episodes.length,
  };
}

export async function syncYouTubeContent() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    throw new Error("Missing YouTube credentials. Set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID.");
  }

  const videos = await fetchYouTubeVideos(apiKey, channelId);
  await replaceYouTubeVideos(videos);

  return {
    videosSynced: videos.length,
  };
}

async function getSpotifyAccessToken(clientId: string, clientSecret: string) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify auth failed: ${errorText}`);
  }

  const json = (await response.json()) as { access_token: string };
  return json.access_token;
}

async function fetchSpotifyPlaylists(accessToken: string, playlistIds: string[]): Promise<InsertSpotifyPlaylist[]> {
  const requests = playlistIds.map((playlistId) =>
    fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Spotify playlist fetch failed: ${errorText}`);
        }
        return response.json();
      })
      .then((data: any) => ({
        spotifyId: data.id,
        name: data.name,
        description: data.description,
        url: data.external_urls?.spotify ?? "",
        imageUrl: data.images?.[0]?.url ?? null,
        followers: data.followers?.total ?? null,
        tracksCount: data.tracks?.total ?? null,
        lastSyncedAt: new Date(),
      }))
  );

  return Promise.all(requests);
}

async function fetchSpotifyEpisodes(accessToken: string, showId: string): Promise<InsertSpotifyEpisode[]> {
  const response = await fetch(`${SPOTIFY_API_BASE}/shows/${showId}/episodes?limit=20`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify episodes fetch failed: ${errorText}`);
  }

  const json = (await response.json()) as { items: any[] };
  return json.items.map((episode) => ({
    spotifyId: episode.id,
    title: episode.name,
    description: episode.description,
    url: episode.external_urls?.spotify ?? "",
    audioUrl: episode.audio_preview_url,
    imageUrl: episode.images?.[0]?.url ?? null,
    durationMs: episode.duration_ms ?? null,
    releaseDate: episode.release_date ? new Date(episode.release_date) : new Date(),
    plays: episode.play_count ?? null,
    lastSyncedAt: new Date(),
  }));
}

async function fetchYouTubeVideos(apiKey: string, channelId: string): Promise<InsertYouTubeVideo[]> {
  const searchParams = new URLSearchParams({
    key: apiKey,
    channelId,
    part: "snippet",
    order: "date",
    type: "video",
    maxResults: "6",
  });

  const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`);
  if (!searchResponse.ok) {
    const errorText = await searchResponse.text();
    throw new Error(`YouTube search failed: ${errorText}`);
  }

  const searchJson = (await searchResponse.json()) as { items: Array<{ id: { videoId: string } }> };
  const videoIds = searchJson.items.map((item) => item.id.videoId).filter(Boolean);
  if (videoIds.length === 0) {
    return [];
  }

  const videosResponse = await fetch(
    `${YOUTUBE_VIDEOS_URL}?` +
      new URLSearchParams({
        key: apiKey,
        id: videoIds.join(","),
        part: "snippet,statistics",
        maxResults: "6",
      })
  );

  if (!videosResponse.ok) {
    const errorText = await videosResponse.text();
    throw new Error(`YouTube videos fetch failed: ${errorText}`);
  }

  const videosJson = (await videosResponse.json()) as {
    items: Array<{
      id: string;
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails?: Record<string, { url: string }>;
      };
      statistics?: { viewCount?: string; likeCount?: string };
    }>;
  };

  return videosJson.items.map((video) => ({
    youtubeId: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnailUrl: video.snippet.thumbnails?.high?.url ?? video.snippet.thumbnails?.default?.url ?? null,
    publishedAt: video.snippet.publishedAt ? new Date(video.snippet.publishedAt) : new Date(),
    viewCount: video.statistics?.viewCount ? Number(video.statistics.viewCount) : null,
    likeCount: video.statistics?.likeCount ? Number(video.statistics.likeCount) : null,
    lastSyncedAt: new Date(),
  }));
}
