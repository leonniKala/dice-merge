/* Service worker: κρατά το παιχνίδι διαθέσιμο χωρίς internet.
   Το CACHE ανεβαίνει σε κάθε νέα έκδοση ώστε να φεύγει η παλιά. */
const CACHE = 'dice-merge-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Δίκτυο πρώτα, ώστε να βλέπεις αμέσως κάθε νέα έκδοση·
   αν δεν υπάρχει σύνδεση, σερβίρεται το αποθηκευμένο αντίγραφο. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
