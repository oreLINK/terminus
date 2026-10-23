// Coquille de Terminus : choisit le réseau (la ville) et le mode,
// automatiquement ou à la main, puis monte le mode dans <main>.

import { NETWORKS, getNetwork, networkAt } from "./networks/index.js";
import { DEFAULT_FEATURE, featuresFor } from "./features/index.js";
import { location } from "./core/location.js";
import { openSheet, closeSheet, sheetOptions, sheetNote, boltSvg, AUTOMATIC } from "./core/sheet.js";
import { readJSON, writeJSON } from "./core/storage.js";
import { esc, clock } from "./core/util.js";
import { lab, now, clearLab } from "./core/lab.js";
import { startSeason } from "./core/season.js";

// { city: "auto" | id, feature: id (mode choisi à la main ; absent ou ancien « auto » : celui de la ville), lastNetwork: id }
const PREFS_KEY = "dt.prefs.v1";

const root = document.getElementById("app");
const cityButton = document.getElementById("picker-city-button");
const cityLabel = document.getElementById("picker-city");
const featureLabel = document.getElementById("picker-feature");


const prefs = { city: "auto", feature: null, lastNetwork: null, ...readJSON(PREFS_KEY) };
const savePrefs = () => writeJSON(PREFS_KEY, prefs);

let current = { network: null, feature: null, instance: null };

// ---------- Choix ----------

// Ville : celle choisie à la main, sinon celle qui dessert la position, sinon la dernière connue.
function resolveNetwork() {
  if (prefs.city !== "auto") {
    const chosen = getNetwork(prefs.city);
    if (chosen) return chosen;
  }
  return networkAt(location.here) ?? getNetwork(prefs.lastNetwork) ?? NETWORKS[0];
}

// Mode : celui choisi à la main s'il existe sur ce réseau, sinon celui de la ville
// (Bordeaux : le dernier tram).
function resolveFeature(network) {
  const available = featuresFor(network);
  const byId = (id) => available.find((f) => f.id === id);
  return byId(prefs.feature) ?? byId(network.defaultFeature) ?? byId(DEFAULT_FEATURE) ?? available[0];
}

// Monte le bon mode ; ne fait rien si rien n'a changé.
function mount() {
  const network = resolveNetwork();
  const feature = resolveFeature(network);
  if (network === current.network && feature === current.feature) return;

  current.instance?.unmount();
  closeSheet();
  if (prefs.lastNetwork !== network.id) {
    prefs.lastNetwork = network.id;
    savePrefs();
  }
  current = {
    network,
    feature,
    instance: feature.mount({ root, network, adapter: network.features[feature.id] }),
  };
  paintChrome();
}

// En-tête compact : en mode automatique, la ville se devine (repère + éclair) ; son nom ne
// s'affiche que si elle a été choisie à la main. Les sources sont sur la page Mentions légales.
function paintChrome() {
  const { network, feature } = current;
  const auto = prefs.city === "auto";
  cityButton.classList.toggle("is-auto", auto);
  cityLabel.innerHTML = auto
    ? `${boltSvg("picker-icon picker-bolt")}<span class="visually-hidden">Ville automatique : ${esc(network.city)}</span>`
    : `<span class="visually-hidden">Ville : </span>${esc(network.city)}`;
  featureLabel.textContent = `Mode : ${feature.short}`;
}

// ---------- Sélecteurs ----------

function openCitySheet() {
  const detected = networkAt(location.here);
  const autoDetail = detected
    ? `Selon votre position : ${detected.city}`
    : location.here
      ? "Votre position n'est dans aucune ville couverte"
      : "Selon votre position, dès qu'elle est connue";
  const body = openSheet(
    "Ville",
    sheetOptions([
      { action: "pick-city", value: "auto", main: AUTOMATIC, detail: esc(autoDetail), pressed: prefs.city === "auto" },
      ...NETWORKS.map((n) => ({
        action: "pick-city",
        value: n.id,
        main: esc(n.city),
        detail: esc(n.name),
        pressed: prefs.city === n.id,
      })),
    ]) + sheetNote("D'autres villes arriveront."),
  );
  body.querySelector('[aria-pressed="true"]')?.focus();
}

// Les modes de la ville, sans choix automatique : le mode affiché est coché.
function openFeatureSheet() {
  const available = featuresFor(current.network);
  const body = openSheet(
    "Mode",
    sheetOptions(
      available.map((f) => ({
        action: "pick-feature",
        value: f.id,
        main: esc(f.title),
        detail: esc(f.description),
        pressed: current.feature?.id === f.id,
      })),
    ) + sheetNote("D'autres modes arriveront."),
  );
  body.querySelector('[aria-pressed="true"]')?.focus();
}

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-action]");
  const action = target?.dataset.action;
  if (action === "open-city") {
    openCitySheet();
  } else if (action === "open-feature") {
    openFeatureSheet();
  } else if (action === "pick-city" || action === "pick-feature") {
    prefs[action === "pick-city" ? "city" : "feature"] = target.dataset.value;
    savePrefs();
    closeSheet();
    mount();
    // Passer d'« Automatique » à la même ville ne remonte rien, mais change l'en-tête.
    paintChrome();
  }
});

// En mode automatique, une nouvelle position peut faire changer de ville.
location.subscribe(({ type }) => {
  if (type === "position" && prefs.city === "auto") mount();
});

// Mode test (local seulement) : un bandeau le rappelle, avec l'heure simulée et la sortie.
if (lab) {
  const bar = document.createElement("div");
  bar.className = "lab-banner";
  bar.innerHTML = `<span>Mode test${lab.clock != null ? ` · <span id="lab-clock"></span>` : ""}</span>
    <a href="lab/">Réglages</a>
    <button type="button" id="lab-quit">Quitter</button>`;
  document.body.prepend(bar);
  const paintClock = () => {
    const el = document.getElementById("lab-clock");
    if (el) el.textContent = `il est ${clock(now())}`;
  };
  paintClock();
  setInterval(paintClock, 10 * 1000);
  document.getElementById("lab-quit").addEventListener("click", () => {
    clearLab();
    globalThis.location.reload();
  });
}

// Thème de saison d'abord : la première image a déjà ses couleurs.
startSeason();
mount();

// Fichiers du site gardés sur le téléphone pour les visites suivantes (sw.js), une fois la page
// affichée. Pas sur le poste de développement, où le code change sans cesse (npm run serve).
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];
if ("serviceWorker" in navigator && !LOCAL_HOSTS.includes(globalThis.location.hostname)) {
  addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).catch(() => {});
  });
}
