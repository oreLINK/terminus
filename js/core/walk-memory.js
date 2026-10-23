// Max, mémoire — les marches réelles côté destination, gardées d'une visite à l'autre : de chaque
// station d'arrivée à la destination, le trajet à pied ne change pas d'un soir à l'autre. Sans elles,
// chaque visite redemandait environ 2,4 itinéraires à l'IGN (mesuré le 23/10/2026, « Le dernier
// transport »). Côté départ, la position change trop : rien n'est gardé.
// Stockage local du navigateur (dt.walks.v1), effacé avec les autres données (page Confidentialité).
// Une marche est rangée sous sa station et la position exacte du centre de la station, qui varie d'un
// mode à l'autre (le tram seul, ou le tram et les bus réunis) : une marche n'est reprise que pour
// le point d'où elle a été calculée.

import { readJSON, writeJSON } from "./storage.js";
import { distanceM, walkMinutes } from "./util.js";
import { encodeLine, decodeLine, simplifyLine } from "./line-trace.js";

const KEY = "dt.walks.v1";
const SAME_HOME_M = 20; // au-delà, une autre destination : on repart de zéro
const KEEP_MS = 30 * 24 * 3600 * 1000; // les rues changent peu ; un mois, puis on redemande
const MAX_WALKS = 60; // par réseau : quelques modes × une douzaine d'arrivées

const spot = (station) => `${station.id}@${station.lat.toFixed(5)},${station.lon.toFixed(5)}`;

function entryFor(all, networkId, home) {
  const entry = all?.[networkId];
  return entry && distanceM(entry.home, home) <= SAME_HOME_M ? entry : null;
}

// Marches gardées pour cette destination : station → marche (format de realWalk), pour les stations
// données. `now` : l'horloge du site.
export function recallWalks(networkId, home, stations, now) {
  const entry = entryFor(readJSON(KEY), networkId, home);
  const out = new Map();
  if (!entry) return out;
  for (const st of stations) {
    const w = entry.walks?.[spot(st)];
    if (!w || now - w.at > KEEP_MS) continue;
    out.set(st.id, { straight: w.straight, meters: w.meters, minutes: walkMinutes(w.meters), path: decodeLine(w.path), real: true });
  }
  return out;
}

// Garde les marches réelles `walks` (station id → marche) des `stations` vers cette destination.
export function rememberWalks(networkId, home, stations, walks, now) {
  const all = readJSON(KEY) ?? {};
  const entry = entryFor(all, networkId, home) ?? { home: { lat: home.lat, lon: home.lon }, walks: {} };
  for (const st of stations) {
    const w = walks.get(st.id);
    if (!w?.real) continue;
    entry.walks[spot(st)] = { at: now, straight: Math.round(w.straight), meters: Math.round(w.meters), path: encodeLine(simplifyLine(w.path, 2)) };
  }
  // Les plus récentes d'abord, au plus MAX_WALKS, sans les périmées.
  entry.walks = Object.fromEntries(
    Object.entries(entry.walks)
      .filter(([, w]) => now - w.at <= KEEP_MS)
      .sort((a, b) => b[1].at - a[1].at)
      .slice(0, MAX_WALKS),
  );
  all[networkId] = entry;
  writeJSON(KEY, all);
}
