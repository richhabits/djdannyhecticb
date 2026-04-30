/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { VercelRequest, VercelResponse } from "@vercel/node";

const BASE_URL = "https://djdannyhecticb.com";

function formatRssDate(date: Date): string {
  return date.toUTCString();
}

export default function handler(
  req: VercelRequest,
  res: VercelResponse
): void {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }

  const now = new Date();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>DJ Danny Hectic B - Updates</title>
    <link>${BASE_URL}</link>
    <description>30+ years of UK Garage, House, Jungle, Grime. Mixes, events, bookings, and live radio.</description>
    <language>en-gb</language>
    <copyright>Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio. All rights reserved.</copyright>
    <lastBuildDate>${formatRssDate(now)}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/og-image.png</url>
      <title>DJ Danny Hectic B</title>
      <link>${BASE_URL}</link>
    </image>
    <item>
      <title>Welcome to DJ Danny Hectic B</title>
      <description>30+ years in UK Garage, House, Jungle, Grime. Available for club gigs, private events, corporate bookings, radio shows, and more.</description>
      <link>${BASE_URL}</link>
      <guid>${BASE_URL}</guid>
      <pubDate>${formatRssDate(now)}</pubDate>
      <category>Updates</category>
    </item>
    <item>
      <title>Browse Mixes</title>
      <description>Check out curated mixes and productions from DJ Danny Hectic B</description>
      <link>${BASE_URL}/mixes</link>
      <guid>${BASE_URL}/mixes</guid>
      <pubDate>${formatRssDate(now)}</pubDate>
      <category>Mixes</category>
    </item>
    <item>
      <title>Upcoming Events</title>
      <description>Find upcoming events and bookings featuring DJ Danny Hectic B</description>
      <link>${BASE_URL}/events</link>
      <guid>${BASE_URL}/events</guid>
      <pubDate>${formatRssDate(now)}</pubDate>
      <category>Events</category>
    </item>
    <item>
      <title>Book a Gig</title>
      <description>Get in touch to book DJ Danny Hectic B for your event</description>
      <link>${BASE_URL}/bookings</link>
      <guid>${BASE_URL}/bookings</guid>
      <pubDate>${formatRssDate(now)}</pubDate>
      <category>Bookings</category>
    </item>
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(rss);
}
