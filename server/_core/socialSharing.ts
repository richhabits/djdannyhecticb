/**
 * Social Media Sharing Service
 * 
 * Handles posting content to various social media platforms
 */

import { SocialPlatform } from "./socialAuth";

export interface ShareContent {
  text: string;
  url?: string;
  mediaUrl?: string;
  hashtags?: string[];
}

export interface ShareResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

/**
 * Post content to a social platform
 */
export async function postToSocial(
  platform: SocialPlatform,
  accessToken: string,
  content: ShareContent
): Promise<ShareResult> {
  try {
    switch (platform) {
      case "twitter":
        return await postToTwitter(accessToken, content);
      case "instagram":
        return await postToInstagram(accessToken, content);
      case "tiktok":
        return await postToTikTok(accessToken, content);
      case "facebook":
        return await postToFacebook(accessToken, content);
      case "telegram":
        return await postToTelegram(accessToken, content);
      default:
        return { success: false, error: "Platform not supported for posting" };
    }
  } catch (error) {
    console.error(`[Social Sharing] Error posting to ${platform}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Twitter/X posting
 */
async function postToTwitter(
  accessToken: string,
  content: ShareContent
): Promise<ShareResult> {
  try {
    let tweetText = content.text;
    if (content.hashtags && content.hashtags.length > 0) {
      tweetText += "\n\n" + content.hashtags.map((h) => `#${h}`).join(" ");
    }
    if (content.url) {
      tweetText += `\n${content.url}`;
    }

    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: tweetText }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Twitter] Post failed:", error);
      return { success: false, error: "Failed to post to Twitter" };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.data.id,
      postUrl: `https://twitter.com/i/web/status/${data.data.id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Instagram posting (requires Business/Creator account)
 */
async function postToInstagram(
  accessToken: string,
  content: ShareContent
): Promise<ShareResult> {
  try {
    // Instagram API requires a two-step process: create container, then publish

    // Step 1: Create container
    let caption = content.text;
    if (content.hashtags && content.hashtags.length > 0) {
      caption += "\n\n" + content.hashtags.map((h) => `#${h}`).join(" ");
    }

    if (!content.mediaUrl) {
      return { success: false, error: "Instagram requires an image or video URL" };
    }

    const containerParams = new URLSearchParams({
      image_url: content.mediaUrl,
      caption,
      access_token: accessToken,
    });

    const containerResponse = await fetch(
      `https://graph.instagram.com/me/media?${containerParams}`,
      { method: "POST" }
    );

    if (!containerResponse.ok) {
      return { success: false, error: "Failed to create Instagram container" };
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Publish container
    const publishParams = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    });

    const publishResponse = await fetch(
      `https://graph.instagram.com/me/media_publish?${publishParams}`,
      { method: "POST" }
    );

    if (!publishResponse.ok) {
      return { success: false, error: "Failed to publish Instagram post" };
    }

    const publishData = await publishResponse.json();
    return {
      success: true,
      postId: publishData.id,
      postUrl: `https://www.instagram.com/p/${publishData.id}/`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * TikTok posting (requires video URL)
 */
async function postToTikTok(
  accessToken: string,
  content: ShareContent
): Promise<ShareResult> {
  try {
    if (!content.mediaUrl) {
      return { success: false, error: "TikTok requires a video URL" };
    }

    // TikTok API for content posting
    const response = await fetch("https://open-api.tiktok.com/share/video/upload/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video: {
          video_url: content.mediaUrl,
        },
        post_info: {
          title: content.text,
          privacy_level: "PUBLIC_TO_EVERYONE",
        },
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to post to TikTok" };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.data.share_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Facebook posting
 */
async function postToFacebook(
  accessToken: string,
  content: ShareContent
): Promise<ShareResult> {
  try {
    let message = content.text;
    if (content.hashtags && content.hashtags.length > 0) {
      message += "\n\n" + content.hashtags.map((h) => `#${h}`).join(" ");
    }

    const params = new URLSearchParams({
      message,
      access_token: accessToken,
    });

    if (content.url) {
      params.set("link", content.url);
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
      method: "POST",
      body: params,
    });

    if (!response.ok) {
      return { success: false, error: "Failed to post to Facebook" };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
      postUrl: `https://www.facebook.com/${data.id}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Telegram posting (via Bot API)
 */
async function postToTelegram(
  botToken: string,
  content: ShareContent
): Promise<ShareResult> {
  try {
    // This would require channel/chat ID
    // For now, return not implemented
    return { success: false, error: "Telegram posting not implemented" };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate share content from track info
 */
export function generateTrackShareContent(
  trackTitle: string,
  trackArtist: string,
  platform: SocialPlatform,
  templateText?: string,
  stationUrl?: string
): ShareContent {
  // Default templates if none provided
  const defaultTemplates: Record<SocialPlatform, string> = {
    twitter: `🔥 Vibing to "{track}" by {artist} on Hectic Radio! 🎧\n\nTune in now 👉`,
    instagram: `🎵 Now Playing: {track} by {artist}\n\n🔊 Lock in with Hectic Radio`,
    tiktok: `{track} - {artist} 🎵\n\nLive on Hectic Radio 🔥`,
    facebook: `Currently listening to "{track}" by {artist} on Hectic Radio!\n\nJoin me and tune in!`,
    spotify: `Loving "{track}" by {artist}!`,
    youtube: `Now Playing: {track} by {artist} on Hectic Radio`,
    snapchat: `🎵 {track} - {artist}`,
    telegram: `🎧 Now Playing: {track} by {artist}\n\nHectic Radio - Live`,
  };

  const template = templateText || defaultTemplates[platform];
  const text = template
    .replace(/\{track\}/g, trackTitle)
    .replace(/\{artist\}/g, trackArtist)
    .replace(/\{station\}/g, "Hectic Radio");

  const hashtags = ["HecticRadio", "NowPlaying", "DJDannyHecticB"];

  return {
    text,
    url: stationUrl || "https://hecticradio.com/live",
    hashtags,
  };
}

/**
 * Get platform-specific character limits
 */
export function getCharacterLimit(platform: SocialPlatform): number {
  const limits: Record<SocialPlatform, number> = {
    twitter: 280,
    instagram: 2200,
    tiktok: 150,
    facebook: 63206,
    spotify: 0, // Spotify doesn't support posting
    youtube: 5000,
    snapchat: 80,
    telegram: 4096,
  };

  return limits[platform];
}

/**
 * Truncate content to fit platform limits
 */
export function truncateContent(
  content: ShareContent,
  platform: SocialPlatform
): ShareContent {
  const limit = getCharacterLimit(platform);
  if (limit === 0 || content.text.length <= limit) {
    return content;
  }

  // Calculate space needed for hashtags and URL
  let reservedSpace = 0;
  if (content.hashtags) {
    reservedSpace += content.hashtags.map((h) => h.length + 2).reduce((a, b) => a + b, 0);
  }
  if (content.url) {
    reservedSpace += 23; // Twitter t.co link length
  }

  const availableSpace = limit - reservedSpace - 10; // 10 for safety and ellipsis
  const truncatedText =
    content.text.substring(0, availableSpace - 3) + "...";

  return {
    ...content,
    text: truncatedText,
  };
}
