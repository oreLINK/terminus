// Génère les correspondances à pied entre stations proches de noms différents, pour chaque fichier
// d'arrêts d'un mode : js/networks/bordeaux-tbm/transfers.js (tram), night-transfers.js (TBNight),
// bus-transfers.js (bus de jour) et transport-transfers.js (tram et bus assemblés : s'y ajoutent les
// correspondances tram ↔ bus).
// Une paire est gardée si ses quais les plus proches sont à moins de 400 m à vol d'oiseau et si l'on y
// change vraiment de ligne (chaque station dessert une ligne que l'autre n'a pas : marcher entre deux
// arrêts successifs d'une même ligne ne sert à rien). La marche est calculée une fois, ici, par le
// calcul d'itinéraire piéton de l'IGN (rues réelles), puis incluse dans le site : aucun appel pendant
// l'utilisation. En cas d'échec de l'IGN, l'estimation (vol d'oiseau × 1,3) est gardée, sans tracé.
// Incrémental : une marche déjà calculée par l'IGN est reprise telle quelle, qu'elle vienne du fichier
// du mode ou d'un autre (cache commun, par paire de quais : le mode tram et bus reprend les marches du
// tram et des bus, et ne demande que les paires tram ↔ bus) ; seules les nouvelles paires, et celles
// restées estimées, sont demandées à l'IGN.
// Usage : npm run transfers, après npm run graph et npm run bus (les stations viennent des arrêts).

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildIndex } from "../js/features/last-ride/planner.js";
import { mergeStops } from "../js/core/compose.js";
import { distanceM, walkBetween } from "../js/core/util.js";
import { fetchWalk } from "../js/core/walk-route.js";
import { simplifyLine, encodeLine, decodeLine } from "../js/core/line-trace.js";

const MAX_STRAIGHT_M = 400;
// Au-delà, la marche réelle est trop longue pour une correspondance (environ 8 min) : une voie rapide
// ou un fleuve impose un détour (constaté : 1 153 m de marche pour 368 m à vol d'oiseau).
const MAX_WALK_M = 600;
// Dans cet ordre : le mode combiné, en dernier, reprend du cache les marches du tram et des bus.
const SOURCES = [
  { stops: ["stops.js"], out: "transfers.js", label: "tram" },
  { stops: ["night-stops.js"], out: "night-transfers.js", label: "TBNight" },
  { stops: ["bus-stops.js"], out: "bus-transfers.js", label: "bus" },
  { stops: ["stops.js", "bus-stops.js"], out: "transport-transfers.js", label: "tram et bus" },
];
const best = (p, q) => distanceM(p, q);

// Cache commun : paire de quais (refs triées) → { meters, path (encodé ou null), from (quai de départ du
// tracé) }. Le sens compte : une même paire peut être rangée a → b dans un fichier et b → a dans un
// autre ; le tracé repris est alors retourné.
const walks = new Map();
const quaiKey = (p, q) => [p.ref, q.ref].sort().join("|");
const remember = (p, q, meters, path) => walks.set(quaiKey(p, q), { meters, path, from: p.ref });
const recall = (p, q) => {
  const w = walks.get(quaiKey(p, q));
  if (!w) return null;
  const path = w.path && w.from !== p.ref ? encodeLine(decodeLine(w.path).reverse()) : w.path;
  return [w.meters, path];
};
const dir = new URL("../js/networks/bordeaux-tbm/", import.meta.url);
const today = new Date().toISOString().slice(0, 10);
const j = JSON.stringify;

for (const source of SOURCES) {
  const data = mergeStops(await Promise.all(source.stops.map(async (file) => (await import(new URL(file, dir))).default)));
  const index = buildIndex(data.stops);
  // Quais de chaque station, calculés une fois (1 600 stations pour le tram et les bus).
  const byRef = new Map(data.stops.map((s) => [s.ref, s]));
  const quaisOf = new Map(index.stations.map((st) => [st.id, st.refs.map((r) => byRef.get(r)).filter(Boolean)]));
  // Une station regroupe des quais de même nom à moins de 600 m de son centre : au-delà de 1,6 km entre
  // deux centres, aucun quai ne peut être à moins de 400 m d'un autre.
  const FAR_M = MAX_STRAIGHT_M + 2 * 600;

  // Paires de stations où l'on change de ligne, à moins de 400 m (quais les plus proches).
  const pairs = [];
  const st = index.stations;
  for (let a = 0; a < st.length; a++) {
    for (let b = a + 1; b < st.length; b++) {
      if (distanceM(st[a], st[b]) > FAR_M) continue;
      const changesLine = st[a].lines.some((l) => !st[b].lines.includes(l)) && st[b].lines.some((l) => !st[a].lines.includes(l));
      if (!changesLine) continue;
      let best = null;
      for (const p of quaisOf.get(st[a].id)) {
        for (const q of quaisOf.get(st[b].id)) {
          const d = distanceM(p, q);
          if (!best || d < best.d) best = { d, p, q };
        }
      }
      if (best && best.d <= MAX_STRAIGHT_M) pairs.push({ a: st[a], b: st[b], ...best });
    }
  }

  // Paires déjà calculées par l'IGN lors d'une génération précédente.
  const previous = new Map();
  try {
    const old = (await import(new URL(source.out, dir))).default;
    for (const [a, b, m, path] of old.rows) {
      if (path) previous.set(`${a}|${b}`, [m, path]);
    }
    // Paires déjà écartées (marche trop longue) : gardées pour ne pas les redemander à l'IGN.
    for (const [a, b, m] of old.tooLong ?? []) previous.set(`${a}|${b}`, [m, null]);
  } catch {
    // Pas encore de fichier : tout est à calculer.
  }

  // Le fichier du mode alimente le cache commun (par paire de quais).
  for (const { a, b, p, q } of pairs) {
    const known = previous.get(`${a.id}|${b.id}`);
    if (known && !walks.has(quaiKey(p, q))) remember(p, q, known[0], known[1]);
  }

  // Une marche par paire (symétrique), une seule fois ici.
  let asked = 0;
  const rows = await Promise.all(
    pairs.map(async ({ a, b, p, q }) => {
      // Jamais moins que la ligne droite : pour deux quais à 8 m, l'IGN ramène les deux points au même
      // endroit de la rue et annonce 3 m (Pessac Centre ↔ Pessac Centre Tram B).
      const floor = (m) => Math.max(Math.round(m), Math.round(best(p, q)));
      const known = recall(p, q);
      if (known) return [a.id, b.id, floor(known[0]), known[1], a.name, b.name, true];
      // (une paire écartée revient avec un tracé null et sa distance réelle : elle est de nouveau écartée)
      asked++;
      const route = await fetchWalk(p, q);
      if (!route) return [a.id, b.id, Math.round(walkBetween(p, q).meters), null, a.name, b.name, false];
      const path = encodeLine(simplifyLine(route.path, 4));
      remember(p, q, Math.round(route.meters), path);
      return [a.id, b.id, floor(route.meters), path, a.name, b.name, true];
    }),
  );
  const tooLong = rows.filter((r) => r[2] > MAX_WALK_M);
  rows.splice(0, rows.length, ...rows.filter((r) => r[2] <= MAX_WALK_M));
  rows.sort((x, y) => (x[0] + x[1] < y[0] + y[1] ? -1 : 1));
  const real = rows.filter((r) => r[6]).length;

  const body = `// Généré par tools/build-transfers.mjs (npm run transfers). Ne pas modifier à la main.
// Correspondances à pied ${source.label} entre stations proches de noms différents (moins de ${MAX_STRAIGHT_M} m
// à vol d'oiseau, au plus ${MAX_WALK_M} m de marche, changement de ligne), marche par les rues calculée par
// l'IGN à la génération. Lu par transferMap
// (js/features/last-ride/planner.js) : [station A, station B, mètres, tracé encodé (encodeLine) ou null
// si l'IGN n'a pas répondu (estimation)]. Identifiants des stations : buildIndex(${source.stops}).

export default {
  generatedAt: ${j(today)},
  rows: [
${rows.map(([a, b, m, path, na, nb]) => `    ${j([a, b, m, path])}, // ${na} ↔ ${nb}`).join("\n")}
  ],
  // Paires écartées, marche de plus de ${MAX_WALK_M} m : [station A, station B, mètres] (non utilisées,
  // gardées pour ne pas les redemander à l'IGN à la prochaine génération).
  tooLong: [
${tooLong.map(([a, b, m, , na, nb]) => `    ${j([a, b, m])}, // ${na} ↔ ${nb}`).join("\n")}
  ],
};
`;
  await writeFile(new URL(source.out, dir), body);
  console.log(`${source.label} : ${rows.length} correspondances à pied (${real} par l'IGN, ${rows.length - real} estimées ; ${tooLong.length} écartées, marche de plus de ${MAX_WALK_M} m ; ${asked} appels à l'IGN) → ${fileURLToPath(new URL(source.out, dir))}`);
}
