// Thème de saison (js/themes/, THEMES.md) : imposé par ses dates d'activation, il habille le site
// sans toucher aux modes. Posé sur <html> (data-season), avec sa feuille de style chargée après
// style.css et ses animations, puis revérifié chaque minute : un thème commence ou finit à l'heure
// dite même si la page reste ouverte. L'horloge est celle du site (mode test compris).

import { activeTheme, DEFAULT_THEME } from "../themes/index.js";
import { now } from "./lab.js";
import { paintBar } from "./ambient.js";

const CHECK_MS = 60 * 1000;
const THEMES_DIR = new URL("../themes/", import.meta.url);

let current = DEFAULT_THEME;
let link = null;
let stopDecorations = null;
let started = false;

export function startSeason() {
  if (started) return;
  started = true;
  apply();
  setInterval(apply, CHECK_MS);
}

function apply() {
  const theme = activeTheme(now());
  if (theme.id === current.id) return;
  stopDecorations?.();
  stopDecorations = null;
  link?.remove();
  link = null;
  current = theme;

  const html = document.documentElement;
  if (theme === DEFAULT_THEME) {
    delete html.dataset.season;
    paintBar();
    return;
  }
  html.dataset.season = theme.id;
  if (theme.stylesheet) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(theme.stylesheet, THEMES_DIR).href;
    link.addEventListener("load", paintBar); // la barre du navigateur prend les couleurs du thème
    document.head.append(link);
  }
  theme
    .decorations?.()
    .then((mod) => {
      if (current !== theme) return; // le thème a changé pendant le chargement
      stopDecorations = mod.start({ theme, now });
    })
    .catch(() => {}); // sans animations, le thème reste : couleurs et décor fixe
}

// Texte du thème en cours pour `key`, sinon `fallback`. `{nom}` est remplacé par vars.nom.
export function seasonText(key, fallback, vars = {}) {
  const text = current.texts?.[key];
  return text ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "") : fallback;
}
