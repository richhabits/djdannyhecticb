/**
 * Analytics and tracking system
 * Tracks user behavior, events, and engagement metrics
 */

import * as db from "../db";

export interface AnalyticsEvent {
  userId?: number;
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface PageViewEvent {
  userId?: number;
  path: string;
  referrer?: string;
  userAgent?: string;
  timestamp?: Date;
}

export interface ClickEvent {
  userId?: number;
  element: string;
  elementId?: string;
  elementText?: string;
  path: string;
  timestamp?: Date;
}

/**
 * Track a custom analytics event
 */
export async function trackEvent(event: AnalyticsEvent) {
  try {
    // Store in database if available
    const dbInstance = await db.getDb();
    if (dbInstance) {
      const { trafficEvents } = await import("../../drizzle/schema");
      await dbInstance.insert(trafficEvents).values({
        userId: event.userId,
        eventType: event.eventType,
        eventName: event.eventName,
        payload: JSON.stringify(event.properties || {}),
        createdAt: event.timestamp || new Date(),
      });
    }
    
    // Also log for debugging
    console.log(`[Analytics] ${event.eventName}`, event.properties);
  } catch (error) {
    console.warn("[Analytics] Failed to track event:", error);
  }
}

/**
 * Track a page view
 */
export async function trackPageView(event: PageViewEvent) {
  await trackEvent({
    userId: event.userId,
    eventType: "page_view",
    eventName: "page_view",
    properties: {
      path: event.path,
      referrer: event.referrer,
      userAgent: event.userAgent,
    },
    timestamp: event.timestamp,
  });
}

/**
 * Track a click event
 */
export async function trackClick(event: ClickEvent) {
  await trackEvent({
    userId: event.userId,
    eventType: "click",
    eventName: "click",
    properties: {
      element: event.element,
      elementId: event.elementId,
      elementText: event.elementText,
      path: event.path,
    },
    timestamp: event.timestamp,
  });
}

/**
 * Track mix play
 */
export async function trackMixPlay(userId: number | undefined, mixId: number, mixTitle: string) {
  await trackEvent({
    userId,
    eventType: "media_play",
    eventName: "mix_play",
    properties: {
      mixId,
      mixTitle,
    },
  });
}

/**
 * Track mix download
 */
export async function trackMixDownload(userId: number | undefined, mixId: number, mixTitle: string) {
  await trackEvent({
    userId,
    eventType: "media_download",
    eventName: "mix_download",
    properties: {
      mixId,
      mixTitle,
    },
  });
}

/**
 * Track share event
 */
export async function trackShare(userId: number | undefined, contentType: string, contentId: number, platform: string) {
  await trackEvent({
    userId,
    eventType: "share",
    eventName: "share",
    properties: {
      contentType,
      contentId,
      platform,
    },
  });
}

/**
 * Track form submission
 */
export async function trackFormSubmission(userId: number | undefined, formName: string, success: boolean) {
  await trackEvent({
    userId,
    eventType: "form_submit",
    eventName: "form_submit",
    properties: {
      formName,
      success,
    },
  });
}

/**
 * Track booking inquiry
 */
export async function trackBookingInquiry(userId: number | undefined, bookingData: Record<string, any>) {
  await trackEvent({
    userId,
    eventType: "conversion",
    eventName: "booking_inquiry",
    properties: bookingData,
  });
}

/**
 * Get analytics summary
 */
export async function getAnalyticsSummary(days: number = 30) {
  try {
    const dbInstance = await db.getDb();
    if (!dbInstance) {
      return {
        pageViews: 0,
        uniqueVisitors: 0,
        mixPlays: 0,
        shares: 0,
        formSubmissions: 0,
        bookingInquiries: 0,
      };
    }

    const { trafficEvents } = await import("../../drizzle/schema");
    const { gte } = await import("drizzle-orm");
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await dbInstance
      .select()
      .from(trafficEvents)
      .where(gte(trafficEvents.createdAt, cutoffDate));

    const pageViews = events.filter(e => e.eventType === "page_view").length;
    const uniqueVisitors = new Set(events.filter(e => e.userId).map(e => e.userId)).size;
    const mixPlays = events.filter(e => e.eventName === "mix_play").length;
    const shares = events.filter(e => e.eventName === "share").length;
    const formSubmissions = events.filter(e => e.eventName === "form_submit").length;
    const bookingInquiries = events.filter(e => e.eventName === "booking_inquiry").length;

    return {
      pageViews,
      uniqueVisitors,
      mixPlays,
      shares,
      formSubmissions,
      bookingInquiries,
    };
  } catch (error) {
    console.warn("[Analytics] Failed to get summary:", error);
    return {
      pageViews: 0,
      uniqueVisitors: 0,
      mixPlays: 0,
      shares: 0,
      formSubmissions: 0,
      bookingInquiries: 0,
    };
  }
}
