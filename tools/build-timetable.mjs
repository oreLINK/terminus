// Génère les horaires théoriques du soir, tirés du GTFS statique de TBM, pour calculer le trajet sans
// appeler l'API (CONTEXT.md, section 11, piste 10) : un dossier par mode, pour qu'un mode ne
// télécharge que ses lignes, js/networks/bordeaux-tbm/evening/<mode>/ (index.js et un day-<n>.js par
// type de jour). Modes : tram (stops.js), night (night-stops.js), bus (bus-stops.js). Seules les
// courses utiles le soir sont gardées : celles qui passent après 17 h. Le GTFS de TBM écrit les trams
// et les bus d'après minuit au-delà de 24:00 sur le jour même, mais les bus de nuit sur le lendemain
// (01:10, 02:45…) : toutes les courses de nuit sont donc gardées. Jours : les 21 prochains, dans la
// limite du GTFS.
// Usage : npm run timetable. À relancer au moins chaque semaine (les jours générés s'épuisent, et
// le réseau publie ses travaux) ; relire le diff.

import { writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import tramStops from "../js/networks/bordeaux-tbm/stops.js";
import nightStops from "../js/networks/bordeaux-tbm/night-stops.js";
import busStops from "../js/networks/bordeaux-tbm/bus-stops.js";
import { withGtfs } from "./gtfs.mjs";

const EVENING_DIR = new URL("../js/networks/bordeaux-tbm/evening/", import.meta.url);
const TIME_ZONE = "Europe/Paris";
const DAYS = 21;
const SINCE_S = 17 * 3600; // une course est gardée si elle passe après 17 h

// Lignes des arrêts générés : refs SIRI « bordeaux:Line:59:LOC » → route_id GTFS « 59 ».
const routeOf = (ref) => /^bordeaux:Line:(.+):LOC$/.exec(ref)?.[1];
const routesOf = (stops) => new Set(Object.keys(stops.lines).map(routeOf).filter(Boolean));
// allDay : toutes les courses (lignes de nuit), sinon celles qui passent après 17 h.
const KINDS = [
  { key: "tram", label: "tram", routes: routesOf(tramStops), allDay: false },
  { key: "night", label: "TBNight", routes: routesOf(nightStops), allDay: true },
  { key: "bus", label: "bus de jour", routes: routesOf(busStops), allDay: false },
];
const wanted = new Set(KINDS.flatMap((k) => [...k.routes]));

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

  if (!dates.length) throw new Error("Aucun jour : le GTFS ne couvre pas les jours à venir.");
  const j = JSON.stringify;
  const head = `// Généré par tools/build-timetable.mjs (npm run timetable). Ne pas modifier à la main.`;
  await rm(EVENING_DIR, { recursive: true, force: true });

  // Un dossier par mode : ses courses du soir, regroupées en types de jour (mêmes courses, mêmes horaires).
  for (const kind of KINDS) {
    // Courses du soir pour chaque jour, regroupées en types de jour (mêmes courses, mêmes horaires).
    const dayTypes = [];
    const dayTypeIdx = new Map();
    const days = {};
    for (const date of dates) {
      const on = activeOn(date);
      const list = [];
      for (const t of trips.values()) {
        if (!kind.routes.has(t.route) || !on.has(t.service) || t.calls.length < 2) continue;
        if (kind.allDay || Math.max(...t.calls.map((c) => c[1])) >= SINCE_S) list.push(t);
      }
      list.sort((x, y) => (x.id < y.id ? -1 : 1));
      const key = list.map((t) => t.id).join(" ");
      if (!dayTypeIdx.has(key)) {
        dayTypeIdx.set(key, dayTypes.length);
        dayTypes.push(list);
      }
      days[date] = dayTypeIdx.get(key);
      console.log(`${kind.key} ${date} : ${list.length} courses (type de jour ${days[date]})`);
    }

    const OUT_DIR = new URL(`${kind.key}/`, EVENING_DIR);
    await mkdir(OUT_DIR, { recursive: true });

    // Un fichier par type de jour : ses motifs (ligne, sens, quais), ses profils (écarts entre quais)
    // et ses courses. Un soir n'en charge qu'un ou deux (le jour, et le lendemain pour les bus de nuit).
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
// Horaires théoriques du soir, ${kind.label} (GTFS statique de TBM, version ${feed.feed_version}) :
// ${kind.allDay ? "toutes les courses" : "courses qui passent après 17 h"}, ${kind.routes.size} lignes, du ${dates[0]} au ${dates.at(-1)}.
// Lus par js/core/timetable.js. Heures en secondes depuis « midi moins 12 h » du jour de service
// (convention GTFS ; au-delà de 24 h, la nuit suivante).
//   days  : jour de service → type de jour, dont les courses sont dans day-<type>.js :
//     patterns : [route_id, sens, [quais…]] (ligne SIRI : bordeaux:Line:<route_id>:LOC)
//     profiles : écarts en secondes entre deux quais successifs
//     trips    : [trip_id, motif, profil, départ du premier quai] (course SIRI : bordeaux:ServiceJourney:<trip_id>:LOC)
// Quais : identifiants GTFS (ref SIRI : bordeaux:StopPoint:BP:<quai>:LOC) ; leurs noms viennent des
// arrêts du mode, déjà chargés.

export default {
  generatedAt: ${j(today)},
  feedVersion: ${j(feed.feed_version)},
  timeZone: ${j(TIME_ZONE)},
  nextDay: ${j(kind.allDay)}, // le soir a aussi besoin du lendemain (bus de nuit rangés sur le jour du matin)
  firstDay: ${j(dates[0])},
  lastDay: ${j(dates.at(-1))},
  days: ${j(days)},
};
`,
    );
    console.log(`${kind.label} : ${totalTrips} courses, ${dayTypes.length} types de jour → ${fileURLToPath(OUT_DIR)}`);
  }
});
