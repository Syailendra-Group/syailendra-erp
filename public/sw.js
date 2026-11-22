/**
 * sw.js — Custom service worker for the Mitra PWA portal.
 * Syailendra Group ERP
 *
 * Decision: custom service worker, no Workbox.
 * - Zero extra dependencies (npm install is locked in this repo).
 * - Full control over the required strategies: network-first for API calls,
 *   cache-first for static assets, offline navigation fallback.
 * Workbox would need a build step and new dependencies; this hand-written SW is
 * smaller and easier to audit.
 */

const CACHE_NAME = 'mitra-shell-v1'
const SHELL_URLS = ['/', '/mitra', '/mitra/login', '/manifest.json']

const isNavigation = (request) => request.mode === 'navigate'
const isApi = (url) => url.pathname.startsWith('/api/')
const isAsset = (url) =>
  url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/_next/image') || url.pathname.startsWith('/public/')

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(SHELL_URLS).catch((error) => {
        console.warn('[mitra-sw] install cache partial:', error)
      })
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone).catch(() => {}))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || offlineResponse()))
    )
    return
  }

  if (isApi(url)) {
    // Network-first: offline API calls fail fast so the client outbox takes over.
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: 'OFFLINE', offline: true }), {
            status: 503,
            headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
          })
      )
    )
    return
  }

  if (request.method === 'GET' && isAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone).catch(() => {}))
            }
            return response
          })
      )
    )
    return
  }
})

function offlineResponse() {
  return new Response(
    '<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Portal Mitra — Offline</title></head><body>Anda sedang offline. Buka kembali saat koneksi tersedia.</body></html>',
    { headers: { 'content-type': 'text/html;charset=utf-8' } }
  )
}
