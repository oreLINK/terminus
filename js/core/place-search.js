// Inès, recherche — les lieux connus et les stations du réseau proposés dans la recherche d'adresse,
// avant les adresses de l'IGN et sans appel : ils sont dans les fichiers du site. Fonctions pures.
// Le catalogue des lieux et les arrêts viennent du réseau (`area.places`, `area.stations`) : rien de
// propre à une ville ici.
// Recherche sans accents ni majuscules, sur le début des mots, dans n'importe quel ordre : « pey »
// trouve la place Pey-Berland, « cite du » la Cité du Vin, « aquitaine musee » le musée d'Aquitaine ;
// les autres noms comptent aussi (« Opéra » mène à la place de la Comédie).

import { normName } from "./text.js";
import { buildIndex } from "./stations.js";

const MAX_CODES = 6; // lignes citées sous une station, puis « … »

// Lignes d'une station dans l'ordre où on les cherche : tram (lettres), bus (numéros), bus de nuit.
function describeLines(codes) {
  const rank = (c) => (/^[A-Z]$/.test(c) ? 0 : /^N\d/.test(c) ? 2 : 1);
  const sorted = [...new Set(codes.filter(Boolean))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, "fr", { numeric: true }));
  if (!sorted.length) return "Station";
  const shown = sorted.slice(0, MAX_CODES).join(", ");
  return `Station · ${sorted.length > 1 ? "lignes" : "ligne"} ${shown}${sorted.length > MAX_CODES ? "…" : ""}`;
}

// Prépare l'index une fois. `places` : [{ name, aliases, category, lat, lon, commune }] ;
// `stops` : arrêts au format de stops.js ({ lines, stops }), regroupés en stations par nom.
export function buildPlaceIndex({ places = [], stops = null } = {}) {
  const entries = [];
  for (const p of places) {
    entries.push({
      kind: "place",
      label: p.name,
      detail: [p.category, p.commune].filter(Boolean).join(" · "),
      lat: p.lat,
      lon: p.lon,
      commune: p.commune ?? null,
      names: [p.name, ...(p.aliases ?? [])].map((n) => normName(n).split(" ").filter(Boolean)),
    });
  }
  if (stops?.stops?.length) {
    for (const st of buildIndex(stops.stops).stations) {
      entries.push({
        kind: "station",
        label: st.name,
        detail: describeLines(st.lines.map((ref) => stops.lines?.[ref]?.code)),
        lat: st.lat,
        lon: st.lon,
        commune: null,
        lines: new Set(st.lines).size, // à égalité, la station la plus desservie d'abord
        names: [normName(st.name).split(" ").filter(Boolean)],
      });
    }
  }
  return entries;
}

// Article en tête d'un nom, ignoré pour le classement (« La Cité du Vin » commence par « cité »).
const ARTICLES = new Set(["la", "le", "les", "l"]);

// Les meilleures correspondances de `text` : chaque mot tapé commence un mot du nom (ou d'un autre
// nom). Score, du meilleur au moins bon : le nom (article ôté) commence par la saisie, sinon son
// premier mot commence par le premier mot tapé, sinon ailleurs ; les mots tapés en entier (« pey »
// pour Pey-Berland, et non Peylanne) font monter, un autre nom que le nom affiché fait un peu
// descendre. À égalité, les lieux avant les stations, la station la plus desservie, puis le nom le
// plus court.
// Au plus `max` résultats : { kind: "place" | "station", label, detail, lat, lon, commune }.
export function searchPlaces(index, text, { max = 5 } = {}) {
  const typed = normName(text).split(" ").filter(Boolean);
  if (!typed.length) return [];
  const phrase = typed.join(" ");
  const found = [];
  for (const e of index) {
    let score = Infinity;
    e.names.forEach((all, n) => {
      if (!typed.every((t) => all.some((w) => w.startsWith(t)))) return;
      const words = all.length > 1 && ARTICLES.has(all[0]) ? all.slice(1) : all;
      let s = words.join(" ").startsWith(phrase) ? 0 : words[0].startsWith(typed[0]) ? 1 : 2;
      if (typed.every((t) => all.includes(t))) s -= 0.75;
      score = Math.min(score, s + (n ? 0.5 : 0));
    });
    if (score < Infinity) found.push({ e, score });
  }
  found.sort(
    (a, b) =>
      a.score - b.score ||
      (a.e.kind === b.e.kind ? 0 : a.e.kind === "place" ? -1 : 1) ||
      (b.e.lines ?? 0) - (a.e.lines ?? 0) ||
      a.e.label.length - b.e.label.length ||
      a.e.label.localeCompare(b.e.label, "fr"),
  );
  return found.slice(0, max).map(({ e }) => ({ kind: e.kind, label: e.label, detail: e.detail, lat: e.lat, lon: e.lon, commune: e.commune }));
}
