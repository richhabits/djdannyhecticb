import { getDb } from "./server/db";
import { featureFlags } from "./drizzle/schema";

async function seed() {
    const db = await getDb();
    if (!db) return;
    
    await db.insert(featureFlags).values([
        { key: "auto_supporter_elevation", isEnabled: true, description: "Auto promote users based on weekly score" },
        { key: "connector_sync_enabled", isEnabled: true, description: "Allow ingestion jobs to run" },
        { key: "alerts_enabled", isEnabled: true, description: "Display live intel alerts to users" },
        { key: "admin_heatmap_enabled", isEnabled: true, description: "Enable admin analytics visualization" }
    ]).onDuplicateKeyUpdate({ set: { isEnabled: true } });
    
    console.log("✅ Feature flags seeded");
    process.exit(0);
}

seed();
