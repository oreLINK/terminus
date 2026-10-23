// Génère js/networks/bordeaux-tbm/evening/ (index.js et un day-<n>.js par type de jour) : les horaires théoriques du soir, tirés du GTFS statique
// de TBM, pour calculer le trajet sans appeler l'API (CONTEXT.md, section 11, piste 10). Seules les
// courses utiles le soir sont gardées : celles qui passent après 17 h. Le GTFS de TBM écrit les trams
// d'après minuit au-delà de 24:00 sur le jour même, mais les bus de nuit sur le lendemain (01:10,
// 02:45…) : toutes les courses des lignes de nuit sont donc gardées. Lignes : celles des arrêts
// générés (tram A à F, TBNight N1 à N8). Jours : les 21 prochains, dans la limite du GTFS.
// Usage : npm run timetable. À relancer au moins chaque semaine (les jours générés s'épuisent, et
// le réseau publie ses travaux) ; relire le diff.

import { writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import tramStops from "../js/networks/bordeaux-tbm/stops.js";
import nightStops from "../js/networks/bordeaux-tbm/night-stops.js";
import { withGtfs } from "./gtfs.mjs";

const OUT_DIR = new URL("../js/networks/bordeaux-tbm/evening/", import.meta.url);
const TIME_ZONE = "Europe/Paris";
const DAYS = 21;
const SINCE_S = 17 * 3600; // une course est gardée si elle passe après 17 h

// Lignes des arrêts générés : refs SIRI « bordeaux:Line:59:LOC » → route_id GTFS « 59 ».
const routeOf = (ref) => /^bordeaux:Line:(.+):LOC$/.exec(ref)?.[1];
const wanted = new Set([...Object.keys(tramStops.lines), ...Object.keys(nightStops.lines)].map(routeOf).filter(Boolean));
const night = new Set(Object.keys(nightStops.lines).map(routeOf).filter(Boolean));

const ymd = (d) => d.toISOString().slice(0, 10);
const compact = (s) => s.replaceAll("-", "");
const secs = (hms) => {
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};
const weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

await withGtfs(async ({ read, stream }) => {
  const feed = read("feed_info.txt")[0];
  const routes = new Set(read("routes.txt").map((r) => r.route_id).filter((id) => wanted.has(id)));
  const trips = new Map();
  for (const t of read("trips.txt")) {
    if (routes.has(t.route_id)) trips.set(t.trip_id, { id: t.trip_id, route: t.route_id, dir: t.direction_id, service: t.service_id, calls: [] });
  }
  const names = new Map(read("stops.txt").map((s) => [s.stop_id, s.stop_name]));
  const calendar = read("calendar.txt");
  const exceptions = read("calendar_dates.txt");

  await stream("stop_times.txt", (st) => {
    const t = trips.get(st.trip_id);
    if (t) t.calls.push([Number(st.stop_sequence), secs(st.departure_time || st.arrival_time), st.stop_id]);
  });

  // Jours de service : du jour de la génération (heure de Paris) aux 21 suivants, sans dépasser le GTFS.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
  const dates = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    if (compact(ymd(d)) <= feed.feed_end_date) dates.push(ymd(d));
  }
  const activeOn = (date) => {
    const c = compact(date);
    const day = weekday[new Date(`${date}T12:00:00Z`).getUTCDay()];
    const on = new Set(calendar.filter((s) => s.start_date <= c && c <= s.end_date && s[day] === "1").map((s) => s.service_id));
    for (const e of exceptions) {
      if (e.date !== c) continue;
      if (e.exception_type === "1") on.add(e.service_id);
      else on.delete(e.service_id);
    }
    return on;
  };

  // Courses du soir pour chaque jour, regroupées en types de jour (mêmes courses, mêmes horaires).
  const dayTypes = [];
  const dayTypeIdx = new Map();
  const days = {};
  for (const date of dates) {
    const on = activeOn(date);
    const list = [];
    for (const t of trips.values()) {
      if (!on.has(t.service) || t.calls.length < 2) continue;
      if (night.has(t.route) || Math.max(...t.calls.map((c) => c[1])) >= SINCE_S) list.push(t);
    }
    list.sort((x, y) => (x.id < y.id ? -1 : 1));
    const key = list.map((t) => t.id).join(" ");
    if (!dayTypeIdx.has(key)) {
      dayTypeIdx.set(key, dayTypes.length);
      dayTypes.push(list);
    }
    days[date] = dayTypeIdx.get(key);
    console.log(`${date} : ${list.length} courses (type de jour ${days[date]})`);
  }
  if (!dates.length) throw new Error("Aucun jour : le GTFS ne couvre pas les jours à venir.");

  const j = JSON.stringify;
  const head = `// Généré par tools/build-timetable.mjs (npm run timetable). Ne pas modifier à la main.`;
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  // Un fichier par type de jour : ses motifs (ligne, sens, quais), ses profils (écarts entre quais)
  // et ses courses. Un soir n'en charge qu'un ou deux (le jour, et le lendemain pour les bus de nuit).
  const usedStops = new Set();
  let totalTrips = 0;
  for (const [n, list] of dayTypes.entries()) {
    const patterns = [];
    const patternIdx = new Map();
    const profiles = [];
    const profileIdx = new Map();
    const index = (map, arr, key, value) => {
      if (!map.has(key)) {
        map.set(key, arr.length);
        arr.push(value);
      }
      return map.get(key);
    };
    const rows = list.map((t) => {
      const calls = t.calls.sort((x, y) => x[0] - y[0]);
      const stops = calls.map((c) => c[2]);
      stops.forEach((id) => usedStops.add(id));
      const deltas = calls.map((c, i) => (i === 0 ? 0 : c[1] - calls[i - 1][1]));
      const pi = index(patternIdx, patterns, `${t.route}|${t.dir}|${stops.join(" ")}`, [t.route, Number(t.dir), stops]);
      const qi = index(profileIdx, profiles, deltas.join(" "), deltas);
      return [t.id, pi, qi, calls[0][1]];
    });
    totalTrips += rows.length;
    const dates_ = Object.keys(days).filter((d) => days[d] === n);
    await writeFile(
      new URL(`day-${n}.js`, OUT_DIR),
      `${head}
// Type de jour ${n} : ${dates_.join(", ")}. ${rows.length} courses. Format : voir index.js.

export default {
  patterns: [
${patterns.map((x) => `    ${j(x)},`).join("\n")}
  ],
  profiles: [
${profiles.map((x) => `    ${j(x)},`).join("\n")}
  ],
  trips: [
${rows.map((x) => `    ${j(x)},`).join("\n")}
  ],
};
`,
    );
  }

  await writeFile(
    new URL("index.js", OUT_DIR),
    `${head}
// Horaires théoriques du soir (GTFS statique de TBM, version ${feed.feed_version}) : courses de tram qui
// passent après 17 h et toutes celles de TBNight, ${wanted.size} lignes, du ${dates[0]} au ${dates.at(-1)}.
// Lus par js/core/timetable.js. Heures en secondes depuis « midi moins 12 h » du jour de service
// (convention GTFS ; au-delà de 24 h, la nuit suivante).
//   days  : jour de service → type de jour, dont les courses sont dans day-<type>.js :
//     patterns : [route_id, sens, [quais…]] (ligne SIRI : bordeaux:Line:<route_id>:LOC)
//     profiles : écarts en secondes entre deux quais successifs
//     trips    : [trip_id, motif, profil, départ du premier quai] (course SIRI : bordeaux:ServiceJourney:<trip_id>:LOC)
//   stops : quai GTFS → nom (ref SIRI : bordeaux:StopPoint:BP:<quai>:LOC)

export default {
  generatedAt: ${j(today)},
  feedVersion: ${j(feed.feed_version)},
  timeZone: ${j(TIME_ZONE)},
  firstDay: ${j(dates[0])},
  lastDay: ${j(dates.at(-1))},
  days: ${j(days)},
  stops: {
${[...usedStops].sort().map((id) => `    ${j(id)}: ${j(names.get(id) ?? id)},`).join("\n")}
  },
};
`,
  );
  console.log(`${totalTrips} courses, ${dayTypes.length} types de jour → ${fileURLToPath(OUT_DIR)}`);
});
