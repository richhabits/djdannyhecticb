import { ENV } from "./env";

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
  external_urls: { spotify: string };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  release_date: string;
  images: Array<{ url: string; width: number; height: number }>;
  external_urls: { spotify: string };
  tracks?: { total: number };
}

interface SpotifyAlbumsResponse {
  items: SpotifyAlbum[];
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  if (!ENV.spotifyClientId || !ENV.spotifyClientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET not configured");
  }

  const credentials = Buffer.from(`${ENV.spotifyClientId}:${ENV.spotifyClientSecret}`).toString("base64");

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Spotify token error: ${response.statusText}`);
    }

    const data: SpotifyToken = await response.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };
    return data.access_token;
  } catch (error) {
    console.error("[Spotify] Failed to get token:", error);
    throw error;
  }
}

export async function fetchSpotifyArtistReleases(artistId: string): Promise<SpotifyAlbum[]> {
  try {
    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=album,single`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data: SpotifyAlbumsResponse = await response.json();
    return data.items;
  } catch (error) {
    console.error("[Spotify] Failed to fetch releases:", error);
    throw error;
  }
}

export function getSpotifyEmbedUrl(trackOrAlbumId: string): string {
  const id = trackOrAlbumId.split("/").pop() || trackOrAlbumId;
  return `https://open.spotify.com/embed/track/${id}`;
}

export function getSpotifyAlbumEmbedUrl(albumId: string): string {
  const id = albumId.split("/").pop() || albumId;
  return `https://open.spotify.com/embed/album/${id}`;
}
