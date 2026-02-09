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
