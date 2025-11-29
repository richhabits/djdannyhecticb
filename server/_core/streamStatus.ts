import axios from "axios";

export type StreamStatus = {
  online: boolean;
  listeners?: number;
  nowPlaying?: string;
  error?: string;
};

/**
 * Check Shoutcast stream status via admin API
 */
async function checkShoutcastStatus(
  adminApiUrl: string,
  adminUser?: string,
  adminPassword?: string
): Promise<StreamStatus> {
  try {
    const auth = adminUser && adminPassword
      ? Buffer.from(`${adminUser}:${adminPassword}`).toString("base64")
      : undefined;

    const response = await axios.get(adminApiUrl, {
      headers: auth ? { Authorization: `Basic ${auth}` } : {},
      timeout: 5000,
      params: {
        mode: "viewxml",
        page: "7", // Current song info
      },
    });

    // Shoutcast XML response parsing (simplified)
    const xml = response.data;
    const listenersMatch = xml.match(/<CURRENTLISTENERS>(\d+)<\/CURRENTLISTENERS>/);
    const titleMatch = xml.match(/<SERVERTITLE>(.*?)<\/SERVERTITLE>/);
    const songMatch = xml.match(/<SONGTITLE>(.*?)<\/SONGTITLE>/);

    return {
      online: true,
      listeners: listenersMatch ? parseInt(listenersMatch[1], 10) : undefined,
      nowPlaying: songMatch?.[1] || titleMatch?.[1] || undefined,
    };
  } catch (error) {
    console.error("[StreamStatus] Shoutcast check failed:", error);
    return {
      online: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check Icecast stream status via stats API
 */
async function checkIcecastStatus(
  adminApiUrl: string,
  adminUser?: string,
  adminPassword?: string
): Promise<StreamStatus> {
  try {
    const auth = adminUser && adminPassword
      ? Buffer.from(`${adminUser}:${adminPassword}`).toString("base64")
      : undefined;

    const response = await axios.get(adminApiUrl, {
      headers: auth ? { Authorization: `Basic ${auth}` } : {},
      timeout: 5000,
    });

    // Icecast JSON stats (if using JSON endpoint) or XML parsing
    const data = response.data;
    
    // Try JSON first
    if (typeof data === "object" && data.icestats) {
      const source = data.icestats.source?.[0] || data.icestats.source;
      return {
        online: true,
        listeners: source?.listeners || 0,
        nowPlaying: source?.yp_currently_playing || source?.server_description || undefined,
      };
    }

    // Fallback: try XML parsing
    if (typeof data === "string") {
      const listenersMatch = data.match(/<listeners>(\d+)<\/listeners>/);
      const titleMatch = data.match(/<server_description>(.*?)<\/server_description>/);
      
      return {
        online: true,
        listeners: listenersMatch ? parseInt(listenersMatch[1], 10) : undefined,
        nowPlaying: titleMatch?.[1] || undefined,
      };
    }

    return { online: true };
  } catch (error) {
    console.error("[StreamStatus] Icecast check failed:", error);
    return {
      online: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get stream status for a given stream configuration
 */
export async function getStreamStatus(
  stream: {
    type: "shoutcast" | "icecast" | "custom";
    adminApiUrl?: string | null;
    adminUser?: string | null;
    adminPassword?: string | null;
  }
): Promise<StreamStatus> {
  // If no admin API URL, return fallback status
  if (!stream.adminApiUrl) {
    return {
      online: true, // Assume online if we can't check
      error: "No admin API configured",
    };
  }

  // Check based on stream type
  if (stream.type === "shoutcast") {
    return checkShoutcastStatus(
      stream.adminApiUrl,
      stream.adminUser || undefined,
      stream.adminPassword || undefined
    );
  }

  if (stream.type === "icecast") {
    return checkIcecastStatus(
      stream.adminApiUrl,
      stream.adminUser || undefined,
      stream.adminPassword || undefined
    );
  }

  // Custom type - try generic check
  try {
    const response = await axios.get(stream.adminApiUrl, {
      timeout: 5000,
      headers: stream.adminUser && stream.adminPassword
        ? {
            Authorization: `Basic ${Buffer.from(`${stream.adminUser}:${stream.adminPassword}`).toString("base64")}`,
          }
        : {},
    });
    return { online: response.status === 200 };
  } catch (error) {
    return {
      online: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

