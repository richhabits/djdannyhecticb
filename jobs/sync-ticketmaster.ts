/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import "dotenv/config";
import { syncTicketmasterEvents } from "../server/_core/ukEventsService";

/**
 * Worker: sync-ticketmaster
 * Responsibility: Sync events from Ticketmaster Discovery API
 */
async function run() {
    console.log("🎟️ [JOB] Starting Ticketmaster sync...");

    try {
        const result = await syncTicketmasterEvents();

        if (result.success) {
            console.log(`✅ [JOB] Sync complete: ${result.eventsAdded} added, ${result.eventsUpdated} updated`);
            process.exit(0);
        } else {
            console.error("❌ [JOB] Sync failed:", result.error);
            process.exit(1);
        }
    } catch (error: any) {
        console.error("❌ [JOB] Ticketmaster sync failed:", error.message);
        process.exit(1);
    }
}

run();
