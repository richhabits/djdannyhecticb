/**
 * useLoadingState Hook
 * Manages async operation state with loading, error, and success states
 */

import { useState, useCallback } from 'react';

export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T,>(promise: Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await promise;
      setIsLoading(false);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setIsLoading(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    execute,
    setLoading: setIsLoading,
    setError,
    reset,
  };
}

/**
 * Advanced loading state hook with multiple named states
 */
export function useLoadingStates(initialStates: Record<string, boolean> = {}) {
  const [states, setStates] = useState(initialStates);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setStates((prev) => ({ ...prev, [key]: isLoading }));
  }, []);

  const setErrorFor = useCallback((key: string, error: string | null) => {
    setErrors((prev) => ({ ...prev, [key]: error }));
  }, []);

  const execute = useCallback(
    async <T,>(key: string, promise: Promise<T>): Promise<T | null> => {
      setLoading(key, true);
      setErrorFor(key, null);

      try {
        const result = await promise;
        setLoading(key, false);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setErrorFor(key, message);
        setLoading(key, false);
        return null;
      }
    },
    [setLoading, setErrorFor]
  );

  return {
    states,
    errors,
    execute,
    setLoading,
    setErrorFor,
  };
}
