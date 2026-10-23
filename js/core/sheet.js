// Feuille de réglage qui monte du bas de l'écran, toujours, formulaires compris : quand le
// clavier s'ouvre, la feuille remonte au-dessus de lui (followKeyboard).
// Repose sur <dialog> : focus piégé, touche Échap et fond inerte fournis par le navigateur.
// Toutes les feuilles sont faites des mêmes briques (sheetOptions, sheetCurrent, sheetAction,
// sheetNote) pour se ressembler : choix en cartes, valeur actuelle, actions en lignes, note.

import { esc } from "./util.js";
import { icon } from "./icons.js";

const CLOSE_MS = 180;
const DRAG_CLOSE_PX = 80;

let dialog = null;
let closing = null;
let onClose = null; // nettoyage de la feuille affichée (une carte à retirer, par exemple)

function cleanUp() {
  const fn = onClose;
  onClose = null;
  fn?.();
}

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
    cleanUp();
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

// `onClose` : appelé quand la feuille se ferme ou laisse la place à une autre.
export function openSheet(title, html, { onClose: cleanup = null } = {}) {
  init();
  if (closing) dialog.close();
  cleanUp();
  onClose = cleanup;
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

// Éclair du mode automatique : dans l'en-tête (sélecteur de ville) et devant « Automatique ».
export const boltSvg = (className) => icon("bolt", className);

// Libellé du choix automatique, le même dans toutes les feuilles.
export const AUTOMATIC = `${boltSvg("sheet-bolt")}Automatique`;

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
  const inner = `${icon(name, "sheet-glyph")}<span>${esc(label)}</span>`;
  return href
    ? `<a class="sheet-action" href="${esc(href)}" target="_blank" rel="noopener">${inner}</a>`
    : `<button type="button" class="sheet-action" data-action="${esc(action)}">${inner}</button>`;
}

// Groupe d'actions, espacées comme une seule liste.
export const sheetActions = (...actions) => `<div class="sheet-actions">${actions.filter(Boolean).join("")}</div>`;

// Note d'explication, discrète. Texte brut.
export const sheetNote = (text) => `<p class="sheet-note">${esc(text)}</p>`;
