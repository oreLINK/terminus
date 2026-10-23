// Simon — simule pour déboguer. Mode test, sur le poste de développement seulement (npm run serve, puis /lab/) : la page
// lab enregistre des réglages que le site applique (horloge, plage horaire, écrans forcés).
// Hors de localhost, `lab` vaut toujours null et l'horloge est l'heure réelle.

import { readJSON, writeJSON } from "./storage.js";

const KEY = "dt.lab.v1";

export const LOCAL = ["localhost", "127.0.0.1", "[::1]"].includes(globalThis.location?.hostname);

// { clock, setAt, startHour, endHour, liveMin, countdownMin, screen, method } : chaque champ est
// facultatif. method : « siri » ou « offline » force la méthode de calcul (sinon, celle du réseau).
export const lab = LOCAL ? readJSON(KEY) : null;

// Horloge du site : en mode test, elle part de l'heure choisie et avance normalement.
const offset = lab?.clock != null ? lab.clock - lab.setAt : 0;
export const now = () => Date.now() + offset;

export const saveLab = (settings) => writeJSON(KEY, settings);

export function clearLab() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Stockage indisponible : rien à effacer.
  }
}
