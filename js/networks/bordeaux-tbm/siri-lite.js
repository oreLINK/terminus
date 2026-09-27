// Accès au flux SIRI-Lite public de Bordeaux Métropole (réseau TBM).
// Doc : https://transport.data.gouv.fr/datasets/offres-de-services-bus-tram-et-scolaire-au-format-gtfs-netex-gtfs-rt-siri-lite
// La clé ci-dessous est la clé open data publique et partagée.

const BASE = "https://bdx.mecatran.com/utw/ws/siri/2.0/bordeaux";
const KEY = "opendata-bordeaux-metropole-flux-gtfs-rt";

const NETWORK_CACHE_KEY = "dt.network.v1";
const NETWORK_TTL_MS = 24 * 3600 * 1000;
const TIMETABLE_TTL_MS = 100 * 1000;

export class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

// Les références SIRI-Lite arrivent sous plusieurs formes : "x", {value: "x"} ou [{value: "x"}].
export const val = (x) => {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return val(x[0]);
  return x.value ?? "";
};

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const toMs = (iso) => (iso ? Date.parse(iso) : null);

export function isInGironde(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat > 44.1 && lat < 45.6 && lon > -1.3 && lon < 0.35;
}

async function siri(endpoint, params = {}, signal) {
  const url = new URL(`${BASE}/${endpoint}`);
  url.searchParams.set("AccountKey", KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  let res;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError("network", "Le serveur TBM ne répond pas. Vérifiez votre connexion.");
  }
  if (!res.ok) throw new ApiError("http", `Le serveur TBM a répondu avec une erreur ${res.status}.`);
  return res.json();
}

function readCache(key, ttl) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < ttl ? data : null;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Stockage plein ou désactivé : on recharge simplement au prochain passage.
  }
}

const isTramLine = (name, code) => /^tram\b/i.test(name) && /^[a-f]$/i.test(code);

// Lignes de tram + points d'arrêt physiques desservis par au moins un tram.
// Mis en cache 24 h : ces données ne changent qu'avec les évolutions du réseau.
export async function loadNetwork() {
  const cached = readCache(NETWORK_CACHE_KEY, NETWORK_TTL_MS);
  if (cached) return cached;

  const [linesJson, stopsJson] = await Promise.all([
    siri("lines-discovery.json"),
    siri("stoppoints-discovery.json"),
  ]);

  const lines = {};
  for (const l of linesJson?.Siri?.LinesDelivery?.AnnotatedLineRef ?? []) {
    const ref = val(l.LineRef);
    const code = val(l.LineCode);
    if (isTramLine(val(l.LineName), code)) lines[ref] = { ref, code: code.toUpperCase() };
  }

  const stops = [];
  for (const s of stopsJson?.Siri?.StopPointsDelivery?.AnnotatedStopPointRef ?? []) {
    const lineRefs = asArray(s.Lines).map(val).filter((r) => lines[r]);
    const lat = Number(s.Location?.latitude);
    const lon = Number(s.Location?.longitude);
    if (!lineRefs.length || !isInGironde(lat, lon)) continue;
    stops.push({ ref: val(s.StopPointRef), name: val(s.StopName).trim(), lat, lon, lines: lineRefs });
  }

  if (!Object.keys(lines).length || !stops.length) {
    throw new ApiError("data", "Les données du réseau TBM sont incomplètes pour le moment.");
  }

  const network = { lines, stops };
  writeCache(NETWORK_CACHE_KEY, network);
  return network;
}

export function parseJourneys(json) {
  const out = [];
  const deliveries = asArray(json?.Siri?.ServiceDelivery?.EstimatedTimetableDelivery);
  for (const delivery of deliveries) {
    for (const frame of asArray(delivery.EstimatedJourneyVersionFrame)) {
      for (const j of asArray(frame.EstimatedVehicleJourney)) {
        if (j.Cancellation === true) continue;
        const rawCalls = [...asArray(j.RecordedCalls?.RecordedCall), ...asArray(j.EstimatedCalls?.EstimatedCall)];
        const calls = rawCalls
          .map((c) => {
            const aimedDep = toMs(c.AimedDepartureTime) ?? toMs(c.AimedArrivalTime);
            const aimedArr = toMs(c.AimedArrivalTime) ?? aimedDep;
            const expDep = toMs(c.ExpectedDepartureTime);
            const expArr = toMs(c.ExpectedArrivalTime);
            return {
              ref: val(c.StopPointRef),
              name: val(c.StopPointName),
              dep: expDep ?? aimedDep,
              depLive: expDep != null,
              arr: expArr ?? aimedArr,
              arrLive: expArr != null,
              cancelled: c.Cancellation === true,
            };
          })
          .filter((c) => c.dep != null);
        if (calls.length < 2) continue;
        out.push({
          id: val(j.VehicleJourneyRef) || val(j.DatedVehicleJourneyRef) || `${val(j.LineRef)}:${calls[0].dep}`,
          line: val(j.LineRef),
          headsign: calls[calls.length - 1].name,
          calls,
        });
      }
    }
  }
  return out;
}

// Toutes les courses restantes de la journée commerciale pour une ligne et un sens.
// PreviewInterval est plafonné par le serveur à la fin de la journée commerciale,
// ce qui donne jusqu'au dernier tram (y compris après minuit).
const timetableCache = new Map();

export async function loadTimetable(lineRef, direction, { signal } = {}) {
  const key = `${lineRef}|${direction}`;
  const hit = timetableCache.get(key);
  if (hit && Date.now() - hit.at < TIMETABLE_TTL_MS) return hit.journeys;
  const json = await siri(
    "estimated-timetable.json",
    { LineRef: lineRef, DirectionRef: direction, PreviewInterval: "PT24H" },
    signal,
  );
  const journeys = parseJourneys(json);
  timetableCache.set(key, { at: Date.now(), journeys });
  return journeys;
}

export function clearTimetableCache() {
  timetableCache.clear();
}
