/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL = "https://djdannyhecticb.com";

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): void {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  // Static pages - core routes that should be indexed
  const urls = [
    { loc: `${BASE_URL}/`, changefreq: "daily", priority: 1.0 },
    { loc: `${BASE_URL}/mixes`, changefreq: "weekly", priority: 0.9 },
    { loc: `${BASE_URL}/events`, changefreq: "weekly", priority: 0.9 },
    { loc: `${BASE_URL}/podcasts`, changefreq: "weekly", priority: 0.9 },
    { loc: `${BASE_URL}/bookings`, changefreq: "monthly", priority: 0.8 },
    { loc: `${BASE_URL}/bio`, changefreq: "monthly", priority: 0.7 },
    { loc: `${BASE_URL}/live`, changefreq: "daily", priority: 0.9 },
    { loc: `${BASE_URL}/contact`, changefreq: "monthly", priority: 0.7 },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
}
