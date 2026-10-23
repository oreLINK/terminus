// Sam — le seul qui appelle TBM en temps réel. Accès au flux SIRI-Lite public de Bordeaux Métropole (réseau TBM).
// Doc : https://transport.data.gouv.fr/datasets/offres-de-services-bus-tram-et-scolaire-au-format-gtfs-netex-gtfs-rt-siri-lite
// La clé ci-dessous est la clé open data publique et partagée.

const BASE = "https://bdx.mecatran.com/utw/ws/siri/2.0/bordeaux";
const KEY = "opendata-bordeaux-metropole-flux-gtfs-rt";

const TIMETABLE_TTL_MS = 100 * 1000;
const TIMETABLES_KEY = "dt.timetables.v1"; // sessionStorage : horaires gardés pour la soirée
const TIMETABLES_KEEP_MS = 15 * 60 * 1000;

class ApiError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

// Les références SIRI-Lite arrivent sous plusieurs formes : "x", {value: "x"} ou [{value: "x"}].
const val = (x) => {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return val(x[0]);
  return x.value ?? "";
};

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const toMs = (iso) => (iso ? Date.parse(iso) : null);

function isInGironde(lat, lon) {
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


// Familles de lignes : (nom, code de l'API) → code affiché, ou null si la ligne n'en fait pas partie.
// Le code de l'API est faux pour TBNight (vérifié le 01/10/2026 : « TBNight » pour la N1, « N1 »
// pour la N8, « N2 » à « N7 » justes) : on prend le numéro dans le nom, « TBNight N8 ».
const LINE_KINDS = {
  tram: (name, code) => (/^tram\b/i.test(name) && /^[a-f]$/i.test(code) ? code.toUpperCase() : null),
  night: (name) => name.match(/^tbnight (n\d)$/i)?.[1].toUpperCase() ?? null,
};

// Lignes d'une famille + points d'arrêt physiques desservis par au moins une d'elles. Appelé
// seulement par tools/build-graph.mjs, qui en tire stops.js (ou night-stops.js) : le site ne fait
// plus ces deux appels lourds.
export async function loadNetwork(kind = "tram") {
  const codeOf = LINE_KINDS[kind];
  const [linesJson, stopsJson] = await Promise.all([
    siri("lines-discovery.json"),
    siri("stoppoints-discovery.json"),
  ]);

  const lines = {};
  for (const l of linesJson?.Siri?.LinesDelivery?.AnnotatedLineRef ?? []) {
    const ref = val(l.LineRef);
    const code = codeOf(val(l.LineName).trim(), val(l.LineCode));
    if (code) lines[ref] = { ref, code };
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

  return { lines, stops };
}

// Courses du flux, au format commun (voir js/core/timetable.js). Une course annulée est gardée, avec
// `cancelled: true` (et parfois sans passage) : la nouvelle méthode s'en sert pour retirer la course
// théorique correspondante ; le calcul les ignore.
export function parseJourneys(json) {
  const out = [];
  const deliveries = asArray(json?.Siri?.ServiceDelivery?.EstimatedTimetableDelivery);
  for (const delivery of deliveries) {
    for (const frame of asArray(delivery.EstimatedJourneyVersionFrame)) {
      for (const j of asArray(frame.EstimatedVehicleJourney)) {
        const cancelled = j.Cancellation === true;
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
        const id = val(j.VehicleJourneyRef) || val(j.DatedVehicleJourneyRef) || (calls[0] && `${val(j.LineRef)}:${calls[0].dep}`);
        if (cancelled) {
          if (id) out.push({ id, line: val(j.LineRef), headsign: calls.at(-1)?.name ?? "", calls, cancelled: true });
          continue;
        }
        if (calls.length < 2) continue;
        out.push({ id, line: val(j.LineRef), headsign: calls[calls.length - 1].name, calls });
      }
    }
  }
  return out;
}

// Horaires par ligne et par sens : en mémoire, et recopiés dans sessionStorage pour qu'un
// rechargement de la page dans la soirée ne refasse pas les appels. Le stockage est « au mieux » :
// une ligne lue pèse jusqu'à ~500 Ko, et un quota dépassé laisse simplement le cache en mémoire.
const timetableCache = new Map(readTimetables());
const pending = new Map(); // appels en cours : deux demandes identiques n'en font qu'une

function readTimetables() {
  try {
    const entries = JSON.parse(globalThis.sessionStorage?.getItem(TIMETABLES_KEY)) ?? [];
    return entries.filter(([, e]) => Date.now() - e.at < TIMETABLES_KEEP_MS);
  } catch {
    return [];
  }
}

function writeTimetables() {
  try {
    globalThis.sessionStorage?.setItem(TIMETABLES_KEY, JSON.stringify([...timetableCache]));
  } catch {
    try {
      globalThis.sessionStorage?.removeItem(TIMETABLES_KEY);
    } catch {
      // Stockage indisponible : le cache reste en mémoire.
    }
  }
}

// PreviewInterval couvrant de maintenant à `until` (fin du service), plus une heure de marge pour
// les courses parties avant et pas encore arrivées. Sans fin connue : 24 h. Mesuré le 01/10/2026
// sur le tram A : PT24H pèse 3,3 Mo (1,3 s), PT6H 590 Ko, PT1H 265 Ko. Un intervalle court ne
// renvoie presque plus les courses déjà passées.
function previewInterval(until) {
  if (!Number.isFinite(until)) return "PT24H";
  const hours = Math.ceil((until - Date.now()) / 3600000) + 1;
  return `PT${Math.min(24, Math.max(1, hours))}H`;
}

// Courses d'une ligne dans un sens, de maintenant jusqu'à `until`. `maxAge` : âge maximal d'un
// résultat en cache (court pour le temps réel du trajet affiché, plus long pour les autres lignes).
export async function loadTimetable(lineRef, direction, { until = Infinity, maxAge = TIMETABLE_TTL_MS, signal } = {}) {
  const key = `${lineRef}|${direction}`;
  const reach = Number.isFinite(until) ? until : null; // null : sans limite (JSON ne garde pas Infinity)
  const hit = timetableCache.get(key);
  const covers = hit && (hit.until === null || (reach !== null && hit.until >= reach));
  if (covers && Date.now() - hit.at < maxAge) return hit.journeys;

  const interval = previewInterval(until);
  const call = `${key}|${interval}`;
  if (!pending.has(call)) {
    pending.set(
      call,
      siri("estimated-timetable.json", { LineRef: lineRef, DirectionRef: direction, PreviewInterval: interval }, signal)
        .then((json) => {
          const journeys = parseJourneys(json);
          timetableCache.set(key, { at: Date.now(), until: reach, journeys });
          writeTimetables();
          return journeys;
        })
        .finally(() => pending.delete(call)),
    );
  }
  return pending.get(call);
}

export function clearTimetableCache() {
  timetableCache.clear();
  stopCache.clear();
  writeTimetables();
}

// ---------- Passages à un arrêt (stop-monitoring) ----------
// Le temps réel du trajet affiché, arrêt par arrêt : la montée et la descente de chaque tronçon, au
// lieu de toute la ligne dans un sens. Mesuré le 23/10/2026 au quai Hôtel de Ville de la ligne A :
// 16 Ko (3 h, ligne filtrée) contre 682 Ko pour estimated-timetable de la ligne jusqu'à la fin du
// service (le serveur ne compresse pas). Mêmes courses que les horaires inclus (36 sur 36, mêmes
// heures prévues) et aucune course fantôme. Le flux ne signale pas les annulations : il garde les
// courses annulées comme des passages ordinaires (constaté le 23/10/2026 au soir : 19 trams annulés,
// tous listés). Leur seule trace : `RecordedAtTime` présent, sans heure en temps réel ni heure
// d'arrivée prévue. Ce signe couvre toutes les annulations vues ce soir-là (34 passages sur 34, sur
// 45 quais), mais aussi des courses normales (41 passages, souvent au premier arrêt d'une course) :
// un passage ainsi marqué est donc « douteux » (`doubtful`), et sa course est vérifiée par
// estimated-timetable, qui dit l'annulation (voir mergeStopLive et js/features/last-ride/index.js).
// Identifiants : « bordeaux:ServiceJourney:<trip> », sans le suffixe « :LOC » d'estimated-timetable,
// rajouté ici pour retrouver la course.

// Passages du flux : [{ id, line, direction, ref, aimedDep, dep, depLive, aimedArr, arr, arrLive, doubtful }].
export function parseStopVisits(json) {
  const out = [];
  for (const delivery of asArray(json?.Siri?.ServiceDelivery?.StopMonitoringDelivery)) {
    for (const visit of asArray(delivery.MonitoredStopVisit)) {
      const j = visit.MonitoredVehicleJourney;
      const c = j?.MonitoredCall;
      const raw = val(j?.FramedVehicleJourneyRef?.DatedVehicleJourneyRef) || val(j?.VehicleJourneyRef);
      if (!c || !raw) continue;
      const aimedDep = toMs(c.AimedDepartureTime) ?? toMs(c.AimedArrivalTime);
      const aimedArr = toMs(c.AimedArrivalTime) ?? aimedDep;
      const expDep = toMs(c.ExpectedDepartureTime);
      const expArr = toMs(c.ExpectedArrivalTime);
      if (aimedDep == null) continue;
      out.push({
        id: raw.endsWith(":LOC") ? raw : `${raw}:LOC`,
        line: val(j.LineRef),
        direction: val(j.DirectionRef),
        ref: val(visit.MonitoringRef) || val(c.StopPointRef) || null,
        aimedDep,
        dep: expDep ?? aimedDep,
        depLive: expDep != null,
        aimedArr,
        arr: expArr ?? aimedArr,
        arrLive: expArr != null,
        // Peut-être annulée (voir plus haut) : à vérifier par la ligne entière.
        doubtful: Boolean(visit.RecordedAtTime) && expDep == null && expArr == null && c.AimedArrivalTime == null,
      });
    }
  }
  return out;
}

const stopCache = new Map();
const stopPending = new Map();

// Passages d'une ligne à un quai, de maintenant jusqu'à `until`. Même cache court que les horaires
// (`maxAge`), en mémoire seulement : quelques Ko, redemandés au plus toutes les 100 s.
export async function loadStopVisits(stopRef, lineRef, { until = Infinity, maxAge = TIMETABLE_TTL_MS, signal } = {}) {
  const key = `${stopRef}|${lineRef}`;
  const reach = Number.isFinite(until) ? until : null;
  const hit = stopCache.get(key);
  const covers = hit && (hit.until === null || (reach !== null && hit.until >= reach));
  if (covers && Date.now() - hit.at < maxAge) return hit.visits;

  const interval = previewInterval(until);
  const call = `${key}|${interval}`;
  if (!stopPending.has(call)) {
    stopPending.set(
      call,
      siri("stop-monitoring.json", { MonitoringRef: stopRef, LineRef: lineRef, PreviewInterval: interval }, signal)
        .then((json) => {
          const visits = parseStopVisits(json).map((v) => ({ ...v, ref: stopRef }));
          stopCache.set(key, { at: Date.now(), until: reach, visits });
          return visits;
        })
        .finally(() => stopPending.delete(call)),
    );
  }
  return stopPending.get(call);
}
