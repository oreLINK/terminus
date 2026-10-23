// Pictogrammes du site, dessinés une seule fois (traits sur une grille de 24, couleur du texte) :
// icon(nom, classe) → <svg>. Les icônes de l'en-tête restent dans index.html (affichées sans script).

const GLYPHS = {
  // Viser : la position actuelle.
  locate: `<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"/>`,
  // Flèche de navigation : l'itinéraire.
  go: `<path d="M20 4 4 11l7 2 2 7 7-16Z"/>`,
  // Repère : un lieu.
  pin: `<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>`,
  // Éclair : le choix automatique.
  bolt: `<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>`,
  home: `<path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>`,
  refresh: `<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>`,
  walk: `<circle cx="13" cy="4.5" r="1.8"/><path d="M12.5 8 10 14l3.5 3 1.5 4.5M10 14l-2 7M11.5 9.5 8 12v3M13 8.5l2.5 3.5H19"/>`,
  expand: `<path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/>`,
  // Monument : un lieu connu (recherche d'adresse).
  landmark: `<path d="M4 20h16M6 20v-8M10 20v-8M14 20v-8M18 20v-8M3.5 10.5 12 4l8.5 6.5Z"/>`,
  // Avant d'un tram : une station (recherche d'adresse).
  station: `<rect x="6" y="3.5" width="12" height="14" rx="3"/><path d="M6 11h12M9.5 20.5l1.5-3M14.5 20.5l-1.5-3"/><circle cx="9.5" cy="14.3" r=".6"/><circle cx="14.5" cy="14.3" r=".6"/>`,
  // Œil : afficher ; œil barré : masquer.
  eye: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>`,
  eyeOff: `<path d="M10 5.8c.6-.2 1.3-.3 2-.3 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.3 7.3A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2M3.5 3.5l17 17"/>`,
};

export const icon = (name, className) =>
  `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${GLYPHS[name]}</svg>`;
