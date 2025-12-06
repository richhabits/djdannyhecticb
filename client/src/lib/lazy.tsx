/**
 * Lazy Loading Utilities
 * 
 * This module provides utilities for lazy loading components and pages
 * to improve initial bundle size and load times.
 */

import React, { Suspense, lazy, ComponentType } from "react";
import { LoadingSpinner } from "@/components/DesignPolish";

/**
 * Loading fallback component for Suspense boundaries
 */
export function LoadingFallback({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Full page loading fallback
 */
export function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading page...</p>
    </div>
  );
}

/**
 * Creates a lazy-loaded component with Suspense wrapper
 */
export function lazyWithSuspense<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <LoadingFallback />
) {
  const LazyComponent = lazy(importFn);

  return function LazyWithSuspense(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Lazy page loader with page-specific fallback
 */
export function lazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazyWithSuspense(importFn, <PageLoadingFallback />);
}

/**
 * Lazy component loader with minimal fallback
 */
export function lazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazyWithSuspense(importFn, <LoadingFallback />);
}

/**
 * Preload a lazy component (for hover prefetching)
 */
export function preloadComponent(importFn: () => Promise<unknown>) {
  return importFn();
}

// Lazy-loaded heavy components
export const LazyAdvancedSearch = lazyComponent(() => import("@/components/AdvancedSearch"));
export const LazyBookingCalendar = lazyComponent(() => import("@/components/BookingCalendar"));
export const LazySpotifyPlayer = lazyComponent(() => import("@/components/SpotifyIntegration").then(m => ({ default: m.SpotifyPlayer })));
export const LazyYouTubeFeed = lazyComponent(() => import("@/components/YouTubeIntegration").then(m => ({ default: m.YouTubeFeed })));
export const LazyPodcastPlayer = lazyComponent(() => import("@/components/PodcastPlayer"));
export const LazyVideoTestimonials = lazyComponent(() => import("@/components/VideoTestimonials").then(m => ({ default: m.VideoTestimonials })));
export const LazySocialFeed = lazyComponent(() => import("@/components/SocialFeed").then(m => ({ default: m.SocialFeed })));
export const LazyDJTools = lazyComponent(() => import("@/components/DJTools").then(m => ({ default: m.TechnicalRider })));

// Lazy-loaded pages
export const LazyAbout = lazyPage(() => import("@/pages/About"));
export const LazyMixes = lazyPage(() => import("@/pages/Mixes"));
export const LazyEvents = lazyPage(() => import("@/pages/Events"));
export const LazyPodcasts = lazyPage(() => import("@/pages/Podcasts"));
export const LazyBookings = lazyPage(() => import("@/pages/Bookings"));
export const LazyDashboard = lazyPage(() => import("@/pages/Dashboard"));
export const LazyProfile = lazyPage(() => import("@/pages/Profile"));
export const LazyShop = lazyPage(() => import("@/pages/Shop"));
export const LazyGallery = lazyPage(() => import("@/pages/Gallery"));
export const LazyBlog = lazyPage(() => import("@/pages/Blog"));
export const LazyAnalytics = lazyPage(() => import("@/pages/Analytics"));

export default {
  LoadingFallback,
  PageLoadingFallback,
  lazyWithSuspense,
  lazyPage,
  lazyComponent,
  preloadComponent,
};
