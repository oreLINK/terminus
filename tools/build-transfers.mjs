// Génère les correspondances à pied entre stations proches de noms différents, pour chaque fichier
// d'arrêts d'un mode : js/networks/bordeaux-tbm/transfers.js (tram) et night-transfers.js (TBNight).
// Une paire est gardée si ses quais les plus proches sont à moins de 400 m à vol d'oiseau et si l'on y
// change vraiment de ligne (chaque station dessert une ligne que l'autre n'a pas : marcher entre deux
// arrêts successifs d'une même ligne ne sert à rien). La marche est calculée une fois, ici, par le
// calcul d'itinéraire piéton de l'IGN (rues réelles), puis incluse dans le site : aucun appel pendant
// l'utilisation. En cas d'échec de l'IGN, l'estimation (vol d'oiseau × 1,3) est gardée, sans tracé.
// Usage : npm run transfers, après npm run graph (les identifiants de stations viennent des arrêts).

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildIndex } from "../js/features/last-ride/planner.js";
import { distanceM, walkBetween } from "../js/core/util.js";
import { fetchWalk } from "../js/core/walk-route.js";
import { simplifyLine, encodeLine } from "../js/core/line-trace.js";

const MAX_STRAIGHT_M = 400;
const SOURCES = [
  { stops: "stops.js", out: "transfers.js", label: "tram" },
  { stops: "night-stops.js", out: "night-transfers.js", label: "TBNight" },
];
const dir = new URL("../js/networks/bordeaux-tbm/", import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const j = JSON.stringify;

for (const source of SOURCES) {
  const data = (await import(new URL(source.stops, dir))).default;
  const index = buildIndex(data.stops);
  const quais = (station) => data.stops.filter((s) => station.refs.includes(s.ref));

  // Paires de stations où l'on change de ligne, à moins de 400 m (quais les plus proches).
  const pairs = [];
  const st = index.stations;
  for (let a = 0; a < st.length; a++) {
    for (let b = a + 1; b < st.length; b++) {
      const changesLine = st[a].lines.some((l) => !st[b].lines.includes(l)) && st[b].lines.some((l) => !st[a].lines.includes(l));
      if (!changesLine) continue;
      let best = null;
      for (const p of quais(st[a])) {
        for (const q of quais(st[b])) {
          const d = distanceM(p, q);
          if (!best || d < best.d) best = { d, p, q };
        }
      }
      if (best && best.d <= MAX_STRAIGHT_M) pairs.push({ a: st[a], b: st[b], ...best });
    }
  }

  // Une marche par paire (symétrique), une seule fois ici.
  const rows = await Promise.all(
    pairs.map(async ({ a, b, p, q }) => {
      const route = await fetchWalk(p, q);
      if (!route) return [a.id, b.id, Math.round(walkBetween(p, q).meters), null, a.name, b.name, false];
      const path = encodeLine(simplifyLine(route.path, 4));
      return [a.id, b.id, Math.round(route.meters), path, a.name, b.name, true];
    }),
  );
  rows.sort((x, y) => (x[0] + x[1] < y[0] + y[1] ? -1 : 1));
  const real = rows.filter((r) => r[6]).length;

  const body = `// Généré par tools/build-transfers.mjs (npm run transfers). Ne pas modifier à la main.
// Correspondances à pied ${source.label} entre stations proches de noms différents (moins de ${MAX_STRAIGHT_M} m,
// changement de ligne), marche par les rues calculée par l'IGN à la génération. Lu par transferMap
// (js/features/last-ride/planner.js) : [station A, station B, mètres, tracé encodé (encodeLine) ou null
// si l'IGN n'a pas répondu (estimation)]. Identifiants des stations : buildIndex(${source.stops}).

export default {
  generatedAt: ${j(today)},
  rows: [
${rows.map(([a, b, m, path, na, nb]) => `    ${j([a, b, m, path])}, // ${na} ↔ ${nb}`).join("\n")}
  ],
};
`;
  await writeFile(new URL(source.out, dir), body);
  console.log(`${source.label} : ${rows.length} correspondances à pied (${real} par l'IGN, ${rows.length - real} estimées) → ${fileURLToPath(new URL(source.out, dir))}`);
}
