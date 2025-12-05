/**
 * Analytics Hook
 * Provides easy access to analytics tracking functions
 */

import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export function useAnalytics() {
  const { user } = useAuth();
  const trackMutation = trpc.analytics.track.useMutation();
  const trackPageViewMutation = trpc.analytics.trackPageView.useMutation();
  const trackClickMutation = trpc.analytics.trackClick.useMutation();

  const track = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      trackMutation.mutate({
        eventType: "custom",
        eventName,
        properties: {
          ...properties,
          userId: user?.id,
        },
      });
    },
    [trackMutation, user]
  );

  const trackPageView = useCallback(
    (path: string, referrer?: string) => {
      trackPageViewMutation.mutate({
        path,
        referrer: referrer || document.referrer,
        userAgent: navigator.userAgent,
      });
    },
    [trackPageViewMutation]
  );

  const trackClick = useCallback(
    (element: string, elementId?: string, elementText?: string) => {
      trackClickMutation.mutate({
        element,
        elementId,
        elementText,
        path: window.location.pathname,
      });
    },
    [trackClickMutation]
  );

  const trackMixPlay = useCallback(
    (mixId: number, mixTitle: string) => {
      track("mix_play", { mixId, mixTitle });
    },
    [track]
  );

  const trackMixDownload = useCallback(
    (mixId: number, mixTitle: string) => {
      track("mix_download", { mixId, mixTitle });
    },
    [track]
  );

  const trackShare = useCallback(
    (contentType: string, contentId: number, platform: string) => {
      track("share", { contentType, contentId, platform });
    },
    [track]
  );

  const trackFormSubmission = useCallback(
    (formName: string, success: boolean) => {
      track("form_submit", { formName, success });
    },
    [track]
  );

  return {
    track,
    trackPageView,
    trackClick,
    trackMixPlay,
    trackMixDownload,
    trackShare,
    trackFormSubmission,
  };
}
