/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * SEO Routes and Utilities
 * 
 * Provides SEO-friendly features:
 * - Sitemap generation
 * - Robots.txt
 * - Structured data (JSON-LD)
 * - Meta tag helpers
 */

import { Express, Request, Response } from "express";
import { getDb } from "../db";
import { mixes, events, podcasts, shows, showEpisodes } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const BASE_URL = process.env.BASE_URL || "https://djdannyhecticb.co.uk";

/**
 * Generate XML Sitemap
 */
async function generateSitemap(): Promise<string> {
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
    { loc: `${BASE_URL}/live`, changefreq: "daily", priority: 0.9 },
  );

  if (db) {
    try {
      // Mixes
      const allMixes = await db.select().from(mixes).orderBy(desc(mixes.createdAt));
      for (const mix of allMixes) {
        urls.push({
          loc: `${BASE_URL}/mixes/${mix.id}`,
          lastmod: mix.updatedAt.toISOString(),
          changefreq: "monthly",
          priority: 0.8,
        });
      }

      // Events
      const allEvents = await db.select().from(events).orderBy(desc(events.createdAt));
      for (const event of allEvents) {
        urls.push({
          loc: `${BASE_URL}/events/${event.id}`,
          lastmod: event.updatedAt.toISOString(),
          changefreq: "weekly",
          priority: 0.8,
        });
      }

      // Podcasts
      const allPodcasts = await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
      for (const podcast of allPodcasts) {
        urls.push({
          loc: `${BASE_URL}/podcasts/${podcast.id}`,
          lastmod: podcast.updatedAt.toISOString(),
          changefreq: "weekly",
          priority: 0.8,
        });
      }

      // Show Episodes
      const allEpisodes = await db.select().from(showEpisodes).orderBy(desc(showEpisodes.createdAt));
      for (const episode of allEpisodes) {
        urls.push({
          loc: `${BASE_URL}/show/episode/${episode.slug}`,
          lastmod: episode.updatedAt.toISOString(),
          changefreq: "weekly",
          priority: 0.8,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SEO] Error generating sitemap:", error);
      }
    }
  }

  // Generate XML
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

  return xml;
}

/**
 * Generate Robots.txt
 */
function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /dashboard

Sitemap: ${BASE_URL}/sitemap.xml
`;
}

/**
 * Generate Structured Data (JSON-LD) for Person
 */
export function generatePersonStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: "DJ Danny Hectic B",
    alternateName: "Danny Hectic B",
    jobTitle: "DJ",
    description: "Legendary UK Garage and House DJ with 30+ years in the game",
    url: BASE_URL,
    sameAs: [
      // Add social media links here
    ],
    knowsAbout: ["UK Garage", "House Music", "DJing", "Music Production"],
  };
}

/**
 * Generate Structured Data for Music Album/Mix
 */
export function generateMusicStructuredData(mix: {
  id: number;
  title: string;
  description?: string;
  audioUrl: string;
  coverImageUrl?: string;
  createdAt: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    "@id": `${BASE_URL}/mixes/${mix.id}`,
    name: mix.title,
    description: mix.description || mix.title,
    image: mix.coverImageUrl || `${BASE_URL}/og-default.png`,
    datePublished: mix.createdAt.toISOString(),
    url: `${BASE_URL}/mixes/${mix.id}`,
    byArtist: {
      "@type": "Person",
      name: "DJ Danny Hectic B",
    },
  };
}

/**
 * Generate Structured Data for Event
 */
export function generateEventStructuredData(event: {
  id: number;
  title: string;
  description?: string;
  eventDate: Date;
  location: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${BASE_URL}/events/${event.id}`,
    name: event.title,
    description: event.description || event.title,
    startDate: event.eventDate.toISOString(),
    location: {
      "@type": "Place",
      name: event.location,
    },
    image: event.imageUrl || `${BASE_URL}/og-default.png`,
    organizer: {
      "@type": "Person",
      name: "DJ Danny Hectic B",
    },
  };
}

/**
 * Generate Structured Data for Podcast Episode
 */
export function generatePodcastStructuredData(podcast: {
  id: number;
  title: string;
  description?: string;
  audioUrl: string;
  coverImageUrl?: string;
  createdAt: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "@id": `${BASE_URL}/podcasts/${podcast.id}`,
    name: podcast.title,
    description: podcast.description || podcast.title,
    image: podcast.coverImageUrl || `${BASE_URL}/og-default.png`,
    datePublished: podcast.createdAt.toISOString(),
    associatedMedia: {
      "@type": "MediaObject",
      contentUrl: podcast.audioUrl,
      encodingFormat: "audio/mpeg",
    },
    partOfSeries: {
      "@type": "PodcastSeries",
      name: "DJ Danny Hectic B Podcast",
    },
  };
}

/**
 * Register SEO routes
 */
export function registerSEORoutes(app: Express) {
  // Sitemap
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const sitemap = await generateSitemap();
      res.setHeader("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[SEO] Error generating sitemap:", error);
      }
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain");
    res.send(generateRobotsTxt());
  });
}

