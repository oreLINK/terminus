// Feuille de réglage qui monte du bas de l'écran.
// Repose sur <dialog> : focus piégé, touche Échap et fond inerte fournis par le navigateur.

let dialog = null;

function init() {
  if (dialog) return;
  dialog = document.getElementById("sheet");
  // Un toucher sur le voile sombre, hors de la feuille, la referme.
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeSheet();
  });
  dialog.addEventListener("close", () => {
    document.getElementById("sheet-body").innerHTML = "";
  });
}

export function openSheet(title, html) {
  init();
  const body = document.getElementById("sheet-body");
  document.getElementById("sheet-title").textContent = title;
  body.innerHTML = html;
  if (!dialog.open) dialog.showModal();
  return body;
}

export function closeSheet() {
  if (dialog?.open) dialog.close();
}
