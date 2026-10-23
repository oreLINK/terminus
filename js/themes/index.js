// Coco — habille le site selon la saison. Calendrier des thèmes de saison. Un thème habille le site (couleurs, décor, animations, quelques
// textes) pendant ses dates d'activation, sans choix de la personne ; le reste du temps, c'est le
// thème Terminus, celui de style.css. Documenté dans THEMES.md (un test vérifie que les deux
// disent la même chose).
//
// Changer les dates d'un thème : modifier `from` et `to` ici et dans THEMES.md. Heures locales du
// fuseau `timeZone`, au format « AAAA-MM-JJ HH:MM » ; le thème est actif de `from` (inclus) à `to`
// (exclu). Ajouter un thème : voir THEMES.md.
//
// Un thème déclare :
//   id, name, from, to, timeZone
//   stylesheet : sa feuille de style, chargée après style.css (chemin relatif à ce dossier)
//   decorations : () => import(…) d'un module { start(context) → stop() }, facultatif
//   texts : textes remplacés pendant le thème (voir seasonText dans js/core/season.js), facultatif

import { zonedTime } from "../core/dates.js";

export { zonedTime }; // utilisé par les tests

export const THEMES = [
  {
    id: "halloween-2026",
    name: "Halloween 2026",
    from: "2026-10-15 18:00",
    to: "2026-11-01 08:00",
    timeZone: "Europe/Paris",
    stylesheet: "halloween-2026/theme.css",
    decorations: () => import("./halloween-2026/decorations.js"),
    texts: {
      late: "Bouh… trop tard",
      over: "Le dernier {vehicle} s'est évaporé",
    },
  },
];

// Le thème par défaut, hors de toute période : celui de style.css, sans fichier à charger.
export const DEFAULT_THEME = { id: "terminus", name: "Terminus" };

export const themeStart = (theme) => zonedTime(theme.from, theme.timeZone);
export const themeEnd = (theme) => zonedTime(theme.to, theme.timeZone);

// Le thème actif à cet instant : le premier dont la période le contient, sinon le thème par défaut.
export function activeTheme(now, themes = THEMES) {
  return themes.find((t) => now >= themeStart(t) && now < themeEnd(t)) ?? DEFAULT_THEME;
}
