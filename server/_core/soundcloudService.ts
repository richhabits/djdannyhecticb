import { ENV } from "./env";

interface SoundCloudTrack {
  id: number;
  title: string;
  description?: string;
  artwork_url?: string;
  uri: string;
}

interface SoundCloudResponse {
  collection: SoundCloudTrack[];
}

export async function fetchSoundCloudTracks(userId: string): Promise<SoundCloudTrack[]> {
  if (!ENV.soundcloudClientId) {
    throw new Error("SOUNDCLOUD_CLIENT_ID not configured");
  }

  try {
    const url = `https://api.soundcloud.com/users/${userId}/tracks?client_id=${ENV.soundcloudClientId}&limit=200`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SoundCloud API error: ${response.statusText}`);
    }
    const data: SoundCloudTrack[] = await response.json();
    return data;
  } catch (error) {
    console.error("[SoundCloud] Failed to fetch tracks:", error);
    throw error;
  }
}

export function getSoundCloudEmbedUrl(trackUrl: string): string {
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&color=ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
}

export function normalizeSoundCloudArtworkUrl(artwork?: string): string | undefined {
  if (!artwork) return undefined;
  // Replace -large with -t500x500 for better quality
  return artwork.replace("-large.jpg", "-t500x500.jpg");
}
