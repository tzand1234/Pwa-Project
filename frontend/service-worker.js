// Define a unique cache name
const cacheName = 'dynamic-cache-v1';

// Install event - do nothing special here
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            return caches.delete(cache);
          }
        })
      );
      self.clients.claim();
    })()
  );
});

// Fetch event - serve cached content when offline and cache new resources dynamically
self.addEventListener('fetch', event => {
  const { request } = event;

  // Check if the request is an API call
  if (request.url.includes('/api/')) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (error) {
          return new Response(null, { status: 500 });
        }
      })()
    );
    return;
  }

  // For other requests, respond with cache first, then network
  event.respondWith(
    (async () => {
      try {
        // Try to fetch the resource from the network
        const networkResponse = await fetch(request);
        
        // If the request is successful, cache the resource
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        
        // Return the network response
        return networkResponse;
      } catch (error) {
        // If the network request fails, try to serve the resource from the cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the resource is not in the cache, fallback to the root HTML file for navigation requests
        if (request.mode === 'navigate') {
          return await caches.match('/');
        }

        // Otherwise, return a fallback response (e.g., a 404 page or an empty response)
        return new Response(null, { status: 404 });
      }
    })()
  );
});
