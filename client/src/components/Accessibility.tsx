/**
 * Accessibility Components and Utilities
 * 
 * This module provides accessibility enhancements for the DJ Danny Hectic B website.
 */

import React, { useEffect, useRef, useState, useCallback, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// ============================================
// SKIP LINKS
// ============================================

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-md focus:outline-none"
    >
      {children}
    </a>
  );
}

/**
 * Skip links container with multiple targets
 */
export function SkipLinks() {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#main-nav">Skip to navigation</SkipLink>
      <SkipLink href="#footer">Skip to footer</SkipLink>
    </div>
  );
}

// ============================================
// SCREEN READER ONLY
// ============================================

/**
 * Visually hidden content for screen readers only
 */
export function VisuallyHidden({
  children,
  as: Component = "span",
  ...props
}: {
  children: React.ReactNode;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component className="sr-only" {...props}>
      {children}
    </Component>
  );
}

/**
 * Live region for dynamic announcements
 */
export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  className,
}: {
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  );
}

// ============================================
// FOCUS MANAGEMENT
// ============================================

/**
 * Focus trap for modals and dialogs
 */
export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
}: {
  children: React.ReactNode;
  active?: boolean;
  returnFocus?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, returnFocus]);

  return <div ref={containerRef}>{children}</div>;
}

/**
 * Hook for managing focus
 */
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null);

  const setFocus = useCallback((element: HTMLElement | null) => {
    focusRef.current = element;
    element?.focus();
  }, []);

  const restoreFocus = useCallback(() => {
    focusRef.current?.focus();
  }, []);

  return { setFocus, restoreFocus };
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

/**
 * Hook for keyboard navigation in lists
 */
export function useArrowNavigation<T extends HTMLElement>({
  onSelect,
  orientation = "vertical",
  loop = true,
}: {
  onSelect?: (index: number) => void;
  orientation?: "vertical" | "horizontal";
  loop?: boolean;
}) {
  const containerRef = useRef<T>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLElement>('[role="option"], [role="menuitem"], [data-nav-item]');
    if (items.length === 0) return;

    const upKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const downKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

    let newIndex = focusedIndex;

    switch (e.key) {
      case upKey:
        e.preventDefault();
        newIndex = focusedIndex - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
        break;
      case downKey:
        e.preventDefault();
        newIndex = focusedIndex + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
        break;
      case "Home":
        e.preventDefault();
        newIndex = 0;
        break;
      case "End":
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && onSelect) {
          onSelect(focusedIndex);
        }
        return;
      default:
        return;
    }

    setFocusedIndex(newIndex);
    items[newIndex]?.focus();
  }, [focusedIndex, orientation, loop, onSelect]);

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}

// ============================================
// REDUCED MOTION
// ============================================

/**
 * Hook to detect user's reduced motion preference
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// ============================================
// COLOR CONTRAST
// ============================================

/**
 * Hook to detect user's color scheme preference
 */
export function usePrefersColorScheme() {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return colorScheme;
}

// ============================================
// ACCESSIBLE BUTTON
// ============================================

/**
 * Accessible button with loading and disabled states
 */
export function AccessibleButton({
  children,
  isLoading = false,
  loadingText = "Loading...",
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
}) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center",
        isLoading && "cursor-wait",
        className
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="sr-only">{loadingText}</span>
            <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================
// ACCESSIBLE ICON
// ============================================

/**
 * Icon with accessible label
 */
export function AccessibleIcon({
  icon: Icon,
  label,
  className,
  ...props
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}) {
  return (
    <>
      <Icon className={className} aria-hidden="true" {...props} />
      <VisuallyHidden>{label}</VisuallyHidden>
    </>
  );
}

// ============================================
// ARIA CONTEXT
// ============================================

interface AriaContextType {
  announce: (message: string, politeness?: "polite" | "assertive") => void;
}

const AriaContext = createContext<AriaContextType | null>(null);

/**
 * Provider for ARIA announcements
 */
export function AriaProvider({ children }: { children: React.ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, politeness: "polite" | "assertive" = "polite") => {
    if (politeness === "assertive") {
      setAssertiveMessage(message);
      setTimeout(() => setAssertiveMessage(""), 100);
    } else {
      setPoliteMessage(message);
      setTimeout(() => setPoliteMessage(""), 100);
    }
  }, []);

  return (
    <AriaContext.Provider value={{ announce }}>
      {children}
      <LiveRegion politeness="polite">{politeMessage}</LiveRegion>
      <LiveRegion politeness="assertive">{assertiveMessage}</LiveRegion>
    </AriaContext.Provider>
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const context = useContext(AriaContext);
  if (!context) {
    throw new Error("useAnnounce must be used within an AriaProvider");
  }
  return context.announce;
}

export default {
  SkipLink,
  SkipLinks,
  VisuallyHidden,
  LiveRegion,
  FocusTrap,
  useFocusManagement,
  useArrowNavigation,
  usePrefersReducedMotion,
  usePrefersColorScheme,
  AccessibleButton,
  AccessibleIcon,
  AriaProvider,
  useAnnounce,
};
