/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { getDb } from "../server/db";
import { hecticLeads } from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Cron Job: hectic-lead-followup
 * Runs daily at 9:00 AM UTC
 * Responsibility: Send follow-up emails to new booking leads from Hectic AI conversations
 */
async function run() {
  console.log("📧 [JOB] Starting Hectic lead follow-up...");

  try {
    const conn = await getDb();
    if (!conn) throw new Error("Database connection failed");

    // Get leads from last 24h that haven't been followed up yet
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const today = new Date();

    const newLeads = await conn
      .select()
      .from(hecticLeads)
      .where(
        sql`${hecticLeads.status} = 'new'
        AND ${hecticLeads.createdAt} >= ${oneDayAgo}
        AND ${hecticLeads.followedUpAt} IS NULL
        AND ${hecticLeads.email} IS NOT NULL`
      )
      .limit(100);

    console.log(`📊 [JOB] Found ${newLeads.length} leads to follow up with...`);

    for (const lead of newLeads) {
      try {
        // TODO: When email provider is configured:
        // 1. Generate personalized follow-up email via Jarvis AI
        // 2. Send via configured email provider (SendGrid, AWS SES, etc)
        // 3. Update lead.followedUpAt

        console.log(`📨 Would follow up with: ${lead.email} (${lead.name})`);

        // For now, just mark as contacted
        await conn
          .update(hecticLeads)
          .set({
            status: "contacted",
            followedUpAt: today,
          })
          .where(sql`${hecticLeads.id} = ${lead.id}`);
      } catch (error) {
        console.error(`❌ [JOB] Failed to follow up with ${lead.email}:`, error);
      }
    }

    console.log("✅ [JOB] Lead follow-up complete.");
  } catch (error) {
    console.error("❌ [JOB] Lead follow-up job failed:", error);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
