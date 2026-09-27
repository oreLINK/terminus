// Adresse du domicile, une par réseau : un domicile à Bordeaux n'a pas de sens à Lyon.

import { readJSON, writeJSON } from "./storage.js";

const HOMES_KEY = "dt.homes.v1"; // { [networkId]: { label, lat, lon } }

const isPlace = (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lon);

export function getHome(network) {
  const homes = readJSON(HOMES_KEY) ?? {};
  if (isPlace(homes[network.id])) return homes[network.id];
  // Reprise d'une adresse enregistrée avant l'arrivée des réseaux multiples.
  const legacy = network.legacyHomeKey && readJSON(network.legacyHomeKey);
  if (isPlace(legacy)) return saveHome(network, legacy);
  return null;
}

export function saveHome(network, place) {
  const home = { label: place.label, lat: place.lat, lon: place.lon };
  const homes = readJSON(HOMES_KEY) ?? {};
  homes[network.id] = home;
  writeJSON(HOMES_KEY, homes);
  return home;
}
