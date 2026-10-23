// Léa (lit les horaires du soir) et Rémi (y recolle le temps réel, mergeLive).
// Horaires théoriques du soir, inclus dans le site (générés depuis le GTFS par
// tools/build-timetable.mjs) : ils donnent les courses au même format que le flux SIRI (voir
// parseJourneys), pour calculer le trajet sans appeler l'API, puis ne demander le temps réel que pour
// les lignes du trajet retenu (mergeLive). CONTEXT.md, section 11, piste 10. Fonctions pures, sauf
// eveningJourneys qui charge les fichiers par l'adaptateur.

import { zonedTime } from "./dates.js";

// Courses d'un jour de service. `refs` traduit les identifiants GTFS en identifiants SIRI du réseau :
// { line(route_id), stop(stop_id), journey(trip_id) }. `lines` : les lignes à garder (Set de refs
// SIRI), facultatif. `nameOf(ref SIRI)` : nom d'un quai (les arrêts du mode, déjà chargés ; les
// horaires ne répètent pas les noms). Les heures GTFS comptent depuis « midi moins 12 h » du jour.
export function buildJourneys(index, day, date, refs, lines = null, nameOf = (ref) => ref) {
  const base = zonedTime(`${date} 12:00`, index.timeZone) - 12 * 3600 * 1000;
  const out = [];
  for (const [tripId, pi, qi, start] of day.trips) {
    const [route, direction, stops] = day.patterns[pi];
    const line = refs.line(route);
    if (lines && !lines.has(line)) continue;
    const deltas = day.profiles[qi];
    let t = start;
    const calls = stops.map((id, k) => {
      if (k) t += deltas[k];
      const ms = base + t * 1000;
      const ref = refs.stop(id);
      return { ref, name: nameOf(ref), dep: ms, depLive: false, arr: ms, arrLive: false, cancelled: false };
    });
    out.push({ id: refs.journey(tripId), line, direction: String(direction), headsign: calls[calls.length - 1].name, calls, theoretical: true });
  }
  return out;
}

// Courses théoriques du soir `evening` (AAAA-MM-JJ), et du lendemain `nextDate` si les horaires le
// demandent (`nextDay` : bus de nuit, que le GTFS range sur le jour du matin), ou null si un jour
// manque : fichier périmé, l'appelant revient alors à l'ancienne méthode. `source` : { loadIndex(),
// loadDay(type), refs }, ou une liste de sources, assemblées (un mode qui combine tram et bus) : null
// si l'une manque.
export async function eveningJourneys(source, evening, nextDate, lines = null, nameOf = undefined) {
  if (Array.isArray(source)) {
    const parts = await Promise.all(source.map((s) => eveningJourneys(s, evening, nextDate, lines, nameOf)));
    return parts.some((p) => p == null) ? null : parts.flat();
  }
  const index = await source.loadIndex();
  const out = [];
  const dates = index?.nextDay ? [evening, nextDate] : [evening];
  for (const date of dates) {
    const type = index?.days?.[date];
    if (type == null) return null;
    out.push(...buildJourneys(index, await source.loadDay(type), date, source.refs, lines, nameOf));
  }
  return out;
}

// Rémi — applique le temps réel des (ligne, sens) interrogés aux courses théoriques. Le temps réel corrige
// ou annule, mais une absence ne prouve rien : le flux SIRI de TBM omet des courses bien réelles
// (constaté le 23/10/2026 : les courses d'après minuit d'un soir, dont il ne garde que celles de la
// veille, l'identifiant d'une course de semaine se répétant chaque jour) et en publie de fantômes
// (courses d'un autre jour, sans aucun suivi en direct). Donc :
//   - une course du flux remplace sa jumelle théorique (même identifiant, à moins de 6 h) ;
//   - une course annulée du flux retire sa jumelle (la plus proche dans le temps, si elle n'a pas
//     d'heure) ;
//   - une course du flux sans jumelle n'est ajoutée que si elle est suivie en direct (renfort réel) :
//     sans suivi, c'est un fantôme probable ;
//   - une course théorique sans jumelle dans le flux reste.
// Un second appel pour les mêmes (ligne, sens) remplace le temps réel du premier (la jumelle peut
// être une course déjà corrigée). `requests` dit les (ligne, sens) interrogés : seules leurs courses
// peuvent être remplacées ou retirées.
export function mergeLive(journeys, requests, live) {
  const key = (j) => `${j.line}|${j.direction}`;
  const asked = new Set(requests.map((r) => `${r.line}|${r.direction}`));
  const SAME_DAY_MS = 6 * 3600 * 1000;
  const first = (j) => j.calls[0]?.dep;
  const out = [...journeys];
  const byId = new Map();
  out.forEach((j, i) => byId.set(j.id, [...(byId.get(j.id) ?? []), i]));
  const twinIndex = (j) => {
    const candidates = (byId.get(j.id) ?? []).filter((i) => out[i] && asked.has(key(out[i])));
    if (!candidates.length) return -1;
    if (first(j) == null) return candidates.sort((a, b) => first(out[a]) - first(out[b]))[0];
    const near = candidates.filter((i) => Math.abs(first(out[i]) - first(j)) < SAME_DAY_MS);
    return near.length ? near[0] : -1;
  };
  const added = [];
  for (const j of live) {
    const i = twinIndex(j);
    if (j.cancelled) {
      if (i >= 0) out[i] = null;
    } else if (i >= 0) {
      out[i] = j;
    } else if (j.calls.some((c) => c.depLive)) {
      added.push(j);
    }
  }
  return [...out.filter(Boolean), ...added];
}
