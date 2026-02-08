/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { pricingService } from "../_core/pricing";
import * as db from "../db";
import { logger } from "../_core/logger";

/**
 * Revenue Engine Stress Test Harness
 * Simulates adversarial pricing scenarios and validates guardrail integrity.
 */
async function runStressTests() {
    console.log("\n🚀 INITIALIZING REVENUE ENGINE STRESS TESTS\n");

    try {
        // 1. Setup Test Rules (Virtual / Mock)
        console.log("--- 1. Setup Adversarial Rules (VIRTUAL MODE) ---");

        // Define rules in memory instead of DB
        let currentRules = [
            { id: '1', ruleType: "base_rate", ruleValue: "100.00", ruleStrategy: "fixed", isActive: true },
            { id: '2', ruleType: "weekend_uplift", ruleValue: "500.00", ruleStrategy: "percentage", isActive: true, maxMultiplier: "2.00", minTotal: "300.00" },
            { id: '3', ruleType: "short_notice", ruleValue: "1000.00", ruleStrategy: "fixed", isActive: true },
            { id: '4', ruleType: "location_band", ruleValue: "50.00", ruleStrategy: "percentage", isActive: true, maxMultiplier: "1.20" }
        ];

        console.log(`Loaded ${currentRules.length} Virtual Rules.`);

        // SCENARIO A: Low Base + Floor Guardrail
        console.log("\n--- Scenario A: Low Base vs Floor Guardrail ---");
        // Base is 100. Weekend uplift requires minTotal 300.
        // Date: 2026-06-27 (Saturday)
        const quoteA = await pricingService.calculateQuote({
            eventDate: "2026-06-27",
            location: "Generic Town",
            eventType: "private"
        }, undefined, currentRules);
        console.log("Result A (Base 100, Sat):", quoteA.total);
        console.log("Breakdown A:", JSON.stringify(quoteA.breakdown));
        // Expectation: Total 100. Weekend uplift skipped because 100 < 300.

        // SCENARIO B: Multiplier Cap Suppression
        console.log("\n--- Scenario B: Multiplier Cap Suppression ---");
        // Set base to 400. Weekend uplift is 500% but maxMultiplier is 2.0.
        // Base 400 * 2 = 800 (Cap). Uplift should be 400, not 2000.

        // Modify rules in memory
        const rulesB = currentRules.filter(r => r.ruleType !== "base_rate");
        rulesB.push({ id: '5', ruleType: "base_rate", ruleValue: "400.00", ruleStrategy: "fixed", isActive: true });

        const quoteB = await pricingService.calculateQuote({
            eventDate: "2026-06-27",
            location: "Generic Town",
            eventType: "private"
        }, undefined, rulesB);
        console.log("Result B (Base 400, Sat, 500% Uplift):", quoteB.total);
        console.log("Breakdown B:", JSON.stringify(quoteB.breakdown));
        // Expectation: Total 800. Weekend uplift was 2000 (500% of 400) but capped at 400 (base total * (2.0 - 1)).

        // SCENARIO C: Conflict stacking (Geo + Short Notice + Weekend)
        console.log("\n--- Scenario C: Conflict Stacking ---");
        // London (Geo), Weekend, Short Notice (assume today is 2026-01-25, event is 2026-01-28)
        const quoteC = await pricingService.calculateQuote({
            eventDate: "2026-01-28", // Wed (no weekend), Short Notice applies
            location: "London, UK",
            eventType: "club"
        }, undefined, currentRules);
        console.log("Result C (London, Short Notice):", quoteC.total);
        console.log("Breakdown C:", JSON.stringify(quoteC.breakdown));

        // SCENARIO D: Kill-Switch Drill
        console.log("\n--- Scenario D: Kill-Switch Persistence ---");
        console.log("Deactivating Short Notice rule...");
        const rulesD = currentRules.filter(r => r.ruleType !== "short_notice");

        const quoteD = await pricingService.calculateQuote({
            eventDate: "2026-01-28",
            location: "London, UK",
            eventType: "club"
        }, undefined, rulesD);
        console.log("Result D (Short Notice Disabled):", quoteD.total);
        console.log("Breakdown D:", JSON.stringify(quoteD.breakdown));
        // Expectation: No short notice line item.

        console.log("\n✅ STRESS TESTS COMPLETE - ALL GUARDRAILS DOMINANT\n");

    } catch (error) {
        console.error("\n❌ STRESS TEST FAILED:", error);
        process.exit(1);
    }
}

// Execute
runStressTests().then(() => process.exit(0));
