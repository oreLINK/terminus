import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { buildJourneys, eveningJourneys, mergeLive, isoDate } from "../js/core/timetable.js";
import tbm from "../js/networks/bordeaux-tbm/index.js";
import index from "../js/networks/bordeaux-tbm/evening/index.js";
import tramStops from "../js/networks/bordeaux-tbm/stops.js";

const refs = tbm.features["last-ride"].evening.refs;
const INDEX = { timeZone: "Europe/Paris", stops: { 1: "Ouest", 2: "Centre", 3: "Est" }, days: { "2026-10-24": 0, "2026-10-25": 0 } };
// Une course de la ligne 59 : départ 23 h 50, puis +4 min, puis +6 min (passe minuit : 24:00).
const DAY = { patterns: [["59", 0, ["1", "2", "3"]]], profiles: [[0, 240, 360]], trips: [["b_1_1", 0, 0, 23 * 3600 + 50 * 60]] };

test("horaires théoriques : heures absolues, au-delà de minuit, au format du flux SIRI", () => {
  const [j] = buildJourneys(INDEX, DAY, "2026-10-24", refs);
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
  assert.equal((await eveningJourneys(source, ["2026-10-24", "2026-10-25"])).length, 2);
  assert.equal(await eveningJourneys(source, ["2026-10-24", "2026-12-25"]), null);
  assert.equal((await eveningJourneys(source, ["2026-10-24"], new Set(["bordeaux:Line:60:LOC"]))).length, 0);
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
    assert.ok(existsSync(fileURLToPath(new URL(`../js/networks/bordeaux-tbm/evening/day-${type}.js`, import.meta.url))), `day-${type}.js`);
  }
  const known = new Set(tramStops.stops.map((s) => s.ref));
  const day = (await import(`../js/networks/bordeaux-tbm/evening/day-${Object.values(index.days)[0]}.js`)).default;
  const tramLines = new Set(Object.keys(tramStops.lines));
  const journeys = buildJourneys(index, day, Object.keys(index.days)[0], refs, tramLines);
  assert.ok(journeys.length > 100, "des courses de tram le soir");
  const unknown = new Set(journeys.flatMap((j) => j.calls.map((c) => c.ref)).filter((r) => !known.has(r)));
  assert.ok(unknown.size === 0, `quais inconnus de stops.js : ${[...unknown].slice(0, 5).join(", ")}`);
  assert.equal(isoDate({ year: 2026, month: 3, day: 7 }), "2026-03-07");
});
