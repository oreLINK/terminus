// Génère, dans js/networks/bordeaux-tbm/ :
// - stops.js : les lignes et les arrêts de tram (nom, position, lignes), que le site charge sans
//   appeler l'API (lines-discovery et stoppoints-discovery, ~5 200 points, sont lourds) ;
// - graph.js : l'ordre des arrêts de chaque ligne de tram, par sens, pour savoir quelles lignes et
//   quel sens charger avant d'appeler l'API (voir routeRequests).
// Usage : npm run graph, de préférence en journée et hors travaux (le soir ou un jour de travaux,
// certaines branches n'ont plus de course et manqueraient au graphe). Relire le diff de graph.js.
// npm run graph -- --stops-only : ne régénère que stops.js.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { loadNetwork, loadTimetable } from "../js/networks/bordeaux-tbm/siri-lite.js";

const OUT = new URL("../js/networks/bordeaux-tbm/graph.js", import.meta.url);
const STOPS_OUT = new URL("../js/networks/bordeaux-tbm/stops.js", import.meta.url);
// Les arrêts viennent de la liste du réseau, pas des courses : travaux et heure de lancement n'y changent rien.
const STOPS_ONLY = process.argv.includes("--stops-only");

// `inner` apparaît d'un seul tenant dans `outer` : course partielle ou limitée par des travaux.
function isContained(inner, outer) {
  if (inner.length >= outer.length) return false;
  const start = outer.indexOf(inner[0]);
  return start >= 0 && inner.every((ref, i) => outer[start + i] === ref);
}

const { lines, stops } = await loadNetwork();
const j = JSON.stringify;
const today = new Date().toISOString().slice(0, 10);

const stopsBody = `// Généré par tools/build-graph.mjs (npm run graph). Ne pas modifier à la main.
// Lignes de tram TBM et points d'arrêt (quais) desservis par au moins un tram.

export default {
  generatedAt: ${j(today)},
  lines: {
${Object.values(lines)
  .sort((a, b) => a.code.localeCompare(b.code))
  .map((l) => `    ${j(l.ref)}: ${j(l)},`)
  .join("\n")}
  },
  stops: [
${[...stops]
  .sort((a, b) => a.ref.localeCompare(b.ref))
  .map((s) => `    ${j({ ...s, lines: [...s.lines].sort() })},`)
  .join("\n")}
  ],
};
`;
await writeFile(STOPS_OUT, stopsBody);
console.log(`${Object.keys(lines).length} lignes, ${stops.length} arrêts → ${fileURLToPath(STOPS_OUT)}`);
if (STOPS_ONLY) process.exit(0);

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
const body = `// Généré par tools/build-graph.mjs (npm run graph). Ne pas modifier à la main.
// Ordre des arrêts de chaque ligne de tram TBM, par sens (DirectionRef SIRI-Lite).
// Un motif par séquence distincte (branches) ; les courses partielles sont retirées.

export default {
  generatedAt: ${j(today)},
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
