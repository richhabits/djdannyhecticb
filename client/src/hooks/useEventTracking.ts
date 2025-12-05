import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useEventTracking() {
  const [location] = useLocation();
  const trackEvent = trpc.analytics.track.useMutation();

  const trackMixPlay = (mixId: number, mixTitle: string) => {
    trackEvent.mutate({
      eventType: "mix_play",
      eventName: "Mix Played",
      properties: {
        mixId,
        mixTitle,
        page: location,
      },
    });
  };

  const trackMixDownload = (mixId: number, mixTitle: string) => {
    trackEvent.mutate({
      eventType: "mix_download",
      eventName: "Mix Downloaded",
      properties: {
        mixId,
        mixTitle,
        page: location,
      },
    });
  };

  const trackShare = (entityType: string, entityId: number, platform: string) => {
    trackEvent.mutate({
      eventType: "share",
      eventName: "Content Shared",
      properties: {
        entityType,
        entityId,
        platform,
        page: location,
      },
    });
  };

  const trackPageView = (page: string) => {
    trackEvent.mutate({
      eventType: "page_view",
      eventName: "Page View",
      page,
    });
  };

  const trackClick = (element: string, properties?: Record<string, any>) => {
    trackEvent.mutate({
      eventType: "click",
      eventName: "Element Clicked",
      properties: {
        element,
        page: location,
        ...properties,
      },
    });
  };

  return {
    trackMixPlay,
    trackMixDownload,
    trackShare,
    trackPageView,
    trackClick,
  };
}
