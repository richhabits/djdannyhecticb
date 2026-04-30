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

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /dashboard

Sitemap: ${BASE_URL}/api/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(robotsTxt);
}
