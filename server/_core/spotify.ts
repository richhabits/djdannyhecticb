/**
 * Spotify API Integration
 * Fetches tracks, playlists, and artist data from Spotify
 */

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
    items: Array<{ track: SpotifyTrack }>;
  };
}

/**
 * Get Spotify access token
 */
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be configured");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get Spotify token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Search for tracks on Spotify
 */
export async function searchSpotifyTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Spotify API error");
    }

    const data = await response.json();
    return data.tracks.items;
  } catch (error) {
    console.error("[Spotify] Search failed:", error);
    return [];
  }
}

/**
 * Get a playlist from Spotify
 */
export async function getSpotifyPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Spotify API error");
    }

    return await response.json();
  } catch (error) {
    console.error("[Spotify] Get playlist failed:", error);
    return null;
  }
}

/**
 * Get track details
 */
export async function getSpotifyTrack(trackId: string): Promise<SpotifyTrack | null> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Spotify API error");
    }

    return await response.json();
  } catch (error) {
    console.error("[Spotify] Get track failed:", error);
    return null;
  }
}
