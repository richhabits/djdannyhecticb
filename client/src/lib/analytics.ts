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
