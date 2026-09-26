// Offline support: keep a copy of the app so it works with no signal.
// Your shortlist and picks live in localStorage, not here.
// Network first, so a new version shows up as soon as you're online. GitHub Pages lets browsers keep files for
// ten minutes, so scripts and styles are re-checked with the server every time instead of taken from that cache.

const CACHE = 'name-tag-v2'; // bump the number when the file list changes
const SHELL = [
  './', 'index.html', 'icon.svg', 'icon-180.png', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/names.js', 'js/sound.js', 'js/check.js', 'js/generate.js', 'js/tag.js', 'js/store.js', 'js/voice.js',
  'fonts/bricolage.woff2', 'fonts/figtree.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const fresh = e.request.mode === 'navigate' ? fetch(e.request) : fetch(e.request, { cache: 'no-cache' });
  e.respondWith(
    fresh
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))),
  );
});
