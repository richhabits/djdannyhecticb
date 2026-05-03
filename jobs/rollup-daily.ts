/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { getDb } from "../server/db";
import { sql } from "drizzle-orm";
import { userSignalMetrics } from "../drizzle/schema";

/**
 * Worker: rollup-daily
 * Responsibility: Aggregate hourly metrics into daily summaries
 */
async function run() {
    console.log("📊 [JOB] Starting daily analytics rollup...");

    try {
        const conn = await getDb();
        if (!conn) return;

        // Aggregate yesterday's data for daily summary
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const startOfDay = new Date(yesterday.toISOString().split('T')[0]);
        const endOfDay = new Date(today.toISOString().split('T')[0]);

        const stats = await conn.select({
            city: userSignalMetrics.city,
            category: userSignalMetrics.category,
            views: sql<number>`SUM(CASE WHEN ${userSignalMetrics.metricType} = 'view' THEN 1 ELSE 0 END)`,
            saves: sql<number>`SUM(CASE WHEN ${userSignalMetrics.metricType} = 'save' THEN 1 ELSE 0 END)`,
            engagement: sql<number>`COUNT(*)`,
        })
            .from(userSignalMetrics)
            .where(sql`${userSignalMetrics.createdAt} >= ${startOfDay} AND ${userSignalMetrics.createdAt} < ${endOfDay}`)
            .groupBy(userSignalMetrics.city, userSignalMetrics.category);

        for (const stat of stats) {
            if (!stat.city) continue;

            // Map city to lane slug for daily aggregation
            const laneId = stat.city.toLowerCase();

            await db.incrementLaneRollup(laneId, yesterday, {
                views: Number(stat.views || 0),
                saves: Number(stat.saves || 0),
                engagement: Number(stat.engagement || 0)
            });
        }

        console.log("✅ [JOB] Daily rollup complete.");
    } catch (error) {
        console.error("❌ [JOB] Daily rollup failed:", error);
    }
}

run().then(() => process.exit(0));
