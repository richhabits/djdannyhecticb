/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../server/db";
import { mixes, events, podcasts } from "../drizzle/schema";
import { desc } from "drizzle-orm";

const BASE_URL = "https://djdannyhecticb.com";

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
    const urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }> = [];

    // Static pages
    urls.push(
      { loc: `${BASE_URL}/`, changefreq: "daily", priority: 1.0 },
      { loc: `${BASE_URL}/mixes`, changefreq: "weekly", priority: 0.9 },
      { loc: `${BASE_URL}/events`, changefreq: "weekly", priority: 0.9 },
      { loc: `${BASE_URL}/podcasts`, changefreq: "weekly", priority: 0.9 },
      { loc: `${BASE_URL}/bookings`, changefreq: "monthly", priority: 0.8 },
      { loc: `${BASE_URL}/bio`, changefreq: "monthly", priority: 0.7 },
      { loc: `${BASE_URL}/live`, changefreq: "daily", priority: 0.9 }
    );

    if (db) {
      try {
        // Mixes
        const allMixes = await db.select().from(mixes).orderBy(desc(mixes.createdAt));
        for (const mix of allMixes) {
          urls.push({
            loc: `${BASE_URL}/mixes/${mix.id}`,
            lastmod: mix.updatedAt?.toISOString() || new Date().toISOString(),
            changefreq: "monthly",
            priority: 0.8,
          });
        }

        // Events
        const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
        for (const event of allEvents) {
          urls.push({
            loc: `${BASE_URL}/events/${event.id}`,
            lastmod: event.updatedAt?.toISOString() || new Date().toISOString(),
            changefreq: "weekly",
            priority: 0.8,
          });
        }

        // Podcasts
        const allPodcasts = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
        for (const podcast of allPodcasts) {
          urls.push({
            loc: `${BASE_URL}/podcasts/${podcast.id}`,
            lastmod: podcast.updatedAt?.toISOString() || new Date().toISOString(),
            changefreq: "weekly",
            priority: 0.8,
          });
        }
      } catch (error) {
        console.warn("[Sitemap] Error fetching database content:", error);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ""}
    ${url.priority ? `<priority>${url.priority}</priority>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (error) {
    console.error("[Sitemap] Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
}
