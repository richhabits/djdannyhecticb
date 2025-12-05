import { useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

interface AnalyticsEvent {
  type: "pageview" | "click" | "scroll" | "time_spent" | "mix_play" | "download" | "share";
  data?: Record<string, unknown>;
}

// Track page views and user behavior
export function useAnalytics() {
  const logTraffic = trpc.analytics.traffic.log.useMutation();

  const trackPageView = useCallback((route?: string) => {
    const url = new URL(window.location.href);
    logTraffic.mutate({
      route: route || window.location.pathname,
      utmSource: url.searchParams.get("utm_source") || undefined,
      utmMedium: url.searchParams.get("utm_medium") || undefined,
      utmCampaign: url.searchParams.get("utm_campaign") || undefined,
      referrer: document.referrer || undefined,
    });
  }, [logTraffic]);

  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Log event to analytics
    console.log("[Analytics]", event);
    // Could integrate with external analytics here (GA, Mixpanel, etc.)
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", event.type, event.data);
    }
  }, []);

  return { trackPageView, trackEvent };
}

// Component for tracking page views automatically
export function AnalyticsTracker() {
  const { trackPageView, trackEvent } = useAnalytics();

  useEffect(() => {
    // Track initial page view
    trackPageView();

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if ([25, 50, 75, 100].includes(scrollDepth)) {
          trackEvent({ type: "scroll", data: { depth: scrollDepth } });
        }
      }
    };

    // Track time spent on page
    const startTime = Date.now();
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent({ type: "time_spent", data: { seconds: timeSpent } });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [trackPageView, trackEvent]);

  return null;
}

// Heatmap tracking (simplified version - tracks click positions)
export function HeatmapTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const element = e.target as HTMLElement;
      const rect = element.getBoundingClientRect();
      const clickData = {
        x: e.clientX,
        y: e.clientY,
        elementX: rect.left,
        elementY: rect.top,
        elementTag: element.tagName,
        elementId: element.id,
        elementClass: element.className,
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      };
      // Store click data locally (in production, send to server)
      const clicks = JSON.parse(localStorage.getItem("heatmap_clicks") || "[]");
      clicks.push(clickData);
      // Keep only last 100 clicks
      if (clicks.length > 100) clicks.shift();
      localStorage.setItem("heatmap_clicks", JSON.stringify(clicks));
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}

// Form analytics tracker
export function useFormAnalytics(formName: string) {
  const { trackEvent } = useAnalytics();

  const trackFormStart = useCallback(() => {
    trackEvent({ type: "click", data: { action: "form_start", formName } });
  }, [formName, trackEvent]);

  const trackFormField = useCallback((fieldName: string) => {
    trackEvent({ type: "click", data: { action: "form_field", formName, fieldName } });
  }, [formName, trackEvent]);

  const trackFormSubmit = useCallback((success: boolean) => {
    trackEvent({ type: "click", data: { action: "form_submit", formName, success } });
  }, [formName, trackEvent]);

  const trackFormAbandonment = useCallback((lastField: string) => {
    trackEvent({ type: "click", data: { action: "form_abandon", formName, lastField } });
  }, [formName, trackEvent]);

  return { trackFormStart, trackFormField, trackFormSubmit, trackFormAbandonment };
}

// A/B Testing hook
export function useABTest(testName: string, variants: string[]) {
  const getVariant = useCallback(() => {
    const storageKey = `ab_test_${testName}`;
    let variant = localStorage.getItem(storageKey);
    
    if (!variant) {
      // Randomly assign a variant
      variant = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(storageKey, variant);
    }
    
    return variant;
  }, [testName, variants]);

  const trackConversion = useCallback((conversionType: string) => {
    const variant = getVariant();
    console.log("[A/B Test]", { testName, variant, conversionType });
  }, [testName, getVariant]);

  return { variant: getVariant(), trackConversion };
}

// Social proof notifications
export function SocialProofNotification({ 
  message, 
  show 
}: { 
  message: string; 
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 z-50 animate-slide-in-left">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-xs">
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

// User cohort analytics
export function getUserCohort(): string {
  const firstVisit = localStorage.getItem("first_visit");
  if (!firstVisit) {
    localStorage.setItem("first_visit", new Date().toISOString());
    return "new";
  }
  
  const daysSinceFirst = Math.floor(
    (Date.now() - new Date(firstVisit).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceFirst < 7) return "week_1";
  if (daysSinceFirst < 30) return "month_1";
  if (daysSinceFirst < 90) return "quarter_1";
  return "veteran";
}

// Cross-device tracking (using localStorage fingerprint)
export function getDeviceFingerprint(): string {
  let fingerprint = localStorage.getItem("device_fingerprint");
  if (!fingerprint) {
    fingerprint = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("device_fingerprint", fingerprint);
  }
  return fingerprint;
}

export default AnalyticsTracker;
