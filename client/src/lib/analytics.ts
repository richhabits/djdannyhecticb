/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import ReactGA from "react-ga4";

// Initialize GA4
// We use a public dummy ID for dev if none provided, but real one should be in env
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";

export const initGA = () => {
    if (MEASUREMENT_ID === "G-XXXXXXXXXX") {
        console.warn("[Analytics] No Measurement ID found. Analytics disabled.");
        return;
    }

    ReactGA.initialize(MEASUREMENT_ID);
    console.log(`[Analytics] Initialized with ID: ${MEASUREMENT_ID}`);
};

export const logPageView = () => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

export const logEvent = (category: string, action: string, label?: string) => {
    ReactGA.event({
        category,
        action,
        label,
    });
};

// Custom Hectic Events
export const logStreamPlay = (streamName: string) => {
    logEvent("Player", "Play Stream", streamName);
};

export const logMixDownload = (mixTitle: string) => {
    logEvent("Content", "Download Mix", mixTitle);
};

export const logShoutSend = () => {
    logEvent("Engagement", "Send Shout", "Shoutbox");
};

/**
 * Beatport shop analytics and tracking
 */

export type BeatportEventType = 
  | 'shop_chart_view'
  | 'shop_track_view'
  | 'shop_outbound_beatport_click'
  | 'shop_search'
  | 'shop_genre_view';

export interface BeatportTrackingEvent {
  event: BeatportEventType;
  timestamp: number;
  data: {
    itemType?: 'track' | 'chart' | 'artist' | 'release' | 'label';
    itemId?: number | string;
    context?: string;
    searchQuery?: string;
    filters?: Record<string, any>;
  };
}

/**
 * Track a Beatport-related event
 */
export function trackBeatportEvent(
  event: BeatportEventType,
  data: BeatportTrackingEvent['data'] = {}
): void {
  const trackingEvent: BeatportTrackingEvent = {
    event,
    timestamp: Date.now(),
    data,
  };

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Beatport Analytics]', trackingEvent);
  }

  // Send to GA4
  logEvent('beatport_shop', event, data.itemId?.toString());

  // Store in localStorage for later analytics
  try {
    const storageKey = 'beatport_events';
    const existingEvents = localStorage.getItem(storageKey);
    const events: BeatportTrackingEvent[] = existingEvents 
      ? JSON.parse(existingEvents) 
      : [];
    
    events.push(trackingEvent);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.shift();
    }
    
    localStorage.setItem(storageKey, JSON.stringify(events));
  } catch (error) {
    console.error('[Beatport Analytics] Failed to store event:', error);
  }
}

/**
 * Track a Beatport outbound click with affiliate parameters
 */
export function trackBeatportClick(
  itemType: 'track' | 'chart' | 'artist' | 'release' | 'label',
  itemId: number | string,
  context?: string
): void {
  trackBeatportEvent('shop_outbound_beatport_click', {
    itemType,
    itemId,
    context,
  });
}

/**
 * Track a chart view
 */
export function trackChartView(chartId: number): void {
  trackBeatportEvent('shop_chart_view', {
    itemType: 'chart',
    itemId: chartId,
  });
}

/**
 * Track a track view
 */
export function trackTrackView(trackId: number): void {
  trackBeatportEvent('shop_track_view', {
    itemType: 'track',
    itemId: trackId,
  });
}

/**
 * Track a search query
 */
export function trackSearch(query: string, filters?: Record<string, any>): void {
  trackBeatportEvent('shop_search', {
    searchQuery: query,
    filters,
  });
}

/**
 * Track a genre page view
 */
export function trackGenreView(genreSlug: string): void {
  trackBeatportEvent('shop_genre_view', {
    context: genreSlug,
  });
}

/**
 * Get all tracked events (for admin dashboard)
 */
export function getBeatportEvents(): BeatportTrackingEvent[] {
  try {
    const storageKey = 'beatport_events';
    const existingEvents = localStorage.getItem(storageKey);
    return existingEvents ? JSON.parse(existingEvents) : [];
  } catch (error) {
    console.error('[Beatport Analytics] Failed to retrieve events:', error);
    return [];
  }
}

/**
 * Clear all tracked events
 */
export function clearBeatportEvents(): void {
  try {
    localStorage.removeItem('beatport_events');
  } catch (error) {
    console.error('[Beatport Analytics] Failed to clear events:', error);
  }
}

/**
 * Generate Beatport affiliate URL with UTM parameters
 * @param baseUrl - The Beatport URL to track
 * @param itemType - Type of item being tracked
 * @param itemId - ID of the item
 * @returns URL with affiliate and UTM parameters
 */
export function generateBeatportUrl(
  baseUrl: string,
  itemType?: string,
  itemId?: string | number
): string {
  try {
    const url = new URL(baseUrl);
    
    // Add UTM parameters for tracking
    url.searchParams.set('utm_source', 'hectic-radio');
    url.searchParams.set('utm_medium', 'shop');
    url.searchParams.set('utm_campaign', 'beatport-integration');
    
    if (itemType) {
      url.searchParams.set('utm_content', `${itemType}-${itemId || 'unknown'}`);
    }
    
    // TODO: Add affiliate ID when available
    // url.searchParams.set('affid', 'YOUR_AFFILIATE_ID');
    
    return url.toString();
  } catch (error) {
    console.error('[Beatport Analytics] Failed to generate URL:', error);
    return baseUrl;
  }
}

/**
 * Calculate CTR (Click-Through Rate) for analytics
 */
export function calculateCTR(views: number, clicks: number): number {
  if (views === 0) return 0;
  return (clicks / views) * 100;
}

/**
 * Get event statistics for a specific event type
 */
export function getEventStats(eventType: BeatportEventType): {
  count: number;
  last24h: number;
  topItems: Array<{ id: string | number; count: number }>;
} {
  const events = getBeatportEvents();
  const filteredEvents = events.filter(e => e.event === eventType);
  
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const last24h = filteredEvents.filter(e => e.timestamp > oneDayAgo).length;
  
  // Count item frequencies
  const itemCounts = new Map<string | number, number>();
  filteredEvents.forEach(event => {
    if (event.data.itemId) {
      const count = itemCounts.get(event.data.itemId) || 0;
      itemCounts.set(event.data.itemId, count + 1);
    }
  });
  
  const topItems = Array.from(itemCounts.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    count: filteredEvents.length,
    last24h,
    topItems,
  };
}
