/**
 * Social Media OAuth Authentication System
 * 
 * This module handles OAuth flows for various social media platforms.
 * Each platform has its own OAuth implementation.
 */

import { ENV } from "./env";

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "twitter"
  | "facebook"
  | "spotify"
  | "youtube"
  | "snapchat"
  | "telegram";

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
}

interface OAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
}

interface SocialProfile {
  platformUserId: string;
  platformUsername?: string;
  profileData: any;
}

/**
 * Get OAuth configuration for a platform
 */
export function getOAuthConfig(platform: SocialPlatform): OAuthConfig | null {
  const baseRedirectUri = `${ENV.appUrl || "http://localhost:3000"}/api/social/callback`;

  switch (platform) {
    case "twitter":
      return {
        clientId: process.env.TWITTER_CLIENT_ID || "",
        clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
        redirectUri: `${baseRedirectUri}/twitter`,
        authUrl: "https://twitter.com/i/oauth2/authorize",
        tokenUrl: "https://api.twitter.com/2/oauth2/token",
        scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      };

    case "instagram":
      return {
        clientId: process.env.INSTAGRAM_CLIENT_ID || "",
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
        redirectUri: `${baseRedirectUri}/instagram`,
        authUrl: "https://api.instagram.com/oauth/authorize",
        tokenUrl: "https://api.instagram.com/oauth/access_token",
        scopes: ["user_profile", "user_media"],
      };

    case "tiktok":
      return {
        clientId: process.env.TIKTOK_CLIENT_KEY || "",
        clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
        redirectUri: `${baseRedirectUri}/tiktok`,
        authUrl: "https://www.tiktok.com/auth/authorize/",
        tokenUrl: "https://open-api.tiktok.com/oauth/access_token/",
        scopes: ["user.info.basic", "video.list", "video.upload"],
      };

    case "facebook":
      return {
        clientId: process.env.FACEBOOK_APP_ID || "",
        clientSecret: process.env.FACEBOOK_APP_SECRET || "",
        redirectUri: `${baseRedirectUri}/facebook`,
        authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
        tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
        scopes: ["public_profile", "pages_manage_posts", "pages_read_engagement"],
      };

    case "spotify":
      return {
        clientId: process.env.SPOTIFY_CLIENT_ID || "",
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
        redirectUri: `${baseRedirectUri}/spotify`,
        authUrl: "https://accounts.spotify.com/authorize",
        tokenUrl: "https://accounts.spotify.com/api/token",
        scopes: ["user-read-currently-playing", "user-read-playback-state"],
      };

    case "youtube":
      return {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirectUri: `${baseRedirectUri}/youtube`,
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopes: [
          "https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube.readonly",
        ],
      };

    case "telegram":
      // Telegram uses a different auth flow (Bot API)
      return null;

    case "snapchat":
      return {
        clientId: process.env.SNAPCHAT_CLIENT_ID || "",
        clientSecret: process.env.SNAPCHAT_CLIENT_SECRET || "",
        redirectUri: `${baseRedirectUri}/snapchat`,
        authUrl: "https://accounts.snapchat.com/login/oauth2/authorize",
        tokenUrl: "https://accounts.snapchat.com/login/oauth2/access_token",
        scopes: ["snapchat-marketing-api"],
      };

    default:
      return null;
  }
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(
  platform: SocialPlatform,
  state: string
): string | null {
  const config = getOAuthConfig(platform);
  if (!config || !config.clientId) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state,
  });

  // Platform-specific adjustments
  if (platform === "twitter") {
    params.set("code_challenge", "challenge");
    params.set("code_challenge_method", "plain");
  }

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  platform: SocialPlatform,
  code: string
): Promise<OAuthTokenResponse | null> {
  const config = getOAuthConfig(platform);
  if (!config || !config.clientId || !config.clientSecret) return null;

  try {
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    });

    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error(`[Social Auth] Token exchange failed for ${platform}:`, await response.text());
      return null;
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  } catch (error) {
    console.error(`[Social Auth] Error exchanging code for token (${platform}):`, error);
    return null;
  }
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(
  platform: SocialPlatform,
  refreshToken: string
): Promise<OAuthTokenResponse | null> {
  const config = getOAuthConfig(platform);
  if (!config || !config.clientId || !config.clientSecret) return null;

  try {
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error(`[Social Auth] Token refresh failed for ${platform}`);
      return null;
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    };
  } catch (error) {
    console.error(`[Social Auth] Error refreshing token (${platform}):`, error);
    return null;
  }
}

/**
 * Fetch user profile from platform API
 */
export async function fetchUserProfile(
  platform: SocialPlatform,
  accessToken: string
): Promise<SocialProfile | null> {
  try {
    switch (platform) {
      case "twitter": {
        const response = await fetch("https://api.twitter.com/2/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
          platformUserId: data.data.id,
          platformUsername: data.data.username,
          profileData: data.data,
        };
      }

      case "instagram": {
        const response = await fetch(
          `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return {
          platformUserId: data.id,
          platformUsername: data.username,
          profileData: data,
        };
      }

      case "tiktok": {
        const response = await fetch("https://open-api.tiktok.com/user/info/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
          platformUserId: data.data.user.open_id,
          platformUsername: data.data.user.display_name,
          profileData: data.data.user,
        };
      }

      case "facebook": {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${accessToken}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return {
          platformUserId: data.id,
          platformUsername: data.name,
          profileData: data,
        };
      }

      case "spotify": {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
          platformUserId: data.id,
          platformUsername: data.display_name,
          profileData: data,
        };
      }

      case "youtube": {
        const response = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.items || data.items.length === 0) return null;
        const channel = data.items[0];
        return {
          platformUserId: channel.id,
          platformUsername: channel.snippet.title,
          profileData: channel.snippet,
        };
      }

      default:
        return null;
    }
  } catch (error) {
    console.error(`[Social Auth] Error fetching profile (${platform}):`, error);
    return null;
  }
}

/**
 * Check if platform OAuth is configured
 */
export function isPlatformConfigured(platform: SocialPlatform): boolean {
  const config = getOAuthConfig(platform);
  return !!(config && config.clientId && config.clientSecret);
}

/**
 * Get list of configured platforms
 */
export function getConfiguredPlatforms(): SocialPlatform[] {
  const platforms: SocialPlatform[] = [
    "twitter",
    "instagram",
    "tiktok",
    "facebook",
    "spotify",
    "youtube",
    "snapchat",
  ];

  return platforms.filter((p) => isPlatformConfigured(p));
}
