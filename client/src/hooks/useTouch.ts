/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * useTouch Hook
 * Detect swipe, pinch, long press, and other touch gestures
 */

import { useCallback, useEffect, useRef } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface SwipeEvent {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
}

interface PinchEvent {
  scale: number;
  distance: number;
}

interface TouchGestureHandlers {
  onSwipe?: (event: SwipeEvent) => void;
  onPinch?: (event: PinchEvent) => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
}

const SWIPE_THRESHOLD = 50; // pixels
const LONG_PRESS_DURATION = 500; // ms
const DOUBLE_TAP_DELAY = 300; // ms

export function useTouch(handlers: TouchGestureHandlers) {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);
  const initialTouchesRef = useRef<Touch[] | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Store initial touches for pinch detection
      if (e.touches.length >= 2) {
        initialTouchesRef.current = Array.from(e.touches);
      }

      // Start long press timer
      longPressTimeoutRef.current = setTimeout(() => {
        if (handlers.onLongPress) {
          handlers.onLongPress();
        }
      }, LONG_PRESS_DURATION);
    },
    [handlers]
  );

  const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      // Cancel long press if user moves
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }

      // Detect pinch
      if (e.touches.length >= 2 && initialTouchesRef.current && initialTouchesRef.current.length >= 2) {
        const currentDistance = getDistance(
          e.touches[0].clientX,
          e.touches[0].clientY,
          e.touches[1].clientX,
          e.touches[1].clientY
        );

        const initialDistance = getDistance(
          initialTouchesRef.current[0].clientX,
          initialTouchesRef.current[0].clientY,
          initialTouchesRef.current[1].clientX,
          initialTouchesRef.current[1].clientY
        );

        const scale = currentDistance / initialDistance;

        if (handlers.onPinch && Math.abs(scale - 1) > 0.1) {
          handlers.onPinch({ scale, distance: currentDistance });
        }
      }
    },
    [handlers, getDistance]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Cancel long press
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }

      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      touchEndRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Calculate swipe
      const deltaX = touchEndRef.current.x - touchStartRef.current.x;
      const deltaY = touchEndRef.current.y - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const duration = touchEndRef.current.time - touchStartRef.current.time;

      // Detect double tap
      const now = Date.now();
      const isDoubleTap = now - lastTapRef.current < DOUBLE_TAP_DELAY && distance < 10;

      if (isDoubleTap && handlers.onDoubleTap) {
        handlers.onDoubleTap();
        lastTapRef.current = 0; // Reset
      } else {
        lastTapRef.current = now;
      }

      // Detect swipe
      if (distance > SWIPE_THRESHOLD && duration < 500) {
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        let direction: 'left' | 'right' | 'up' | 'down';

        if (isHorizontal) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        if (handlers.onSwipe) {
          handlers.onSwipe({ direction, distance, duration });
        }
      }

      touchStartRef.current = null;
      touchEndRef.current = null;
      initialTouchesRef.current = null;
    },
    [handlers]
  );

  useEffect(() => {
    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
}

export function useSwipe(onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void) {
  useTouch({
    onSwipe: (event) => onSwipe(event.direction),
  });
}

export function useLongPress(onPress: () => void) {
  useTouch({
    onLongPress: onPress,
  });
}

export function useDoubleTap(onTap: () => void) {
  useTouch({
    onDoubleTap: onTap,
  });
}

export function usePinch(onPinch: (scale: number) => void) {
  useTouch({
    onPinch: (event) => onPinch(event.scale),
  });
}
