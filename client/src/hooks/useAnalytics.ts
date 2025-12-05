import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export function useAnalytics() {
  const [location] = useLocation();
  const trackEvent = trpc.analytics.track.useMutation();

  // Track page views
  useEffect(() => {
    trackEvent.mutate({
      eventType: "page_view",
      eventName: "Page View",
      page: location,
    });
  }, [location, trackEvent]);

  return {
    track: (eventType: string, eventName: string, properties?: Record<string, any>) => {
      trackEvent.mutate({
        eventType,
        eventName,
        properties,
        page: location,
      });
    },
  };
}
