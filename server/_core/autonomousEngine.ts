/**
 * HECTIC EMPIRE: AUTONOMOUS OPERATIONS ENGINE
 * Responsibility: Monitor, Verify, Score, Decide, Act, Clean, Report.
 */

import { observability } from "./observability";
import * as db from "../db";
import * as schema from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { execSync } from "child_process";

export type SystemState = 'GREEN' | 'AMBER' | 'RED';

class AutonomousEngine {
    private state: SystemState = 'AMBER';
    private greenStartTime: number | null = null;
    private isLive = false;

    async runCycle() {
        console.log("📡 [SENTRY] Starting Autonomous Cycle...");

        try {
            // 1. MONITOR & VERIFY
            const checks = await this.performChecks();

            // 2. SCORE
            this.state = this.calculateState(checks);

            // 3. DECIDE & ACT
            await this.executeDecisions();

            // 4. HYGIENE
            await this.performHygiene();

            // 5. REPORT
            await this.logState(checks);

            console.log(`✅ [SENTRY] Cycle Complete. State: ${this.state} | Live: ${this.isLive}`);
        } catch (error) {
            console.error("❌ [SENTRY] Cycle Failed:", error);
            this.state = 'RED';
            await this.enforceKillSwitch("SYSTEM_CRASH");
        }
    }

    private async performChecks() {
        const metrics = observability.getMetrics();
        const dbConn = await db.getDb();

        return {
            dbAlive: !!dbConn,
            connectivity: metrics.network.avgConfidence >= 0.95,
            storageOk: metrics.storage.diskUsagePercent < 80,
            syncDriftOk: metrics.network.syncDriftMs < 30000,
            integrityShield: metrics.network.integrityShield === 'active'
        };
    }

    private calculateState(checks: any): SystemState {
        if (!checks.dbAlive || !checks.integrityShield || !checks.connectivity) return 'RED';
        if (!checks.storageOk || !checks.syncDriftOk) return 'AMBER';
        return 'GREEN';
    }

    private async executeDecisions() {
        if (this.state === 'RED') {
            await this.enforceKillSwitch("AUTO_SENTINEL_RED_ALERT");
        }

        if (this.state === 'GREEN') {
            if (!this.greenStartTime) this.greenStartTime = Date.now();

            // Auto-Go-Live: 24h of GREEN (for demo, 5 mins)
            const greenDuration = Date.now() - this.greenStartTime;
            const targetDuration = process.env.NODE_ENV === 'production' ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000;

            if (greenDuration >= targetDuration && !this.isLive) {
                console.log("🚀 [SENTRY] AUTO-GO-LIVE THRESHOLD REACHED.");
                this.isLive = true;
            }
        } else {
            this.greenStartTime = null;
        }
    }

    private async enforceKillSwitch(reason: string) {
        const dbConn = await db.getDb();
        if (!dbConn) return;

        console.warn(`🛑 [SENTRY] ACTIVATING KILL-SWITCH: ${reason}`);
        await dbConn.update(schema.featureFlags)
            .set({ isEnabled: false })
            .where(eq(schema.featureFlags.key, "alerts_enabled"));

        await db.createGovernanceLog({
            actorType: "system",
            action: "AUTO_KILL_SWITCH",
            reason,
            payload: JSON.stringify({ state: this.state, metrics: observability.getMetrics() })
        });
    }

    private async performHygiene() {
        // Log rotation / Cleanup
        try {
            // Prune any dangling docker images or temp files if on server
            // For now, just a placeholder for the logic
            if (process.env.NODE_ENV === 'production') {
                execSync("find /tmp -mtime +1 -type f -delete");
            }
        } catch (e) {
            console.warn("⚠️ [SENTRY] Hygiene task failed:", e);
        }
    }

    private async logState(checks: any) {
        // Internal state reporting
        // In a real app, this would write to a 'system_health' table
    }

    getStatus() {
        return {
            state: this.state,
            isLive: this.isLive,
            greenSince: this.greenStartTime,
            metrics: observability.getMetrics()
        };
    }
}

export const autonomousEngine = new AutonomousEngine();
