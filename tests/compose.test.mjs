import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeStops, mergeGraphs, mergeShapes, loadMerged } from "../js/core/compose.js";
import { buildIndex } from "../js/core/stations.js";
import { eveningJourneys } from "../js/core/timetable.js";

const tram = {
  lines: { T: { ref: "T", code: "A" } },
  stops: [
    { ref: "t1", name: "Victoire", lat: 44.8309, lon: -0.573, lines: ["T"] },
    { ref: "x", name: "Commun", lat: 44.84, lon: -0.58, lines: ["T"] },
  ],
};
const bus = {
  lines: { B: { ref: "B", code: "4", color: "#00B1EB" } },
  stops: [
    { ref: "b1", name: "Victoire", lat: 44.8311, lon: -0.5728, lines: ["B"] },
    { ref: "x", name: "Commun", lat: 44.84, lon: -0.58, lines: ["B"] },
  ],
};

test("assemblage des arrêts : un quai commun garde ses lignes, les quais homonymes forment une station", () => {
  const merged = mergeStops([tram, bus]);
  assert.deepEqual(Object.keys(merged.lines).sort(), ["B", "T"]);
  assert.deepEqual(merged.stops.find((s) => s.ref === "x").lines, ["B", "T"]);
  assert.equal(merged.stops.length, 3);
  // Tram « Victoire » et bus « Victoire » : une seule station, où l'on change sans marcher.
  const victoire = buildIndex(merged.stops).stations.find((s) => s.name === "Victoire");
  assert.deepEqual(victoire.refs.sort(), ["b1", "t1"]);
  assert.deepEqual(victoire.lines.sort(), ["B", "T"]);
});

test("assemblage des graphes, des tracés et des horaires du soir", async () => {
  assert.deepEqual(mergeGraphs([{ names: { a: "A" }, patterns: [1] }, { names: { b: "B" }, patterns: [2] }]), { names: { a: "A", b: "B" }, patterns: [1, 2] });
  assert.deepEqual(mergeShapes([{ lines: { A: [1] } }, { lines: { 4: [2] } }]).lines, { A: [1], 4: [2] });
  const load = loadMerged(mergeStops, async () => tram, async () => bus);
  assert.equal((await load()).stops.length, 3);
  // Horaires : plusieurs sources assemblées ; si l'une manque son jour, null (ancienne méthode).
  const refs = { line: (r) => r, stop: (s) => s, journey: (t) => t };
  const day = { patterns: [["L", 0, ["1", "2"]]], profiles: [[0, 60]], trips: [["t", 0, 0, 72000]] };
  const source = (days) => ({ loadIndex: async () => ({ timeZone: "Europe/Paris", days }), loadDay: async () => day, refs });
  assert.equal((await eveningJourneys([source({ "2026-10-24": 0 }), source({ "2026-10-24": 0 })], "2026-10-24", "2026-10-25")).length, 2);
  assert.equal(await eveningJourneys([source({ "2026-10-24": 0 }), source({})], "2026-10-24", "2026-10-25"), null);
});
