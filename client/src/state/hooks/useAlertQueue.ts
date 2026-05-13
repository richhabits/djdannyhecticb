import { useState, useCallback, useRef, useEffect } from 'react';

export interface Alert {
  id: string;
  type: 'raid' | 'subscribe' | 'donation' | 'follow' | 'error' | 'success';
  title: string;
  message: string;
  data?: Record<string, any>;
  duration?: number; // ms, 0 = permanent
  priority?: number; // higher = displayed first
  action?: {
    label: string;
    onClick: () => void;
  };
}

const DISMISS_DURATIONS = {
  raid: 8000,
  subscribe: 7000,
  donation: 6000,
  follow: 5000,
  error: 8000,
  success: 4000,
} as const;

const PRIORITY_LEVELS = {
  raid: 3,
  subscribe: 2,
  donation: 2,
  follow: 1,
  error: 4,
  success: 0,
} as const;

export function useAlertQueue() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const add = useCallback((alert: Omit<Alert, 'id'>) => {
    const id = `alert-${idRef.current++}`;
    const newAlert: Alert = {
      ...alert,
      id,
      duration: alert.duration ?? DISMISS_DURATIONS[alert.type],
      priority: alert.priority ?? PRIORITY_LEVELS[alert.type],
    };

    setAlerts((prev) => {
      const updated = [...prev, newAlert];
      // Sort by priority (higher first)
      return updated.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    });

    // Auto-dismiss if duration > 0
    if (newAlert.duration > 0) {
      const timer = setTimeout(() => {
        dismiss(id);
      }, newAlert.duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setAlerts([]);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return {
    alerts,
    add,
    dismiss,
    dismissAll,
  };
}
