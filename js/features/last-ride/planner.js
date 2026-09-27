// Calcul du trajet tram direct entre la position actuelle et le domicile.
// Fonctions pures : aucune dépendance au DOM ni au réseau, testables avec Node.

import { distanceM, walkBetween } from "../../core/util.js";

export const normName = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Regroupe les quais (un point d'arrêt par sens) en stations.
// Deux arrêts homonymes à plus de 600 m l'un de l'autre restent distincts.
export function buildIndex(stops) {
  const byName = new Map();
  for (const s of stops) {
    const key = normName(s.name);
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(s);
  }

  const stations = [];
  for (const [key, points] of byName) {
    const clusters = [];
    for (const p of points) {
      const c = clusters.find((cl) => distanceM(cl, p) < 600);
      if (c) {
        c.points.push(p);
        c.lat = c.points.reduce((sum, q) => sum + q.lat, 0) / c.points.length;
        c.lon = c.points.reduce((sum, q) => sum + q.lon, 0) / c.points.length;
      } else {
        clusters.push({ lat: p.lat, lon: p.lon, points: [p] });
      }
    }
    clusters.forEach((c, i) => {
      stations.push({
        id: clusters.length > 1 ? `${key}#${i}` : key,
        key,
        name: c.points[0].name,
        lat: c.lat,
        lon: c.lon,
        refs: c.points.map((p) => p.ref),
        lines: [...new Set(c.points.flatMap((p) => p.lines))],
      });
    });
  }

  const byRef = new Map();
  const byKey = new Map();
  for (const st of stations) {
    for (const r of st.refs) byRef.set(r, st);
    if (!byKey.has(st.key)) byKey.set(st.key, []);
    byKey.get(st.key).push(st);
  }

  return {
    stations,
    stationFor(call) {
      const hit = byRef.get(call.ref);
      if (hit) return hit;
      const sameName = byKey.get(normName(call.name));
      return sameName && sameName.length === 1 ? sameName[0] : null;
    },
  };
}

// Stations autour d'un point : toutes celles dans le rayon (à vol d'oiseau),
// au moins `min` même si elles sont plus loin, au plus `max`.
export function nearestStations(stations, point, { radius, min, max }) {
  const sorted = stations
    .map((station) => ({ station, walk: walkBetween(point, station) }))
    .sort((a, b) => a.walk.straight - b.walk.straight);
  const inRadius = sorted.filter((x) => x.walk.straight <= radius).slice(0, max);
  return inRadius.length >= min ? inRadius : sorted.slice(0, min);
}

export function sharedLines(origins, dests) {
  const fromHere = new Set(origins.flatMap((o) => o.station.lines));
  return [...new Set(dests.flatMap((d) => d.station.lines))].filter((l) => fromHere.has(l));
}

const MIN = 60 * 1000;
export const SERVICE_GAP_MS = 2 * 3600 * 1000;

// Construit une option par couple (station de départ, station d'arrivée),
// toutes lignes confondues : les courses qui desservent le départ PUIS l'arrivée.
// Les courses partielles (qui s'arrêtent avant la station d'arrivée) sont exclues d'office.
export function plan({ origins, dests, journeys, index, lineCodes, now }) {
  const originById = new Map(origins.map((o) => [o.station.id, o]));
  const destById = new Map(dests.map((d) => [d.station.id, d]));
  const byPair = new Map();

  for (const j of journeys) {
    const firstIndex = new Map();
    j.calls.forEach((call, i) => {
      const st = index.stationFor(call);
      if (st && !firstIndex.has(st.id)) firstIndex.set(st.id, i);
    });

    for (const [oid, oi] of firstIndex) {
      const origin = originById.get(oid);
      if (!origin) continue;
      const oc = j.calls[oi];
      if (oc.cancelled || oc.dep < now - MIN) continue;

      for (const [did, di] of firstIndex) {
        if (di <= oi || did === oid) continue;
        const dest = destById.get(did);
        if (!dest) continue;
        const dc = j.calls[di];
        if (dc.cancelled) continue;
        const key = `${oid}|${did}`;
        if (!byPair.has(key)) byPair.set(key, { origin, dest, trips: [] });
        byPair.get(key).trips.push({
          journeyId: j.id,
          line: j.line,
          lineCode: lineCodes[j.line] ?? "?",
          headsign: j.headsign,
          dep: oc.dep,
          depLive: oc.depLive,
          arr: dc.arr,
          arrLive: dc.arrLive,
        });
      }
    }
  }

  const options = [];
  for (const opt of byPair.values()) {
    const trips = dedupe(opt.trips).sort((a, b) => a.dep - b.dep);
    const walkToMs = opt.origin.walk.minutes * MIN;
    const catchable = trips.filter((t) => t.dep >= now + walkToMs);
    if (!catchable.length) continue;
    const next = catchable[0];
    const last = catchable[catchable.length - 1];
    options.push({
      origin: opt.origin,
      dest: opt.dest,
      lineCodes: [...new Set(trips.map((t) => t.lineCode))].sort(),
      catchable,
      next,
      last,
      leaveBy: last.dep - walkToMs,
      arriveHome: next.arr + opt.dest.walk.minutes * MIN,
    });
  }

  options.sort((a, b) => a.arriveHome - b.arriveHome || a.origin.walk.meters - b.origin.walk.meters);

  if (!options.length) return { status: byPair.size ? "missed" : "none", options };

  const primary = options[0];
  // La journée commerciale a basculé : le prochain départ est demain matin.
  if (primary.next.dep - now > SERVICE_GAP_MS) return { status: "ended", options, primary };

  const latest = options.reduce((best, o) => (o.leaveBy > best.leaveBy ? o : best), primary);
  const alternatives = [];
  const seenOrigins = new Set([primary.origin.station.id]);
  for (const o of options) {
    if (seenOrigins.has(o.origin.station.id)) continue;
    seenOrigins.add(o.origin.station.id);
    alternatives.push(o);
    if (alternatives.length === 3) break;
  }

  return {
    status: "ok",
    options,
    primary,
    alternatives,
    later: latest !== primary && latest.leaveBy - primary.leaveBy >= 2 * MIN ? latest : null,
  };
}

function dedupe(trips) {
  const seen = new Set();
  return trips.filter((t) => (seen.has(t.journeyId) ? false : (seen.add(t.journeyId), true)));
}
