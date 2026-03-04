// Bump this whenever you change core app assets (app.js/index/styles/etc.)
const CACHE_NAME = 'gh100-flashcards-baseline2e-v4';

// Core “app shell” assets (keep this relatively stable)
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',

  // configs
  './decks.auto.json',
  './decks.json',

  // (optional) keep your most important decks pre-cached
  // You can keep or remove these; runtime caching will handle new decks anyway.
  './cards.json',
  './hard.json',
  './Actual4Test_cards.json',
  './QnAfromMultiSite_cards.json',
  './ShapingPixel_cards.json',

  // PWA
  './manifest.json',

  // icons (root files — aligns with your updated manifest approach)
  './icon-192.png',
  './icon-512.png'
];

// Decide which requests should be runtime-cached.
// We cache:
// - any "*_cards.json" (your deck files)
// - decks.json / decks.auto.json (deck registries)
function isRuntimeCacheCandidate(requestUrl) {
  try {
    const url = new URL(requestUrl);
    const p = url.pathname.toLowerCase();

    // Same-origin only (avoid caching external resources unexpectedly)
    if (url.origin !== self.location.origin) return false;

    // Deck files + configs
    return (
      p.endsWith('/decks.json') ||
      p.endsWith('/decks.auto.json') ||
      p.endsWith('_cards.json')
    );
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    // Not cached → go network
    const resp = await fetch(req);

    // If this is a deck/config file and network fetch succeeded, store it
    if (resp && resp.ok && isRuntimeCacheCandidate(req.url)) {
      const cache = await caches.open(CACHE_NAME);
      // Clone because response streams can only be read once
      cache.put(req, resp.clone());
    }

    return resp;
  })());
});