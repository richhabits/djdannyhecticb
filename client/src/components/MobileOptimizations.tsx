/**
 * Mobile UX Optimizations
 * 
 * Components and utilities for improving mobile user experience.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// ============================================
// MOBILE DETECTION
// ============================================

/**
 * Hook to detect mobile device
 */
export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect touch device
 */
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}

// ============================================
// MOBILE NAVIGATION
// ============================================

/**
 * Bottom navigation bar for mobile
 */
export function MobileNav({
  items,
  activeItem,
  onItemClick,
  className,
}: {
  items: { id: string; label: string; icon: React.ReactNode; href?: string }[];
  activeItem?: string;
  onItemClick?: (id: string) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50",
        "flex items-center justify-around py-2 px-4",
        "safe-area-inset-bottom",
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const content = (
          <>
            <span className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
              isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
            )}>
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </span>
          </>
        );

        if (item.href) {
          return (
            <a
              key={item.id}
              href={item.href}
              className="flex-1 flex justify-center"
              aria-current={isActive ? "page" : undefined}
            >
              {content}
            </a>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className="flex-1 flex justify-center"
            aria-pressed={isActive}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}

// ============================================
// SWIPE GESTURES
// ============================================

interface SwipeState {
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  isSwiping: boolean;
  direction: "left" | "right" | "up" | "down" | null;
}

/**
 * Hook for handling swipe gestures
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}) {
  const [state, setState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    deltaX: 0,
    deltaY: 0,
    isSwiping: false,
    direction: null,
  });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setState({
      startX: touch.clientX,
      startY: touch.clientY,
      deltaX: 0,
      deltaY: 0,
      isSwiping: true,
      direction: null,
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.isSwiping) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    let direction: SwipeState["direction"] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? "right" : "left";
    } else {
      direction = deltaY > 0 ? "down" : "up";
    }

    setState(prev => ({
      ...prev,
      deltaX,
      deltaY,
      direction,
    }));
  }, [state.isSwiping, state.startX, state.startY]);

  const handleTouchEnd = useCallback(() => {
    if (!state.isSwiping) return;

    const { deltaX, deltaY, direction } = state;

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      switch (direction) {
        case "left":
          onSwipeLeft?.();
          break;
        case "right":
          onSwipeRight?.();
          break;
        case "up":
          onSwipeUp?.();
          break;
        case "down":
          onSwipeDown?.();
          break;
      }
    }

    setState(prev => ({
      ...prev,
      isSwiping: false,
      direction: null,
    }));
  }, [state, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    state,
  };
}

// ============================================
// PULL TO REFRESH
// ============================================

/**
 * Pull to refresh component
 */
export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
}: {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || containerRef.current?.scrollTop !== 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      e.preventDefault();
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-y-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none transition-opacity"
        style={{
          top: pullDistance - 40,
          opacity: progress,
        }}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full border-2 border-accent border-t-transparent",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: `rotate(${progress * 360}deg)`,
          }}
        />
      </div>

      {/* Content with transform */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: pullDistance === 0 ? "transform 0.2s" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// SCROLL TO TOP
// ============================================

/**
 * Scroll to top button
 */
export function ScrollToTop({
  threshold = 300,
  className,
}: {
  threshold?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-20 right-4 z-50 rounded-full shadow-lg",
        "transition-transform hover:scale-110",
        className
      )}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5" />
    </Button>
  );
}

// ============================================
// MOBILE MODAL
// ============================================

/**
 * Mobile-friendly modal/bottom sheet
 */
export function MobileSheet({
  isOpen,
  onClose,
  children,
  title,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const { handlers, state } = useSwipe({
    onSwipeDown: onClose,
    threshold: 100,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl",
          "max-h-[85vh] overflow-hidden",
          "animate-slide-up",
          className
        )}
        style={{
          transform: state.isSwiping ? `translateY(${Math.max(0, state.deltaY)}px)` : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "sheet-title" : undefined}
        {...handlers}
      >
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-2 border-b border-border">
            <h2 id="sheet-title" className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-accent/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto p-4 safe-area-inset-bottom">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// TOUCH FEEDBACK
// ============================================

/**
 * Touch feedback wrapper for mobile interactions
 */
export function TouchFeedback({
  children,
  className,
  activeClassName = "bg-accent/10",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  activeClassName?: string;
}) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div
      className={cn(
        "transition-colors duration-150",
        isActive && activeClassName,
        className
      )}
      onTouchStart={() => setIsActive(true)}
      onTouchEnd={() => setIsActive(false)}
      onTouchCancel={() => setIsActive(false)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// SAFE AREA INSETS
// ============================================

/**
 * Component that respects safe area insets
 */
export function SafeArea({
  children,
  top,
  bottom,
  left,
  right,
  className,
}: {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        top && "pt-safe",
        bottom && "pb-safe",
        left && "pl-safe",
        right && "pr-safe",
        className
      )}
      style={{
        paddingTop: top ? "env(safe-area-inset-top)" : undefined,
        paddingBottom: bottom ? "env(safe-area-inset-bottom)" : undefined,
        paddingLeft: left ? "env(safe-area-inset-left)" : undefined,
        paddingRight: right ? "env(safe-area-inset-right)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export default {
  useMobile,
  useTouchDevice,
  MobileNav,
  useSwipe,
  PullToRefresh,
  ScrollToTop,
  MobileSheet,
  TouchFeedback,
  SafeArea,
};
