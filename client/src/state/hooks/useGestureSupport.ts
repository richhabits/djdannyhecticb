import { useRef, useEffect, useCallback } from 'react';

export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
}

const SWIPE_THRESHOLD = 50; // Minimum pixels to trigger swipe
const LONG_PRESS_DURATION = 500; // Milliseconds
const LONG_PRESS_TOLERANCE = 10; // Pixels of movement allowed during long press
const DOUBLE_TAP_WINDOW = 300; // Milliseconds between taps for double-tap

export function useGestureSupport(
  handlers: GestureHandlers,
  element?: React.RefObject<HTMLElement>
) {
  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const lastTap = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isTouchMoving = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return; // Only handle single touch

    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    isTouchMoving.current = false;

    // Set up long press detection
    longPressTimer.current = setTimeout(() => {
      if (!isTouchMoving.current) {
        handlers.onLongPress?.();
      }
    }, LONG_PRESS_DURATION);
  }, [handlers]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 1) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const distance = Math.sqrt(
      Math.pow(currentX - startX.current, 2) +
        Math.pow(currentY - startY.current, 2)
    );

    // If user moved more than tolerance, mark as moving (cancel long press)
    if (distance > LONG_PRESS_TOLERANCE) {
      isTouchMoving.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (e.changedTouches.length !== 1) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const duration = Date.now() - startTime.current;
      const distance = Math.sqrt(
        Math.pow(endX - startX.current, 2) +
          Math.pow(endY - startY.current, 2)
      );

      // Long press was already handled in timeout
      if (duration > LONG_PRESS_DURATION && distance < LONG_PRESS_TOLERANCE) {
        return;
      }

      // Double tap detection
      if (duration < 300) {
        const now = Date.now();
        if (now - lastTap.current < DOUBLE_TAP_WINDOW) {
          handlers.onDoubleTap?.();
          lastTap.current = 0; // Reset to prevent triple tap
          return;
        }
        lastTap.current = now;
      }

      // Swipe detection (only if moved and not a long press)
      if (distance > SWIPE_THRESHOLD && isTouchMoving.current) {
        const deltaX = endX - startX.current;
        const deltaY = endY - startY.current;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Horizontal swipe takes precedence if significantly more movement
        if (absDeltaX > absDeltaY * 0.5) {
          if (deltaX > 0 && absDeltaX > SWIPE_THRESHOLD) {
            handlers.onSwipeRight?.();
          } else if (deltaX < 0 && absDeltaX > SWIPE_THRESHOLD) {
            handlers.onSwipeLeft?.();
          }
        }
        // Vertical swipe
        else if (absDeltaY > SWIPE_THRESHOLD) {
          if (deltaY > 0) {
            handlers.onSwipeDown?.();
          } else {
            handlers.onSwipeUp?.();
          }
        }
      }
    },
    [handlers]
  );

  useEffect(() => {
    const target = element?.current || window;

    target.addEventListener('touchstart', handleTouchStart as EventListener);
    target.addEventListener('touchmove', handleTouchMove as EventListener);
    target.addEventListener('touchend', handleTouchEnd as EventListener);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart as EventListener);
      target.removeEventListener('touchmove', handleTouchMove as EventListener);
      target.removeEventListener('touchend', handleTouchEnd as EventListener);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [element, handleTouchStart, handleTouchMove, handleTouchEnd]);
}
