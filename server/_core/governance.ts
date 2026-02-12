/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import * as db from "../db";
import { logger } from "./logger";
import { appEvents, EVENTS } from "./events";

/**
 * Governance Service
 * High-integrity control layer for Revenue Ops and System Safety.
 */
export class GovernanceService {
    /**
     * Emergency Kill-Switch for the Revenue Engine
     * Prevents any new quotes or deposit intents.
     */
    async toggleRevenueKillSwitch(active: boolean, actorId: number, reason: string) {
        logger.warn(`[Governance] Revenue Kill-Switch ${active ? 'ACTIVATED' : 'DEACTIVATED'} by Actor ${actorId}. Reason: ${reason}`);

        await db.setEmpireSetting("revenue_kill_switch", active ? "true" : "false", `Revenue Kill-Switch: ${reason}`, actorId);

        await db.createGovernanceLog({
            action: active ? "REV_KILL_SWITCH_ACTIVATE" : "REV_KILL_SWITCH_DEACTIVATE",
            actorType: 'admin',
            actorId,
            reason,
            snapshot: JSON.stringify({ timestamp: new Date().toISOString(), systemStatus: active ? "Locked" : "Operational" })
        });

        if (active) {
            await db.createRevenueIncident({
                type: "manual_override",
                severity: "high",
                message: `Revenue Engine locked by admin: ${reason}`,
                status: "active"
            });
        }

        return { success: true, status: active };
    }

    /**
     * Automated Deposit Hygiene (Cron-compatible)
     * Scans for expired pending deposits and releases inventory.
     */
    async runDepositHygiene() {
        logger.info("[Governance] Starting Automated Deposit Hygiene scan...");

        const expiredCount = await db.expirePendingDeposits();

        if (expiredCount > 0) {
            logger.warn(`[Governance] Hygiene scan completed. Released ${expiredCount} expired booking dates.`);

            await db.createGovernanceLog({
                action: "DEPOSIT_HYGIENE_CLEANUP",
                actorType: 'system',
                reason: "System Scheduled TTL Enforcement",
                snapshot: JSON.stringify({ releasedInventoryCount: expiredCount })
            });

            // Emit event for real-time admin notification
            appEvents.emit(EVENTS.NOTIFICATION_CREATED, {
                type: "governance_cleanup",
                message: `Released ${expiredCount} expired booking dates to public inventory.`
            });
        } else {
            logger.info("[Governance] Hygiene scan: No expired deposits found.");
        }

        return { expiredCount };
    }

    /**
     * Checks if Revenue Ops are permitted (Kill-Switch check)
     */
    async isRevenueOperational() {
        const killSwitch = await db.getEmpireSetting("revenue_kill_switch");
        return killSwitch?.value !== "true";
    }

    /**
     * Detect and log pricing drift or anomalies
     */
    async logPricingAnomaly(message: string, severity: "low" | "medium" | "high" | "critical", metadata: any) {
        logger.error(`[Governance] PRICING ANOMALY DETECTED: ${message}`);

        await db.createRevenueIncident({
            type: "pricing_drift",
            severity,
            message,
            impactedQuotes: JSON.stringify(metadata),
            status: "active"
        });
    }
}

export const governanceService = new GovernanceService();
