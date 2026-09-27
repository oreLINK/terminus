// Autocomplétion d'adresses : Géoplateforme de l'IGN (https://geoservices.ign.fr), France entière.
// La zone vient du réseau choisi : `area = { department, bounds, center }`.
// Le service de complétion filtre par département (terr=33 pour la Gironde).
// En cas d'échec, repli sur le géocodage « search », filtré sur le code postal du département.

import { inBounds } from "./util.js";

const COMPLETION_URL = "https://data.geopf.fr/geocodage/completion/";
const SEARCH_URL = "https://data.geopf.fr/geocodage/search";
const MAX_RESULTS = 7;

export async function suggestAddresses(text, { area, types = "StreetAddress", signal } = {}) {
  try {
    return await viaCompletion(text, area, types, signal);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    return viaSearch(text, area, signal);
  }
}

async function viaCompletion(text, area, types, signal) {
  const url = new URL(COMPLETION_URL);
  url.search = new URLSearchParams({ text, terr: area.department, type: types, maximumResponses: String(MAX_RESULTS) });
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`completion ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.results)) throw new Error("completion: format inattendu");
  return unique(
    data.results.map((r) => ({ label: r.fulltext, lat: Number(r.y), lon: Number(r.x) })),
    area,
  );
}

async function viaSearch(text, area, signal) {
  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({
    q: text,
    autocomplete: "1",
    index: "address",
    limit: "15",
    lat: String(area.center.lat),
    lon: String(area.center.lon),
  });
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Le service d'adresses a répondu ${res.status}.`);
  const data = await res.json();
  return unique(
    (data.features ?? [])
      .filter((f) => String(f.properties?.postcode ?? "").startsWith(area.department))
      .map((f) => ({
        label: f.properties.label,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
      })),
    area,
  ).slice(0, MAX_RESULTS);
}

// Toute coordonnée hors de la zone du réseau est écartée.
function unique(items, area) {
  const seen = new Set();
  return items.filter((a) => {
    if (!a.label || !inBounds(area.bounds, a) || seen.has(a.label)) return false;
    seen.add(a.label);
    return true;
  });
}
