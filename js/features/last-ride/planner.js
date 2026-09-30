// Calcul du trajet en tram entre la position actuelle et le domicile, avec ou sans correspondance.
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

// Lignes à charger : toutes celles des stations des deux côtés. Elles suffisent pour un trajet
// direct ou à une correspondance ; au-delà, l'appelant charge les autres lignes (voir index.js).
export function candidateLines(origins, dests) {
  return [...new Set([...origins, ...dests].flatMap((x) => x.station.lines))];
}

const MIN = 60 * 1000;
export const SERVICE_GAP_MS = 2 * 3600 * 1000;
// Temps laissé pour changer de quai dans une même station (choix de l'auteur, 30/09/2026).
export const TRANSFER_MS = 2 * MIN;
// Marge ajoutée à la marche jusqu'à l'arrêt de départ : on part 2 min plus tôt que le strict nécessaire.
export const WALK_MARGIN_MS = 2 * MIN;
export const MAX_TRANSFERS = 2;
// Dans le choix automatique, une correspondance « coûte » autant que 10 min de trajet en plus.
export const TRANSFER_PENALTY_MS = 10 * MIN;

// Horaires à charger d'après le graphe du réseau (ordre des arrêts par ligne et par sens), avant
// tout appel : [{ line, direction }]. Garde les motifs utiles à un trajet d'au plus `extraTransfers`
// correspondances de plus que le trajet le plus simple, dans la limite de `maxTransfers`.
// Mesuré sur le réseau TBM : avec 0, 1 à 4 appels ; avec 1, 8 à 11, presque tout le réseau.
// Tableau vide si le graphe ne relie pas les deux côtés : l'appelant charge alors sans graphe.
export function routeRequests({ graph, index, origins, dests, maxTransfers = MAX_TRANSFERS, extraTransfers = 0 }) {
  const seqs = graph.patterns.map((p) => ({
    line: p.line,
    direction: p.direction,
    stations: p.stops
      .map((ref) => index.stationFor({ ref, name: graph.names?.[ref] ?? "" })?.id)
      .filter(Boolean),
  }));
  const maxLegs = maxTransfers + 1;
  const fwd = legsFrom(seqs, origins, maxLegs, false);
  const bwd = legsFrom(seqs, dests, maxLegs, true);

  // Pour chaque motif, le trajet le plus court qui l'emprunte : monter en i, descendre en j > i.
  const best = seqs.map(({ stations }) => {
    let boardMin = Infinity;
    let legs = Infinity;
    for (const st of stations) {
      legs = Math.min(legs, boardMin + 1 + (bwd.get(st) ?? Infinity));
      boardMin = Math.min(boardMin, fwd.get(st) ?? Infinity);
    }
    return legs;
  });
  const minLegs = Math.min(...best);
  if (!Number.isFinite(minLegs)) return [];
  const limit = Math.min(maxLegs, minLegs + extraTransfers);

  const requests = new Map();
  seqs.forEach((s, i) => {
    if (best[i] <= limit) requests.set(`${s.line}|${s.direction}`, { line: s.line, direction: s.direction });
  });
  return [...requests.values()];
}

// Nombre minimal de tronçons en tram pour atteindre chaque station depuis `sources`
// (0 pour elles), ou pour rejoindre `sources` à rebours. Au plus `maxLegs`.
function legsFrom(seqs, sources, maxLegs, reverse) {
  const legs = new Map(sources.map((s) => [s.station.id, 0]));
  for (let round = 0; round < maxLegs; round++) {
    for (const { stations } of seqs) {
      let boardMin = Infinity;
      const order = reverse ? [...stations].reverse() : stations;
      for (const st of order) {
        const here = legs.get(st) ?? Infinity;
        if (boardMin + 1 < here && boardMin + 1 <= maxLegs) legs.set(st, boardMin + 1);
        boardMin = Math.min(boardMin, here);
      }
    }
  }
  return legs;
}

// Profils à rebours, un par nombre de correspondances k (0 = direct).
// profiles[k] : station id → départs en tram depuis cette station qui ramènent au domicile avec
// exactement k correspondances, chacun avec l'arrivée au domicile la plus tôt (marche comprise).
// Les listes sont triées par départ et ne gardent que les départs utiles : un départ plus tard
// qui arrive au plus tard aussi tôt rend le précédent inutile. Le premier départ à partir d'une
// heure donnée est donc aussi celui qui arrive le plus tôt.
function buildProfiles({ journeys, index, destById, maxTransfers }) {
  const runs = journeys.map((j) => ({ j, stations: j.calls.map((c) => index.stationFor(c)) }));
  const profiles = [];

  for (let k = 0; k <= maxTransfers; k++) {
    const prev = profiles[k - 1];
    const byStation = new Map();

    for (const { j, stations } of runs) {
      // En remontant la course : meilleure descente parmi les arrêts suivants.
      let best = null;
      for (let i = j.calls.length - 1; i >= 0; i--) {
        const call = j.calls[i];
        const st = stations[i];
        if (!st || call.cancelled) continue;

        if (best && best.station.id !== st.id) {
          if (!byStation.has(st.id)) byStation.set(st.id, []);
          byStation.get(st.id).push({
            dep: call.dep,
            arrHome: best.arrHome,
            dest: best.dest,
            leg: {
              journeyId: j.id,
              line: j.line,
              headsign: j.headsign,
              from: st,
              to: best.station,
              dep: call.dep,
              depLive: call.depLive,
              arr: best.call.arr,
              arrLive: best.call.arrLive,
            },
            next: best.next,
          });
        }

        const here = k === 0 ? alightHome(st, call, destById) : alightTransfer(st, call, j, prev);
        if (here && (!best || here.arrHome < best.arrHome)) best = here;
      }
    }

    for (const [id, entries] of byStation) byStation.set(id, frontier(entries));
    profiles.push(byStation);
  }
  return profiles;
}

// Descente à une station proche du domicile, puis marche.
function alightHome(station, call, destById) {
  const dest = destById.get(station.id);
  return dest ? { station, call, dest, next: null, arrHome: call.arr + dest.walk.minutes * MIN } : null;
}

// Descente pour une correspondance : le premier départ utile après le changement de quai.
function alightTransfer(station, call, journey, prev) {
  const next = firstFrom(prev.get(station.id), call.arr + TRANSFER_MS, journey.id);
  return next ? { station, call, dest: next.dest, next, arrHome: next.arrHome } : null;
}

function frontier(entries) {
  entries.sort((a, b) => b.dep - a.dep || a.arrHome - b.arrHome);
  const kept = [];
  let bestArr = Infinity;
  for (const e of entries) {
    if (e.arrHome < bestArr) {
      kept.push(e);
      bestArr = e.arrHome;
    }
  }
  return kept.reverse();
}

function firstFrom(list, t, skipJourney) {
  if (!list) return null;
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].dep < t) lo = mid + 1;
    else hi = mid;
  }
  while (lo < list.length && list[lo].leg.journeyId === skipJourney) lo++;
  return list[lo] ?? null;
}

// Trajet complet à partir d'un départ du profil. Les champs du premier tronçon restent à la
// racine (dep, lineCode…) : c'est le tram à prendre depuis l'arrêt de départ.
function itinerary(entry, lineCodes) {
  const legs = [];
  for (let e = entry; e; e = e.next) legs.push({ ...e.leg, lineCode: lineCodes[e.leg.line] ?? "?" });
  const [first] = legs;
  const final = legs[legs.length - 1];
  return {
    journeyId: first.journeyId,
    line: first.line,
    lineCode: first.lineCode,
    headsign: first.headsign,
    dep: first.dep,
    depLive: first.depLive,
    arr: final.arr,
    arrLive: final.arrLive,
    arrHome: entry.arrHome,
    dest: entry.dest,
    transfers: legs.length - 1,
    legs,
  };
}

// Une option par couple (station de départ, nombre de correspondances), toutes lignes confondues.
// Les courses partielles (qui s'arrêtent avant la station d'arrivée) ne servent que si une
// correspondance permet de finir le trajet.
export function plan({ origins, dests, journeys, index, lineCodes, now, maxTransfers = MAX_TRANSFERS }) {
  const destById = new Map(dests.map((d) => [d.station.id, d]));
  const profiles = buildProfiles({ journeys, index, destById, maxTransfers });

  const found = [];
  let upcoming = false; // des trams restent, rejoignables ou non
  let servedEarlier = false; // un trajet a relié les deux côtés plus tôt dans la journée

  for (const origin of origins) {
    const walkToMs = origin.walk.minutes * MIN + WALK_MARGIN_MS;
    profiles.forEach((profile, transfers) => {
      const entries = profile.get(origin.station.id) ?? [];
      const future = entries.filter((e) => e.dep >= now - MIN);
      if (future.length < entries.length) servedEarlier = true;
      if (future.length) upcoming = true;
      const catchable = future.filter((e) => e.dep >= now + walkToMs).map((e) => itinerary(e, lineCodes));
      if (!catchable.length) return;
      const next = catchable[0];
      const last = catchable[catchable.length - 1];
      found.push({
        key: `${origin.station.id}|${transfers}`,
        origin,
        dest: last.dest,
        transfers,
        lineCodes: [...new Set(catchable.map((t) => t.lineCode))].sort(),
        catchable,
        next,
        last,
        leaveBy: last.dep - walkToMs,
        arriveHome: next.arrHome,
      });
    });
  }

  // Plus de correspondances depuis le même arrêt ne sert que pour partir plus tard ou arriver plus tôt.
  const options = found.filter(
    (o) =>
      !found.some(
        (p) =>
          p.origin.station.id === o.origin.station.id &&
          p.transfers < o.transfers &&
          p.leaveBy >= o.leaveBy &&
          p.arriveHome <= o.arriveHome,
      ),
  );

  const rank = (o) => o.arriveHome + o.transfers * TRANSFER_PENALTY_MS;
  options.sort(
    (a, b) => rank(a) - rank(b) || a.origin.walk.meters - b.origin.walk.meters || a.transfers - b.transfers,
  );

  // missed : des trams restent, mais aucun n'est rejoignable à pied à temps.
  // over : le trajet existait plus tôt, le dernier tram est parti (fin de service, travaux…).
  // none : aucun tram ne relie les deux côtés de la journée, même avec correspondance.
  if (!options.length) return { status: upcoming ? "missed" : servedEarlier ? "over" : "none", options };

  const primary = options[0];
  // La journée commerciale a basculé : le prochain départ est demain matin.
  if (primary.next.dep - now > SERVICE_GAP_MS) return { status: "ended", options, primary };

  // À égalité d'heure limite, la première option du classement (souvent moins de correspondances).
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
