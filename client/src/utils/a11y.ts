/**
 * Accessibility Utility Functions
 * WCAG 2.1 AA compliant helpers for focus management, keyboard navigation, and screen reader support
 */

/**
 * Focus an HTML element and optionally add aria-live announcement
 */
export function focusElement(element: HTMLElement | null, announce?: string) {
  if (!element) return;
  element.focus();
  if (announce) {
    announceToScreenReader(announce);
  }
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]',
    '[role="tab"]',
    '[role="menuitem"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
}

/**
 * Implement focus trap for modal dialogs
 * Keeps keyboard focus within the modal when tabbing
 */
export function createFocusTrap(
  container: HTMLElement,
  onEscape?: () => void
): { activate: () => void; deactivate: () => void } {
  let isActive = false;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive) return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Handle Tab key
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }

    // Handle Escape key
    if (e.key === 'Escape' && onEscape) {
      onEscape();
    }
  };

  return {
    activate: () => {
      isActive = true;
      document.addEventListener('keydown', handleKeyDown);
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    },
    deactivate: () => {
      isActive = false;
      document.removeEventListener('keydown', handleKeyDown);
    },
  };
}

/**
 * Announce a message to screen reader users
 * Creates a temporary aria-live region and removes it after announcement
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  duration = 1000
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  // Ensure announcer exists or create it
  let announcer = document.getElementById('sr-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  announcer.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, duration);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/**
 * Generate unique ID for form field labels and descriptions
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Keyboard event handler for common patterns
 */
export const keyboardHandlers = {
  /**
   * Handle Enter or Space key press (for button-like elements)
   */
  isActivationKey(e: KeyboardEvent): boolean {
    return e.key === 'Enter' || e.key === ' ';
  },

  /**
   * Handle arrow key navigation
   */
  isNavigationKey(e: KeyboardEvent): boolean {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
  },

  /**
   * Handle Home/End keys
   */
  isExtentKey(e: KeyboardEvent): boolean {
    return e.key === 'Home' || e.key === 'End';
  },
};

/**
 * Utility to set aria-disabled with visual feedback
 */
export function setDisabledState(
  element: HTMLElement,
  disabled: boolean
): void {
  if (disabled) {
    element.setAttribute('aria-disabled', 'true');
    element.style.opacity = '0.5';
    element.style.cursor = 'not-allowed';
  } else {
    element.setAttribute('aria-disabled', 'false');
    element.style.opacity = '1';
    element.style.cursor = 'pointer';
  }
}

/**
 * Get recommended font sizes and line heights for accessibility
 */
export const typographyScales = {
  body: {
    fontSize: '16px',
    lineHeight: '1.5',
  },
  h1: {
    fontSize: '2rem',
    lineHeight: '1.2',
  },
  h2: {
    fontSize: '1.75rem',
    lineHeight: '1.3',
  },
  h3: {
    fontSize: '1.5rem',
    lineHeight: '1.4',
  },
  caption: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
};

/**
 * WCAG Color Contrast Checker
 * Returns true if contrast ratio meets WCAG AA standards (4.5:1 for normal text)
 */
export function checkContrast(
  foregroundHex: string,
  backgroundHex: string,
  largeText = false
): boolean {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foregroundHex);
  const l2 = getLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const contrast = (lighter + 0.05) / (darker + 0.05);

  // WCAG AA: 4.5:1 for normal text, 3:1 for large text
  return largeText ? contrast >= 3 : contrast >= 4.5;
}

/**
 * Polyfill for requestIdleCallback with fallback
 */
export function onIdle(callback: () => void, timeout = 50): number {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  }
  return window.setTimeout(callback, timeout);
}

/**
 * Debounce function for keyboard events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
