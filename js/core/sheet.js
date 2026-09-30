// Feuille de réglage qui monte du bas de l'écran, toujours, formulaires compris : quand le
// clavier s'ouvre, la feuille remonte au-dessus de lui (followKeyboard).
// Repose sur <dialog> : focus piégé, touche Échap et fond inerte fournis par le navigateur.
// Toutes les feuilles sont faites des mêmes briques (sheetOptions, sheetCurrent, sheetAction,
// sheetNote) pour se ressembler : choix en cartes, valeur actuelle, actions en lignes, note.

import { esc } from "./util.js";

const CLOSE_MS = 180;
const DRAG_CLOSE_PX = 80;

let dialog = null;
let closing = null;

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function init() {
  if (dialog) return;
  dialog = document.getElementById("sheet");
  // Un toucher sur le voile sombre, hors de la feuille, la referme.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeSheet();
  });
  dialog.addEventListener("close", () => {
    clearTimeout(closing);
    closing = null;
    dialog.classList.remove("is-closing");
    dialog.querySelector(".sheet-panel").style.transform = "";
    document.getElementById("sheet-body").innerHTML = "";
  });
  // Échap : même sortie animée qu'un toucher sur « Fermer ».
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeSheet();
  });
  dialog.querySelector(".sheet-close").addEventListener("click", () => closeSheet());
  enableDragToClose(dialog.querySelector(".sheet-head"));
  followKeyboard();
}

// Le clavier virtuel recouvre le bas de l'écran sans toujours le redimensionner (iOS) : on mesure
// la partie cachée avec visualViewport et on remonte la feuille d'autant (--keyboard).
function followKeyboard() {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    const hidden = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    dialog.style.setProperty("--keyboard", `${Math.round(hidden)}px`);
  };
  vv.addEventListener("resize", update);
  vv.addEventListener("scroll", update);
  update();
}

// Tirer la tête d'une feuille basse vers le bas la referme, comme sur un téléphone.
function enableDragToClose(handle) {
  const panel = dialog.querySelector(".sheet-panel");
  let startY = null;
  handle.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    startY = e.clientY;
    handle.setPointerCapture(e.pointerId);
    panel.style.transition = "none";
  });
  handle.addEventListener("pointermove", (e) => {
    if (startY == null) return;
    panel.style.transform = `translateY(${Math.max(0, e.clientY - startY)}px)`;
  });
  const end = (e) => {
    if (startY == null) return;
    const moved = e.clientY - startY;
    startY = null;
    panel.style.transition = "";
    if (moved > DRAG_CLOSE_PX) closeSheet();
    else panel.style.transform = "";
  };
  handle.addEventListener("pointerup", end);
  handle.addEventListener("pointercancel", end);
}

export function openSheet(title, html) {
  init();
  if (closing) dialog.close();
  const body = document.getElementById("sheet-body");
  document.getElementById("sheet-title").textContent = title;
  body.innerHTML = html;
  if (!dialog.open) dialog.showModal();
  return body;
}

export function closeSheet() {
  if (!dialog?.open || closing) return;
  if (reducedMotion()) return dialog.close();
  dialog.classList.add("is-closing");
  closing = setTimeout(() => dialog.close(), CLOSE_MS);
}

// ---------- Briques communes ----------

// Pictogrammes des actions : viser (localisation), flèche de navigation (itinéraire), repère (lieu).
const ICONS = {
  locate: `<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"/>`,
  go: `<path d="M20 4 4 11l7 2 2 7 7-16Z"/>`,
  pin: `<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>`,
};

// Éclair du mode automatique : dans l'en-tête (sélecteur de ville) et devant « Automatique ».
export const boltSvg = (className) =>
  `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/></svg>`;

// Libellé du choix automatique, le même dans toutes les feuilles.
export const AUTOMATIC = `${boltSvg("sheet-bolt")}Automatique`;

const icon = (name) => `<svg class="sheet-glyph" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

// Liste de choix. Chaque choix : { action, value, main, detail, pressed }. `main` et `detail`
// sont du HTML déjà échappé par l'appelant (ils peuvent contenir des badges de ligne).
export function sheetOptions(items) {
  return `<ul class="sheet-options">${items
    .map(
      ({ action, value, main, detail = "", pressed = false }) => `
      <li>
        <button type="button" class="sheet-option" data-action="${esc(action)}" data-value="${esc(value)}" aria-pressed="${pressed}">
          <span class="sheet-option-main">${main}</span>
          ${detail ? `<span class="sheet-option-detail">${detail}</span>` : ""}
        </button>
      </li>`,
    )
    .join("")}</ul>`;
}

// Valeur enregistrée, rappelée sous le champ : « Actuellement » + l'adresse. Texte brut.
export function sheetCurrent(label, value) {
  return `<p class="sheet-current"><span class="sheet-current-label">${esc(label)}</span><span class="sheet-current-value">${esc(value)}</span></p>`;
}

// Action secondaire en pleine largeur : un bouton (`action`) ou un lien externe (`href`).
export function sheetAction({ icon: name, label, action, href }) {
  const inner = `${icon(name)}<span>${esc(label)}</span>`;
  return href
    ? `<a class="sheet-action" href="${esc(href)}" target="_blank" rel="noopener">${inner}</a>`
    : `<button type="button" class="sheet-action" data-action="${esc(action)}">${inner}</button>`;
}

// Groupe d'actions, espacées comme une seule liste.
export const sheetActions = (...actions) => `<div class="sheet-actions">${actions.filter(Boolean).join("")}</div>`;

// Note d'explication, discrète. Texte brut.
export const sheetNote = (text) => `<p class="sheet-note">${esc(text)}</p>`;
