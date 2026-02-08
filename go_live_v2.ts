import * as db from "./server/db";
import * as schema from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function run() {
    try {
        const conn = await db.getDb();
        if (!conn) {
            console.error("DB connection failed");
            process.exit(1);
        }

        console.log("🚀 [GO-LIVE] Initializing Hectic Empire v2...");

        // 1. Feature Flags
        const flags = [
            { key: "alerts_enabled", isEnabled: true, description: "Global alert broadcast" },
            { key: "connector_sync_enabled", isEnabled: true, description: "Intelligence ingestion flow" },
            { key: "auto_supporter_elevation", isEnabled: true, description: "Meritocracy engine" },
            { key: "admin_heatmap_enabled", isEnabled: true, description: "Operational intelligence" }
        ];
        for (const flag of flags) {
            await conn.insert(schema.featureFlags).values(flag).onDuplicateKeyUpdate({ set: { isEnabled: true } });
        }

        // 2. City Lanes
        const lanes = [
            { city: "London", genre: "DnB", laneName: "London DnB", isActive: true },
            { city: "Manchester", genre: "Techno", laneName: "Manchester Techno", isActive: true },
            { city: "Birmingham", genre: "UKG", laneName: "Birmingham UKG", isActive: true }
        ];
        for (const lane of lanes) {
            await conn.insert(schema.cityLanes).values(lane).onDuplicateKeyUpdate({ set: { isActive: true } });
        }

        // 3. Connectors
        const connectorConfigs = [
            { name: "Ticketmaster UK", type: "ticketmaster", isEnabled: true, config: JSON.stringify({ endpoint: "api.ticketmaster.com" }) },
            { name: "Skiddle Events", type: "skiddle", isEnabled: true, config: JSON.stringify({ endpoint: "api.skiddle.com" }) },
            { name: "RA Feeds", type: "ra", isEnabled: true, config: JSON.stringify({ endpoint: "ra.co/feeds" }) }
        ];
        for (const connector of connectorConfigs) {
            await conn.insert(schema.connectors).values(connector).onDuplicateKeyUpdate({ set: { isEnabled: true } });
        }

        console.log("✅ Network nodes initialized.");
        
        // 4. Initial Sync
        const { IngestionEngine } = await import("./server/_core/ingestionEngine");
        await IngestionEngine.syncAllLanes();
        console.log("✅ Initial synchronization complete.");

        process.exit(0);
    } catch (e) {
        console.error("FAILED:", e);
        process.exit(1);
    }
}

run();
