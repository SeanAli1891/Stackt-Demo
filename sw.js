/* Offline support for the home-screen app.
   Network first: when the phone is online it always gets the latest files
   (including your settings.js edits), skipping the browser's short-term cache.
   The saved copy is used only when the phone is offline. */
const CACHE = "stackt-v3";
const CORE = ["./", "index.html", "settings.js", "assets/styles.css", "assets/app.js", "manifest.webmanifest", "assets/icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  let fresh = req;
  if (new URL(req.url).origin === self.location.origin) {
    // Ask the server whether the file changed instead of trusting a cached copy.
    try { fresh = new Request(req, { cache: "no-cache" }); } catch (err) { fresh = req; }
  }
  e.respondWith(
    fetch(fresh)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
  );
});
