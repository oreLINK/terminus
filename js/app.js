// Coquille de Terminus : choisit le réseau (la ville) et le type d'information,
// automatiquement ou à la main, puis monte le type d'information dans <main>.

import { NETWORKS, getNetwork, networkAt } from "./networks/index.js";
import { FEATURES, DEFAULT_FEATURE, featuresFor } from "./features/index.js";
import { location } from "./core/location.js";
import { openSheet, closeSheet } from "./core/sheet.js";
import { readJSON, writeJSON } from "./core/storage.js";
import { esc } from "./core/util.js";

const PREFS_KEY = "dt.prefs.v1"; // { city: "auto" | id, feature: "auto" | id, lastNetwork: id }

const root = document.getElementById("app");
const cityLabel = document.getElementById("picker-city");
const featureLabel = document.getElementById("picker-feature");
const footerSources = document.getElementById("footer-sources");

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

function paintChrome() {
  const { network, feature } = current;
  cityLabel.textContent = network.city;
  featureLabel.textContent = feature.short;
  footerSources.textContent = `${network.attribution} Adresses : Géoplateforme de l'IGN.`;
}

// ---------- Sélecteurs ----------

function optionHtml(action, value, main, detail, pressed) {
  return `
    <li>
      <button type="button" class="sheet-option" data-action="${action}" data-value="${esc(value)}" aria-pressed="${pressed}">
        <span class="sheet-option-main">${esc(main)}</span>
        <span class="sheet-option-detail">${esc(detail)}</span>
      </button>
    </li>`;
}

function openCitySheet() {
  const detected = networkAt(location.here);
  const autoDetail = detected
    ? `Selon votre position : ${detected.city}`
    : location.here
      ? "Votre position n'est dans aucune ville couverte"
      : "Selon votre position, dès qu'elle est connue";
  const body = openSheet(
    "Ville",
    `
    <ul class="sheet-options">
      ${optionHtml("pick-city", "auto", "Automatique", autoDetail, prefs.city === "auto")}
      ${NETWORKS.map((n) => optionHtml("pick-city", n.id, n.city, n.name, prefs.city === n.id)).join("")}
    </ul>
    <p class="sheet-text">D'autres villes arriveront.</p>`,
  );
  body.querySelector('[aria-pressed="true"]')?.focus();
}

function openFeatureSheet() {
  const available = featuresFor(current.network);
  const byDefault = FEATURES.find((f) => f.id === DEFAULT_FEATURE);
  const body = openSheet(
    "Information",
    `
    <ul class="sheet-options">
      ${optionHtml("pick-feature", "auto", "Automatique", byDefault.title, prefs.feature === "auto")}
      ${available.map((f) => optionHtml("pick-feature", f.id, f.title, f.description, prefs.feature === f.id)).join("")}
    </ul>
    <p class="sheet-text">D'autres informations arriveront.</p>`,
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
  }
});

// En mode automatique, une nouvelle position peut faire changer de ville.
location.subscribe(({ type }) => {
  if (type === "position" && prefs.city === "auto") mount();
});

mount();
