/**
 * Animation Helper Utilities
 * Common patterns and utility functions for animations
 */

/**
 * Build animation class string from options
 */
export interface AnimationOptions {
  animation?: string;
  duration?: 'fast' | 'base' | 'slow';
  delay?: number;
  iteration?: 'once' | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export function buildAnimationClass(options: AnimationOptions): string {
  const classes: string[] = [];

  if (options.animation) {
    classes.push(options.animation);
  }

  if (options.duration) {
    classes.push(`animate-duration-${options.duration}`);
  }

  if (options.iteration === 'infinite') {
    classes.push('');
  }

  return classes.filter(Boolean).join(' ');
}

/**
 * Get staggered animation delays for list items
 */
export function getStaggeredDelay(index: number, baseDelay: number = 100): number {
  return index * baseDelay;
}

/**
 * Create CSS variable for animation delay
 */
export function createDelayStyle(index: number, delayMs: number = 100) {
  return {
    '--animation-delay': `${index * delayMs}ms`,
    animationDelay: `var(--animation-delay)`,
  } as React.CSSProperties;
}

/**
 * Prefers Reduced Motion query
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Listen for reduced motion preference changes
 */
export function onReducedMotionChange(callback: (prefersReduced: boolean) => void) {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listener = (e: MediaQueryListEvent) => callback(e.matches);

  mediaQuery.addEventListener('change', listener);
  return () => mediaQuery.removeEventListener('change', listener);
}

/**
 * Get animation duration in milliseconds
 */
export function getAnimationDuration(duration: 'fast' | 'base' | 'slow'): number {
  const durations = {
    fast: 150,
    base: 200,
    slow: 300,
  };
  return durations[duration];
}

/**
 * Delay function execution
 */
export async function delayExecution(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for animation to complete
 */
export function onAnimationComplete(
  element: HTMLElement,
  callback: () => void
): () => void {
  const handler = () => {
    callback();
    element.removeEventListener('animationend', handler);
  };

  element.addEventListener('animationend', handler);

  return () => element.removeEventListener('animationend', handler);
}

/**
 * Check if animations are safe to use
 */
export function areAnimationsSafe(): boolean {
  return !prefersReducedMotion();
}

/**
 * Get easing function
 */
export const easingFunctions = {
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  linear: 'linear',
} as const;

/**
 * Create smooth scroll animation
 */
export function smoothScroll(
  element: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth' }
) {
  element.scrollIntoView(options);
}

/**
 * Animate scroll to specific position
 */
export function animateScrollTo(
  target: number,
  duration: number = 1000,
  element: HTMLElement | Window = window
) {
  const start = 'scrollY' in element ? element.scrollY : (element as HTMLElement).scrollTop;
  const distance = target - start;
  const startTime = Date.now();

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const scroll = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = easeOutCubic(progress);
    const position = start + distance * easeProgress;

    if (element === window) {
      window.scrollTo(0, position);
    } else {
      (element as HTMLElement).scrollTop = position;
    }

    if (progress < 1) {
      requestAnimationFrame(scroll);
    }
  };

  requestAnimationFrame(scroll);
}

/**
 * Create fade transition between elements
 */
export function createFadeTransition(
  fromElement: HTMLElement,
  toElement: HTMLElement,
  duration: number = 200
): Promise<void> {
  return new Promise((resolve) => {
    // Fade out
    fromElement.style.opacity = '0';
    fromElement.style.transition = `opacity ${duration}ms ease-out`;

    setTimeout(() => {
      fromElement.style.display = 'none';
      toElement.style.display = 'block';
      toElement.style.opacity = '0';

      requestAnimationFrame(() => {
        toElement.style.transition = `opacity ${duration}ms ease-out`;
        toElement.style.opacity = '1';
      });

      setTimeout(resolve, duration);
    }, duration);
  });
}

/**
 * Ripple effect (material-like)
 */
export function createRippleEffect(
  element: HTMLElement,
  event: MouseEvent
): void {
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const size = Math.max(rect.width, rect.height);

  const ripple = document.createElement('span');
  ripple.style.position = 'absolute';
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = ripple.style.height = '0px';
  ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
  ripple.style.borderRadius = '50%';
  ripple.style.pointerEvents = 'none';
  ripple.style.transform = 'translate(-50%, -50%)';

  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);

  const animate = () => {
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.opacity = '0';
    ripple.style.transition = `all 600ms ease-out`;
  };

  requestAnimationFrame(animate);

  setTimeout(() => ripple.remove(), 600);
}

/**
 * Get random delay for staggered animations
 */
export function getRandomDelay(min: number = 0, max: number = 300): number {
  return Math.random() * (max - min) + min;
}

/**
 * Convert keyframe object to CSS string
 */
export function keyframeToCSS(keyframes: Record<string, Record<string, string>>): string {
  return Object.entries(keyframes)
    .map(([key, styles]) => {
      const styleStr = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');
      return `${key} { ${styleStr} }`;
    })
    .join(' ');
}
