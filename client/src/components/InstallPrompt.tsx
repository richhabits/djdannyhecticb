/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import clsx from 'clsx';
import { savePreference, getPreference } from '@/utils/offlineStorage';
import './InstallPrompt.css';

let deferredPrompt: any = null;

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if already dismissed in this session
    const checkDismissed = async () => {
      const dismissed = await getPreference('install-prompt-dismissed');
      if (dismissed) {
        return;
      }

      const handler = (e: Event) => {
        e.preventDefault();
        deferredPrompt = e;
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    };

    checkDismissed();
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
      await savePreference('app-installed', true);
    }

    deferredPrompt = null;
  };

  const handleDismiss = async () => {
    setShowPrompt(false);
    await savePreference('install-prompt-dismissed', true);
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className={clsx('install-prompt', 'install-prompt--visible')}>
      <div className="install-prompt__content">
        <div className="install-prompt__header">
          <h2 className="install-prompt__title">Add to Home Screen</h2>
          <button
            className="install-prompt__close"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>

        <p className="install-prompt__description">
          Get offline access, faster loading, and a native app experience
        </p>

        <div className="install-prompt__benefits">
          <div className="install-prompt__benefit">
            <span className="install-prompt__benefit-icon">📱</span>
            <span>App-like experience</span>
          </div>
          <div className="install-prompt__benefit">
            <span className="install-prompt__benefit-icon">⚡</span>
            <span>Faster loading</span>
          </div>
          <div className="install-prompt__benefit">
            <span className="install-prompt__benefit-icon">🔌</span>
            <span>Offline access</span>
          </div>
        </div>

        <div className="install-prompt__actions">
          <button
            className="install-prompt__btn install-prompt__btn--primary"
            onClick={handleInstall}
          >
            <Download size={18} />
            Install App
          </button>
          <button
            className="install-prompt__btn install-prompt__btn--secondary"
            onClick={handleDismiss}
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
