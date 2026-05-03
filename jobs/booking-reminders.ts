/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { getDb } from "../server/db";
import { eventBookings } from "../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Cron Job: booking-reminders
 * Runs daily at 10:00 AM UTC
 * Responsibility: Send reminder emails for confirmed bookings within 7 days
 */
async function run() {
  console.log("🔔 [JOB] Starting booking reminder emails...");

  try {
    const conn = await getDb();
    if (!conn) throw new Error("Database connection failed");

    // Find confirmed bookings within 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const upcomingBookings = await conn
      .select()
      .from(eventBookings)
      .where(
        sql`${eventBookings.status} = 'confirmed'
        AND ${eventBookings.eventDate} >= ${now}
        AND ${eventBookings.eventDate} <= ${sevenDaysFromNow}`
      )
      .limit(100);

    console.log(
      `📅 [JOB] Found ${upcomingBookings.length} upcoming bookings to remind...`
    );

    for (const booking of upcomingBookings) {
      try {
        // TODO: When email provider is configured:
        // 1. Fetch event details
        // 2. Generate reminder email (date, venue, contact info)
        // 3. Send via configured email provider
        // 4. Update booking notes with reminder_sent timestamp

        console.log(
          `📨 Would send reminder for booking ${booking.id} on ${booking.eventDate}`
        );

        // For now, just log what we would do
      } catch (error) {
        console.error(`❌ [JOB] Failed to send reminder for booking ${booking.id}:`, error);
      }
    }

    console.log("✅ [JOB] Booking reminders complete.");
  } catch (error) {
    console.error("❌ [JOB] Booking reminders job failed:", error);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
