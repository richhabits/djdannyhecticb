/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import * as db from "../server/db";
import { users, userSignalMetrics, invites } from "../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

/**
 * Worker: supporter-score-weekly
 * Responsibility: Reward real community contribution with elite status.
 */
async function run() {
    console.log("🎖️ [JOB] Starting weekly supporter scoring (Phase D Tuning)...");

    const isEnabled = await db.checkFeatureFlag("auto_supporter_elevation");
    if (!isEnabled) {
        console.log("⚠️ [JOB] Auto elevation disabled.");
        return;
    }

    try {
        const dbConn = await db.getDb();
        if (!dbConn) return;

        const allUsers = await dbConn.select().from(users);
        const now = new Date();
        const weekStart = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

        for (const user of allUsers) {
            // Eligibility check: account age >= 14 days
            const accountAgeDays = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (accountAgeDays < 14) continue;

            let score = 0;
            const breakdown: any = {};

            // D2 Directive Weighting:
            // Invite Redemption: 40% (Target: 100 points @ 5 redemptions = 20pts each)
            // Signal Saves: 30% (Target: 75 points @ 15 saves = 5pts each)
            // Lane Activity: 20% (Target: 50 points @ 5 active days = 10pts each)
            // Longevity: 10% (Target: 25 points @ 5 weeks = 5pts/week)

            // 1. Invite Redemptions (40%)
            const [redemptions] = await dbConn.select({ count: sql<number>`count(*)` })
                .from(invites)
                .where(and(eq(invites.inviterId, user.id), sql`${invites.createdAt} >= ${weekStart}`));

            const redemptionPoints = (redemptions?.count || 0) * 20;
            score += redemptionPoints;
            breakdown.invite_redemption = redemptionPoints;

            // 2. Signal Saves (30%)
            const [saves] = await dbConn.select({ count: sql<number>`count(*)` })
                .from(userSignalMetrics)
                .where(and(eq(userSignalMetrics.userId, user.id), eq(userSignalMetrics.metricType, 'save'), sql`${userSignalMetrics.createdAt} >= ${weekStart}`));

            const savePoints = (saves?.count || 0) * 5;
            score += savePoints;
            breakdown.signal_saves = savePoints;

            // 3. Lane Activity (20%)
            const [activeDays] = await dbConn.select({ count: sql<number>`count(distinct date(${userSignalMetrics.createdAt}))` })
                .from(userSignalMetrics)
                .where(and(eq(userSignalMetrics.userId, user.id), sql`${userSignalMetrics.createdAt} >= ${weekStart}`));

            const activityPoints = (activeDays?.count || 0) * 10;
            score += activityPoints;
            breakdown.lane_activity = activityPoints;

            // 4. Longevity (10%)
            const weeksActive = Math.floor(accountAgeDays / 7);
            const longevityPoints = Math.min(25, weeksActive * 5);
            score += longevityPoints;
            breakdown.longevity = longevityPoints;

            // Record score
            await db.recordSupporterScore(user.id, weekStart, score, breakdown);

            // Promotion Logic: 2-week rolling confirmation (Score >= 250 for two consecutive weeks)
            if (score >= 250 && !user.isSupporter) {
                // Check last week's score
                const lastWeeksScores = await dbConn.select()
                    .from(supporterScores)
                    .where(and(eq(supporterScores.userId, user.id), sql`${supporterScores.weekStart} >= ${twoWeeksAgo}`, sql`${supporterScores.weekStart} < ${weekStart}`))
                    .limit(1);

                if (lastWeeksScores.length > 0 && lastWeeksScores[0].score >= 250) {
                    await db.promoteToSupporter(user.id, `2-week rolling confirmation reached. Latest score: ${score}.`);
                    console.log(`🚀 [MERITOCRACY] User ${user.id} promoted.`);
                } else {
                    console.log(`⏳ [MERITOCRACY] User ${user.id} hit threshold, awaiting rolling confirmation.`);
                }
            }

            // Inactivity Decay: Demote if inactive for 30 days
            if (user.isSupporter) {
                const [lastSeen] = await dbConn.select({ date: sql<string>`max(${userSignalMetrics.createdAt})` })
                    .from(userSignalMetrics)
                    .where(eq(userSignalMetrics.userId, user.id));

                const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
                if (lastSeen?.date && new Date(lastSeen.date) < thirtyDaysAgo) {
                    // Demote logic (reuse governance log)
                    await dbConn.update(users).set({ isSupporter: false }).where(eq(users.id, user.id));
                    await db.createGovernanceLog({
                        actorType: 'system',
                        action: 'supporter_demote',
                        userId: user.id,
                        reason: 'Inactivity decay (No activity in 30 days).'
                    });
                    console.log(`📉 [MERITOCRACY] User ${user.id} demoted due to inactivity.`);
                }
            }
        }

        console.log("✅ [JOB] Weekly meritocracy tuning complete.");
    } catch (error) {
        console.error("❌ [JOB] Weekly meritocracy failed:", error);
    }
}

run().then(() => process.exit(0));
