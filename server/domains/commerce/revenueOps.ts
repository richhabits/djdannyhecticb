/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import * as db from "../db";
import { logger } from "./logger";
import { appEvents, EVENTS } from "./events";

/**
 * Revenue Operations Service
 * Centralized state transitions for the revenue lifecycle.
 * Ensures idempotency and consistent side-effects.
 */
export class RevenueOpsService {
    /**
     * Transition a booking to 'Confirmed' via Deposit Payment
     */
    async confirmDeposit(bookingId: number, paymentIntentId: string) {
        const booking = await db.getEventBooking(bookingId);
        if (!booking) {
            logger.error(`[RevOps] Attempted to confirm non-existent booking: ${bookingId}`);
            return;
        }

        if (booking.depositPaid && booking.status === "confirmed") {
            logger.info(`[RevOps] Idempotency catch: Booking ${bookingId} already confirmed.`);
            return;
        }

        logger.info(`[RevOps] Processing deposit confirmation for Booking ${bookingId}`);

        // 1. Update Database State
        const updatedBooking = await db.updateEventBooking(bookingId, {
            depositPaid: true,
            status: "confirmed",
            paymentIntentId // Ensure we have the latest one linked
        });

        // 2. Synchronize Pricing Audit Log
        await db.updatePricingAuditLogStatus(bookingId, "deposit_paid");

        // 3. Emit Global Events
        // This triggers social proof, mobile alerts, and AI Danny responses
        appEvents.emit(EVENTS.BOOKING_CONFIRMED, updatedBooking);

        // 4. Future hooks: Automated Contracts, Invoice PDFs, etc.
        logger.info(`[RevOps] Booking ${bookingId} fully activated.`);

        return updatedBooking;
    }

    /**
     * Handle Deposit Expiry (Housekeeping)
     */
    async handleExpiry(bookingId: number) {
        const booking = await db.getEventBooking(bookingId);
        if (!booking || booking.status !== "pending" || booking.depositPaid) return;

        logger.warn(`[RevOps] Expiring unpaid deposit for Booking ${bookingId}`);

        await db.updateEventBooking(bookingId, {
            status: "cancelled",
            extraNotes: (booking.extraNotes || "") + "\n[System] Auto-cancelled: Deposit window expired."
        });

        await db.updatePricingAuditLogStatus(bookingId, "expired");

        // Notify admin of lost revenue opportunity
        appEvents.emit(EVENTS.BOOKING_EXPIRED, booking);
    }
}

export const revenueOps = new RevenueOpsService();
