/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Service Worker Manager
 * Handles registration, updates, and lifecycle management
 */

export interface ServiceWorkerConfig {
  enableAutoUpdate?: boolean;
  updateCheckInterval?: number;
}

let updateCheckInterval: ReturnType<typeof setInterval> | null = null;

export async function registerServiceWorker(config: ServiceWorkerConfig = {}) {
  const { enableAutoUpdate = true, updateCheckInterval: interval = 60000 } = config;

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration);

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is ready
          notifyUpdate();
        }
      });
    });

    // Auto-check for updates
    if (enableAutoUpdate) {
      startUpdateCheck(registration, interval);
    }

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

function startUpdateCheck(
  registration: ServiceWorkerRegistration,
  interval: number
) {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
  }

  // Check immediately
  registration.update();

  // Then check periodically
  updateCheckInterval = setInterval(() => {
    registration.update();
  }, interval);
}

function notifyUpdate() {
  // Dispatch custom event for app to handle
  const event = new CustomEvent('sw-update-available', {
    detail: { message: 'New version available. Refresh to update.' },
  });
  window.dispatchEvent(event);
}

export function stopUpdateCheck() {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
}

export async function skipWaiting() {
  const registration = await navigator.serviceWorker.ready;
  if (!registration) return;

  const worker = registration.waiting || registration.active;
  if (worker) {
    worker.postMessage({ type: 'SKIP_WAITING' });
  }
}

export function listenForUpdates(callback: () => void) {
  window.addEventListener('sw-update-available', callback);
  return () => {
    window.removeEventListener('sw-update-available', callback);
  };
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    stopUpdateCheck();
  } catch (error) {
    console.error('Failed to unregister service worker:', error);
  }
}
