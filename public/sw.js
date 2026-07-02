// Service worker Finko — cache réseau-d'abord pour l'app shell
const CACHE = 'finko-v1'
const OFFLINE_URLS = ['/', '/communaute', '/calculatrices', '/glossaire']

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  // Jamais de cache pour Supabase ni les API : données temps réel
  const url = new URL(request.url)
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && url.origin === location.origin) {
          const copy = response.clone()
          caches.open(CACHE).then(cache => cache.put(request, copy))
        }
        return response
      })
      .catch(() => caches.match(request).then(hit => hit || caches.match('/'))),
  )
})
