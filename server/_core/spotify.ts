/**
 * Spotify API Integration
 * Documentation: https://developer.spotify.com/documentation/web-api
 */

interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  popularity: number;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  external_urls: { spotify: string };
  owner: { display_name: string };
}

interface SpotifySearchResult {
  tracks: { items: SpotifyTrack[]; total: number };
  playlists: { items: SpotifyPlaylist[]; total: number };
}

// Token storage (in-memory for now, should use database in production)
let cachedTokens: SpotifyTokens | null = null;

function getConfig(): SpotifyConfig {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured");
  }

  return {
    clientId,
    clientSecret,
    redirectUri: redirectUri || "http://localhost:3000/callback/spotify",
  };
}

/**
 * Get OAuth authorization URL for Spotify login
 */
export function getSpotifyAuthUrl(scopes: string[] = []): string {
  const config = getConfig();
  const defaultScopes = [
    "user-read-private",
    "user-read-email",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-recently-played",
    "playlist-read-private",
    "playlist-read-collaborative",
  ];

  const allScopes = [...new Set([...defaultScopes, ...scopes])];
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    scope: allScopes.join(" "),
    show_dialog: "true",
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeSpotifyCode(code: string): Promise<SpotifyTokens> {
  const config = getConfig();

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: config.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange Spotify code: ${error}`);
  }

  const data = await response.json();
  
  const tokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  cachedTokens = tokens;
  return tokens;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokens> {
  const config = getConfig();

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Spotify token");
  }

  const data = await response.json();
  
  const tokens: SpotifyTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  cachedTokens = tokens;
  return tokens;
}

/**
 * Get valid access token, refreshing if needed
 */
async function getValidToken(): Promise<string> {
  if (!cachedTokens) {
    throw new Error("No Spotify tokens available. Please authenticate first.");
  }

  if (Date.now() >= cachedTokens.expiresAt - 60000) {
    // Token expires in less than a minute, refresh it
    await refreshSpotifyToken(cachedTokens.refreshToken);
  }

  return cachedTokens.accessToken;
}

/**
 * Make authenticated request to Spotify API
 */
async function spotifyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getValidToken();

  const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify API error: ${error}`);
  }

  return response.json();
}

/**
 * Search for tracks, playlists, etc.
 */
export async function searchSpotify(
  query: string,
  types: ("track" | "playlist" | "artist" | "album")[] = ["track", "playlist"],
  limit: number = 20
): Promise<SpotifySearchResult> {
  const params = new URLSearchParams({
    q: query,
    type: types.join(","),
    limit: limit.toString(),
  });

  return spotifyFetch(`/search?${params.toString()}`);
}

/**
 * Get user's recently played tracks
 */
export async function getRecentlyPlayed(limit: number = 20): Promise<{ items: { track: SpotifyTrack; played_at: string }[] }> {
  return spotifyFetch(`/me/player/recently-played?limit=${limit}`);
}

/**
 * Get user's playlists
 */
export async function getUserPlaylists(limit: number = 50): Promise<{ items: SpotifyPlaylist[]; total: number }> {
  return spotifyFetch(`/me/playlists?limit=${limit}`);
}

/**
 * Get playlist tracks
 */
export async function getPlaylistTracks(
  playlistId: string,
  limit: number = 100
): Promise<{ items: { track: SpotifyTrack }[]; total: number }> {
  return spotifyFetch(`/playlists/${playlistId}/tracks?limit=${limit}`);
}

/**
 * Get track by ID
 */
export async function getTrack(trackId: string): Promise<SpotifyTrack> {
  return spotifyFetch(`/tracks/${trackId}`);
}

/**
 * Get current playback state
 */
export async function getCurrentPlayback(): Promise<{
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
  device: { name: string; type: string };
} | null> {
  try {
    return await spotifyFetch("/me/player");
  } catch {
    return null;
  }
}

/**
 * Start/resume playback
 */
export async function play(deviceId?: string, uris?: string[]): Promise<void> {
  await spotifyFetch("/me/player/play" + (deviceId ? `?device_id=${deviceId}` : ""), {
    method: "PUT",
    body: uris ? JSON.stringify({ uris }) : undefined,
  });
}

/**
 * Pause playback
 */
export async function pause(deviceId?: string): Promise<void> {
  await spotifyFetch("/me/player/pause" + (deviceId ? `?device_id=${deviceId}` : ""), {
    method: "PUT",
  });
}

/**
 * Skip to next track
 */
export async function skipToNext(deviceId?: string): Promise<void> {
  await spotifyFetch("/me/player/next" + (deviceId ? `?device_id=${deviceId}` : ""), {
    method: "POST",
  });
}

/**
 * Skip to previous track
 */
export async function skipToPrevious(deviceId?: string): Promise<void> {
  await spotifyFetch("/me/player/previous" + (deviceId ? `?device_id=${deviceId}` : ""), {
    method: "POST",
  });
}

/**
 * Get DJ Danny's featured playlists (public API, no auth needed)
 */
export async function getFeaturedPlaylists(): Promise<SpotifyPlaylist[]> {
  // This uses client credentials flow for public data
  const config = getConfig();

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Failed to get Spotify client token");
  }

  const { access_token } = await tokenResponse.json();

  // Search for DJ-related playlists or use a specific user ID
  const response = await fetch(
    "https://api.spotify.com/v1/browse/featured-playlists?limit=10&country=GB",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch featured playlists");
  }

  const data = await response.json();
  return data.playlists.items;
}

export default {
  getAuthUrl: getSpotifyAuthUrl,
  exchangeCode: exchangeSpotifyCode,
  refreshToken: refreshSpotifyToken,
  search: searchSpotify,
  getRecentlyPlayed,
  getUserPlaylists,
  getPlaylistTracks,
  getTrack,
  getCurrentPlayback,
  play,
  pause,
  skipToNext,
  skipToPrevious,
  getFeaturedPlaylists,
};
