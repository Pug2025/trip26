/* Keeps the last copy of the page on the phone so it opens with no signal.
   Network first: a fresh copy is used whenever there is one. Only this site's own files are kept. */
var CACHE = "trip-v1";
self.addEventListener("install", function (e) { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var key = url.origin + url.pathname;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(key, copy); });
      }
      return res;
    }).catch(function () {
      return caches.open(CACHE).then(function (c) { return c.match(key); }).then(function (hit) {
        return hit || Response.error();
      });
    })
  );
});
