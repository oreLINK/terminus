// Indicateur « calcul en cours » : une classe sur <body> que tous les écrans savent afficher,
// et un message pour les lecteurs d'écran. Reste visible au moins MIN_MS pour être perçu.

const MIN_MS = 700;

let since = 0;
let timer = null;

export function setComputing(on, message = "Calcul en cours…") {
  const status = document.getElementById("compute-status");
  clearTimeout(timer);
  if (on) {
    since = Date.now();
    document.body.classList.add("is-computing");
    status.textContent = message;
    return;
  }
  timer = setTimeout(() => {
    document.body.classList.remove("is-computing");
    status.textContent = "";
  }, Math.max(0, MIN_MS - (Date.now() - since)));
}
