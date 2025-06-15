/* Don't Skip Leg Day - Service Worker */
const CACHE_NAME = 'leg-day-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/success.mp3',
  '/error.mp3',
  '/alarm.mp3',
  '/complete.mp3',
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Network first, then cache strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response for the cache
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked in service worker', event);
  
  // Close the notification
  event.notification.close();
  
  // Send message to client that notification was clicked
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        action: 'notificationClick',
        notification: {
          title: event.notification.title,
          tag: event.notification.tag,
          data: event.notification.data
        }
      });
    });
  });
  
  // Focus or open a window if clicked
  event.waitUntil(
    self.clients.matchAll({type: 'window'}).then(clientList => {
      // If we have a client, focus it
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      // Otherwise open a new window
      return self.clients.openWindow('/');
    })
  );
});
// Activate and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications (for future use with push API)
self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || "🦵 DON'T SKIP LEG DAY! 🦵";
  const options = {
    body: data.message || "Time for your leg workout! No skipping today!",
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
