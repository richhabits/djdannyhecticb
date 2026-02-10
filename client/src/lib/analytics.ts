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

// ============================================
// SELF-HOSTED ANALYTICS (Sovereign Data)
// ============================================

type TrackEventPayload = {
    event: string;
    props?: Record<string, unknown>;
    path?: string;
};

/**
 * Track an analytics event to self-hosted endpoint
 * Best-effort: ignores errors silently
 * 
 * @param event - Event name (snake_case, max 80 chars)
 * @param props - Optional properties object
 * 
 * @example
 * track('home_event_card_click', { eventId: 123 })
 */
export function track(event: string, props?: Record<string, unknown>): void {
    const payload: TrackEventPayload = {
        event,
        props,
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };

    // Store in localStorage for admin dashboard
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        try {
            const storageKey = `analytics_${event}`;
            const existing = localStorage.getItem(storageKey);
            const events = existing ? JSON.parse(existing) : [];
            events.push({
                timestamp: Date.now(),
                props,
                path: window.location.pathname,
            });
            // Keep only last 1000 events per type to avoid storage bloat
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }
            localStorage.setItem(storageKey, JSON.stringify(events));
        } catch (error) {
            // Ignore localStorage errors
        }
    }

    // Fire and forget
    fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true, // Ensures request completes even on page navigation
    }).catch(() => {
        // Silently ignore - analytics should never break the app
    });
}

/**
 * Create a section view tracker using IntersectionObserver
 * 
 * @param sectionId - ID of the section to observe
 * @param eventName - Event name to track when section is viewed
 * @param props - Optional properties to include
 * @returns Cleanup function to disconnect observer
 */
export function trackSectionView(
    sectionId: string,
    eventName: string,
    props?: Record<string, unknown>
): () => void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
        return () => { };
    }

    let hasTracked = false;

    const observer = new IntersectionObserver(
        (entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting && !hasTracked) {
                hasTracked = true;
                track(eventName, props);
                observer.disconnect();
            }
        },
        { threshold: 0.5 }
    );

    const element = document.getElementById(sectionId);
    if (element) {
        observer.observe(element);
    }

    return () => observer.disconnect();
}

// ============================================
// BEATPORT ANALYTICS (Shop Integration)
// ============================================

/**
 * Track Beatport click events
 * @param type - Type of content clicked (track, chart, artist, release, label)
 * @param id - ID of the content
 * @param origin - Where the click originated from (e.g., 'shop-home', 'search', 'chart-123')
 */
export function trackBeatportClick(type: 'track' | 'chart' | 'artist' | 'release' | 'label', id: number, origin: string): void {
    track('beatport_click', {
        type,
        id,
        origin,
    });
}

/**
 * Track Beatport chart view
 * @param chartId - Chart ID being viewed
 */
export function trackChartView(chartId: number): void {
    track('beatport_chart_view', {
        chartId,
    });
}

/**
 * Track Beatport genre view
 * @param genreSlug - Genre slug being viewed
 */
export function trackGenreView(genreSlug: string): void {
    track('beatport_genre_view', {
        genreSlug,
    });
}

/**
 * Track search query
 * @param query - Search query string
 */
export function trackSearch(query: string): void {
    track('search', {
        query,
    });
}

// ============================================
// ANALYTICS HELPERS (Admin Dashboard)
// ============================================

export interface EventStats {
    count: number;
    last24h: number;
    topItems: Array<{ id: string; count: number }>;
}

/**
 * Get statistics for a specific event type from localStorage
 * @param eventType - Event type to get stats for
 * @returns Statistics object with count, last24h, and topItems
 */
export function getEventStats(eventType: string): EventStats {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return { count: 0, last24h: 0, topItems: [] };
    }

    try {
        const storageKey = `analytics_${eventType}`;
        const data = localStorage.getItem(storageKey);
        if (!data) {
            return { count: 0, last24h: 0, topItems: [] };
        }

        const events = JSON.parse(data);
        if (!Array.isArray(events)) {
            return { count: 0, last24h: 0, topItems: [] };
        }

        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;

        // Count events in last 24h
        const last24h = events.filter((e: any) => e.timestamp > oneDayAgo).length;

        // Get top items by counting occurrences
        const itemCounts = new Map<string, number>();
        events.forEach((e: any) => {
            const itemId = e.props?.id?.toString() || e.props?.chartId?.toString() || e.props?.query || 'unknown';
            itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + 1);
        });

        const topItems = Array.from(itemCounts.entries())
            .map(([id, count]) => ({ id, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            count: events.length,
            last24h,
            topItems,
        };
    } catch (error) {
        console.error('Error getting event stats:', error);
        return { count: 0, last24h: 0, topItems: [] };
    }
}

/**
 * Calculate click-through rate
 * @param views - Total number of views
 * @param clicks - Total number of clicks
 * @returns CTR as a decimal (0.0 to 1.0)
 */
export function calculateCTR(views: number, clicks: number): number {
    if (views === 0) return 0;
    return clicks / views;
}
