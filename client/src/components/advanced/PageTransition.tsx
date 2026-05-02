/**
 * PageTransition Component
 * Advanced page transition animations with route-based strategies
 * Last updated: 2026-05-01
 */

import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '@/contexts/ThemeContextEnhanced';

type TransitionType =
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-top'
  | 'slide-bottom'
  | 'scale'
  | 'none';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  duration?: number; // milliseconds
  delay?: number; // milliseconds before transition starts
  onTransitionComplete?: () => void;
}

/**
 * Page transition wrapper with configurable animation
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionType = 'fade',
  duration = 300,
  delay = 0,
  onTransitionComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    const timer = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    if (!isVisible || prefersReducedMotion) return;

    const timer = setTimeout(onTransitionComplete, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onTransitionComplete, prefersReducedMotion]);

  if (prefersReducedMotion || transitionType === 'none') {
    return <>{children}</>;
  }

  const animationClass = isVisible
    ? `page-transition-${transitionType}`
    : '';

  return (
    <div
      className={animationClass}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Hook to determine transition type based on navigation
 */
export const useTransitionType = (
  fromPath: string,
  toPath: string
): TransitionType => {
  // Determine transition based on route change
  const fromDepth = fromPath.split('/').length;
  const toDepth = toPath.split('/').length;

  if (toDepth > fromDepth) {
    // Going deeper in navigation (e.g., list -> detail)
    return 'slide-left';
  } else if (toDepth < fromDepth) {
    // Going back up (e.g., detail -> list)
    return 'slide-right';
  } else if (toPath.localeCompare(fromPath) > 0) {
    // Alphabetically later route
    return 'slide-left';
  } else {
    // Alphabetically earlier route
    return 'slide-right';
  }
};

/**
 * Wrapper for multiple pages with shared layout animation
 */
interface SharedLayoutPageProps {
  children: React.ReactNode;
  layoutId?: string;
  transitionType?: TransitionType;
}

export const SharedLayoutPage: React.FC<SharedLayoutPageProps> = ({
  children,
  layoutId = 'page',
  transitionType = 'fade',
}) => {
  return (
    <PageTransition transitionType={transitionType}>
      <div className="page-layout" data-layout-id={layoutId}>
        {children}
      </div>
    </PageTransition>
  );
};

/**
 * Staggered content reveal (reveals children with cascade effect)
 */
interface StaggeredContentProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredContent: React.FC<StaggeredContentProps> = ({
  children,
  delay = 0,
  staggerDelay = 50,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`stagger-container ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!child) return null;

        return (
          <div
            key={index}
            style={{
              animationDelay: prefersReducedMotion
                ? '0ms'
                : `${delay + index * staggerDelay}ms`,
            }}
            className="animate-fade-in"
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

/**
 * Route-based transition mapper
 */
const ROUTE_TRANSITIONS: Record<string, TransitionType> = {
  '/': 'fade',
  '/about': 'slide-left',
  '/services': 'slide-left',
  '/portfolio': 'slide-left',
  '/contact': 'slide-left',
  '/dashboard': 'scale',
  '/settings': 'slide-right',
};

/**
 * Get transition for a specific route
 */
export const getTransitionForRoute = (route: string): TransitionType => {
  return ROUTE_TRANSITIONS[route] || 'fade';
};

/**
 * Page wrapper with automatic transition detection
 */
interface AutoTransitionPageProps {
  children: React.ReactNode;
  currentRoute: string;
  previousRoute?: string;
}

export const AutoTransitionPage: React.FC<AutoTransitionPageProps> = ({
  children,
  currentRoute,
  previousRoute,
}) => {
  const transitionType = previousRoute
    ? useTransitionType(previousRoute, currentRoute)
    : getTransitionForRoute(currentRoute);

  return (
    <PageTransition transitionType={transitionType}>
      {children}
    </PageTransition>
  );
};
