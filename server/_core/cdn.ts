/**
 * CDN Integration
 * Handles CDN URLs for static assets
 */

export function getCDNUrl(path: string): string {
  const cdnBaseUrl = process.env.CDN_BASE_URL;
  if (!cdnBaseUrl) {
    // Fallback to relative path
    return path.startsWith("/") ? path : `/${path}`;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${cdnBaseUrl.replace(/\/$/, "")}/${cleanPath}`;
}

/**
 * Get CDN URL for images
 */
export function getImageUrl(path: string): string {
  return getCDNUrl(`images/${path}`);
}

/**
 * Get CDN URL for audio files
 */
export function getAudioUrl(path: string): string {
  return getCDNUrl(`audio/${path}`);
}

/**
 * Get CDN URL for video files
 */
export function getVideoUrl(path: string): string {
  return getCDNUrl(`videos/${path}`);
}

/**
 * Check if CDN is configured
 */
export function isCDNConfigured(): boolean {
  return !!process.env.CDN_BASE_URL;
}
