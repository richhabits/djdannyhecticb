/**
 * Event Sync Cron Job
 * Automatically syncs UK events from external APIs
 * 
 * Run this with: npx tsx server/_core/eventSyncCron.ts
 * Or schedule via cron/PM2/systemd
 */

import 'dotenv/config';
import { syncTicketmasterEvents } from './ukEventsService';

async function runSync() {
    console.log('[EventSync] Starting automated UK events sync...');
    console.log('[EventSync] Timestamp:', new Date().toISOString());

    try {
        // Sync Ticketmaster events
        console.log('[EventSync] Syncing Ticketmaster events...');
        const ticketmasterResult = await syncTicketmasterEvents();

        if (ticketmasterResult.success) {
            console.log(`[EventSync] Ticketmaster sync complete:`);
            console.log(`  - Events found: ${ticketmasterResult.eventsFound}`);
            console.log(`  - Events added: ${ticketmasterResult.eventsAdded}`);
            console.log(`  - Events updated: ${ticketmasterResult.eventsUpdated}`);
        } else {
            console.error('[EventSync] Ticketmaster sync failed:', ticketmasterResult.error);
        }

        // Future: Add more sources here
        // - StubHub sync
        // - Eventbrite sync
        // - Skiddle sync
        // - DICE sync

        console.log('[EventSync] All syncs complete!');

    } catch (error) {
        console.error('[EventSync] Fatal error during sync:', error);
        process.exit(1);
    }
}

import { fileURLToPath } from 'url';
import path from 'path';

// Check if running directly
const __filename = fileURLToPath(import.meta.url);
const entryFile = process.argv[1];

if (entryFile === __filename) {
    runSync()
        .then(() => {
            console.log('[EventSync] Finished successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('[EventSync] Failed:', error);
            process.exit(1);
        });
}

export { runSync };
