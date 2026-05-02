/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * useNetworkQuality Hook
 * Detect network connection type and quality for adaptive content
 */

import { useEffect, useState } from 'react';

export type ConnectionType = '4g' | '3g' | '2g' | 'wifi' | 'unknown';

export interface NetworkQuality {
  type: ConnectionType;
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // ms
  saveData: boolean;
  online: boolean;
}

export function useNetworkQuality() {
  const [quality, setQuality] = useState<NetworkQuality>(() => {
    if (typeof window === 'undefined') {
      return {
        type: 'unknown',
        effectiveType: '4g',
        downlink: 0,
        rtt: 0,
        saveData: false,
        online: true,
      };
    }

    return getNetworkQuality();
  });

  useEffect(() => {
    function handleNetworkChange() {
      setQuality(getNetworkQuality());
    }

    // Network Information API
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleNetworkChange);
    }

    // Online/Offline events
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      if (connection) {
        connection.removeEventListener('change', handleNetworkChange);
      }
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  return quality;
}

function getNetworkQuality(): NetworkQuality {
  if (typeof window === 'undefined') {
    return {
      type: 'unknown',
      effectiveType: '4g',
      downlink: 0,
      rtt: 0,
      saveData: false,
      online: true,
    };
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) {
    return {
      type: 'unknown',
      effectiveType: '4g',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: (navigator as any).connection?.saveData || false,
      online: navigator.onLine,
    };
  }

  const effectiveType = connection.effectiveType || '4g';
  const saveData = connection.saveData || false;

  return {
    type: detectConnectionType(connection.type),
    effectiveType,
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData,
    online: navigator.onLine,
  };
}

function detectConnectionType(type: string): ConnectionType {
  switch (type) {
    case 'wifi':
      return 'wifi';
    case '4g':
      return '4g';
    case '3g':
      return '3g';
    case '2g':
    case 'slow-2g':
      return '2g';
    default:
      return 'unknown';
  }
}

export function useAdaptiveContent() {
  const quality = useNetworkQuality();

  return {
    // Should reduce quality on slow connections
    shouldReduceQuality:
      quality.effectiveType === 'slow-2g' ||
      quality.effectiveType === '2g' ||
      quality.effectiveType === '3g' ||
      quality.saveData,

    // Should defer non-critical content on slow connections
    shouldDefer: quality.effectiveType === 'slow-2g' || quality.effectiveType === '2g',

    // Video quality settings
    videoQuality: getVideoQuality(quality),

    // Image quality settings
    imageQuality: getImageQuality(quality),

    // Lazy load aggressiveness
    lazyLoadThreshold: getLazyLoadThreshold(quality),

    // Animation settings
    reduceMotion: quality.effectiveType === 'slow-2g' || quality.effectiveType === '2g',

    // Network info
    quality,
  };
}

function getVideoQuality(quality: NetworkQuality): 'low' | 'medium' | 'high' {
  if (!quality.online) return 'low';

  switch (quality.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'low';
    case '3g':
      return 'medium';
    case '4g':
    default:
      return 'high';
  }
}

function getImageQuality(quality: NetworkQuality): 'low' | 'medium' | 'high' {
  if (quality.saveData) return 'low';

  switch (quality.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'low';
    case '3g':
      return 'medium';
    case '4g':
    default:
      return 'high';
  }
}

function getLazyLoadThreshold(quality: NetworkQuality): number {
  // Intersection Observer threshold for lazy loading
  // Load earlier on fast connections, later on slow ones
  switch (quality.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 2000; // Load 2s before visibility
    case '3g':
      return 1000; // Load 1s before visibility
    case '4g':
    default:
      return 500; // Load 500ms before visibility
  }
}

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
