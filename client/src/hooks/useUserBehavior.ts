import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export function useUserBehavior() {
  const [location] = useLocation();
  const startTimeRef = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);
  const clicksRef = useRef<number>(0);
  const sessionIdRef = useRef<string>(
    typeof window !== "undefined"
      ? sessionStorage.getItem("sessionId") || Math.random().toString(36).substring(7)
      : ""
  );
  const trackBehavior = trpc.analytics.track.useMutation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Store session ID
    if (!sessionStorage.getItem("sessionId")) {
      sessionStorage.setItem("sessionId", sessionIdRef.current);
    }

    // Reset on page change
    startTimeRef.current = Date.now();
    scrollDepthRef.current = 0;
    clicksRef.current = 0;

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
      
      if (scrollPercent > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercent;
      }
    };

    // Track clicks
    const handleClick = () => {
      clicksRef.current++;
    };

    // Track time spent before leaving
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      trackBehavior.mutate({
        eventType: "user_behavior",
        eventName: "Page Interaction",
        properties: {
          timeSpent,
          scrollDepth: scrollDepthRef.current,
          clicks: clicksRef.current,
          page: location,
        },
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Periodic tracking (every 30 seconds)
    const interval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      
      trackBehavior.mutate({
        eventType: "user_behavior",
        eventName: "Page Interaction",
        properties: {
          timeSpent,
          scrollDepth: scrollDepthRef.current,
          clicks: clicksRef.current,
          page: location,
        },
      });
    }, 30000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearInterval(interval);
      
      // Final tracking
      handleBeforeUnload();
    };
  }, [location, trackBehavior]);

  return {
    sessionId: sessionIdRef.current,
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      trackBehavior.mutate({
        eventType: "user_interaction",
        eventName,
        properties: {
          ...properties,
          page: location,
        },
      });
    },
  };
}
