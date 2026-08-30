/*
 * Service worker minimo: serve solo a rendere il prototipo installabile e a
 * farlo aprire anche senza rete. Nessuna precache generata a build time —
 * si riempie da sola con quello che la pagina chiede davvero.
 *
 * Conseguenza da sapere: la prima apertura installa il worker ma non passa
 * ancora da lui, quindi non lascia niente in cache. Offline funziona dalla
 * seconda in poi — che e' comunque dopo l'"aggiungi a home".
 */
const CACHE = 'bab-proto-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (e.request.method !== 'GET' || url.origin !== location.origin) return
  e.respondWith(
    // rete per prima cosa, cosi' una versione nuova arriva subito; la cache
    // e' la rete di sicurezza quando il telefono e' offline
    fetch(e.request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, copy))
        return res
      })
      .catch(() => caches.match(e.request).then((r) => r ?? caches.match('./index.html'))),
  )
})
