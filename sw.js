/* service worker of the web version (GitHub Pages): the app starts offline after the first visit.
   Own files only (the app keeps map data, sessions and tracks itself in IndexedDB); maps, routing, search go to the network as usual. */
const VERSION = '73c3a0236ac8', CACHE = 'gps-utils-' + VERSION;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './LICENSES.txt'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('gps-utils-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* page: network first (updates), after 4 s or offline the stored copy; other own files: stored copy first */
self.addEventListener('fetch', (e) => { const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(new Promise((resolve) => { let done = false; const fallback = () => { if (!done) { done = true; caches.match('./index.html').then(m => resolve(m || Response.error())); } };
      const t = setTimeout(fallback, 4000);
      fetch(r).then(res => { clearTimeout(t); if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } if (!done) { done = true; resolve(res); } }).catch(() => { clearTimeout(t); fallback(); }); }));
    return; }
  e.respondWith(caches.match(r).then(m => m || fetch(r))); });
