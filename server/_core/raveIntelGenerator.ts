/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { observability } from "./observability";
import * as db from "../db";

export interface RaveIntelItem {
    id: number;
    category: 'ticket-alert' | 'event-intel' | 'set-release' | 'underground-news';
    title: string;
    content: string;
    timestamp: string;
    source: string;
    sourceUrl: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    city?: string;
    genre?: string;
    sourceType?: string;
    confidence?: string;
}

/**
 * Modern Intel Generator
 * Responsibility: Serve high-fidelity, persistent data from the hardened ingestion pipeline.
 */
export async function generateRaveIntel(options: { city?: string, genre?: string, isSupporter?: boolean } = {}): Promise<RaveIntelItem[]> {
    console.log(`📡 [INTEL] Intercepting signal context: ${options.city || 'ALL'}/${options.genre || 'ALL'} [Supporter: ${!!options.isSupporter}]`);

    // D1 Operational Hardening: Check active kill-switch
    const alertsEnabled = await db.checkFeatureFlag("alerts_enabled");
    if (!alertsEnabled) {
        console.log("⚠️ [INTEL] Alerts globally suppressed via kill-switch.");
        return [];
    }

    // Fetch from persistent DB layer
    const items = await db.getIntelItems({
        city: options.city,
        genre: options.genre,
        limit: 50
    });

    if (items.length === 0) {
        observability.recordIntelMiss();
        return [];
    }

    // D4.1: Supporter-First Delay Set
    const SUPPORTER_DELAY_MS = 90 * 1000;
    const now = Date.now();

    const filtered = items.filter(item => {
        // Supporters get everything instantly (T-0)
        if (options.isSupporter) return true;

        // Gate 2.1: Public users require verified authority
        const sourceCount = JSON.parse(item.metadata || '{}').sourceCount || 1;
        const isVerified = sourceCount >= 2;
        if (!isVerified) return false;

        // Non-supporters face a transmission delay (T+90s)
        const timeSinceCreated = now - item.createdAt.getTime();
        return timeSinceCreated >= SUPPORTER_DELAY_MS;
    });

    return filtered.map(item => {
        const confidenceScore = Number(item.confidence || 0);
        observability.trackConfidence(confidenceScore);

        return {
            id: item.id,
            category: item.category as any,
            title: item.title,
            content: item.content,
            timestamp: item.publishedAt.toISOString(),
            source: item.sourceName,
            sourceUrl: item.sourceUrl,
            priority: confidenceScore > 0.8 ? 'high' : 'medium',
            tags: item.tags ? JSON.parse(item.tags) : [],
            city: item.city || undefined,
            genre: item.genre || undefined,
            sourceType: item.sourceType,
            confidence: item.confidence || undefined
        };
    });
}
