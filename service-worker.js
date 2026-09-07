const CACHE = 'gastos-v33';
const ASSETS = ['./', './index.html', './logic.js', './manifest.json', './icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// index.html y logic.js son los que cambian mientras se sigue desarrollando la app:
// red primero (así la próxima vez que la abras con internet ya tenés lo último),
// y solo se usa el caché si no hay conexión. El resto casi no cambia: caché primero.
const NETWORK_FIRST = new Set(['', 'index.html', 'logic.js']);

self.addEventListener('fetch', e => {
  const file = new URL(e.request.url).pathname.split('/').pop();
  if (NETWORK_FIRST.has(file)) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
  }
});
