// Calendrier des thèmes de saison. Un thème habille le site (couleurs, décor, animations, quelques
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

// Instant (ms) d'une heure locale « AAAA-MM-JJ HH:MM » dans un fuseau, changements d'heure compris :
// on part de l'heure lue comme UTC, puis on retire le décalage du fuseau à cet instant (deux passes
// suffisent, même la nuit d'un changement d'heure).
export function zonedTime(local, timeZone) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(local);
  if (!m) throw new Error(`Date de thème illisible : « ${local} » (attendu AAAA-MM-JJ HH:MM)`);
  const [, y, mo, d, h, mi] = m.map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  let t = asUtc;
  for (let i = 0; i < 2; i++) t = asUtc - offsetAt(t, timeZone);
  return t;
}

function offsetAt(ms, timeZone) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(ms)
      .map((x) => [x.type, Number(x.value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}

export const themeStart = (theme) => zonedTime(theme.from, theme.timeZone);
export const themeEnd = (theme) => zonedTime(theme.to, theme.timeZone);

// Le thème actif à cet instant : le premier dont la période le contient, sinon le thème par défaut.
export function activeTheme(now, themes = THEMES) {
  return themes.find((t) => now >= themeStart(t) && now < themeEnd(t)) ?? DEFAULT_THEME;
}
