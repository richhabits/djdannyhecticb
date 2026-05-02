/**
 * useScrollAnimation Hook
 * Trigger animations when elements enter viewport
 * Performance optimized with Intersection Observer
 * Last updated: 2026-05-01
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean; // Only trigger animation once
}

/**
 * Hook to trigger animations when element enters viewport
 * Uses Intersection Observer for performance
 */
export const useScrollAnimation = (
  options: UseScrollAnimationOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
  } = options;

  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasAnimated || !once) {
            setIsVisible(true);
            setHasAnimated(true);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold, rootMargin, once, hasAnimated]);

  return { elementRef, isVisible };
};

/**
 * Hook for staggered animations of child elements
 * Cascading animation effect with configurable delays
 */
export const useStaggerAnimation = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseScrollAnimationOptions & {
    staggerDelay?: number; // Milliseconds between each child animation
  } = {}
) => {
  const { staggerDelay = 50, ...scrollOptions } = options;
  const { elementRef: ref, isVisible } = useScrollAnimation(scrollOptions);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const children = containerRef.current.children;
    Array.from(children).forEach((child, index) => {
      const element = child as HTMLElement;
      element.style.animationDelay = `${index * staggerDelay}ms`;
      element.classList.add('animate-fade-in');
    });
  }, [isVisible, staggerDelay, containerRef]);

  return { containerRef: ref };
};

/**
 * Hook for parallax scroll effect
 * Applies transform based on scroll position
 */
export const useParallaxScroll = (
  elementRef: React.RefObject<HTMLElement>,
  intensity: number = 0.5 // 0-1, higher = more movement
) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const handleScroll = () => {
      if (!elementRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const scrollProgress = 1 - (rect.top / window.innerHeight);

      if (scrollProgress >= 0 && scrollProgress <= 1) {
        const movement = scrollProgress * 100 * intensity;
        elementRef.current.style.transform = `translateY(${movement}px)`;
      }
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
        setTimeout(() => {
          ticking = false;
        }, 16); // ~60fps
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [intensity, elementRef]);
};

/**
 * Hook for fade-in animations with staggered children
 */
export const useFadeInAnimation = (
  containerRef: React.RefObject<HTMLElement>,
  options: UseScrollAnimationOptions & {
    childDelay?: number;
  } = {}
) => {
  const { childDelay = 100, ...scrollOptions } = options;
  const { isVisible } = useScrollAnimation(scrollOptions);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const children = containerRef.current.children;
    Array.from(children).forEach((child, index) => {
      const element = child as HTMLElement;
      element.style.opacity = '0';
      element.style.animation = `fadeIn 300ms ease-out ${index * childDelay}ms forwards`;
    });
  }, [isVisible, childDelay, containerRef]);

  return containerRef;
};

/**
 * Hook for number counter animations
 * Counts from start to end value when element enters viewport
 */
export const useCounterAnimation = (
  elementRef: React.RefObject<HTMLElement>,
  endValue: number,
  duration: number = 2000,
  options: UseScrollAnimationOptions = {}
) => {
  const { isVisible } = useScrollAnimation(options);
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;

      if (progress < 1) {
        setCurrentValue(Math.floor(endValue * progress));
        animationId = requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isVisible, endValue, duration]);

  return currentValue;
};

/**
 * Hook for scroll-triggered reveal animations
 * Reveals content as user scrolls down
 */
export const useRevealAnimation = (
  elementRef: React.RefObject<HTMLElement>,
  direction: 'top' | 'bottom' | 'left' | 'right' = 'bottom',
  distance: number = 40,
  options: UseScrollAnimationOptions = {}
) => {
  const { isVisible } = useScrollAnimation(options);

  useEffect(() => {
    if (!elementRef.current) return;

    if (isVisible) {
      elementRef.current.style.animation = `slideIn${direction.charAt(0).toUpperCase() + direction.slice(1)} 600ms ease-out forwards`;
    }
  }, [isVisible, direction, distance, elementRef]);

  return elementRef;
};

/**
 * Hook for scale-in animations
 */
export const useScaleAnimation = (
  elementRef: React.RefObject<HTMLElement>,
  startScale: number = 0.9,
  options: UseScrollAnimationOptions = {}
) => {
  const { isVisible } = useScrollAnimation(options);

  useEffect(() => {
    if (!elementRef.current) return;

    if (isVisible) {
      elementRef.current.style.animation = 'scaleIn 300ms ease-out forwards';
    } else {
      elementRef.current.style.transform = `scale(${startScale})`;
      elementRef.current.style.opacity = '0';
    }
  }, [isVisible, startScale, elementRef]);

  return elementRef;
};

/**
 * Hook for bounce animations
 */
export const useBounceAnimation = (
  elementRef: React.RefObject<HTMLElement>,
  intensity: number = 1,
  duration: number = 600
) => {
  const trigger = useCallback(() => {
    if (!elementRef.current) return;

    elementRef.current.style.animation = `none`;
    // Force reflow to restart animation
    void elementRef.current.offsetWidth;
    elementRef.current.style.animation = `bounce ${duration}ms ease-out`;
  }, [elementRef, duration]);

  return { trigger };
};

/**
 * Hook for pulse/glow animations
 */
export const usePulseAnimation = (
  elementRef: React.RefObject<HTMLElement>,
  enabled: boolean = true,
  duration: number = 2000
) => {
  useEffect(() => {
    if (!elementRef.current || !enabled) return;

    const interval = setInterval(() => {
      if (elementRef.current) {
        elementRef.current.style.animation = `none`;
        void elementRef.current.offsetWidth;
        elementRef.current.style.animation = `pulse-soft ${duration}ms infinite`;
      }
    }, duration + 100);

    return () => clearInterval(interval);
  }, [enabled, duration, elementRef]);
};

/**
 * Hook for intersection observer without animation
 * Useful for lazy loading, analytics, etc.
 */
export const useIntersectionObserver = (
  elementRef: React.RefObject<HTMLElement>,
  callback: (isVisible: boolean) => void,
  options: UseScrollAnimationOptions = {}
) => {
  const { threshold = 0.1, rootMargin = '0px' } = options;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold, rootMargin, callback]);

  return elementRef;
};
