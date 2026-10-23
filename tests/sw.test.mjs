import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";

// Simulation minimale du navigateur pour sw.js : stockage des caches, réseau, événements.
const SCOPE = "https://orelink.github.io/terminus/";
const handlers = {};
const stores = new Map(); // nom → Map(url → Response)
const keyOf = (r) => (typeof r === "string" ? r : r.url);
const cacheOf = (name) => {
  if (!stores.has(name)) stores.set(name, new Map());
  const m = stores.get(name);
  return {
    match: async (r) => m.get(keyOf(r))?.clone(),
    put: async (r, res) => void m.set(keyOf(r), res),
    delete: async (r) => m.delete(keyOf(r)),
  };
};
globalThis.caches = {
  open: async (name) => cacheOf(name),
  delete: async (name) => stores.delete(name),
  keys: async () => [...stores.keys()],
  match: async (r, { ignoreSearch = false } = {}) => {
    const want = ignoreSearch ? keyOf(r).split("?")[0] : keyOf(r);
    for (const m of stores.values()) for (const [k, v] of m) if ((ignoreSearch ? k.split("?")[0] : k) === want) return v.clone();
    return undefined;
  },
};
let online = true;
let commit = "aaa";
const hits = [];
globalThis.fetch = async (r) => {
  const url = keyOf(r);
  hits.push(url);
  if (!online) throw new TypeError("Failed to fetch");
  const body = url.endsWith("version.json") ? JSON.stringify({ commit }) : `${url} @ ${commit}`;
  const res = new Response(body, { status: 200 });
  Object.defineProperty(res, "type", { value: "basic" });
  return res;
};
globalThis.self = {
  registration: { scope: SCOPE },
  location: { origin: "https://orelink.github.io" },
  addEventListener: (type, fn) => (handlers[type] = fn),
  skipWaiting: () => {},
  clients: { claim: async () => {} },
};
await import("../sw.js");

// Une requête passée au service worker : sa réponse, ou null s'il la laisse au réseau.
async function request(url, mode = "cors") {
  let answer = null;
  handlers.fetch({ request: { url, method: "GET", mode }, respondWith: (p) => (answer = p) });
  return answer ? (await answer).text() : null;
}
const visit = async () => [await request(SCOPE, "navigate"), await request(`${SCOPE}js/app.js`), await request(`${SCOPE}js/networks/bordeaux-tbm/stops.js`)];

test("service worker : fichiers gardés d'une visite à l'autre, réseau seulement pour la page et la version", async () => {
  await visit();
  hits.length = 0;
  const second = await visit();
  assert.deepEqual(hits.sort(), [SCOPE, `${SCOPE}version.json`].sort(), "deuxième visite : seulement la page et la version");
  assert.match(second[1], /@ aaa$/);
});

test("service worker : nouvelle version publiée, tous les fichiers redemandés", async () => {
  commit = "bbb";
  const pages = await visit();
  assert.match(pages[1], /app\.js @ bbb$/);
  assert.match(pages[2], /stops\.js @ bbb$/);
});

test("service worker : hors connexion, la page et les fichiers gardés", async () => {
  online = false;
  const pages = await visit();
  assert.match(pages[0], /@ bbb$/);
  assert.match(pages[1], /app\.js @ bbb$/);
  online = true;
});

test("service worker : services et fond de carte laissés au réseau", async () => {
  assert.equal(await request("https://bdx.mecatran.com/utw/ws/siri/2.0/bordeaux/stop-monitoring.json"), null);
  assert.equal(await request("https://data.geopf.fr/wmts?REQUEST=GetTile"), null);
  assert.equal(await request(`${SCOPE}version.json`), null);
});

test("service worker : copié au déploiement, enregistré par la page hors poste de développement", () => {
  const deploy = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");
  assert.match(deploy, /cp -R [^\n]*\bsw\.js\b/);
  const app = readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
  assert.match(app, /serviceWorker\.register\("sw\.js"/);
  assert.match(app, /localhost/);
});
