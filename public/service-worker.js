const CACHE_NAME = 'genoa-news-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/App.jsx',
  '/App.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Cache opened');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache API calls, just serve from network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If offline, return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // For other requests, try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cached) => {
          return cached || new Response('Offline - No cached content available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Background sync for periodic updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-news') {
    event.waitUntil(
      fetch('/api/scrape', { method: 'POST' })
        .then(() => console.log('✅ Background sync completed'))
        .catch(err => console.log('❌ Background sync failed:', err))
    );
  }
});

// Push notifications (optional)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nuova notizia sul Genoa!',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23DC143C" width="192" height="192"/><circle cx="96" cy="96" r="80" fill="%231E3A8A"/><text x="96" y="128" font-size="90" font-weight="bold" text-anchor="middle" fill="%23DC143C" font-family="Arial">G</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23DC143C" width="192" height="192"/></svg>',
    tag: 'genoa-news',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Genoa Calcio News', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('🔧 Service Worker loaded');
