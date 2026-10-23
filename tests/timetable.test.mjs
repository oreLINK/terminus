import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildJourneys, eveningJourneys, mergeLive, mergeStopLive } from "../js/core/timetable.js";
import { parseStopVisits } from "../js/networks/bordeaux-tbm/siri-lite.js";
import { isoDate } from "../js/core/dates.js";
import tbm from "../js/networks/bordeaux-tbm/index.js";
import index from "../js/networks/bordeaux-tbm/evening/tram/index.js";
import tramStops from "../js/networks/bordeaux-tbm/stops.js";

const refs = tbm.features["last-ride"].evening.refs;
const INDEX = { timeZone: "Europe/Paris", nextDay: true, days: { "2026-10-24": 0, "2026-10-25": 0 } };
const NAMES = { "bordeaux:StopPoint:BP:1:LOC": "Ouest", "bordeaux:StopPoint:BP:2:LOC": "Centre", "bordeaux:StopPoint:BP:3:LOC": "Est" };
const nameOf = (ref) => NAMES[ref] ?? ref;
// Une course de la ligne 59 : départ 23 h 50, puis +4 min, puis +6 min (passe minuit : 24:00).
const DAY = { patterns: [["59", 0, ["1", "2", "3"]]], profiles: [[0, 240, 360]], trips: [["b_1_1", 0, 0, 23 * 3600 + 50 * 60]] };

test("horaires théoriques : heures absolues, au-delà de minuit, au format du flux SIRI", () => {
  const [j] = buildJourneys(INDEX, DAY, "2026-10-24", refs, null, nameOf);
  assert.equal(j.id, "bordeaux:ServiceJourney:b_1_1:LOC");
  assert.equal(j.line, "bordeaux:Line:59:LOC");
  assert.equal(j.direction, "0");
  assert.equal(j.headsign, "Est");
  assert.equal(j.calls[0].ref, "bordeaux:StopPoint:BP:1:LOC");
  assert.equal(j.calls[0].dep, Date.parse("2026-10-24T21:50:00Z")); // 23 h 50 à Paris (UTC+2)
  assert.equal(j.calls[2].dep, Date.parse("2026-10-24T22:00:00Z")); // minuit
  assert.ok(j.theoretical && !j.calls[0].depLive);
});

test("horaires théoriques : la nuit du changement d'heure suit la convention GTFS (midi moins 12 h)", () => {
  // Le 25 octobre 2026, on passe à l'heure d'hiver à 3 h. « Midi moins 12 h » vaut 1 h du matin
  // (heure d'été), soit 23:00 UTC la veille : 23:50 au GTFS donne bien 23:50 heure d'hiver, 22:50 UTC.
  const [j] = buildJourneys(INDEX, DAY, "2026-10-25", refs);
  assert.equal(j.calls[0].dep, Date.parse("2026-10-25T22:50:00Z"));
});

test("horaires théoriques : un jour absent rend null (fichier périmé, retour à l'ancienne méthode)", async () => {
  const source = { loadIndex: async () => INDEX, loadDay: async () => DAY, refs };
  assert.equal((await eveningJourneys(source, "2026-10-24", "2026-10-25")).length, 2); // soir et lendemain (nextDay)
  assert.equal(await eveningJourneys(source, "2026-10-24", "2026-12-25"), null);
  assert.equal((await eveningJourneys(source, "2026-10-24", "2026-10-25", new Set(["bordeaux:Line:60:LOC"]))).length, 0);
  // Sans nextDay (tram, bus) : le soir seulement, le lendemain n'est pas chargé.
  const tramLike = { ...source, loadIndex: async () => ({ ...INDEX, nextDay: false }) };
  assert.equal((await eveningJourneys(tramLike, "2026-10-24", "2026-12-25")).length, 1);
});

test("temps réel ciblé : il corrige et annule, mais une absence ne supprime rien", () => {
  const theo = (id, dep, line = "L", direction = "0") => ({ id, line, direction, theoretical: true, calls: [{ dep }] });
  const live = (id, dep, followed = true) => ({ id, line: "L", direction: "0", calls: [{ dep, depLive: followed }] });
  const H = 3600 * 1000;
  const journeys = [theo("a", 10 * H), theo("absente", 11 * H), theo("annulee", 12 * H), theo("autre", 10 * H, "M")];
  const merged = mergeLive(journeys, [{ line: "L", direction: "0" }], [
    live("a", 10 * H + 120_000), // corrige « a »
    { id: "annulee", line: "L", direction: "0", calls: [], cancelled: true }, // annule
    live("fantome", 13 * H, false), // sans jumelle ni suivi : ignorée
    live("renfort", 14 * H), // sans jumelle, suivie en direct : ajoutée
    live("absente", 11 * H - 24 * H), // même identifiant, la veille : ne remplace pas la course de ce soir
  ]);
  const ids = merged.map((j) => j.id).sort();
  assert.ok(ids.includes("absente"), "une course absente du flux reste");
  assert.ok(!ids.includes("annulee"), "une course annulée est retirée");
  assert.ok(!ids.includes("fantome"), "une course sans jumelle ni suivi est ignorée");
  assert.ok(ids.includes("renfort") && ids.includes("autre"));
  assert.equal(merged.find((j) => j.id === "a").calls[0].dep, 10 * H + 120_000);
  assert.equal(merged.find((j) => j.id === "absente" && j.theoretical).calls[0].dep, 11 * H);
  // Un second tour remplace l'ancien temps réel, sans doublon ni perte.
  const again = mergeLive(merged, [{ line: "L", direction: "0" }], [live("a", 10 * H + 180_000)]);
  assert.equal(again.filter((j) => j.id === "a").length, 1);
  assert.equal(again.find((j) => j.id === "a").calls[0].dep, 10 * H + 180_000);
  assert.ok(again.some((j) => j.id === "renfort"));
  // Un (ligne, sens) non interrogé n'est pas touché.
  assert.equal(mergeLive(journeys, [{ line: "M", direction: "0" }], [live("a", 1)]).find((j) => j.id === "a").calls[0].dep, 10 * H);
});

test("horaires générés : chaque jour a son fichier, et les quais du tram sont ceux de stops.js", async () => {
  for (const type of new Set(Object.values(index.days))) {
    assert.ok(existsSync(fileURLToPath(new URL(`../js/networks/bordeaux-tbm/evening/tram/day-${type}.js`, import.meta.url))), `day-${type}.js`);
  }
  const known = new Set(tramStops.stops.map((s) => s.ref));
  const day = (await import(`../js/networks/bordeaux-tbm/evening/tram/day-${Object.values(index.days)[0]}.js`)).default;
  const tramLines = new Set(Object.keys(tramStops.lines));
  const journeys = buildJourneys(index, day, Object.keys(index.days)[0], refs, tramLines);
  assert.ok(journeys.length > 100, "des courses de tram le soir");
  const unknown = new Set(journeys.flatMap((j) => j.calls.map((c) => c.ref)).filter((r) => !known.has(r)));
  assert.ok(unknown.size === 0, `quais inconnus de stops.js : ${[...unknown].slice(0, 5).join(", ")}`);
  assert.equal(isoDate({ year: 2026, month: 3, day: 7 }), "2026-03-07");
});

// ---------- Temps réel quai par quai (stop-monitoring) ----------

const Q = (n) => `bordeaux:StopPoint:BP:${n}:LOC`;
const T0 = Date.parse("2026-10-23T21:00:00Z");
const course = (id, start) => ({
  id, line: "bordeaux:Line:59:LOC", direction: "0", headsign: "Est", theoretical: true,
  calls: [1, 2, 3, 4].map((n, k) => ({ ref: Q(n), name: String(n), dep: start + k * 300000, depLive: false, arr: start + k * 300000, arrLive: false, cancelled: false })),
});
const visit = (id, n, aimed, expected) => ({ id, line: "bordeaux:Line:59:LOC", direction: "0", ref: Q(n), aimedDep: aimed, dep: expected, depLive: true, aimedArr: aimed, arr: expected, arrLive: true });

test("stop-monitoring : lecture du format Mecatran, identifiant complété de « :LOC »", () => {
  const json = { Siri: { ServiceDelivery: { StopMonitoringDelivery: [{ MonitoredStopVisit: [
    { MonitoredVehicleJourney: { LineRef: { value: "bordeaux:Line:59:LOC" }, DirectionRef: { value: "0" }, FramedVehicleJourneyRef: { DatedVehicleJourneyRef: "bordeaux:ServiceJourney:t_1_23" },
      MonitoredCall: { StopPointName: [{ value: "Hôtel de Ville" }], Order: 12, AimedArrivalTime: "2026-10-23T21:00:00Z", AimedDepartureTime: "2026-10-23T21:00:30Z", ExpectedDepartureTime: "2026-10-23T21:02:30Z" } } },
    { MonitoredVehicleJourney: { LineRef: { value: "bordeaux:Line:59:LOC" }, DirectionRef: { value: "0" }, FramedVehicleJourneyRef: { DatedVehicleJourneyRef: "bordeaux:ServiceJourney:t_2_23" },
      MonitoredCall: { AimedDepartureTime: "2026-10-23T21:10:00Z" } } },
  ] }] } } };
  const [a, b] = parseStopVisits(json);
  assert.equal(a.doubtful, false);
  assert.equal(a.id, "bordeaux:ServiceJourney:t_1_23:LOC");
  assert.equal(a.direction, "0");
  assert.equal(a.aimedDep, Date.parse("2026-10-23T21:00:30Z"));
  assert.equal(a.dep, Date.parse("2026-10-23T21:02:30Z"));
  assert.ok(a.depLive);
  assert.equal(a.arrLive, false); // pas d'heure d'arrivée en temps réel : l'heure prévue
  assert.equal(b.dep, b.aimedDep);
  assert.equal(b.depLive, false);
});

test("mergeStopLive : l'heure du quai, et le retard reporté sur les arrêts suivants", () => {
  const { journeys, seen } = mergeStopLive([course("c1", T0), course("c2", T0 + 900000)], [visit("c1", 2, T0 + 300000, T0 + 420000)]);
  const [c1, c2] = journeys;
  assert.equal(c1.calls[0].dep, T0); // avant le quai : inchangé
  assert.equal(c1.calls[1].dep, T0 + 420000);
  assert.ok(c1.calls[1].depLive);
  assert.equal(c1.calls[3].arr, T0 + 900000 + 120000); // 2 min de retard reportées
  assert.equal(c1.calls[3].arrLive, false);
  assert.equal(c2.calls[1].dep, T0 + 1200000); // l'autre course reste théorique
  assert.ok(seen.has(`c1|${Q(2)}`));
});

test("mergeStopLive : un passage plus loin corrige le report, et rien n'est retiré", () => {
  const visits = [visit("c1", 3, T0 + 600000, T0 + 600000 + 60000), visit("c1", 2, T0 + 300000, T0 + 300000 + 180000)];
  const { journeys } = mergeStopLive([course("c1", T0)], visits);
  const calls = journeys[0].calls;
  assert.equal(calls[1].dep, T0 + 480000);
  assert.equal(calls[2].dep, T0 + 660000); // 1 min, et non 3 : le passage du quai 3 l'emporte
  assert.equal(calls[3].dep, T0 + 960000);
  const none = mergeStopLive([course("c1", T0)], []);
  assert.equal(none.journeys.length, 1);
  assert.equal(none.seen.size, 0);
});

test("mergeStopLive : même identifiant un autre jour, ou quai non desservi : ignoré", () => {
  const original = course("c1", T0);
  const { journeys, seen } = mergeStopLive([original], [visit("c1", 2, T0 + 300000 + 24 * 3600000, T0 + 24 * 3600000), visit("c1", 9, T0, T0)]);
  assert.deepEqual(journeys[0], original);
  assert.equal(seen.size, 0);
});

test("stop-monitoring : une course peut-être annulée (gardée comme un passage, sans temps réel) est douteuse", () => {
  const json = { Siri: { ServiceDelivery: { StopMonitoringDelivery: [{ MonitoredStopVisit: [
    { RecordedAtTime: "2026-10-23T18:28:42Z", MonitoredVehicleJourney: { LineRef: { value: "bordeaux:Line:59:LOC" }, DirectionRef: { value: "1" }, FramedVehicleJourneyRef: { DatedVehicleJourneyRef: "bordeaux:ServiceJourney:t_268436230_23" },
      MonitoredCall: { Order: 0, AimedDepartureTime: "2026-10-23T19:56:58Z" } } },
  ] }] } } };
  assert.equal(parseStopVisits(json)[0].doubtful, true);
});

test("mergeStopLive : un passage douteux n'est ni appliqué ni compté (sa course sera vérifiée)", () => {
  const original = course("c1", T0);
  const { journeys, seen } = mergeStopLive([original], [{ ...visit("c1", 2, T0 + 300000, T0 + 420000), doubtful: true }]);
  assert.deepEqual(journeys[0], original);
  assert.equal(seen.size, 0);
});
