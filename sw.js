// Service worker da BLU. Rede primeiro: com internet o app sempre pega a versao nova;
// sem sinal, abre a ultima copia guardada. E tambem o que deixa o Chrome instalar a BLU
// como app de verdade e, mais pra frente, receber os lembretes.
const CACHE = "blu-v1";
const CASCA = ["./", "index.html", "rostos.webp", "icone.png", "icone-192.png", "manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CASCA)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(resp => {
      if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(r, copia)); }
      return resp;
    }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});
