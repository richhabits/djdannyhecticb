/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 */

import { execSync } from "child_process";

export interface SystemMetrics {
    intel: {
        cacheHits: number;
        cacheMisses: number;
        hitRatio: number;
    };
    ai: {
        providerUsage: Record<string, number>;
        fallbackEvents: number;
        lastProviderUsed: string;
    };
    storage: {
        diskUsagePercent: number;
        watermarkLevel: "normal" | "warning" | "critical";
    };
    network: {
        avgConfidence: number;
        connectorHealth: Record<string, 'healthy' | 'degraded'>;
        syncDriftMs: number;
        integrityShield: 'active' | 'breached';
    };
}

class ObservabilityService {
    private metrics: SystemMetrics = {
        intel: { cacheHits: 0, cacheMisses: 0, hitRatio: 0 },
        ai: { providerUsage: {}, fallbackEvents: 0, lastProviderUsed: "none" },
        storage: { diskUsagePercent: 0, watermarkLevel: "normal" },
        network: {
            avgConfidence: 1.0,
            connectorHealth: {},
            syncDriftMs: 0,
            integrityShield: 'active'
        }
    };

    trackConfidence(score: number) {
        this.metrics.network.avgConfidence = (this.metrics.network.avgConfidence * 0.9) + (score * 0.1);
    }

    recordSyncHealth(connector: string, isHealthy: boolean, drift: number = 0) {
        this.metrics.network.connectorHealth[connector] = isHealthy ? 'healthy' : 'degraded';
        this.metrics.network.syncDriftMs = Math.max(this.metrics.network.syncDriftMs, drift);
    }

    breachIntegrity() {
        this.metrics.network.integrityShield = 'breached';
    }

    recordIntelHit() {
        this.metrics.intel.cacheHits++;
        this.updateHitRatio();
    }

    recordIntelMiss() {
        this.metrics.intel.cacheMisses++;
        this.updateHitRatio();
    }

    recordAiUsage(provider: string, isFallback: boolean = false) {
        this.metrics.ai.providerUsage[provider] = (this.metrics.ai.providerUsage[provider] || 0) + 1;
        this.metrics.ai.lastProviderUsed = provider;
        if (isFallback) this.metrics.ai.fallbackEvents++;
    }

    private updateHitRatio() {
        const total = this.metrics.intel.cacheHits + this.metrics.intel.cacheMisses;
        this.metrics.intel.hitRatio = total > 0 ? (this.metrics.intel.cacheHits / total) : 0;
    }

    getMetrics(): SystemMetrics {
        this.updateStorageMetrics();
        return { ...this.metrics };
    }

    private updateStorageMetrics() {
        try {
            // Standard Unix command for disk usage
            const output = execSync("df / | tail -1 | awk '{print $5}'").toString().trim();
            const percent = parseInt(output.replace("%", ""), 10);

            this.metrics.storage.diskUsagePercent = percent;

            if (percent > 90) this.metrics.storage.watermarkLevel = "critical";
            else if (percent > 75) this.metrics.storage.watermarkLevel = "warning";
            else this.metrics.storage.watermarkLevel = "normal";
        } catch (e) {
            console.warn("⚠️ [OBS] Failed to fetch storage metrics");
        }
    }
}

export const observability = new ObservabilityService();
