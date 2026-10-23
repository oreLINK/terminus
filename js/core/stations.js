// Inès — l'index des stations : regroupe les quais en stations, trouve les stations candidates autour
// d'un point (départ, destination) et les arrivées en zone à la demande. Fonctions pures, communes à
// l'écran, aux outils de génération (tools/build-transfers.mjs) et au comparateur.

import { distanceM, walkBetween } from "./util.js";
import { normName, normCommune } from "./text.js";

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
  const points = new Map(stops.map((s) => [s.ref, { lat: s.lat, lon: s.lon }]));
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
    // Position du quai lui-même, plus fidèle au tracé que le centre de la station.
    pointOf: (ref) => points.get(ref) ?? null,
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

// Stations candidates autour d'un point, ligne par ligne : pour chaque ligne, la station la plus
// proche qui la dessert dans le rayon, plus les `min` stations les plus proches quelle que soit leur
// ligne ; au plus `max`, les plus proches d'abord. Sans cela, les 8 stations les plus proches seraient
// toutes sur une même ligne dense (le bus) et masqueraient une autre ligne un peu plus loin.
export function candidateStations(stations, point, { radius, min, max }) {
  const sorted = stations
    .map((station) => ({ station, walk: walkBetween(point, station) }))
    .sort((a, b) => a.walk.straight - b.walk.straight);
  const kept = new Set(sorted.slice(0, min));
  const covered = new Set();
  for (const x of sorted) {
    if (x.walk.straight > radius) break;
    if (x.station.lines.some((l) => !covered.has(l))) {
      kept.add(x);
      x.station.lines.forEach((l) => covered.add(l));
    }
  }
  return sorted.filter((x) => kept.has(x)).slice(0, max);
}

// Zones à la demande (TBNight) : au-delà de son dernier arrêt fixe, une ligne dessert les arrêts
// réservés dans certaines communes. Si le domicile est dans l'une d'elles, le dernier arrêt fixe de
// la ligne devient une arrivée possible, sans marche : on reste dans le bus. L'heure d'arrivée est
// celle du dernier arrêt fixe (la suite dépend des réservations).
// zones : [{ line: code, communes: [nom] }] ; `commune` : communeOf (js/core/text.js) ; renvoie des
// arrivées au format de nearestStations.
export function zoneDests({ zones, commune, graph, index, lineCodes }) {
  if (!zones?.length || !commune || !graph) return [];
  const out = [];
  for (const zone of zones) {
    const match = zone.communes.find((c) => normCommune(c) === commune);
    if (!match) continue;
    for (const p of graph.patterns) {
      if (lineCodes[p.line] !== zone.line) continue;
      const last = p.stops[p.stops.length - 1];
      const station = index.stationFor({ ref: last, name: graph.names?.[last] ?? "" });
      if (station && !out.some((d) => d.station.id === station.id)) {
        out.push({ station, walk: { straight: 0, meters: 0, minutes: 0 }, zone: { line: zone.line, commune: match } });
      }
    }
  }
  return out;
}
