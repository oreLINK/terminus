// Itinéraire piéton réel : calcul d'itinéraire de la Géoplateforme de l'IGN (profil « pedestrian »,
// France entière, sans clé). Il donne le tracé rue par rue et la vraie distance ; le temps de marche
// reste celui de Terminus (walkMinutes, 4,7 km/h), l'IGN supposant une marche plus lente.
// Le service accepte 10 appels par seconde : on n'en lance que deux à la fois, espacés, et un refus
// (429) est retenté une fois. Un échec renvoie null : l'appelant garde l'estimation à vol d'oiseau.

import { walkMinutes } from "./util.js";

const ROUTE_URL = "https://data.geopf.fr/navigation/itineraire";
const CONCURRENCY = 2;
const SPACING_MS = 250;
const RETRY_MS = 1200;

// Réponse de l'IGN → { meters, path: [[lat, lon], …] }. Lève une erreur si elle est illisible.
export function parseRoute(data) {
  const meters = Number(data?.distance);
  const coords = data?.geometry?.coordinates;
  if (!Number.isFinite(meters) || !Array.isArray(coords) || coords.length < 2) {
    throw new Error("itinéraire : format inattendu");
  }
  const unit = data.distanceUnit ?? "meter";
  return {
    meters: unit === "kilometer" ? meters * 1000 : meters,
    path: coords.map(([lon, lat]) => [lat, lon]),
  };
}

// La marche réelle, au format de walkBetween : { straight, meters, minutes, path, real }.
export const realWalk = (estimate, route) => ({
  straight: estimate.straight,
  meters: route.meters,
  minutes: walkMinutes(route.meters),
  path: route.path,
  real: true,
});

// File d'attente : au plus CONCURRENCY appels en cours, un départ tous les SPACING_MS.
let running = 0;
let lastStart = 0;
const waiting = [];

function pump() {
  if (running >= CONCURRENCY || !waiting.length) return;
  const wait = Math.max(0, lastStart + SPACING_MS - Date.now());
  if (wait > 0) return void setTimeout(pump, wait);
  const job = waiting.shift();
  running++;
  lastStart = Date.now();
  job().finally(() => {
    running--;
    pump();
  });
  pump();
}

const queued = (task) =>
  new Promise((resolve) => {
    waiting.push(() => task().then(resolve, () => resolve(null)));
    pump();
  });

async function request(from, to, retryMs) {
  const url = new URL(ROUTE_URL);
  url.search = new URLSearchParams({
    resource: "bdtopo-osrm",
    profile: "pedestrian",
    optimization: "fastest",
    start: `${from.lon},${from.lat}`,
    end: `${to.lon},${to.lat}`,
    geometryFormat: "geojson",
    getSteps: "false",
    distanceUnit: "meter",
  });
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    if (res.status === 429 && attempt === 0) {
      await new Promise((r) => setTimeout(r, retryMs));
      continue;
    }
    if (!res.ok) throw new Error(`itinéraire ${res.status}`);
    return parseRoute(await res.json());
  }
}

// Itinéraire à pied de `from` à `to` ({ lat, lon }) : { meters, path }, ou null en cas d'échec.
export const fetchWalk = (from, to, { retryMs = RETRY_MS } = {}) => queued(() => request(from, to, retryMs));
