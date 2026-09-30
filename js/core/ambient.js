// Couleur d'ambiance de toute la fenêtre : le ton de la situation (vert, orange, rouge, noir, gris)
// teinte le fond en camaïeu (voir .ambient dans style.css) et la barre du navigateur.
// Un type d'information l'appelle à chaque changement de ton, et le remet à « none » en se démontant.

const TONES = ["ok", "soon", "urgent", "late", "none"];

// Couleur de la barre du navigateur (theme-color) par ton, en clair et en sombre.
// Doit suivre --amb-1 de style.css.
const THEME = {
  light: { ok: "#D3EEDC", soon: "#FADDC0", urgent: "#F7D2CE", late: "#05070A", none: "#E7ECF0" },
  dark: { ok: "#0E2A1D", soon: "#33200D", urgent: "#361514", late: "#000000", none: "#12202E" },
};

let current = null;

export function setAmbient(tone = "none", { pulsing = false } = {}) {
  const t = TONES.includes(tone) ? tone : "none";
  const html = document.documentElement;
  html.classList.toggle("is-pulsing-ambient", pulsing);
  if (t === current) return;
  current = t;
  html.dataset.tone = t;
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.content = THEME[dark ? "dark" : "light"][t];
  }
}
