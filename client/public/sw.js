/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

// Enhanced Service Worker for PWA with offline support and push notifications
const CACHE_NAME = 'hectic-radio-v4';
const RUNTIME_CACHE = 'hectic-radio-runtime-v4';
const API_CACHE = 'hectic-radio-api-v4';
const IMAGE_CACHE = 'hectic-radio-images-v4';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo-danny-hectic-b.png',
  '/logo-danny-hectic-b.webp',
  '/logo-icon.png',
  '/manifest.json',
];

const ASSET_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.ico',
  '.woff2',
  '.woff',
];

const API_PATHS = ['/api/', '/trpc/'];

// Install event - precache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching resources');
        return cache.addAll(PRECACHE_URLS).catch((error) => {
          console.warn('[SW] Precache failed:', error);
          // Continue even if some precache fails
        });
      })
      .then(() => {
        console.log('[SW] Skipping waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== API_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  const isAsset = ASSET_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
  const isHTML = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
  const isCode = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
  const isAPI = API_PATHS.some((path) => url.pathname.includes(path));

  // Network-first for HTML to avoid stale pages
  if (isHTML) {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // Network-first for code (JS/CSS) to avoid stale bundles
  if (isCode) {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // Network-first for API calls with offline fallback
  if (isAPI) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Cache-first for images
  if (isAsset) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // Stale-while-revalidate for other requests
  event.respondWith(staleWhileRevalidate(request));
});

// Network-first strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Fetch failed, using cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Offline</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                     background: #0a0a0a; color: #fff; margin: 0; padding: 20px; display: flex;
                     align-items: center; justify-content: center; min-height: 100vh; }
              .container { text-align: center; max-width: 400px; }
              h1 { font-size: 24px; margin: 0 0 10px; }
              p { color: #999; margin: 10px 0; }
              button { background: #f97316; color: white; border: none; padding: 12px 24px;
                      border-radius: 8px; font-size: 14px; cursor: pointer; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>You're Offline</h1>
              <p>Check your internet connection and try again.</p>
              <button onclick="window.location.reload()">Retry</button>
            </div>
          </body>
        </html>`,
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
          status: 503,
          statusText: 'Service Unavailable',
        }
      );
    }
    throw error;
  }
}

// Cache-first strategy
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache miss and fetch failed:', request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(RUNTIME_CACHE);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  });

  return cached || fetchPromise;
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting and claiming clients');
    self.skipWaiting();
    self.clients.claim();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches');
    caches.keys().then((cacheNames) => {
      Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    });
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[SW] Push received but no data');
    return;
  }

  let notificationData = {
    title: 'DJ Danny Hectic B',
    body: 'New message',
    icon: '/logo-danny-hectic-b.png',
    badge: '/logo-icon.png',
  };

  try {
    const data = event.data.json();
    notificationData = { ...notificationData, ...data };
  } catch {
    notificationData.body = event.data.text();
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, notificationData));
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action || 'default';
  const data = event.notification.data || {};

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find existing window
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action,
            data,
          });
          return;
        }
      }

      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow('/').then((client) => {
          if (client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICK',
              action,
              data,
            });
          }
        });
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }

  if (event.tag === 'sync-donations') {
    event.waitUntil(syncDonations());
  }
});

async function syncMessages() {
  try {
    // Get pending messages from IndexedDB
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('hectic-radio-offline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');
    const messages = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    // Sync pending messages
    const pendingMessages = messages.filter((m) => m.status === 'pending');
    for (const message of pendingMessages) {
      try {
        await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync messages failed:', error);
    throw error;
  }
}

async function syncDonations() {
  try {
    // Similar to syncMessages but for donations
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('hectic-radio-offline', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(['donations'], 'readonly');
    const store = transaction.objectStore('donations');
    const donations = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    // Sync pending donations
    const pendingDonations = donations.filter((d) => d.status === 'pending');
    for (const donation of pendingDonations) {
      try {
        await fetch('/api/donations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(donation),
        });
      } catch (error) {
        console.error('[SW] Failed to sync donation:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync donations failed:', error);
    throw error;
  }
}

// Handle periodic background sync (if supported)
self.addEventListener('periodicSync', (event) => {
  if (event.tag === 'periodic-sync-messages') {
    event.waitUntil(syncMessages());
  }
  if (event.tag === 'periodic-sync-donations') {
    event.waitUntil(syncDonations());
  }
});

// Handle notification close (cleanup)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

console.log('[SW] Service Worker loaded and ready');
