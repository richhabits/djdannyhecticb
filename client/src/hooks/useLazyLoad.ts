import { useEffect, useRef, useState } from 'react';

export function useLazyLoad<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return { ref, isLoaded };
}

// Lazy load components
export function useLazyLoadComponent<T extends HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        rootMargin: '100px',
        ...options,
      }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

// Lazy load multiple elements
export function useLazyLoadMultiple<T extends HTMLElement>(
  elements: React.RefObject<T>[],
  options?: IntersectionObserverInit
) {
  const [visibleElements, setVisibleElements] = useState<T[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleElements((prev) => {
            const target = entry.target as T;
            if (!prev.includes(target)) {
              return [...prev, target];
            }
            return prev;
          });
        }
      },
      {
        rootMargin: '50px',
        ...options,
      }
    );

    elements.forEach((elem) => {
      if (elem.current) observer.observe(elem.current);
    });

    return () => observer.disconnect();
  }, [elements, options]);

  return visibleElements;
}

// Debounced resize observer
export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: (entry: ResizeObserverEntry) => void,
  debounceMs = 100
) {
  useEffect(() => {
    if (!ref.current) return;

    let debounceTimer: NodeJS.Timeout;

    const observer = new ResizeObserver((entries) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        entries.forEach(callback);
      }, debounceMs);
    });

    observer.observe(ref.current);

    return () => {
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [ref, callback, debounceMs]);
}
