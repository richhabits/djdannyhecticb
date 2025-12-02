/**
 * Utilities for social sharing and analytics
 */

export interface ShareOptions {
  url: string;
  title: string;
  description?: string;
  source?: string;
  medium?: string;
}

/**
 * Build a URL with UTM parameters for analytics tracking
 */
export function buildShareUrl(
  baseUrl: string,
  source: string,
  medium: string = "social"
): string {
  const url = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  return url.toString();
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "whatsapp", "social");
  const text = options.description 
    ? `${options.title}\n\n${options.description}\n\n${shareUrl}`
    : `${options.title}\n\n${shareUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Generate X (Twitter) share URL
 */
export function getTwitterShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "twitter", "social");
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(options.title)}&url=${encodeURIComponent(shareUrl)}`;
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "facebook", "social");
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

/**
 * Generate Telegram share URL
 */
export function getTelegramShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "telegram", "social");
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(options.title)}`;
}

/**
 * Copy URL to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Track-specific sharing utilities
 */
export interface TrackShareOptions {
  trackTitle: string;
  trackArtist: string;
  stationName?: string;
  streamUrl?: string;
  platform?: string;
}

/**
 * Generate share text for a track
 */
export function generateTrackShareText(options: TrackShareOptions): string {
  const { trackTitle, trackArtist, stationName = "Hectic Radio" } = options;
  return `🎵 Now playing on ${stationName}: "${trackTitle}" by ${trackArtist} 🔥\n\nListen live: ${typeof window !== "undefined" ? window.location.origin : ""}`;
}

/**
 * Get share URL for a specific platform and track
 */
export function getTrackShareUrl(platform: string, options: TrackShareOptions): string {
  const shareText = generateTrackShareText(options);
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  switch (platform.toLowerCase()) {
    case "twitter":
    case "x":
      return getTwitterShareUrl({
        url: shareUrl,
        title: shareText,
        source: "twitter",
      });
    
    case "facebook":
      return getFacebookShareUrl({
        url: shareUrl,
        title: shareText,
        source: "facebook",
      });
    
    case "whatsapp":
      return getWhatsAppShareUrl({
        url: shareUrl,
        title: shareText,
        source: "whatsapp",
      });
    
    case "telegram":
      return getTelegramShareUrl({
        url: shareUrl,
        title: shareText,
        source: "telegram",
      });
    
    case "instagram":
      // Instagram doesn't support direct URL sharing, return text for copy
      return shareText;
    
    case "tiktok":
      // TikTok doesn't support direct URL sharing, return text for copy
      return shareText;
    
    default:
      return shareText;
  }
}

/**
 * Detect user's login method/platform from OAuth
 */
export function detectUserPlatform(loginMethod?: string | null): string | null {
  if (!loginMethod) return null;
  
  const method = loginMethod.toLowerCase();
  if (method.includes("twitter") || method.includes("x")) return "twitter";
  if (method.includes("facebook")) return "facebook";
  if (method.includes("google")) return "youtube"; // Google login might indicate YouTube
  if (method.includes("instagram")) return "instagram";
  if (method.includes("tiktok")) return "tiktok";
  
  return null;
}

