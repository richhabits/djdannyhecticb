import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionAnimationOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionAnimation(
  options: UseIntersectionAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else {
          if (!triggerOnce) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentElement = ref.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return {
    ref,
    isVisible: triggerOnce ? hasBeenVisible : isVisible,
    hasBeenVisible,
  };
}
