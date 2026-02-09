/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { appEvents, EVENTS } from "./events";
import { socialProofBreaker } from "./circuitBreaker";
import { logger } from "./logger";
import * as db from "../db";

interface SocialProofPayload {
    type: "booking.confirmed";
    bookingId: string;
    eventDate: string;
    locationCity?: string;
    timestamp: number;
}

export class SocialProofService {
    private wss: WebSocketServer | null = null;
    private lastNotificationTime: number = 0;
    private DEFAULT_THROTTLE = 30000; // 30 seconds

    constructor() { }

    async initialize(server: Server) {
        this.wss = new WebSocketServer({ noServer: true });

        server.on("upgrade", (request, socket, head) => {
            const pathname = new URL(request.url!, `http://${request.headers.host}`).pathname;

            if (pathname === "/ws/social-proof") {
                this.wss?.handleUpgrade(request, socket, head, (ws) => {
                    this.wss?.emit("connection", ws, request);
                });
            }
        });

        this.wss.on("connection", (ws: WebSocket) => {
            logger.info("[SocialProof] Client connected");
        });

        // Listen for authoritative booking events
        appEvents.on(EVENTS.BOOKING_CONFIRMED, async (payload: any) => {
            await this.broadcastNotification(payload);
        });

        logger.info("[SocialProof] Service initialized");
    }

    private async broadcastNotification(bookingData: any) {
        // Protection: don't block core flow if breaker is open
        return socialProofBreaker.execute(async () => {
            // 1. Check if enabled
            const enabledSetting = await db.getEmpireSetting("social_proof_enabled");
            if (enabledSetting?.value === "false") return;

            // 2. Rate Control / Throttling
            const throttleSetting = await db.getEmpireSetting("social_proof_throttle");
            const throttleMs = throttleSetting ? parseInt(throttleSetting.value) * 1000 : this.DEFAULT_THROTTLE;

            const now = Date.now();
            if (now - this.lastNotificationTime < throttleMs) {
                logger.debug("[SocialProof] Notification throttled");
                return;
            }

            // 3. TTL Check: Drop if booking is too old (e.g. 5 minutes)
            const bookingTime = new Date(bookingData.createdAt).getTime();
            if (now - bookingTime > 5 * 60000) {
                logger.debug("[SocialProof] Notification expired (TTL)");
                return;
            }

            // 4. Transform to Privacy-Safe Payload (No PII)
            const payload: SocialProofPayload = {
                type: "booking.confirmed",
                bookingId: Buffer.from(String(bookingData.id)).toString("base64"), // Obfuscate ID
                eventDate: bookingData.eventDate,
                locationCity: this.extractCity(bookingData.location),
                timestamp: now,
            };

            // 5. Broadcast to all clients
            let clientCount = 0;
            this.wss?.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(payload));
                    clientCount++;
                }
            });

            this.lastNotificationTime = now;
            logger.info(`[SocialProof] Emitted to ${clientCount} clients`, { bookingId: payload.bookingId });
        }, () => {
            logger.warn("[SocialProof] Suppressed notification due to circuit breaker");
        });
    }

    private extractCity(location: string): string | undefined {
        if (!location) return undefined;
        // Simple logic: take first part before comma or just first word
        return location.split(",")[0].trim();
    }
}

export const socialProofService = new SocialProofService();
