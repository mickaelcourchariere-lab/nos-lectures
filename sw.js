// Garde l'appli en mémoire sur le téléphone pour qu'elle s'ouvre même sans internet.
// Avec internet, la page est toujours relue en ligne d'abord : les mises à jour arrivent seules.
// Changer VERSION seulement si la liste des fichiers ci-dessous change.
var VERSION = 'lectures-v1';
var FICHIERS = ['./', 'index.html', 'manifest.webmanifest', 'icone-180.png', 'icone-192.png', 'icone-512.png', 'icone-masquable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // En ligne d'abord, puis la copie gardée si le réseau ne répond pas.
  e.respondWith(fetch(req).then(function (rep) {
    var copie = rep.clone();
    caches.open(VERSION).then(function (c) { c.put(req, copie); });
    return rep;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match('./'); });
  }));
});
