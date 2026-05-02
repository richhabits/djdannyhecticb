/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * InstallPromptBanner Component
 * Prompts users to install the PWA on their device
 * Smart positioning: top on mobile, bottom on desktop
 */

import { useState, useEffect } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Download, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InstallPromptBanner() {
  const { isInstallable, isInstalled, install } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Don't show if already installed or dismissed
  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('installPrompt_dismissed', 'true');
  };

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50',
        'max-md:top-0 md:bottom-0', // Top on mobile, bottom on desktop
        'bg-gradient-to-r from-accent-red to-accent-orange',
        'text-white shadow-lg',
        'animate-in slide-in-from-top duration-300 md:slide-in-from-bottom',
        'safe-area'
      )}
      role="status"
      aria-live="polite"
      aria-label="Install app prompt"
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <Download className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Install DJ Danny App</p>
            <p className="text-xs opacity-90">Add to your home screen for quick access</p>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0 ml-4">
          <button
            onClick={handleInstall}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm',
              'bg-white text-accent-red',
              'hover:bg-opacity-90 transition-colors',
              'active:scale-95 transition-transform',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-accent-red',
              'min-h-[44px] flex items-center justify-center' // Min tap target
            )}
            aria-label="Install app"
          >
            Install
          </button>

          <button
            onClick={handleDismiss}
            className={cn(
              'px-3 py-2 rounded-lg',
              'hover:bg-white hover:bg-opacity-20 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
              'min-h-[44px] flex items-center justify-center'
            )}
            aria-label="Dismiss install prompt"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
