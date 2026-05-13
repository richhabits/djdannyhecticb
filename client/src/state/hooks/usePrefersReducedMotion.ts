import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled reduced motion preference in their OS settings
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    // Check if mediaquery is supported
    if (!window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial state
    setPrefersReduced(mediaQuery.matches);

    // Create event handler
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReduced(e.matches);
    };

    // Add listener with legacy support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return prefersReduced;
}
