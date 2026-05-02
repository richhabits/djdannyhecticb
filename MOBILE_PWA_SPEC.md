# Mobile & Progressive Web App: Implementation Specification

**Date:** 2026-05-02  
**Status:** Spec Complete - Ready for Implementation  
**Target:** Native-like experience on all devices, 95+ Lighthouse score

---

## 📱 Progressive Web App (PWA) Strategy

### App Shell Architecture
```
┌─────────────────────────────────────────────┐
│         Service Worker                       │
│    (Offline capability, caching)             │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
   ┌─────────┐         ┌─────────────┐
   │IndexedDB│         │Cache API    │
   │(Local  │         │(HTTP        │
   │data)   │         │responses)   │
   └─────────┘         └─────────────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
   ┌──────────┐        ┌─────────────┐
   │Offline   │        │Background   │
   │Content   │        │Sync         │
   └──────────┘        └─────────────┘
```

---

## 1️⃣ Service Worker Implementation

### 1.1 Service Worker File
**File:** `client/public/sw.js`

```javascript
// ============================================================================
// Service Worker - Offline-First Strategy
// ============================================================================

const CACHE_VERSION = 'v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/offline.html',
  // Core CSS/JS bundles
  '/assets/app.js',
  '/assets/app.css',
  // Critical fonts
  '/fonts/inter-400.woff2',
  '/fonts/outfit-700.woff2',
  // Offline fallback images
  '/images/offline-hero.webp',
];

const CACHE_RUNTIME = 'runtime-v1.0.0';
const CACHE_IMAGES = 'images-v1.0.0';

// ============================================================================
// INSTALLATION
// ============================================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// ============================================================================
// ACTIVATION
// ============================================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION && name !== CACHE_RUNTIME && name !== CACHE_IMAGES)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Claim clients immediately
});

// ============================================================================
// FETCH STRATEGY: Cache-First with Network Fallback
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests: Network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Image requests: Cache-first, lazy network update
  if (request.destination === 'image') {
    event.respondWith(cacheFirstImageStrategy(request));
    return;
  }

  // Document/HTML: Network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets: Cache-first
  event.respondWith(cacheFirstStrategy(request));
});

// Cache-first strategy
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match('/offline.html');
  }
}

// Network-first strategy
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(CACHE_RUNTIME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Network failed - use cached version
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // No cached version - return offline page
    return caches.match('/offline.html');
  }
}

// Cache-first for images with lazy network update
async function cacheFirstImageStrategy(request) {
  const cache = await caches.open(CACHE_IMAGES);
  const cached = await cache.match(request);

  if (cached) {
    // Return cached, but update in background
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          cache.put(request, response);
        }
      })
      .catch(() => {
        // Network failed, that's OK - we have cached version
      });

    return cached;
  }

  // Not cached - fetch and cache
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return placeholder image
    return caches.match('/images/image-placeholder.webp');
  }
}

// ============================================================================
// BACKGROUND SYNC (Offline Actions)
// ============================================================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }
  if (event.tag === 'sync-reactions') {
    event.waitUntil(syncOfflineReactions());
  }
});

async function syncOfflineMessages() {
  const db = await openDB();
  const messages = await db.getAll('pending_messages');

  for (const message of messages) {
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      await db.delete('pending_messages', message.id);
    } catch (error) {
      console.error('Failed to sync message', error);
    }
  }
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // App not open - open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================================================
// MESSAGE HANDLING (Client ↔ Service Worker)
// ============================================================================
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames.map((cacheName) => caches.delete(cacheName))
  );
}
```

---

## 2️⃣ Web App Manifest

**File:** `client/public/manifest.json`

```json
{
  "name": "DJ Danny Hectic B",
  "short_name": "Danny Hectic",
  "description": "Live DJ streaming, exclusive mixes, and community interaction",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#0A0A0A",
  "background_color": "#0A0A0A",
  "categories": ["music", "entertainment"],
  "screenshots": [
    {
      "src": "/images/screenshot-192x192.png",
      "sizes": "192x192",
      "form_factor": "narrow",
      "type": "image/png"
    },
    {
      "src": "/images/screenshot-540x720.png",
      "sizes": "540x720",
      "form_factor": "wide",
      "type": "image/png"
    }
  ],
  "icons": [
    {
      "src": "/images/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/images/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Go Live",
      "short_name": "Stream",
      "description": "Start streaming",
      "url": "/stream?mode=broadcast",
      "icons": [
        {
          "src": "/images/icon-broadcast.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "View Shop",
      "short_name": "Shop",
      "description": "Browse products",
      "url": "/shop",
      "icons": [
        {
          "src": "/images/icon-shop.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "media",
          "accept": ["audio/*", "video/*"]
        }
      ]
    }
  }
}
```

---

## 3️⃣ IndexedDB for Offline State

### 3.1 Database Schema
```typescript
interface OfflineDB {
  // User data
  user_profile: {
    keyPath: 'id';
    data: { id, name, email, subscription_tier };
  };

  // Offline queue
  pending_messages: {
    keyPath: 'id';
    indexes: ['timestamp', 'streamId'];
    data: { id, streamId, text, timestamp, synced };
  };

  pending_reactions: {
    keyPath: 'id';
    indexes: ['timestamp'];
    data: { id, emoji, timestamp, synced };
  };

  // Cached content
  stream_cache: {
    keyPath: 'id';
    data: { id, title, description, viewers, status };
  };

  products_cache: {
    keyPath: 'id';
    indexes: ['category', 'price'];
    data: { id, name, price, imageUrl };
  };

  favorites: {
    keyPath: 'id';
    indexes: ['createdAt'];
    data: { id, contentId, contentType, createdAt };
  };

  // Offline history
  offline_log: {
    keyPath: 'id';
    indexes: ['timestamp', 'action'];
    data: { id, action, timestamp, details };
  };
}
```

### 3.2 IndexedDB Service
```typescript
class OfflineDatabase {
  private db: IDBDatabase;

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('djdanny', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as any).result;

        // Create object stores
        if (!db.objectStoreNames.contains('pending_messages')) {
          const store = db.createObjectStore('pending_messages', { keyPath: 'id', autoIncrement: true });
          store.createIndex('streamId', 'streamId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('pending_reactions')) {
          const store = db.createObjectStore('pending_reactions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // ... create other stores
      };
    });
  }

  async addPendingMessage(message: {streamId, text, timestamp}) {
    const tx = this.db.transaction('pending_messages', 'readwrite');
    return tx.objectStore('pending_messages').add(message);
  }

  async getPendingMessages() {
    const tx = this.db.transaction('pending_messages', 'readonly');
    return new Promise((resolve, reject) => {
      const request = tx.objectStore('pending_messages').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearSynced() {
    const tx = this.db.transaction('pending_messages', 'readwrite');
    const store = tx.objectStore('pending_messages');
    const index = store.index('streamId');
    const range = IDBKeyRange.bound(-Infinity, Infinity);

    return new Promise((resolve) => {
      const request = index.openCursor(range);
      request.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve(null);
        }
      };
    });
  }
}
```

---

## 4️⃣ Mobile UI Components

### 4.1 Bottom Navigation

```typescript
// MobileBottomNav.tsx
export function MobileBottomNav() {
  const location = useLocation();
  const [route, setRoute] = useState(location.hash.slice(1) || '');

  const navigationItems = [
    { icon: 'home', label: 'Home', href: '/#/' },
    { icon: 'live', label: 'Stream', href: '/#/stream' },
    { icon: 'shop', label: 'Shop', href: '/#/shop' },
    { icon: 'bell', label: 'Alerts', href: '/#/alerts' },
    { icon: 'menu', label: 'Menu', href: '/#/menu' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border-primary bg-dark-bg z-40 tablet:hidden">
      <div className="flex justify-around items-center h-16 safe-area-bottom">
        {navigationItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-16 transition-colors ${
              route === item.href.slice(2)
                ? 'text-accent-red'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            aria-label={item.label}
          >
            <Icon name={item.icon} className="w-6 h-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
```

### 4.2 Touch Gestures
```typescript
// useTouchGestures.ts
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [gesture, setGesture] = useState<'swipe-left' | 'swipe-right' | 'pinch' | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;

    // Horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      setGesture(diffX > 0 ? 'swipe-left' : 'swipe-right');
    }
  };

  return { handleTouchStart, handleTouchEnd, gesture };
}

// Usage: Swipe to navigate
<div
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  className="swipeable-container"
>
  {gesture === 'swipe-left' && navigateNext()}
  {gesture === 'swipe-right' && navigatePrev()}
</div>
```

### 4.3 Install Prompt
```typescript
// useInstallPrompt.ts
export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  return { installPrompt, isInstalled, install };
}

// UI Component
<InstallPrompt />
```

---

## 5️⃣ Responsive Design Optimizations

### 5.1 Mobile-First Breakpoints
```css
/* Mobile-first (375px base) */
body { font-size: 16px; }
.stream-container { grid-template-columns: 1fr; }

/* Tablet (768px) */
@media (min-width: 768px) {
  .stream-container { grid-template-columns: 2fr 1fr; }
  .sidebar { display: flex; }
}

/* Desktop (1024px) */
@media (min-width: 1024px) {
  .stream-container { grid-template-columns: 3fr 1fr; }
}
```

### 5.2 Safe Area Insets (Notch Support)
```css
/* iPhone X, 11, 12, etc. notch support */
body {
  padding-left: max(1rem, env(safe-area-inset-left));
  padding-right: max(1rem, env(safe-area-inset-right));
  padding-top: max(1rem, env(safe-area-inset-top));
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* Bottom navigation with safe area */
nav {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

---

## 6️⃣ Network Quality Detection

```typescript
// useNetworkStatus.ts
export function useNetworkStatus() {
  const [connectionType, setConnectionType] = useState('4g');
  const [effectiveType, setEffectiveType] = useState('4g');
  const [downlink, setDownlink] = useState(10);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection;

    if (connection) {
      const updateNetworkStatus = () => {
        setConnectionType(connection.type);
        setEffectiveType(connection.effectiveType);
        setDownlink(connection.downlink);
      };

      updateNetworkStatus();
      connection.addEventListener('change', updateNetworkStatus);

      return () => connection.removeEventListener('change', updateNetworkStatus);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
    };
  }, []);

  return { connectionType, effectiveType, downlink, isOnline };
}

// Adaptive loading based on network
export function AdaptiveImage({ src, alt }: ImageProps) {
  const { effectiveType } = useNetworkStatus();

  const imageSrc =
    effectiveType === '4g'
      ? src.replace('.webp', '.webp') // Full quality
      : src.replace('.webp', '-mobile.webp'); // Mobile optimized

  return <img src={imageSrc} alt={alt} loading="lazy" />;
}
```

---

## 7️⃣ Performance Metrics for Mobile

```typescript
// measureMobilePerformance.ts
export function measureMobileMetrics() {
  const metrics = {
    // Mobile-specific
    interaction_to_paint: 0, // Time from user input to visible change
    first_input_delay: 0,    // Delay on first user interaction
    
    // Memory usage
    memory: {
      heapUsed: performance.memory?.usedJSHeapSize || 0,
      heapLimit: performance.memory?.jsHeapSizeLimit || 0,
      percentage: 0,
    },
    
    // Frame rate
    fps: 0,
    
    // Scroll smoothness
    scroll_jank: 0, // Percentage of janky frames
  };

  // Measure frame rate
  let lastTime = performance.now();
  let frame = 0;
  let fps = 0;

  function countFrames() {
    const now = performance.now();
    if (now >= lastTime + 1000) {
      fps = frame;
      frame = 0;
      lastTime = now;
    }
    frame++;
    requestAnimationFrame(countFrames);
  }

  requestAnimationFrame(countFrames);

  return metrics;
}
```

---

## ✅ Implementation Checklist

### Service Worker & Caching
- [ ] Implement service worker (sw.js)
- [ ] Configure cache strategies (static, dynamic, API)
- [ ] Test offline functionality
- [ ] Implement background sync
- [ ] Test cache updates

### Manifest & Installation
- [ ] Create manifest.json
- [ ] Add app icons (192x192, 512x512, maskable)
- [ ] Configure install prompts
- [ ] Test "Add to Home Screen"
- [ ] Verify standalone mode

### Mobile UI
- [ ] Implement bottom navigation
- [ ] Add touch gesture support
- [ ] Configure safe area insets
- [ ] Test on iOS & Android
- [ ] Optimize tap target sizes (44px min)

### Offline Functionality
- [ ] Set up IndexedDB
- [ ] Implement offline queue for actions
- [ ] Background sync implementation
- [ ] Conflict resolution for offline changes
- [ ] Offline indicator UI

### Performance Optimization
- [ ] Network quality detection
- [ ] Adaptive image loading
- [ ] Code splitting for routes
- [ ] Lazy load modules
- [ ] Measure FID and CLS on mobile

### Testing & Validation
- [ ] Lighthouse audit (95+)
- [ ] Test on real devices (iOS/Android)
- [ ] Test on slow networks (3G)
- [ ] Test offline mode
- [ ] Load testing (1000+ concurrent)

---

## 📊 Success Metrics

- [ ] Lighthouse score: 95+
- [ ] Installable as app (90+ score)
- [ ] LCP on mobile: <2.5s
- [ ] FID on mobile: <100ms
- [ ] CLS: <0.1
- [ ] Offline chat working (message queue)
- [ ] 1000+ offline-capable users
- [ ] 30+ day retention increase

---

## 🔗 Integration Points

**Dependencies:**
- Service Worker API (all modern browsers)
- IndexedDB (offline storage)
- Web App Manifest (installation)
- Push API (notifications)

**Integrates with:**
- Real-time chat system (offline queue)
- Analytics dashboard (mobile metrics)
- Notification system (push notifications)
- User profiles (offline data sync)
