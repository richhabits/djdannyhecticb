import { useRef, useState, useCallback } from 'react';
import { useGestureSupport, GestureHandlers } from '@/hooks/useGestureSupport';

export interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  className?: string;
  /** Swipe direction for exit animation ('left' | 'right' | 'up' | 'down') */
  swipeDirection?: 'left' | 'right' | 'up' | 'down';
  /** Callback animation delay before handler is called */
  animationDelay?: number;
  /** Enable visual feedback on gestures */
  showFeedback?: boolean;
}

/**
 * SwipeableCard - Interactive card with gesture support
 *
 * Provides swipe, long-press, and double-tap detection with smooth animations.
 * Mobile-optimized with visual feedback and accessibility support.
 *
 * @example
 * ```tsx
 * <SwipeableCard
 *   onSwipeLeft={() => console.log('Swiped left')}
 *   onLongPress={() => console.log('Long pressed')}
 *   showFeedback
 * >
 *   <div>Swipe me!</div>
 * </SwipeableCard>
 * ```
 */
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  onDoubleTap,
  className = '',
  swipeDirection,
  animationDelay = 200,
  showFeedback = false,
}: SwipeableCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<
    'left' | 'right' | 'up' | 'down' | null
  >(null);
  const [isPressed, setIsPressed] = useState(false);

  const animationClassMap = {
    left: 'animate-swipe-out-left',
    right: 'animate-swipe-out-right',
    up: 'animate-swipe-out-up',
    down: 'animate-swipe-out-down',
  };

  const handleSwipeLeft = useCallback(() => {
    if (showFeedback) {
      setIsAnimating(true);
      setAnimationType('left');
    }
    setTimeout(() => onSwipeLeft?.(), animationDelay);
  }, [onSwipeLeft, animationDelay, showFeedback]);

  const handleSwipeRight = useCallback(() => {
    if (showFeedback) {
      setIsAnimating(true);
      setAnimationType('right');
    }
    setTimeout(() => onSwipeRight?.(), animationDelay);
  }, [onSwipeRight, animationDelay, showFeedback]);

  const handleSwipeUp = useCallback(() => {
    if (showFeedback) {
      setIsAnimating(true);
      setAnimationType('up');
    }
    setTimeout(() => onSwipeUp?.(), animationDelay);
  }, [onSwipeUp, animationDelay, showFeedback]);

  const handleSwipeDown = useCallback(() => {
    if (showFeedback) {
      setIsAnimating(true);
      setAnimationType('down');
    }
    setTimeout(() => onSwipeDown?.(), animationDelay);
  }, [onSwipeDown, animationDelay, showFeedback]);

  const handleLongPress = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    onLongPress?.();
  }, [onLongPress]);

  const handleDoubleTap = useCallback(() => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onDoubleTap?.();
  }, [onDoubleTap]);

  const gestureHandlers: GestureHandlers = {
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: handleSwipeUp,
    onSwipeDown: handleSwipeDown,
    onLongPress: handleLongPress,
    onDoubleTap: handleDoubleTap,
  };

  useGestureSupport(gestureHandlers, ref);

  const animationClass =
    isAnimating && animationType ? animationClassMap[animationType] : '';

  return (
    <div
      ref={ref}
      className={`
        cursor-grab active:cursor-grabbing gesture-friendly
        transition-all duration-200
        ${animationClass}
        ${isPressed ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
        ${showFeedback ? 'ring-2 ring-transparent hover:ring-accent/30' : ''}
        ${className}
      `}
      role="button"
      tabIndex={0}
      aria-label="Swipeable card"
      onKeyDown={(e) => {
        // Add keyboard support for accessibility
        if (e.key === 'Enter') {
          handleDoubleTap();
        } else if (e.key === ' ') {
          handleLongPress();
        }
      }}
    >
      {children}
    </div>
  );
}

/**
 * SwipeableDismissCard - Card that dismisses on swipe
 *
 * Automatically removes itself when swiped with customizable directions.
 *
 * @example
 * ```tsx
 * <SwipeableDismissCard
 *   onDismiss={() => removeFromList()}
 *   dismissDirection="left"
 * >
 *   <Alert message="Swipe to dismiss" />
 * </SwipeableDismissCard>
 * ```
 */
export interface SwipeableDismissCardProps extends Omit<SwipeableCardProps, 'onSwipeLeft' | 'onSwipeRight' | 'onSwipeUp' | 'onSwipeDown'> {
  onDismiss: () => void;
  dismissDirection?: 'left' | 'right' | 'up' | 'down';
}

export function SwipeableDismissCard({
  children,
  onDismiss,
  dismissDirection = 'left',
  className = '',
  ...props
}: SwipeableDismissCardProps) {
  const handlers: SwipeableCardProps = {
    children,
    className,
    showFeedback: true,
    swipeDirection: dismissDirection,
    ...props,
  };

  if (dismissDirection === 'left') {
    handlers.onSwipeLeft = onDismiss;
  } else if (dismissDirection === 'right') {
    handlers.onSwipeRight = onDismiss;
  } else if (dismissDirection === 'up') {
    handlers.onSwipeUp = onDismiss;
  } else if (dismissDirection === 'down') {
    handlers.onSwipeDown = onDismiss;
  }

  return <SwipeableCard {...handlers} />;
}
