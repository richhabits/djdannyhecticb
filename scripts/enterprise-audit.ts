/**
 * HECTIC ENTERPRISE AUDIT SCRIPT
 * Protocol: P1-AUDIT-001
 * Responsibility: Prove technical gates for Phase D Go-Live.
 */

import "dotenv/config";
import * as db from "../server/db";
import { generateRaveIntel } from "../server/_core/raveIntelGenerator";
import { IngestionEngine } from "../server/_core/ingestionEngine";
import { observability } from "../server/_core/observability";
import * as schema from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function audit() {
    console.log("🕵️ [AUDIT] Starting Enterprise Go-Live Audit...");
    const results: any = {};

    // Gated Check: Environmental Lock
    results.environmentalLoad = !!process.env.DATABASE_URL;

    // A2: Kill-Switch Test
    console.log("🛠️  [A2] Testing Kill-Switch Response...");
    const dbConn = await db.getDb();
    if (!dbConn) throw new Error("DB offline");

    await dbConn.update(schema.featureFlags).set({ isEnabled: false }).where(eq(schema.featureFlags.key, "alerts_enabled"));
    const offState = await generateRaveIntel();
    results.killSwitchOffWork = offState.length === 0;

    await dbConn.update(schema.featureFlags).set({ isEnabled: true }).where(eq(schema.featureFlags.key, "alerts_enabled"));
    const onState = await generateRaveIntel({ isSupporter: true });
    results.killSwitchOnWork = onState.length > 0;

    // B1: Source Reality
    console.log("📡 [B1] Verifying Data Provenance...");
    const eliteState = await generateRaveIntel({ isSupporter: true });
    const sample = eliteState[0];
    results.sourceProvenanceValid = !!(sample && sample.source && sample.sourceUrl && sample.confidence);

    // C1: Duplicate Suppression
    console.log("🧬 [C1] Verifying Duplicate Suppression Logic...");
    const mockItems: any = [
        { venue: "WHP", date: "2026-02-15", sourceName: "RA", city: "Manchester" },
        { venue: "WHP", date: "2026-02-15", sourceName: "Skiddle", city: "Manchester" }
    ];
    const consolidated = (IngestionEngine as any).consolidateItems(mockItems);
    results.duplicateSuppression = consolidated.length === 1 && consolidated[0].sourceCount === 2;

    // C2: Supporter-First Enforcement
    console.log("🎖️  [C2] Verifying Supporter/Public Tier Separation...");
    // Mock a very recent alert (Force freshness to < 90s)
    await dbConn.update(schema.intelItems).set({ createdAt: new Date() });

    const recentItems = await generateRaveIntel({ isSupporter: true });
    const publicItems = await generateRaveIntel({ isSupporter: false });

    // Public shouldn't see alerts younger than 90s (unless they are older verified ones)
    // We already seeded items with 'new Date()', so they are definitely < 90s old.
    results.tierSeparationEnforced = publicItems.length < recentItems.length;

    // E: Observability Check
    console.log("👁️  [E] Verifying Real-Time Monitoring Hooks...");
    const metrics = observability.getMetrics();
    results.monitoringActive = metrics.network.avgConfidence > 0 && metrics.network.integrityShield === 'active';

    console.log("\n--- [AUDIT RESULTS] ---");
    console.log(JSON.stringify(results, null, 2));

    if (Object.values(results).every(v => v === true)) {
        console.log("\n✅ [STATUS] ALL GATES PASSED. PLATFORM IS AUTHORITATIVE.");
    } else {
        console.log("\n❌ [STATUS] AUDIT FAILED. RECTIFICATION REQUIRED.");
    }
    process.exit(0);
}

audit();
