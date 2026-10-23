// Champ d'adresse avec suggestions : combobox ARIA, clavier et tactile.
// Suggestions en deux temps : d'abord les lieux connus et les stations du réseau (js/core/place-search.js,
// sans appel, dès 2 lettres), puis les adresses de l'IGN en dessous (dès 3 lettres, après 250 ms sans
// frappe). Un pictogramme distingue lieu, station et adresse.

import { suggestAddresses, reverseAddress } from "./geocode.js";
import { buildPlaceIndex, searchPlaces } from "./place-search.js";
import { esc } from "./util.js";
import { icon } from "./icons.js";

const LOCAL_MIN = 2; // lettres avant les lieux et stations (instantanés, sans appel)
const REMOTE_MIN = 3; // lettres avant les adresses de l'IGN
const LOCAL_MAX = 5;
const COMMUNE_WAIT_MS = 1500; // commune d'une station (zones à la demande) : au plus cette attente
const GLYPH = { place: "landmark", station: "station", address: "pin" };
const KIND_LABEL = { place: "Lieu", station: "Station", address: "Adresse" };

let uid = 0;

// Index des lieux et stations d'une zone, préparé une fois, au premier mot tapé (null : la zone n'en a pas).
const indexes = new WeakMap();
function localIndex(area) {
  if (!area?.places && !area?.stations) return null;
  if (!indexes.has(area)) {
    const places = area.places ? area.places().catch(() => []) : [];
    const stops = area.stations ? area.stations().catch(() => null) : null;
    indexes.set(area, Promise.all([places, stops]).then(([p, s]) => buildPlaceIndex({ places: p, stops: s })));
  }
  return indexes.get(area);
}

// Commune d'un point, d'après l'adresse la plus proche (« … 33150 Cenon » → « Cenon »), ou null.
async function communeAt(point) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), COMMUNE_WAIT_MS);
  try {
    const found = await reverseAddress(point, { signal: ctrl.signal });
    return /\b\d{5}\s+(.+)$/.exec(found?.label ?? "")?.[1] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function createAddressField(host, { label, placeholder, area, types, hint = "", onSelect }) {
  const id = `addr${++uid}`;
  host.innerHTML = `
    <div class="field">
      <label class="field-label" for="${id}">${esc(label)}</label>
      <div class="combo">
        <input id="${id}" class="field-input" type="text" inputmode="search" enterkeyhint="search"
          role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list"
          aria-describedby="${id}-hint" autocomplete="off" autocapitalize="off" spellcheck="false"
          placeholder="${esc(placeholder)}">
        <ul id="${id}-list" class="suggestions" role="listbox" aria-label="Lieux, stations et adresses proposés" hidden></ul>
      </div>
      <p id="${id}-hint" class="field-hint" aria-live="polite">${esc(hint)}</p>
    </div>`;

  const input = host.querySelector("input");
  const list = host.querySelector("ul");
  const hintEl = host.querySelector(".field-hint");
  let items = [];
  let local = [];
  let remote = [];
  let remoteState = "idle"; // idle | waiting | done | failed
  let active = -1;
  let timer = null;
  let controller = null;
  let seq = 0; // numéro de la frappe : une réponse d'une frappe précédente est ignorée

  const setHint = (text) => (hintEl.textContent = text);

  function close() {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    active = -1;
  }

  function highlight(i) {
    active = i;
    [...list.children].forEach((li, n) => li.setAttribute("aria-selected", String(n === i)));
    if (i >= 0) {
      input.setAttribute("aria-activedescendant", `${id}-opt${i}`);
      list.children[i].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function render() {
    list.innerHTML = items
      .map(
        (a, i) => `<li id="${id}-opt${i}" role="option" aria-selected="false" data-i="${i}" class="suggestion is-${a.kind}">
          ${icon(GLYPH[a.kind] ?? "pin", "suggestion-glyph")}
          <span class="suggestion-text"><span class="visually-hidden">${KIND_LABEL[a.kind] ?? ""} : </span><span class="suggestion-main">${esc(a.label)}</span>${a.detail ? `<span class="suggestion-detail">${esc(a.detail)}</span>` : ""}</span>
        </li>`,
      )
      .join("");
    list.hidden = !items.length;
    input.setAttribute("aria-expanded", String(items.length > 0));
    active = -1;
  }

  // Lieux et stations d'abord, puis les adresses qui ne les répètent pas.
  function show() {
    const known = new Set(local.map((l) => l.label.toLowerCase()));
    items = [...local, ...remote.filter((r) => !known.has(r.label.toLowerCase()))];
    render();
    if (remoteState === "failed" && !items.length) setHint("La recherche d'adresse ne répond pas. Vérifiez votre connexion puis réessayez.");
    else if (remoteState === "done" && !items.length) setHint(`Aucune adresse trouvée (${area.label}). Essayez avec le nom de la commune.`);
    else setHint("");
  }

  async function choose(i) {
    const item = items[i];
    if (!item) return;
    input.value = item.label;
    close();
    setHint("");
    // Une station ne dit pas sa commune : l'adresse la plus proche la donne (zones à la demande).
    const commune = item.commune ?? (item.kind === "station" ? await communeAt(item) : null);
    onSelect({ label: item.label, lat: item.lat, lon: item.lon, kind: item.kind, ...(commune ? { commune } : {}) });
  }

  async function searchRemote(text, mine) {
    controller?.abort();
    controller = new AbortController();
    try {
      const found = await suggestAddresses(text, { area, types, signal: controller.signal });
      if (mine !== seq) return;
      remote = found.map((a) => ({ ...a, kind: "address" }));
      remoteState = "done";
    } catch (err) {
      if (err.name === "AbortError" || mine !== seq) return;
      remote = [];
      remoteState = "failed";
    }
    show();
  }

  input.addEventListener("input", () => {
    clearTimeout(timer);
    controller?.abort();
    const mine = ++seq;
    const text = input.value.trim();
    remote = [];
    remoteState = "idle";
    if (text.length < LOCAL_MIN) {
      local = [];
      items = [];
      render();
      setHint(hint);
      return;
    }
    const index = localIndex(area);
    if (index) {
      index.then((idx) => {
        if (mine !== seq) return;
        local = searchPlaces(idx, text, { max: LOCAL_MAX });
        show();
      });
    } else {
      local = [];
    }
    if (text.length >= REMOTE_MIN) {
      remoteState = "waiting";
      timer = setTimeout(() => searchRemote(text, mine), 250);
    } else if (!index) {
      show();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      if (list.hidden) render();
      highlight((active + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      highlight(active <= 0 ? items.length - 1 : active - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) choose(active);
      else if (items.length === 1) choose(0);
    } else if (e.key === "Escape") {
      close();
    }
  });

  // mousedown plutôt que click : le choix se fait avant que le champ perde le focus.
  list.addEventListener("mousedown", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    e.preventDefault();
    choose(Number(li.dataset.i));
  });

  input.addEventListener("blur", () => setTimeout(close, 120));

  return { focus: () => input.focus() };
}
