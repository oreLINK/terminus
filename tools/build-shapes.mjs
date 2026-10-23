// Génère js/networks/bordeaux-tbm/shapes.js : le tracé réel de chaque ligne de tram (A à F) et de
// bus de nuit TBNight (N1 à N8), tiré du GTFS statique de TBM (shapes.txt), pour que la carte suive
// les voies et les rues au lieu de relier les arrêts en ligne droite (voir js/core/line-trace.js).
// Usage : npm run shapes. Relancer quand une ligne change de parcours ; relire le diff.
// Le GTFS est téléchargé et lu par tools/gtfs.mjs.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { withGtfs } from "./gtfs.mjs";
import tramStops from "../js/networks/bordeaux-tbm/stops.js";
import nightStops from "../js/networks/bordeaux-tbm/night-stops.js";
import { simplifyLine, encodeLine, distanceToLine } from "../js/core/line-trace.js";

const OUT = new URL("../js/networks/bordeaux-tbm/shapes.js", import.meta.url);
const TOLERANCE_M = 4; // écart maximal entre le tracé simplifié et le tracé d'origine
const CONTAINED_M = 8; // un tracé dont chaque point est à moins de 8 m d'un autre est un doublon

// Les lignes que Terminus calcule : celles des arrêts générés par build-graph.
const codes = new Set([...Object.values(tramStops.lines), ...Object.values(nightStops.lines)].map((l) => l.code));

await withGtfs(async ({ read }) => {

  const routeCode = new Map(read("routes.txt").filter((r) => codes.has(r.route_short_name)).map((r) => [r.route_id, r.route_short_name]));
  const shapeCode = new Map();
  for (const t of read("trips.txt")) {
    const code = routeCode.get(t.route_id);
    if (code && t.shape_id) shapeCode.set(t.shape_id, code);
  }

  const raw = new Map();
  for (const s of read("shapes.txt")) {
    if (!shapeCode.has(s.shape_id)) continue;
    if (!raw.has(s.shape_id)) raw.set(s.shape_id, []);
    raw.get(s.shape_id).push([Number(s.shape_pt_sequence), Number(s.shape_pt_lat), Number(s.shape_pt_lon)]);
  }

  // Par ligne : chaque tracé simplifié, sans les doublons (un tracé entièrement couvert par un autre
  // de la même ligne, comme une course partielle).
  const byCode = new Map();
  for (const [id, pts] of raw) {
    const line = simplifyLine(pts.sort((a, b) => a[0] - b[0]).map(([, lat, lon]) => [lat, lon]), TOLERANCE_M);
    const code = shapeCode.get(id);
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(line);
  }
  const lines = {};
  let kept = 0;
  for (const code of [...byCode.keys()].sort()) {
    const all = byCode.get(code).sort((a, b) => b.length - a.length);
    const distinct = [];
    for (const line of all) {
      const covered = distinct.some((other) => line.every((p) => distanceToLine(other, p) <= CONTAINED_M));
      if (!covered) distinct.push(line);
    }
    lines[code] = distinct.map(encodeLine);
    kept += distinct.length;
    console.log(`${code} : ${all.length} tracés, ${distinct.length} gardés, ${distinct.reduce((n, l) => n + l.length, 0)} points`);
  }
  const missing = [...codes].filter((c) => !lines[c]);
  if (missing.length) console.warn(`Sans tracé dans le GTFS : ${missing.join(", ")} (la carte les reliera en ligne droite).`);

  const j = JSON.stringify;
  const body = `// Généré par tools/build-shapes.mjs (npm run shapes). Ne pas modifier à la main.
// Tracé réel des lignes de tram et TBNight, tiré du GTFS statique de TBM (shapes.txt), simplifié à
// ${TOLERANCE_M} m près. Par code de ligne, une liste de tracés (sens et branches), chacun encodé par
// encodeLine (js/core/line-trace.js) : premier point puis écarts, en cent-millièmes de degré.

export default {
  generatedAt: ${j(new Date().toISOString().slice(0, 10))},
  lines: {
${Object.entries(lines)
  .map(([code, list]) => `    ${j(code)}: [\n${list.map((l) => `      ${j(l)},`).join("\n")}\n    ],`)
  .join("\n")}
  },
};
`;
  await writeFile(OUT, body);
  console.log(`${kept} tracés pour ${Object.keys(lines).length} lignes → ${fileURLToPath(OUT)}`);
});
