import { getDb } from "./server/db";
import { featureFlags, connectors, cityLanes } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function run() {
    const db = await getDb();
    if (!db) return;

    console.log("🚀 [GO-LIVE] Initialising Hectic Empire Protocols...");

    // 1. Feature Flags (Switch ON)
    const flags = [
        { key: "alerts_enabled", isEnabled: true, description: "Global alert broadcast" },
        { key: "connector_sync_enabled", isEnabled: true, description: "Intelligence ingestion flow" },
        { key: "auto_supporter_elevation", isEnabled: true, description: "Meritocracy engine" },
        { key: "admin_heatmap_enabled", isEnabled: true, description: "Operational intelligence" }
    ];

    for (const flag of flags) {
        await db.insert(featureFlags).values(flag).onDuplicateKeyUpdate({ set: { isEnabled: true } });
    }
    console.log("✅ Feature flags active.");

    // 2. City Lanes (Manchester Activation)
    const lanes = [
        { city: "London", genre: "DnB", laneName: "London DnB", isActive: true },
        { city: "Manchester", genre: "Techno", laneName: "Manchester Techno", isActive: true },
        { city: "Birmingham", genre: "UKG", laneName: "Birmingham UKG", isActive: true }
    ];

    for (const lane of lanes) {
        await db.insert(cityLanes).values(lane).onDuplicateKeyUpdate({ set: { isActive: true } });
    }
    console.log("✅ Regional lanes online.");

    // 3. Connectors (Authority Alignment)
    const connectorConfigs = [
        { name: "Ticketmaster UK", type: "ticketmaster", isEnabled: true, config: JSON.stringify({ endpoint: "api.ticketmaster.com" }) },
        { name: "Skiddle Events", type: "skiddle", isEnabled: true, config: JSON.stringify({ endpoint: "api.skiddle.com" }) },
        { name: "RA Feeds", type: "ra", isEnabled: true, config: JSON.stringify({ endpoint: "ra.co/feeds" }) }
    ];

    for (const conn of connectorConfigs) {
        await db.insert(connectors).values(conn).onDuplicateKeyUpdate({ set: { isEnabled: true } });
    }
    console.log("✅ Intelligence connectors enabled.");

    console.log("📡 [GO-LIVE] Hectic Radio is now broadcasting authority.");
    process.exit(0);
}

run();
