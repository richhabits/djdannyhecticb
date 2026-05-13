/**
 * useAnimationState Hook
 * Manage animation and transition states with callbacks
 */

import { useState, useCallback } from 'react';

interface AnimationState {
  isEntering: boolean;
  isExiting: boolean;
  isVisible: boolean;
}

export function useAnimationState(initialVisible = true) {
  const [state, setState] = useState<AnimationState>({
    isEntering: false,
    isExiting: false,
    isVisible: initialVisible,
  });

  const enter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEntering: true,
      isExiting: false,
      isVisible: true,
    }));
  }, []);

  const exit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEntering: false,
      isExiting: true,
    }));
  }, []);

  const onAnimationComplete = useCallback(() => {
    setState((prev) => {
      if (prev.isExiting) {
        return {
          isEntering: false,
          isExiting: false,
          isVisible: false,
        };
      }
      return {
        isEntering: false,
        isExiting: false,
        isVisible: true,
      };
    });
  }, []);

  return {
    ...state,
    enter,
    exit,
    onAnimationComplete,
  };
}

/**
 * useHoverState Hook
 * Track hover state with animation support
 */
export function useHoverState() {
  const [isHovered, setIsHovered] = useState(false);

  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    handlers: {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
  };
}

/**
 * usePulseAnimation Hook
 * Create a pulsing animation effect
 */
export function usePulseAnimation(isActive: boolean) {
  const [shouldPulse, setShouldPulse] = useState(isActive);

  return {
    shouldPulse,
    className: shouldPulse ? 'animate-pulse-soft' : '',
  };
}

/**
 * useLoadingAnimation Hook
 * Manage loading state with animation
 */
export function useLoadingAnimation(isLoading: boolean) {
  const [isAnimating, setIsAnimating] = useState(isLoading);

  return {
    isAnimating,
    className: isAnimating ? 'animate-shimmer' : '',
  };
}

/**
 * useCountdownAnimation Hook
 * Animate a countdown timer
 */
export function useCountdownAnimation(seconds: number, onComplete?: () => void) {
  const [remaining, setRemaining] = useState(seconds);

  useState(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onComplete]);

  return remaining;
}
