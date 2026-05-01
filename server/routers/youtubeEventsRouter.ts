import { Router } from "express";
import { google } from "googleapis";
import { broadcastStreamEvent } from "./streamEventsRouter";

const router = Router();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

interface YouTubeActivity {
  id: string;
  snippet: {
    publishedAt: string;
    channelTitle: string;
    title: string;
    type: string;
  };
}

async function fetchYouTubeFollows(channelId: string) {
  try {
    const response = await youtube.activities.list({
      part: ["snippet", "contentDetails"],
      channelId,
      maxResults: 10,
      order: "relevance",
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Failed to fetch YouTube activities:", error);
    return [];
  }
}

router.get("/channel/:channelId/subscribers", async (req, res) => {
  try {
    const { channelId } = req.params;

    const response = await youtube.channels.list({
      part: ["statistics"],
      id: [channelId],
    });

    const stats = response.data.items?.[0]?.statistics;

    res.json({
      subscriberCount: stats?.subscriberCount,
      viewCount: stats?.viewCount,
      videoCount: stats?.videoCount,
    });
  } catch (error) {
    console.error("Failed to get channel stats:", error);
    res.status(500).json({ error: "Failed to fetch channel stats" });
  }
});

router.post("/event/follow", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Missing username" });
  }

  broadcastStreamEvent({
    id: `youtube_follow_${Date.now()}`,
    type: "follow",
    username,
    timestamp: new Date(),
  });

  res.json({ success: true });
});

export default router;
