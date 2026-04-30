/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../server/db";
import { mixes, events } from "../drizzle/schema";
import { desc } from "drizzle-orm";

const BASE_URL = "https://djdannyhecticb.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRssDate(date: Date): string {
  return date.toUTCString();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const db = await getDb();
    let items = "";

    if (db) {
      try {
        // Get recent mixes
        const recentMixes = await db.select().from(mixes).orderBy(desc(mixes.createdAt)).limit(20);
        for (const mix of recentMixes) {
          items += `  <item>
    <title>${escapeXml(mix.title)}</title>
    <description>${escapeXml(mix.description || mix.title)}</description>
    <link>${BASE_URL}/mixes/${mix.id}</link>
    <guid>${BASE_URL}/mixes/${mix.id}</guid>
    <pubDate>${formatRssDate(mix.createdAt)}</pubDate>
    <category>Music Mix</category>
  </item>\n`;
        }

        // Get recent events
        const recentEvents = await db.select().from(events).orderBy(desc(events.createdAt)).limit(10);
        for (const event of recentEvents) {
          items += `  <item>
    <title>${escapeXml(event.title)}</title>
    <description>${escapeXml(event.description || event.title)} - ${event.location}</description>
    <link>${BASE_URL}/events/${event.id}</link>
    <guid>${BASE_URL}/events/${event.id}</guid>
    <pubDate>${formatRssDate(event.createdAt)}</pubDate>
    <category>Event</category>
  </item>\n`;
        }
      } catch (error) {
        console.warn("[RSS Feed] Error fetching database content:", error);
      }
    }

    // Default item if no content
    if (!items) {
      items = `  <item>
    <title>DJ Danny Hectic B - 30+ Years UK Underground</title>
    <description>Book Danny for clubs, private events, corporate gigs. 30+ years in Garage, House, Jungle, Grime.</description>
    <link>${BASE_URL}</link>
    <guid>${BASE_URL}</guid>
    <pubDate>${formatRssDate(new Date())}</pubDate>
  </item>`;
    }

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>DJ Danny Hectic B - Updates</title>
    <link>${BASE_URL}</link>
    <description>30+ years of UK Garage, House, Jungle, Grime. Mixes, events, and more.</description>
    <language>en-gb</language>
    <copyright>Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio. All rights reserved.</copyright>
    <lastBuildDate>${formatRssDate(new Date())}</lastBuildDate>
    <image>
      <url>${BASE_URL}/og-image.png</url>
      <title>DJ Danny Hectic B</title>
      <link>${BASE_URL}</link>
    </image>
${items}  </channel>
</rss>`;

    res.setHeader("Content-Type", "application/rss+xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(rss);
  } catch (error) {
    console.error("[RSS Feed] Error generating feed:", error);
    res.status(500).send("Error generating RSS feed");
  }
}
