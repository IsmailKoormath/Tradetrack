// TradeTrack service worker: app shell is cached on install, so the app opens fully offline.
const CACHE = 'tradetrack-v1'
const scope = self.registration.scope
const url = u => new URL(u, scope).href
self.addEventListener('install', e => e.waitUntil((async () => {
  const cache = await caches.open(CACHE)
  const html = await (await fetch(url('./index.html'), { cache: 'reload' })).text()
  const assets = [...html.matchAll(/(?:src|href)="(\.?\/?assets\/[^"]+)"/g)].map(m => url(m[1]))
  await cache.addAll([url('./'), url('./manifest.webmanifest'), url('./icon-192.png'), url('./icon-512.png'), ...assets])
  await self.skipWaiting()
})()))
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k)
  await self.clients.claim()
})()))
self.addEventListener('fetch', e => {
  const r = e.request
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(url('./'), c)); return res })
      .catch(() => caches.match(url('./'))))
    return
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)) }
    return res
  })))
})
