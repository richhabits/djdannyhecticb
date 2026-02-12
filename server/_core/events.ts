/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { EventEmitter } from "events";

/**
 * Global Event Bus for internal communication
 */
class AppEvents extends EventEmitter { }

export const appEvents = new AppEvents();

/**
 * Event Constants
 */
export const EVENTS = {
    BOOKING_CONFIRMED: "booking.confirmed",
    NOTIFICATION_CREATED: "notification.created",
    BOOKING_EXPIRED: "booking.expired",
    // Add more as needed
} as const;
