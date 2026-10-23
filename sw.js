// Service worker de Terminus : garde sur le téléphone les fichiers du site (pages, styles, modules,
// icônes, Leaflet, données du réseau générées) pour que les visites suivantes s'ouvrent sans attendre
// le réseau. GitHub Pages ne les laisse en cache que 10 minutes : au-delà, chaque visite revérifiait
// une quarantaine de fichiers, par vagues (un module en importe d'autres).
//
// Cohérence : les fichiers gardés sont ceux d'une même version publiée. À chaque ouverture d'une page
// (réseau d'abord), la version en ligne (version.json, écrit par deploy.yml) est comparée à celle des
// fichiers gardés ; si elle a changé, ou si elle ne répond pas alors que la page, elle, a répondu, tout
// est oublié et redemandé. Hors connexion, la page et ses fichiers gardés servent tels quels.
//
// Pas concernés : les appels aux services (temps réel TBM, adresses et marche IGN), toujours au réseau ;
// les images du fond de carte de l'IGN, que le navigateur garde déjà 21 jours (leur en-tête de cache).
// Pas enregistré sur le poste de développement (js/app.js), où le code change sans cesse.

const FILES = "terminus-files";
const META = "terminus-meta";
const SCOPE = self.registration.scope;
const VERSION_URL = new URL("version.json", SCOPE).href;
const VERSION_KEY = new URL("__version__", SCOPE).href; // version des fichiers gardés, dans META
const PAGE_TIMEOUT_MS = 4000; // au-delà, la page gardée (réseau trop lent ou absent)

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("terminus-") && ![FILES, META].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // services et fond de carte : comme sans service worker
  if (request.mode === "navigate") return event.respondWith(page(request));
  if (url.href === VERSION_URL || url.pathname.endsWith("/sw.js")) return;
  event.respondWith(file(request));
});

// Page : réseau d'abord (avec la vérification de version), la copie gardée en secours.
async function page(request) {
  const online = withTimeout(fetch(request), PAGE_TIMEOUT_MS);
  const version = withTimeout(fetch(VERSION_URL, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)), PAGE_TIMEOUT_MS).catch(() => null);
  try {
    const res = await online;
    await syncVersion(await version);
    if (res.ok) (await caches.open(FILES)).put(request, res.clone());
    return res;
  } catch {
    const kept = (await caches.match(request, { ignoreSearch: true })) ?? (await caches.match(new URL("./", SCOPE).href));
    return kept ?? Response.error();
  }
}

// Une autre version en ligne (ou aucune réponse sur la version) : les fichiers gardés sont oubliés.
async function syncVersion(online) {
  const meta = await caches.open(META);
  const kept = await meta.match(VERSION_KEY).then((r) => (r ? r.text() : null));
  const commit = online?.commit ?? null;
  if (commit && commit === kept) return;
  await caches.delete(FILES);
  if (commit) await meta.put(VERSION_KEY, new Response(commit));
  else await meta.delete(VERSION_KEY);
}

// Fichier du site : la copie gardée, sinon le réseau (et la copie pour la suite).
async function file(request) {
  const kept = await caches.match(request);
  if (kept) return kept;
  const res = await fetch(request);
  if (res.ok && res.type === "basic") (await caches.open(FILES)).put(request, res.clone());
  return res;
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("délai dépassé")), ms))]);
}
