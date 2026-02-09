/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import * as db from "../db";
import { pricingService } from "./pricing";
import { logger } from "./logger";

/**
 * Outbound Lead Engine Service
 * Implements signal-driven scoring and quote-first outreach logic.
 */
export class OutboundService {
    /**
     * Score a lead based on deterministic revenue signals
     */
    async scoreLead(leadId: number) {
        const lead = await db.getLeadWithInteractions(leadId);
        if (!lead) return 0;

        let score = 0;

        // 1. Geography Signal
        const tier1Cities = ["LONDON", "IBIZA", "DUBAI", "MANCHESTER", "MIAMI"];
        if (lead.geoContext && tier1Cities.includes(lead.geoContext.toUpperCase())) {
            score += 40;
        }

        // 2. Date Signal (Proximity + Availability)
        if (lead.targetDate) {
            const confirmedDates = await db.getConfirmedBookingDates();
            if (confirmedDates.includes(lead.targetDate)) {
                score -= 100; // Conflict - low priority
            } else {
                score += 30;
            }
        }

        // 3. Source Signal
        if (lead.source === "referral") score += 50;
        if (lead.source === "scraping") score += 10;
        if (lead.source === "social") score += 20;

        // 4. Organisation Signal
        if (lead.organisation && (lead.organisation.toLowerCase().includes("ltd") || lead.organisation.toLowerCase().includes("agency"))) {
            score += 20;
        }

        await db.updateLeadScore(leadId, score);
        return score;
    }

    /**
     * Generate a Quote-First outreach package
     */
    async generateOutreach(leadId: number) {
        const lead = await db.getLeadWithInteractions(leadId);
        if (!lead) throw new Error("Lead not found");

        const targetDate = lead.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Generate indicative quote
        const quote = await pricingService.calculateQuote({
            eventDate: targetDate,
            location: lead.geoContext || "Unknown",
            eventType: "other"
        });

        // Construct message
        const message = `Hi ${lead.name || 'Team'},\n\nI noticed you're planning an event in ${lead.geoContext || 'your area'}. I'm currently checking availability for ${targetDate} and I'd love to discuss bringing the Hectic Empire sound to your project.\n\nIndicative Performance Quote: £${quote.total}\nSecured Deposit Required: £${quote.depositAmount}\n\nYou can lock this date immediately here: [SECURE_LINK]\n\nBest,\nDanny Hectic B`;

        // Log the automated quote interaction
        await db.createOutboundInteraction({
            leadId,
            type: "automated_quote",
            content: message,
            auditLogId: Number(quote.auditLogId),
            outcome: "pending_contact"
        });

        return {
            quote,
            message
        };
    }
}

export const outboundService = new OutboundService();
