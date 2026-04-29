/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import * as db from "../server/db";
import {
  hecticLeads,
  jarvisInsights,
  eventBookings,
} from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Cron Job: jarvis-daily-insights
 * Runs daily at 7:00 AM UTC
 * Responsibility: Analyze 7 days of booking data, generate venue suggestions, update insights cache
 */
async function run() {
  console.log("🧠 [JOB] Starting Jarvis daily insights generation...");

  try {
    const conn = await db.getDb();
    if (!conn) throw new Error("Database connection failed");

    // Analyze last 7 days of leads
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const recentLeads = await conn
      .select()
      .from(hecticLeads)
      .where(sql`${hecticLeads.createdAt} >= ${sevenDaysAgo}`);

    console.log(
      `📊 [JOB] Analyzing ${recentLeads.length} leads from past 7 days...`
    );

    // Group by location to identify top cities
    const cityMap: Record<string, number> = {};
    const eventTypeMap: Record<string, number> = {};

    for (const lead of recentLeads) {
      if (lead.location) {
        cityMap[lead.location] = (cityMap[lead.location] || 0) + 1;
      }
      if (lead.eventType) {
        eventTypeMap[lead.eventType] =
          (eventTypeMap[lead.eventType] || 0) + 1;
      }
    }

    const topCities = Object.entries(cityMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    console.log(`🏙️ [JOB] Top cities: ${topCities.map(([c]) => c).join(", ")}`);

    // Generate venue suggestions for top cities
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    for (const [city, count] of topCities) {
      try {
        // TODO: When Jarvis AI context is available:
        // 1. Call Jarvis with city context
        // 2. Get venue suggestions specific to city
        // 3. Parse suggestions into structured data

        const content = `High demand in ${city} (${count} recent bookings). Key venues: [TO_BE_FILLED_BY_JARVIS]`;

        // Clean up old insights for this city
        await conn
          .delete(jarvisInsights)
          .where(
            sql`${jarvisInsights.type} = 'venue_suggestion'
          AND ${jarvisInsights.metadata} ->> 'city' = ${city}`
          );

        // Insert new insight
        await conn.insert(jarvisInsights).values({
          type: "venue_suggestion",
          title: `Venue Opportunities: ${city}`,
          content,
          metadata: { city, count },
          status: "active",
          priority: count > 5 ? 10 : 5,
          expiresAt,
        });

        console.log(`📍 [JOB] Generated suggestions for ${city}`);
      } catch (error) {
        console.error(`❌ [JOB] Failed to generate insights for ${city}:`, error);
      }
    }

    // Clean up expired insights
    await conn
      .delete(jarvisInsights)
      .where(
        sql`${jarvisInsights.expiresAt} < ${now} AND ${jarvisInsights.status} = 'active'`
      );

    console.log("✅ [JOB] Daily insights generation complete.");
  } catch (error) {
    console.error("❌ [JOB] Daily insights job failed:", error);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
