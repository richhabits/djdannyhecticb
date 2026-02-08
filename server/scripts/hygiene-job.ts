/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { governanceService } from "../server/_core/governance";
import { logger } from "../server/_core/logger";

async function main() {
    logger.info("[Cron] Starting Governance Hygiene Job...");
    try {
        const result = await governanceService.runDepositHygiene();
        logger.info(`[Cron] Success. Released ${result.expiredCount} deposits.`);
        process.exit(0);
    } catch (error) {
        logger.error("[Cron] Hygiene Job Failed:", error);
        process.exit(1);
    }
}

main();
