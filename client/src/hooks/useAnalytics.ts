import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * Enterprise-level analytics tracking hook
 * Automatically tracks page views and provides methods for custom event tracking
 */
export function useAnalytics() {
  const [location] = useLocation();
  const trackMutation = trpc.analytics.track.useMutation();

  // Track page views automatically
  useEffect(() => {
    const pagePath = location;
    const referrer = document.referrer || undefined;

    trackMutation.mutate({
      eventType: "page_view",
      eventCategory: "navigation",
      pagePath,
      referrer,
    });
  }, [location]);

  const trackEvent = (
    eventType: string,
    options?: {
      eventCategory?: string;
      eventLabel?: string;
      metadata?: Record<string, unknown>;
    }
  ) => {
    trackMutation.mutate({
      eventType,
      eventCategory: options?.eventCategory,
      eventLabel: options?.eventLabel,
      pagePath: location,
      metadata: options?.metadata,
    });
  };

  const trackClick = (label: string, metadata?: Record<string, unknown>) => {
    trackEvent("click", {
      eventCategory: "engagement",
      eventLabel: label,
      metadata,
    });
  };

  const trackSearch = (query: string, resultsCount?: number) => {
    trackEvent("search", {
      eventCategory: "engagement",
      eventLabel: query,
      metadata: { resultsCount },
    });
  };

  const trackBooking = (bookingId?: number, metadata?: Record<string, unknown>) => {
    trackEvent("booking_created", {
      eventCategory: "conversion",
      eventLabel: bookingId?.toString(),
      metadata,
    });
  };

  const trackDownload = (resourceType: string, resourceId?: number) => {
    trackEvent("download", {
      eventCategory: "engagement",
      eventLabel: resourceType,
      metadata: { resourceId },
    });
  };

  const trackShare = (platform: string, contentType: string) => {
    trackEvent("share", {
      eventCategory: "engagement",
      eventLabel: platform,
      metadata: { contentType },
    });
  };

  return {
    trackEvent,
    trackClick,
    trackSearch,
    trackBooking,
    trackDownload,
    trackShare,
  };
}
