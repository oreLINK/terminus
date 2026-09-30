// Génère js/networks/bordeaux-tbm/graph.js : l'ordre des arrêts de chaque ligne de tram, par sens.
// Sert à savoir quelles lignes et quel sens charger avant d'appeler l'API (voir routeRequests).
// Usage : npm run graph, de préférence en journée (le soir, certaines branches n'ont plus de course).

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadNetwork, loadTimetable } from "../js/networks/bordeaux-tbm/siri-lite.js";

const OUT = new URL("../js/networks/bordeaux-tbm/graph.js", import.meta.url);

// `inner` apparaît d'un seul tenant dans `outer` : course partielle ou limitée par des travaux.
function isContained(inner, outer) {
  if (inner.length >= outer.length) return false;
  const start = outer.indexOf(inner[0]);
  return start >= 0 && inner.every((ref, i) => outer[start + i] === ref);
}

const { lines } = await loadNetwork();
const names = {};
const patterns = [];

for (const line of Object.values(lines).sort((a, b) => a.code.localeCompare(b.code))) {
  for (const direction of ["0", "1"]) {
    const journeys = await loadTimetable(line.ref, direction);
    const sequences = new Map();
    for (const j of journeys) {
      for (const c of j.calls) names[c.ref] ??= c.name;
      const refs = j.calls.map((c) => c.ref);
      sequences.set(refs.join(" "), refs);
    }
    const all = [...sequences.values()];
    const kept = all.filter((s) => !all.some((o) => isContained(s, o))).sort((a, b) => b.length - a.length);
    for (const stops of kept) patterns.push({ line: line.ref, direction, stops });
    console.log(`${line.code} sens ${direction} : ${journeys.length} courses, ${kept.length} motif(s)`);
  }
}

if (!patterns.length) throw new Error("Aucun motif : l'API n'a renvoyé aucune course de tram.");

// Une entrée par ligne de texte : fichier compact, diffs lisibles quand le réseau change.
const j = JSON.stringify;
const body = `// Généré par tools/build-graph.mjs (npm run graph). Ne pas modifier à la main.
// Ordre des arrêts de chaque ligne de tram TBM, par sens (DirectionRef SIRI-Lite).
// Un motif par séquence distincte (branches) ; les courses partielles sont retirées.

export default {
  generatedAt: ${j(new Date().toISOString().slice(0, 10))},
  names: {
${Object.keys(names)
  .sort()
  .map((ref) => `    ${j(ref)}: ${j(names[ref])},`)
  .join("\n")}
  },
  patterns: [
${patterns.map((p) => `    { line: ${j(p.line)}, direction: ${j(p.direction)}, stops: ${j(p.stops)} },`).join("\n")}
  ],
};
`;
await writeFile(OUT, body);
console.log(`${patterns.length} motifs, ${Object.keys(names).length} arrêts → ${fileURLToPath(OUT)}`);
