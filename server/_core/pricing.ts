/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import * as db from "../db";
import { parseISO, differenceInDays, getDay } from "date-fns";
import { logger } from "./logger";

/**
 * Pricing Service
 * High-performance quote engine for dynamic revenue optimization
 */
export class PricingService {
    /**
     * Calculates a total quote and required deposit based on active pricing rules
     */
    async calculateQuote(bookingData: { eventDate: string; location: string; eventType: string }, bookingId?: number, overrideRules?: any[]) {
        // 0. Governance Fail-Safe (Skip if testing)
        if (!overrideRules) {
            const { governanceService } = await import("./governance");
            if (!(await governanceService.isRevenueOperational())) {
                logger.error("[PricingService] Quote generation blocked: Revenue Kill-Switch is ACTIVE.");
                throw new Error("Quote generation is temporarily suspended for maintenance. Please check back shortly.");
            }
        }

        const rules = overrideRules || await db.getPricingRules();
        let total = 0;
        let baseRate = 0;
        const breakdown: Array<{ label: string; amount: number }> = [];
        const rulesApplied: string[] = [];

        // 1. Base Rate Application
        const baseRule = rules.find((r: any) => r.ruleType === "base_rate");
        if (baseRule) {
            baseRate = parseFloat(String(baseRule.ruleValue));
            total += baseRate;
            breakdown.push({ label: "Performance Fee", amount: baseRate });
            rulesApplied.push(`base_rate:${baseRule.id || 'mock'}`);
        } else {
            baseRate = 350;
            total = 350;
            breakdown.push({ label: "Standard Rate", amount: 350 });
            rulesApplied.push("base_rate:default");
        }

        const applyDynamicRule = (rule: any, label: string) => {
            // Guardrail: Minimum total required for rule to apply
            if (rule.minTotal && total < parseFloat(String(rule.minTotal))) {
                logger.info(`[PricingService] Rule ${rule.ruleType} skipped: total below floor (£${rule.minTotal})`);
                return;
            }

            let amount = this.applyRule(rule, total);

            // Guardrail: Cap for percentage rules (maxMultiplier relative to current total)
            if (rule.ruleStrategy === "percentage" && rule.maxMultiplier) {
                const cap = total * (parseFloat(String(rule.maxMultiplier)) - 1);
                if (amount > cap) {
                    logger.warn(`[PricingService] Rule ${rule.ruleType} capped at ${cap} (was ${amount})`);
                    amount = cap;
                }
            }

            total += amount;
            breakdown.push({ label, amount });
            rulesApplied.push(`${rule.ruleType}:${rule.id || 'mock'}`);
        };

        // 2. Dynamic Weekend Uplift
        const eventDate = parseISO(bookingData.eventDate);
        const dayOfWeek = getDay(eventDate);
        if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
            const weekendRule = rules.find((r: any) => r.ruleType === "weekend_uplift");
            if (weekendRule) {
                applyDynamicRule(weekendRule, "Weekend/Peak Date Uplift");
            }
        }

        // 3. Rapid Deployment Premium
        const daysUntilEvent = differenceInDays(eventDate, new Date());
        const shortNoticeRule = rules.find((r: any) => r.ruleType === "short_notice");
        if (shortNoticeRule && daysUntilEvent < 14) {
            applyDynamicRule(shortNoticeRule, "Short Notice Premium (<14 days)");
        }

        // 4. Geographic Tiering
        const locationRule = rules.find((r: any) => r.ruleType === "location_band");
        if (locationRule && bookingData.location) {
            const city = bookingData.location.split(",")[0].trim().toLowerCase();
            const tier1Cities = ["london", "manchester", "birmingham", "dubai", "ibiza"];
            if (tier1Cities.includes(city)) {
                applyDynamicRule(locationRule, `Premium Location Uplift (${city.toUpperCase()})`);
            }
        }

        // 5. Automated Deposit Requirement
        let depositPercent = 25;
        let expiryHours = 24;

        if (!overrideRules) {
            const depositPercentSetting = await db.getEmpireSetting("booking_deposit_percent");
            depositPercent = depositPercentSetting ? parseFloat(depositPercentSetting.value) : 25;

            const expirySetting = await db.getEmpireSetting("booking_deposit_expiry_hours");
            expiryHours = expirySetting ? parseInt(expirySetting.value) : 24;
        }

        const depositAmount = Math.round((total * depositPercent) / 100);
        const depositExpiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

        let auditLogId = null;
        if (!overrideRules) {
            // Revenue Ops Audit Logging (Immutable)
            auditLogId = await db.createPricingAuditLog({
                bookingId: bookingId || null,
                baseRate: baseRate.toString(),
                finalTotal: total.toString(),
                rulesApplied: JSON.stringify(rulesApplied),
                breakdown: JSON.stringify(breakdown),
                geoContext: bookingData.location ? bookingData.location.split(",")[0].trim().toUpperCase() : "UNKNOWN",
                conversionStatus: "quote_served"
            }).catch(err => {
                logger.error("[PricingService] Failed to log audit:", err);
                return null;
            });
        }

        logger.info(`[PricingService] Quote finalized: £${total} (Rules: ${rulesApplied.length})`);

        return {
            total,
            depositAmount,
            breakdown,
            depositExpiresAt,
            currency: "GBP",
            auditLogId
        };
    }

    private applyRule(rule: any, currentTotal: number): number {
        const value = parseFloat(String(rule.ruleValue));
        if (rule.ruleStrategy === "percentage") {
            return Math.round((currentTotal * value) / 100);
        }
        return value;
    }
}

export const pricingService = new PricingService();
