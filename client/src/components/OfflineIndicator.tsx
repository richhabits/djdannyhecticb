/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import React, { useEffect, useState } from 'react';
import { useIsOnline, useNetworkQuality } from '@/hooks/useNetworkQuality';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStorageStats } from '@/utils/offlineStorage';
import './OfflineIndicator.css';

interface StorageStats {
  used: number;
  quota: number;
  percentage: number;
}

export function OfflineIndicator() {
  const isOnline = useIsOnline();
  const { effectiveType, downlink } = useNetworkQuality();
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      getStorageStats().then(setStorageStats);
    }
  }, [isOnline]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'px-4 py-2.5',
        'safe-area-top',
        'bg-red-900 text-red-100',
        'transition-all duration-300'
      )}
      role="status"
      aria-live="assertive"
      aria-label="Offline mode"
    >
      <div className="max-w-screen-xl mx-auto">
        <div
          className="flex items-center justify-between gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">
              You are offline - Using cached data
            </span>
          </div>

          {storageStats && (
            <div className="text-xs opacity-70">
              {(storageStats.used / 1024 / 1024).toFixed(1)}MB used
            </div>
          )}
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-30 text-xs space-y-1">
            <p className="opacity-90">
              Cached messages and data will sync when you reconnect.
            </p>
            {storageStats && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-black bg-opacity-20 rounded h-2 overflow-hidden">
                  <div
                    className="bg-current bg-opacity-70 h-full transition-all"
                    style={{ width: `${storageStats.percentage}%` }}
                  />
                </div>
                <span className="opacity-70">
                  {storageStats.percentage.toFixed(0)}% storage used
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function SlowConnectionIndicator() {
  const isOnline = useIsOnline();
  const { effectiveType, downlink } = useNetworkQuality();
  const [showDetails, setShowDetails] = useState(false);

  const isSlowConnection = isOnline && (effectiveType === 'slow-2g' || effectiveType === '2g');

  if (!isSlowConnection) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'px-4 py-2.5',
        'safe-area-top',
        'bg-yellow-900 text-yellow-100',
        'transition-all duration-300'
      )}
      role="status"
      aria-live="polite"
      aria-label="Slow connection"
    >
      <div className="max-w-screen-xl mx-auto">
        <div
          className="flex items-center justify-between gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">
              Slow connection - Using reduced quality
            </span>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-current border-opacity-30 text-xs space-y-1">
            <p className="opacity-90">
              Connection speed: {downlink ? `${downlink} Mbps` : 'Slow (2G/3G)'}. Images and
              videos are optimized for your connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function OnlineIndicator() {
  const isOnline = useIsOnline();
  const [showTrigger, setShowTrigger] = useState(false);

  React.useEffect(() => {
    if (isOnline) {
      setShowTrigger(true);
      const timer = setTimeout(() => setShowTrigger(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showTrigger) {
    return null;
  }

  return (
    <div className="online-indicator" role="status" aria-live="polite">
      <div className="online-indicator__content">
        <Wifi size={16} className="online-indicator__icon" />
        <span className="online-indicator__text">Back online</span>
      </div>
    </div>
  );
}
