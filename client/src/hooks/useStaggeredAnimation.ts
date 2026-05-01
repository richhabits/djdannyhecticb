/**
 * useStaggeredAnimation Hook
 * Applies staggered animation delays to child elements
 */

import { useEffect, useRef } from 'react';

export function useStaggeredAnimation(
  containerSelector: string,
  delayIncrement: number = 100
) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) return;

    const children = container.querySelectorAll('[data-stagger]');
    children.forEach((child, index) => {
      (child as HTMLElement).style.animationDelay = `${index * delayIncrement}ms`;
    });

    return () => {
      // Cleanup: reset animation delays
      children.forEach((child) => {
        (child as HTMLElement).style.animationDelay = '0ms';
      });
    };
  }, [containerSelector, delayIncrement]);

  return containerRef;
}

/**
 * Alternative hook for custom stagger control
 */
export function useListStagger(isVisible: boolean = true, delayMs: number = 100) {
  useEffect(() => {
    if (!isVisible) return;

    const elements = document.querySelectorAll('[data-list-item]');
    elements.forEach((el, index) => {
      const element = el as HTMLElement;
      element.style.setProperty('--stagger-delay', `${index * delayMs}ms`);
      element.style.animationDelay = `var(--stagger-delay)`;
    });

    return () => {
      elements.forEach((el) => {
        const element = el as HTMLElement;
        element.style.animationDelay = '0ms';
      });
    };
  }, [isVisible, delayMs]);
}
