// Colette — assemble les données de plusieurs modes, pour un mode qui les combine
// (« Le dernier transport » : tram et bus). Rien n'est généré en double : on assemble au chargement les fichiers de chaque mode.
// Fonctions pures, sans rien de propre à un réseau.

// Arrêts : { lines, stops } de chaque mode → un seul jeu. Un quai présent dans plusieurs modes garde
// toutes ses lignes. L'index (buildIndex) regroupe ensuite par nom les quais des différents modes : le
// tram « Victoire » et le bus « Victoire » forment une seule station, où l'on change sans marcher.
export function mergeStops(parts) {
  const lines = {};
  const byRef = new Map();
  for (const part of parts) {
    Object.assign(lines, part.lines);
    for (const s of part.stops) {
      const known = byRef.get(s.ref);
      byRef.set(s.ref, known ? { ...known, lines: [...new Set([...known.lines, ...s.lines])].sort() } : s);
    }
  }
  return { lines, stops: [...byRef.values()] };
}

// Graphes : { names, patterns } → un seul (motifs mis bout à bout).
export const mergeGraphs = (parts) => ({
  names: Object.assign({}, ...parts.map((p) => p.names)),
  patterns: parts.flatMap((p) => p.patterns),
});

// Tracés : { lines: { [code]: [...] } } → un seul (les codes de ligne ne se recouvrent pas d'un mode à
// l'autre : A à F, N1 à N8, numéros de bus).
export const mergeShapes = (parts) => ({ lines: Object.assign({}, ...parts.map((p) => p.lines)) });

// Charge plusieurs fichiers en parallèle et les assemble : load(() => import(a), () => import(b)).
export const loadMerged = (merge, ...loaders) => () => Promise.all(loaders.map((load) => load())).then(merge);
