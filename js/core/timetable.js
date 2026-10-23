// Horaires théoriques du soir, inclus dans le site (générés depuis le GTFS par
// tools/build-timetable.mjs) : ils donnent les courses au même format que le flux SIRI (voir
// parseJourneys), pour calculer le trajet sans appeler l'API, puis ne demander le temps réel que pour
// les lignes du trajet retenu (mergeLive). CONTEXT.md, section 11, piste 10. Fonctions pures, sauf
// eveningJourneys qui charge les fichiers par l'adaptateur.

import { zonedTime } from "./util.js";

// Courses d'un jour de service. `refs` traduit les identifiants GTFS en identifiants SIRI du réseau :
// { line(route_id), stop(stop_id), journey(trip_id) }. `lines` : les lignes à garder (Set de refs
// SIRI), facultatif. Les heures GTFS comptent depuis « midi moins 12 h » du jour de service.
export function buildJourneys(index, day, date, refs, lines = null) {
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
      return { ref: refs.stop(id), name: index.stops[id] ?? id, dep: ms, depLive: false, arr: ms, arrLive: false, cancelled: false };
    });
    out.push({ id: refs.journey(tripId), line, direction: String(direction), headsign: calls[calls.length - 1].name, calls, theoretical: true });
  }
  return out;
}

// Courses théoriques des jours donnés (le soir, et le lendemain pour les bus de nuit, que le GTFS
// range sur le jour du matin), ou null si un jour manque : fichier périmé, l'appelant revient alors
// à l'ancienne méthode. `source` : { loadIndex(), loadDay(type), refs }.
export async function eveningJourneys(source, dates, lines = null) {
  const index = await source.loadIndex();
  const out = [];
  for (const date of dates) {
    const type = index?.days?.[date];
    if (type == null) return null;
    out.push(...buildJourneys(index, await source.loadDay(type), date, source.refs, lines));
  }
  return out;
}

// Remplace, pour chaque (ligne, sens) interrogé en temps réel, les courses théoriques que le flux
// couvre par celles du flux. Une course théorique absente du flux dans sa fenêtre est tenue pour
// supprimée (le flux omet les courses supprimées). Au-delà de la dernière course du flux (horizon
// du flux), les courses théoriques restent. Un flux vide pour un (ligne, sens) ne prouve rien (panne,
// fin de service) : les courses théoriques restent.
export function mergeLive(journeys, requests, live) {
  const key = (line, direction) => `${line}|${direction}`;
  const horizon = new Map();
  for (const j of live) {
    const k = key(j.line, j.direction);
    const first = j.calls[0].dep;
    horizon.set(k, Math.max(horizon.get(k) ?? -Infinity, first));
  }
  const asked = new Set(requests.map((r) => key(r.line, r.direction)));
  const kept = journeys.filter((j) => {
    const k = key(j.line, j.direction);
    if (!asked.has(k) || !horizon.has(k)) return true; // pas rafraîchi : inchangé
    if (!j.theoretical) return false; // ancien temps réel de ce (ligne, sens) : remplacé
    return j.calls[0].dep > horizon.get(k); // au-delà de l'horizon du flux : gardé
  });
  return [...kept, ...live];
}

// Jours de service au format AAAA-MM-JJ.
export const isoDate = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
