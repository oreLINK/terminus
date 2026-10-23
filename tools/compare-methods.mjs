// Compare, pour le mode tram, l'ancienne méthode (horaires SIRI par ligne) et la nouvelle (horaires
// théoriques inclus, evening/) : c'est le test de fiabilité de l'étape 1 (CONTEXT.md, section 11,
// piste 10). Deux parties :
//   1. les données : chaque course SIRI doit exister dans les horaires inclus, avec le même sens, les
//      mêmes quais et, hors temps réel, les mêmes heures ; une course incluse absente de SIRI dans sa
//      fenêtre est signalée (supprimée ce jour-là, ou décalage des données) ;
//   2. les trajets : sur des couples (position, destination) tirés au hasard, le tracé « le plus
//      tard » et « le prochain » des deux méthodes, comparés course par course.
// Usage : npm run compare [-- --pairs 60] [-- --seed 7]. Douze appels SIRI (tous les trams, deux
// sens). Le soir, le temps réel explique les écarts d'heure ; une course différente est un écart à
// examiner. En journée, la comparaison s'arrête à l'horizon du flux SIRI (environ 12 h).

import tbm from "../js/networks/bordeaux-tbm/index.js";
import stopsData from "../js/networks/bordeaux-tbm/stops.js";
import { loadTimetable } from "../js/networks/bordeaux-tbm/siri-lite.js";
import { buildIndex, candidateStations, transferMap, plan, serviceEndAfter, serviceMorning, addDays } from "../js/features/last-ride/planner.js";
import { decodeLine } from "../js/core/line-trace.js";
import { eveningJourneys, isoDate } from "../js/core/timetable.js";
import { zonedTime } from "../js/core/util.js";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? Number(process.argv[i + 1]) : fallback;
};
const PAIRS = arg("pairs", 60);
let seed = arg("seed", 7);
const random = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

const adapter = tbm.features["last-ride"];
const tz = tbm.timeZone;
const lines = Object.keys(stopsData.lines);
const lineCodes = Object.fromEntries(Object.values(stopsData.lines).map((l) => [l.ref, l.code]));
const index = buildIndex(stopsData.stops);
// Comme dans l'appli : correspondances à pied et candidats ligne par ligne.
const transfers = transferMap((await adapter.loadTransfers()).rows, index, decodeLine);
const now = Date.now();
const serviceEnd = serviceEndAfter(now, { timeZone: tz, hour: adapter.serviceEndHour });
const fmt = (ms) => new Intl.DateTimeFormat("fr-FR", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(ms);

// ---------- Horaires des deux méthodes ----------

const live = [];
for (const line of lines) {
  for (const direction of ["0", "1"]) {
    const got = await loadTimetable(line, direction, { until: serviceEnd });
    live.push(...got.map((j) => ({ ...j, direction })));
  }
}
// Les annulations explicites du flux ne roulent pas : comptées à part, hors des comparaisons.
const cancellations = live.filter((j) => j.cancelled);
live.splice(0, live.length, ...live.filter((j) => !j.cancelled));
const evening = addDays(serviceMorning(now, { timeZone: tz, hour: adapter.serviceEndHour }), -1);
const theo = await eveningJourneys(adapter.evening, [isoDate(evening), isoDate(addDays(evening, 1))], new Set(lines));
if (!theo) throw new Error("Les horaires inclus ne couvrent pas cette soirée : npm run timetable.");

// Fenêtre commune : jusqu'à l'horizon du flux le plus court, et de 17 h (début des horaires inclus).
const horizonOf = new Map();
for (const j of live) {
  const k = `${j.line}|${j.direction}`;
  horizonOf.set(k, Math.max(horizonOf.get(k) ?? 0, j.calls[0].dep));
}
const horizon = Math.min(serviceEnd, ...horizonOf.values());
// Les horaires inclus couvrent la soirée à partir de 17 h : en journée, on compare comme s'il était 17 h.
const since = Math.max(now, zonedTime(`${isoDate(evening)} 17:00`, tz));
console.log(`Soirée du ${isoDate(evening)}, comparaison de ${fmt(since)} à ${fmt(horizon)} (fin du service ${fmt(serviceEnd)}).`);
console.log(`Courses : ${live.length} dans SIRI (et ${cancellations.length} annulations), ${theo.length} dans les horaires inclus.\n`);

// ---------- 1. Les données ----------

// Une course GTFS garde son identifiant d'un jour à l'autre : on rapproche par identifiant ET par
// heure (à 6 h près), sinon une course de demain passerait pour celle de ce soir.
const theoByIdList = new Map();
for (const j of theo) theoByIdList.set(j.id, [...(theoByIdList.get(j.id) ?? []), j]);
const sameDay = (a, b) => Math.abs(a.calls[0].dep - b.calls[0].dep) < 6 * 3600 * 1000;
const twinOf = (j) => theoByIdList.get(j.id)?.find((t) => sameDay(t, j));
const theoById = { get: (id) => theoByIdList.get(id)?.[0], has: (id) => theoByIdList.has(id) };
// Une course compte si elle passe dans la fenêtre (le flux renvoie aussi celles de la veille au soir).
const inWindow = (j) => j.calls.at(-1).dep >= since && j.calls[0].dep <= horizon;
const liveIn = live.filter(inWindow);
let found = 0;
let sameDir = 0;
let sameStops = 0;
let sameTimes = 0;
let aimedCompared = 0;
const missingInTheo = [];
for (const j of liveIn) {
  const t = twinOf(j);
  if (!t) {
    missingInTheo.push(j);
    continue;
  }
  found++;
  if (t.direction === j.direction) sameDir++;
  // SIRI peut omettre les quais déjà passés : on compare la fin de course.
  const tail = t.calls.slice(-j.calls.length).map((c) => c.ref).join(" ");
  if (tail === j.calls.map((c) => c.ref).join(" ")) sameStops++;
  const aimed = j.calls.filter((c) => !c.depLive);
  if (aimed.length) {
    aimedCompared++;
    const byRef = new Map(t.calls.map((c) => [c.ref, c.dep]));
    if (aimed.every((c) => Math.abs((byRef.get(c.ref) ?? Infinity) - c.dep) <= 60_000)) sameTimes++;
  }
}
const liveByIdList = new Map();
for (const j of live) liveByIdList.set(j.id, [...(liveByIdList.get(j.id) ?? []), j]);
const missingInLive = theo.filter((j) => inWindow(j) && !liveByIdList.get(j.id)?.some((l) => sameDay(l, j)));
// Absente de SIRI ce soir, mais présente à la date de la veille : le flux ne garde qu'une course par
// identifiant, celle d'hier soir, et il lui manque celle de ce soir.
const staleInLive = missingInLive.filter((j) => liveByIdList.has(j.id));
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)} %` : "—");
console.log("1. Données");
console.log(`  Courses SIRI retrouvées dans les horaires inclus : ${found}/${liveIn.length} (${pct(found, liveIn.length)})`);
console.log(`  … même sens : ${pct(sameDir, found)} ; mêmes quais : ${pct(sameStops, found)} ; mêmes heures prévues (à 1 min) : ${sameTimes}/${aimedCompared} (${pct(sameTimes, aimedCompared)})`);
console.log(`  Courses incluses absentes de SIRI dans la fenêtre : ${missingInLive.length}, dont ${staleInLive.length} présentes dans SIRI à la date de la veille seulement`);
// Courses SIRI absentes du GTFS : fantômes si aucune n'est suivie en direct (constaté le 23/10/2026 :
// des courses du service du samedi publiées un vendredi, sans aucun suivi en direct).
const phantoms = missingInTheo.filter((j) => !j.calls.some((c) => c.depLive));
console.log(`  Courses SIRI absentes des horaires inclus : ${missingInTheo.length}, dont ${phantoms.length} sans aucun suivi en direct (fantômes probables)`);
for (const j of [...missingInTheo.slice(0, 3)]) console.log(`    absente des horaires inclus : ${j.id} (${lineCodes[j.line]}, ${fmt(j.calls[0].dep)})`);
for (const j of missingInLive.slice(0, 3)) console.log(`    absente de SIRI : ${j.id} (${lineCodes[j.line]}, ${fmt(j.calls[0].dep)})`);

// ---------- 2. Les trajets ----------

const stations = index.stations.filter((s) => s.lines.some((l) => lineCodes[l]));
const pick = () => stations[Math.floor(random() * stations.length)];
const jitter = (s) => ({ lat: s.lat + (random() - 0.5) * 0.004, lon: s.lon + (random() - 0.5) * 0.004 });
const legsKey = (o) => o?.last.legs.map((l) => `${lineCodes[l.line]}:${l.journeyId}@${l.from.name}`).join(" + ") ?? "aucun";
const tally = { same: 0, delay: 0, different: 0, phantom: 0, stale: 0, none: 0 };
// Le tracé SIRI emprunte-t-il une course absente des horaires inclus ce soir et jamais suivie en direct ?
const usesPhantom = (o) =>
  o?.last.legs.some((l) => {
    const j = liveByIdList.get(l.journeyId)?.find((x) => Math.abs(x.calls[0].dep - l.dep) < 6 * 3600 * 1000) ?? { id: l.journeyId, calls: [{ dep: l.dep }] };
    return !twinOf(j) && !j.calls.some((c) => c.depLive);
  });
// Le tracé des horaires inclus emprunte-t-il une course que SIRI ne connaît qu'à la date de la veille ?
const staleIds = new Set(staleInLive.map((j) => j.id));
const usesStale = (o) => o?.last.legs.some((l) => staleIds.has(l.journeyId));
const details = [];
let tested = 0;
let walkingTransfers = 0;
while (tested < PAIRS) {
  const a = pick();
  const b = pick();
  if (a.id === b.id || Math.hypot(a.lat - b.lat, a.lon - b.lon) < 0.02) continue;
  tested++;
  const here = jitter(a);
  const home = jitter(b);
  const origins = candidateStations(index.stations, here, { radius: 2000, min: 2, max: 10 });
  const dests = candidateStations(index.stations, home, { radius: 1500, min: 1, max: 8 });
  const run = (journeys) => plan({ origins, dests, journeys, index, lineCodes, now: since, serviceEnd: horizon, transfers });
  const old = run(live);
  const fresh = run(theo);
  for (const kind of ["primary", "soonest"]) {
    const x = old[kind];
    const y = fresh[kind];
    if (y?.last.legs.some((l) => l.walkAfter)) walkingTransfers++;
    if (!x && !y) {
      tally.none++;
      continue;
    }
    const kx = legsKey(x);
    const ky = legsKey(y);
    if (kx === ky && x.leaveBy === y.leaveBy) tally.same++;
    else if (kx === ky) tally.delay++;
    else if (usesPhantom(x)) tally.phantom++;
    else if (usesStale(y)) tally.stale++;
    else {
      tally.different++;
      details.push(`  ${kind === "primary" ? "le plus tard" : "le prochain"}, ${a.name} → ${b.name}\n    SIRI     ${kx} (avant ${x ? fmt(x.leaveBy) : "—"})\n    inclus   ${ky} (avant ${y ? fmt(y.leaveBy) : "—"})`);
    }
  }
}
const total = tally.same + tally.delay + tally.different;
console.log(`\n2. Trajets (${tested} couples, tracés « le plus tard » et « le prochain »)`);
console.log(`  Mêmes courses, même heure limite : ${tally.same}/${total} (${pct(tally.same, total)})`);
console.log(`  Mêmes courses, heure différente (temps réel) : ${tally.delay}`);
console.log(`  SIRI s'appuie sur une course fantôme (absente du GTFS ce soir, jamais suivie) : ${tally.phantom}`);
console.log(`  Les horaires inclus trouvent une course que SIRI n'a qu'à la date de la veille : ${tally.stale}`);
console.log(`  Autres écarts, à examiner : ${tally.different}${tally.none ? ` ; sans trajet dans les deux : ${tally.none}` : ""}`);
console.log(`  Tracés avec une correspondance à pied (horaires inclus) : ${walkingTransfers}`);
for (const d of details.slice(0, 8)) console.log(d);
