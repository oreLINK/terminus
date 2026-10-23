// Couleur d'ambiance de toute la fenêtre : le ton de la situation (vert, orange, rouge, noir, gris)
// teinte le fond en camaïeu (voir .ambient dans style.css) et la barre du navigateur.
// Un mode l'appelle à chaque changement de ton, et le remet à « none » en se démontant.

const TONES = ["ok", "soon", "urgent", "late", "none"];

let current = null;

// Barre du navigateur (theme-color) : la couleur --bar de style.css, définie avec --amb-1 pour
// chaque ton, en clair et en sombre, et par le thème de saison s'il y en a un. Une seule source.
export function paintBar() {
  const color = getComputedStyle(document.documentElement).getPropertyValue("--bar").trim();
  if (!color) return;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.content = color;
}

export function setAmbient(tone = "none", { pulsing = false } = {}) {
  const t = TONES.includes(tone) ? tone : "none";
  const html = document.documentElement;
  html.classList.toggle("is-pulsing-ambient", pulsing);
  if (t === current) return;
  current = t;
  html.dataset.tone = t;
  paintBar();
}
