// Génère, dans js/networks/bordeaux-tbm/, les arrêts et le graphe des bus de jour, tirés du GTFS
// statique de TBM (aucun appel au flux SIRI), aux formats de stops.js et graph.js :
//   bus-stops.js : lignes (avec leur couleur officielle) et quais desservis ;
//   bus-graph.js : ordre des quais de chaque ligne, par sens (motifs, courses partielles retirées).
// Lignes gardées : celles du réseau TBM (les lignes scolaires, réseau TBMSCO, sont écartées), de type
// bus, hors TBNight, qui ont au moins une course après 18 h dans les 21 prochains jours (le mode
// « Le dernier bus » fonctionne de 18 h à 3 h). Identifiants au format SIRI, comme le tram.
// Usage : npm run bus. Ensuite : npm run transfers, npm run shapes, npm run timetable.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import nightStops from "../js/networks/bordeaux-tbm/night-stops.js";
import { withGtfs } from "./gtfs.mjs";

const DIR = new URL("../js/networks/bordeaux-tbm/", import.meta.url);
const TIME_ZONE = "Europe/Paris";
const DAYS = 21;
const SINCE_S = 18 * 3600;
const lineRef = (route) => `bordeaux:Line:${route}:LOC`;
const stopRef = (stop) => `bordeaux:StopPoint:BP:${stop}:LOC`;
const routeOf = (ref) => /^bordeaux:Line:(.+):LOC$/.exec(ref)?.[1];
const night = new Set(Object.keys(nightStops.lines).map(routeOf));
const secs = (hms) => {
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};
const compact = (d) => d.replaceAll("-", "");
const weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// `inner` apparaît d'un seul tenant dans `outer` : course partielle.
function isContained(inner, outer) {
  if (inner.length >= outer.length) return false;
  const start = outer.indexOf(inner[0]);
  return start >= 0 && inner.every((ref, i) => outer[start + i] === ref);
}

await withGtfs(async ({ read, stream }) => {
  const feed = read("feed_info.txt")[0];
  const school = new Set(read("route_networks.txt").filter((r) => r.network_id !== "TBM").map((r) => r.route_id));
  const routes = new Map(
    read("routes.txt")
      .filter((r) => r.route_type === "3" && !school.has(r.route_id) && !night.has(r.route_id))
      .map((r) => [r.route_id, r]),
  );

  // Services actifs dans les 21 prochains jours.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
  const calendar = read("calendar.txt");
  const exceptions = read("calendar_dates.txt");
  const active = new Set();
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    const c = compact(date);
    if (c > feed.feed_end_date) break;
    const day = weekday[d.getUTCDay()];
    const on = new Set(calendar.filter((s) => s.start_date <= c && c <= s.end_date && s[day] === "1").map((s) => s.service_id));
    for (const e of exceptions) {
      if (e.date !== c) continue;
      if (e.exception_type === "1") on.add(e.service_id);
      else on.delete(e.service_id);
    }
    on.forEach((s) => active.add(s));
  }

  const trips = new Map();
  for (const t of read("trips.txt")) {
    if (routes.has(t.route_id) && active.has(t.service_id)) trips.set(t.trip_id, { route: t.route_id, dir: t.direction_id, calls: [] });
  }
  await stream("stop_times.txt", (st) => {
    const t = trips.get(st.trip_id);
    if (t) t.calls.push([Number(st.stop_sequence), secs(st.departure_time || st.arrival_time), st.stop_id]);
  });

  // Motifs des courses du soir (après 18 h), par ligne et par sens.
  const sequences = new Map(); // `${route}|${dir}` → Map(clé → [quais])
  for (const t of trips.values()) {
    if (t.calls.length < 2 || Math.max(...t.calls.map((c) => c[1])) < SINCE_S) continue;
    const stops = t.calls.sort((a, b) => a[0] - b[0]).map((c) => c[2]);
    const k = `${t.route}|${t.dir}`;
    if (!sequences.has(k)) sequences.set(k, new Map());
    sequences.get(k).set(stops.join(" "), stops);
  }
  const patterns = [];
  for (const [k, seqs] of [...sequences].sort()) {
    const [route, dir] = k.split("|");
    const all = [...seqs.values()];
    const kept = all.filter((s) => !all.some((o) => isContained(s, o))).sort((a, b) => b.length - a.length);
    for (const stops of kept) patterns.push({ line: lineRef(route), direction: dir, stops: stops.map(stopRef) });
  }
  const usedRoutes = [...new Set(patterns.map((p) => routeOf(p.line)))].sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
  if (!usedRoutes.length) throw new Error("Aucune ligne de bus le soir : GTFS vide ou périmé ?");

  // Quais desservis, avec leurs lignes.
  const stopsTxt = new Map(read("stops.txt").map((s) => [s.stop_id, s]));
  const linesOf = new Map();
  for (const p of patterns) for (const ref of p.stops) linesOf.set(ref, new Set([...(linesOf.get(ref) ?? []), p.line]));
  const stops = [...linesOf]
    .map(([ref, lines]) => {
      const s = stopsTxt.get(/BP:(.+):LOC$/.exec(ref)[1]);
      return { ref, name: s.stop_name, lat: Number(s.stop_lat), lon: Number(s.stop_lon), lines: [...lines].sort() };
    })
    .sort((a, b) => a.ref.localeCompare(b.ref));

  const j = JSON.stringify;
  const head = `// Généré par tools/build-bus-network.mjs (npm run bus). Ne pas modifier à la main.`;
  await writeFile(
    new URL("bus-stops.js", DIR),
    `${head}
// Lignes de bus de jour TBM qui roulent après 18 h (hors scolaires et TBNight), et leurs quais. GTFS
// version ${feed.feed_version}. Format de stops.js, avec la couleur officielle de chaque ligne.

export default {
  generatedAt: ${j(today)},
  lines: {
${usedRoutes
  .map((r) => {
    const x = routes.get(r);
    return `    ${j(lineRef(r))}: ${j({ ref: lineRef(r), code: x.route_short_name, name: x.route_long_name, color: `#${x.route_color || "1D3557"}`, textColor: `#${x.route_text_color || "FFFFFF"}` })},`;
  })
  .join("\n")}
  },
  stops: [
${stops.map((s) => `    ${j(s)},`).join("\n")}
  ],
};
`,
  );
  await writeFile(
    new URL("bus-graph.js", DIR),
    `${head}
// Ordre des quais de chaque ligne de bus de jour, par sens (direction_id du GTFS, identique au
// DirectionRef de SIRI). Un motif par séquence distincte ; les courses partielles sont retirées.

export default {
  generatedAt: ${j(today)},
  names: {
${stops.map((s) => `    ${j(s.ref)}: ${j(s.name)},`).join("\n")}
  },
  patterns: [
${patterns.map((p) => `    { line: ${j(p.line)}, direction: ${j(p.direction)}, stops: ${j(p.stops)} },`).join("\n")}
  ],
};
`,
  );
  console.log(`${usedRoutes.length} lignes de bus, ${patterns.length} motifs, ${stops.length} quais → ${fileURLToPath(DIR)}bus-stops.js, bus-graph.js`);
});
