/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import * as db from "../server/db";
import { sql } from "drizzle-orm";
import { userSignalMetrics } from "../drizzle/schema";

/**
 * Worker: rollup-hourly
 * Responsibility: Populate lane_daily_rollups from real-time behavioral logs.
 */
async function run() {
    console.log("📊 [JOB] Starting hourly analytics rollup...");

    try {
        const conn = await db.getDb();
        if (!conn) return;

        // Fetch recent metrics that haven't been rolled up yet
        // In a real system, we'd track 'last rolled up id'
        // For this implementation, we aggregate the current day's data
        const today = new Date();
        const startOfDay = new Date(today.toISOString().split('T')[0]);

        const stats = await conn.select({
            city: userSignalMetrics.city,
            category: userSignalMetrics.category,
            views: sql<number>`SUM(CASE WHEN ${userSignalMetrics.metricType} = 'view' THEN 1 ELSE 0 END)`,
            saves: sql<number>`SUM(CASE WHEN ${userSignalMetrics.metricType} = 'save' THEN 1 ELSE 0 END)`,
        })
            .from(userSignalMetrics)
            .where(sql`${userSignalMetrics.createdAt} >= ${startOfDay}`)
            .groupBy(userSignalMetrics.city, userSignalMetrics.category);

        for (const stat of stats) {
            if (!stat.city) continue;

            // Map city to lane slug (e.g. "London" -> "london")
            const laneId = stat.city.toLowerCase();

            await db.incrementLaneRollup(laneId, today, {
                views: Number(stat.views || 0),
                saves: Number(stat.saves || 0)
            });
        }

        console.log("✅ [JOB] Hourly rollup complete.");
    } catch (error) {
        console.error("❌ [JOB] Hourly rollup failed:", error);
    }
}

run().then(() => process.exit(0));
