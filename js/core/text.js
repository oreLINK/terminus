// Noms comparables : arrêts, communes. Fonctions pures.

// Nom d'arrêt normalisé : minuscules, sans accents ni ponctuation (« Hôtel-de-Ville » → « hotel de ville »).
export const normName = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Commune normalisée pour la comparer à une liste : minuscules, sans accents ni tirets, « St » écrit
// « saint ».
export const normCommune = (name) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-'’]/g, " ")
    .replace(/\bst\b/g, "saint")
    .replace(/\s+/g, " ")
    .trim();

// Commune d'une adresse de la Géoplateforme (« 12 Rue X 33700 Mérignac » → « merignac »).
export function communeOf(label) {
  const m = /\b\d{5}\s+(.+)$/.exec(label ?? "");
  return m ? normCommune(m[1]) : null;
}
