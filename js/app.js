// Coquille de Terminus : choisit le réseau (la ville) et le type d'information,
// automatiquement ou à la main, puis monte le type d'information dans <main>.

import { NETWORKS, getNetwork, networkAt } from "./networks/index.js";
import { FEATURES, DEFAULT_FEATURE, featuresFor } from "./features/index.js";
import { location } from "./core/location.js";
import { openSheet, closeSheet, sheetOptions, sheetNote, boltSvg, AUTOMATIC } from "./core/sheet.js";
import { readJSON, writeJSON } from "./core/storage.js";
import { esc } from "./core/util.js";

const PREFS_KEY = "dt.prefs.v1"; // { city: "auto" | id, feature: "auto" | id, lastNetwork: id }

const root = document.getElementById("app");
const cityButton = document.getElementById("picker-city-button");
const cityLabel = document.getElementById("picker-city");
const featureLabel = document.getElementById("picker-feature");


const prefs = { city: "auto", feature: "auto", lastNetwork: null, ...readJSON(PREFS_KEY) };
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

// Type d'information : celui choisi à la main s'il existe sur ce réseau, sinon le type par défaut.
function resolveFeature(network) {
  const available = featuresFor(network);
  if (prefs.feature !== "auto") {
    const chosen = available.find((f) => f.id === prefs.feature);
    if (chosen) return chosen;
  }
  return available.find((f) => f.id === DEFAULT_FEATURE) ?? available[0];
}

// Monte le bon type d'information ; ne fait rien si rien n'a changé.
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
  featureLabel.textContent = `Information : ${feature.short}`;
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

function openFeatureSheet() {
  const available = featuresFor(current.network);
  const byDefault = FEATURES.find((f) => f.id === DEFAULT_FEATURE);
  const body = openSheet(
    "Information",
    sheetOptions([
      {
        action: "pick-feature",
        value: "auto",
        main: AUTOMATIC,
        detail: esc(byDefault.title),
        pressed: prefs.feature === "auto",
      },
      ...available.map((f) => ({
        action: "pick-feature",
        value: f.id,
        main: esc(f.title),
        detail: esc(f.description),
        pressed: prefs.feature === f.id,
      })),
    ]) + sheetNote("D'autres informations arriveront."),
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

mount();
