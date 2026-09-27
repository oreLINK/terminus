// Type d'information « Le dernier tram pour rentrer » : combien de temps avant de devoir partir
// à pied pour attraper le dernier tram direct qui ramène au domicile.

import { buildIndex, nearestStations, sharedLines, plan, SERVICE_GAP_MS } from "./planner.js";
import { createAddressField } from "../../core/address-field.js";
import { clock, distanceLabel, walkBetween, walkLink, esc } from "../../core/util.js";
import { openSheet, closeSheet } from "../../core/sheet.js";
import { location } from "../../core/location.js";
import { setComputing } from "../../core/computing.js";
import { getHome, saveHome } from "../../core/home.js";
import { covers } from "../../networks/index.js";

const REFRESH_MS = 30 * 1000;
const MOVE_THRESHOLD_M = 150;
const TICK_MS = 10 * 1000;
// Ton du compte à rebours : vert, puis orange sous 20 min, rouge sous 10 min, noir quand c'est trop tard.
const SOON_MIN = 20;
const URGENT_MIN = 10;
const PULSE_MIN = 5;

// Pictogrammes des trois blocs : une cible pour la position, l'avant d'un tram pour l'arrêt,
// une maison pour le domicile.
const ICONS = {
  here: `<svg class="trip-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"/></svg>`,
  stop: `<svg class="trip-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="15" rx="3"/><path d="M5 11h14M9 21l1.5-3M15 21l-1.5-3M10 6.5h4"/><circle cx="8.5" cy="14.5" r=".6"/><circle cx="15.5" cy="14.5" r=".6"/></svg>`,
  home: `<svg class="trip-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/></svg>`,
};

// Barre fine où glisse un segment, comme un tram sur sa ligne : visible pendant un calcul.
const PROGRESS = `<div class="progress" aria-hidden="true"></div>`;

export default {
  id: "last-ride",
  title: "Le dernier tram pour rentrer",
  short: "Dernier tram",
  description: "Combien de temps il vous reste avant de partir pour attraper le dernier tram vers chez vous.",
  mount,
};

function mount({ root, network, adapter }) {
  const state = {
    home: getHome(network),
    index: null,
    lineCodes: {},
    timer: null,
    busy: false,
    pending: false,
    pendingVisible: false,
    lastComputedFrom: null,
    pinnedOrigin: null, // id de la station choisie à la main, sinon choix automatique
    last: null, // dernier calcul : { result, origins, dests, now, partial }
    leaveBy: null, // heure limite affichée par le compte à rebours
    unmounted: false,
  };

  const area = network.area;

  // ---------- Écrans ----------

  // Premier écran, même sans domicile : le compteur attend et la carte Domicile invite à le renseigner.
  function showWaitingForHome() {
    state.last = null;
    renderScreen({
      hero: heroPending("Ajoutez votre domicile pour lancer le calcul."),
      station: { value: "En attente", detail: "Après le domicile" },
      meta: false,
    });
  }

  // Étape en cours (localisation, calcul) : l'écran principal reste en place, compteur en attente.
  function showMessage(title, text = "") {
    renderScreen({
      hero: heroPending(esc(title), esc(text)),
      station: { value: "Recherche…", detail: "Arrêts autour de vous" },
      meta: false,
    });
  }

  // Position inconnue ou hors du réseau : l'écran principal reste affiché, compteur en attente,
  // et le bloc Position invite à l'indiquer.
  function showLocationUnknown(reason, title = "Position inconnue") {
    state.last = null;
    renderScreen({
      hero: heroPending(esc(title), esc(reason)),
      station: { value: "En attente", detail: "Après votre position" },
      needPosition: true,
      meta: false,
    });
  }

  function showOutsideNetwork() {
    showLocationUnknown(
      `Choisissez une autre ville en haut de l'écran, ou indiquez une position à ${network.city}.`,
      `Vous êtes hors du réseau de ${network.city}`,
    );
  }

  function openPositionSheet(reason = location.issue ?? "Indiquez l'adresse ou le lieu d'où vous partez.") {
    const known = location.address?.label;
    const body = openSheet(
      "Votre position",
      `
      <div class="sheet-field"></div>
      <button type="button" class="button button-quiet" data-action="retry-gps">Utiliser ma localisation</button>
      <p class="sheet-text">${known ? `Actuellement : ${esc(known)}${location.here?.source === "gps" ? " (GPS)" : ""}` : esc(reason)}</p>`,
      { tall: true },
    );
    createAddressField(body.querySelector(".sheet-field"), {
      label: "Où êtes-vous ?",
      placeholder: "Adresse, lieu ou arrêt",
      area,
      types: "StreetAddress,PositionOfInterest",
      onSelect(address) {
        closeSheet();
        showMessage("Calcul du trajet…");
        state.lastComputedFrom = null;
        location.setManual(address); // l'abonnement ci-dessous lance le calcul
      },
    }).focus();
  }

  // ---------- Localisation ----------

  function start() {
    if (!state.home) return showWaitingForHome();
    state.lastComputedFrom = null;
    const here = location.here;
    if (here) {
      if (!covers(network, here)) showOutsideNetwork();
      else {
        showMessage("Calcul du trajet…");
        compute({ visible: true });
      }
    } else if (location.issue) {
      showLocationUnknown(location.issue);
    } else {
      showMessage("Recherche de votre position…", "Autorisez la localisation si le navigateur vous la demande.");
    }
    location.start();
    scheduleRefresh();
  }

  function onLocation({ type, here, issue }) {
    if (state.unmounted) return;
    if (type === "address") return paintPosition();
    if (!state.home) return;
    if (type === "issue") {
      if (!location.here) showLocationUnknown(issue);
      return;
    }
    if (!covers(network, here)) {
      state.lastComputedFrom = null;
      return showOutsideNetwork();
    }
    const moved = !state.lastComputedFrom || walkBetween(state.lastComputedFrom, here).straight > MOVE_THRESHOLD_M;
    if (moved) compute({ visible: true });
  }

  function scheduleRefresh() {
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (document.visibilityState === "visible") compute();
    }, REFRESH_MS);
  }

  function onVisibility() {
    if (document.visibilityState === "visible" && location.here) compute();
  }

  // ---------- Calcul ----------

  async function ensureStops() {
    if (state.index) return;
    const data = await adapter.loadStops();
    state.index = buildIndex(data.stops);
    state.lineCodes = Object.fromEntries(Object.values(data.lines).map((l) => [l.ref, l.code]));
  }

  // `visible` : calcul demandé par la personne (position saisie, actualisation, nouveau domicile)
  // ou premier calcul. Les rafraîchissements automatiques restent silencieux.
  async function compute({ visible = false } = {}) {
    const here = location.here;
    if (state.unmounted || !state.home || !here || !covers(network, here)) return;
    if (state.busy) {
      state.pending = true;
      state.pendingVisible ||= visible;
      return;
    }
    state.busy = true;
    const shown = visible || !state.lastComputedFrom;
    if (shown) setComputing(true, "Calcul du trajet…");
    try {
      await ensureStops();
      if (state.unmounted) return;

      if (walkBetween(here, state.home).straight < 300) {
        state.lastComputedFrom = here;
        state.last = null;
        return renderAtHome();
      }

      const origins = nearestStations(state.index.stations, here, { radius: 2000, min: 2, max: 8 });
      const dests = nearestStations(state.index.stations, state.home, { radius: 1500, min: 1, max: 5 });
      const lines = sharedLines(origins, dests);
      if (!lines.length) {
        state.lastComputedFrom = here;
        state.last = { result: { status: "noline", options: [] }, origins, dests, now: Date.now(), partial: false };
        return renderLast();
      }

      const settled = await Promise.allSettled(
        lines.flatMap((l) => ["0", "1"].map((dir) => adapter.loadTimetable(l, dir))),
      );
      if (state.unmounted) return;
      const failed = settled.filter((r) => r.status === "rejected");
      if (failed.length === settled.length) throw failed[0].reason;
      const journeys = settled.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);

      const now = Date.now();
      const result = plan({ origins, dests, journeys, index: state.index, lineCodes: state.lineCodes, now });
      state.lastComputedFrom = here;
      state.last = { result, origins, dests, now, partial: failed.length > 0 };
      renderLast();
    } catch (err) {
      if (!state.unmounted) renderError(err);
    } finally {
      state.busy = false;
      if (shown) setComputing(false);
      if (state.pending && !state.unmounted) {
        const again = state.pendingVisible;
        state.pending = false;
        state.pendingVisible = false;
        compute({ visible: again });
      }
    }
  }

  // ---------- Rendu ----------

  const badges = (codes) =>
    codes
      .map((c) => {
        const color = network.lineColors?.[c];
        const style = color ? ` style="--line: ${color}; --line-ink: ${network.lineInk ?? "#FFFFFF"}"` : "";
        return `<span class="line-badge"${style} aria-label="${esc(adapter.vehicle)} ${esc(c)}">${esc(c)}</span>`;
      })
      .join("");

  // Une option par station de départ, la plus rapide pour rentrer (les options arrivent triées).
  function optionsByOrigin(options) {
    const byOrigin = new Map();
    for (const o of options) if (!byOrigin.has(o.origin.station.id)) byOrigin.set(o.origin.station.id, o);
    return [...byOrigin.values()].sort((a, b) => a.origin.walk.meters - b.origin.walk.meters);
  }

  // L'arrêt choisi à la main s'il a encore un tram direct, sinon le choix automatique.
  function chosenOption(result) {
    const pinned = state.pinnedOrigin && result.options.find((o) => o.origin.station.id === state.pinnedOrigin);
    return pinned || result.primary || null;
  }

  const isPinned = (option) => option && option.origin.station.id === state.pinnedOrigin;
  const isEnded = (option, now) => option.next.dep - now > SERVICE_GAP_MS;

  // Contenu du bloc Position, d'après la position partagée et son adresse.
  function positionBlock() {
    const here = location.here;
    if (!here) {
      return location.issue || !state.home
        ? { value: "Non renseignée", detail: state.home ? "Touchez pour l'indiquer" : "Après le domicile" }
        : { value: "Recherche…", detail: "Localisation en cours" };
    }
    const name = location.address?.name;
    if (here.source === "manual") return { value: esc(name ?? here.label), detail: "Adresse saisie" };
    const acc = here.accuracy ? `, à ${distanceLabel(here.accuracy)} près` : "";
    return { value: name ? esc(name) : "Position GPS", detail: `GPS${acc}` };
  }

  function paintPosition() {
    const value = root.querySelector("#position-value");
    if (!value) return;
    const block = positionBlock();
    value.innerHTML = block.value;
    root.querySelector("#position-detail").innerHTML = covers(network, location.here) || !location.here ? block.detail : "Hors du réseau";
  }

  function setTone(el, tone) {
    el.classList.remove("tone-none", "tone-ok", "tone-soon", "tone-urgent", "tone-late");
    el.classList.add(`tone-${tone}`);
  }

  function heroCountdown(option) {
    const last = option.last;
    return `
      <section class="hero tone-ok" id="hero">
        <p class="hero-label" id="hero-label">Partez dans</p>
        <p class="countdown" id="countdown"></p>
        <p class="hero-sub">avant <strong class="hero-time">${clock(option.leaveBy)}</strong></p>
        <p class="hero-line">Dernier ${esc(adapter.vehicle)} ${badges([last.lineCode])} à ${clock(last.dep)}</p>
        ${
          last.depLive
            ? `<p class="hero-source is-live">Temps réel</p>`
            : `<p class="hero-source">Estimé sur l'horaire prévu</p>`
        }
        ${PROGRESS}
      </section>`;
  }

  function heroText(label, big, sub = "", extra = "", tone = "none") {
    return `
      <section class="hero hero-quiet tone-${tone}">
        <p class="hero-label">${esc(label)}</p>
        <p class="hero-big">${esc(big)}</p>
        ${sub ? `<p class="hero-sub">${sub}</p>` : ""}
        ${extra}
        ${PROGRESS}
      </section>`;
  }

  function heroPending(sub, note = "") {
    return `
      <section class="hero hero-quiet tone-none" role="status">
        <p class="hero-label">Partez dans</p>
        <p class="countdown countdown-empty" aria-hidden="true">–</p>
        <p class="hero-sub">${sub}</p>
        ${note ? `<p class="hero-note">${note}</p>` : ""}
        ${PROGRESS}
      </section>`;
  }

  function countdownHtml(minutes) {
    if (minutes < 1) return `<span class="countdown-word">maintenant</span>`;
    if (minutes < 60) return `${minutes}<span class="countdown-unit">min</span>`;
    const m = minutes % 60;
    return `${Math.floor(minutes / 60)}<span class="countdown-unit">h</span>${String(m).padStart(2, "0")}`;
  }

  // Met à jour le compte à rebours entre deux calculs, sans toucher au reste de l'écran.
  function paintCountdown() {
    const el = root.querySelector("#countdown");
    if (!el || state.leaveBy == null) return;
    const left = state.leaveBy - Date.now();
    // Heure limite dépassée de plus d'une minute : ce tram-là est perdu, en attendant le prochain calcul.
    const late = left < -60000;
    const minutes = Math.max(0, Math.floor(left / 60000));
    el.innerHTML = late ? `<span class="countdown-word">trop tard</span>` : countdownHtml(minutes);
    root.querySelector("#hero-label").textContent = late ? "Pour ce tram, c'est" : minutes < 1 ? "Partez" : "Partez dans";
    const hero = root.querySelector("#hero");
    setTone(hero, late ? "late" : minutes < URGENT_MIN ? "urgent" : minutes < SOON_MIN ? "soon" : "ok");
    hero.classList.toggle("is-pulsing", !late && minutes < PULSE_MIN);
  }

  function renderScreen({
    hero,
    station,
    homeDetail = "",
    now = Date.now(),
    partial = false,
    leaveBy = null,
    meta = true,
    needPosition = false,
  }) {
    state.leaveBy = leaveBy;
    // Ce qui manque pour calculer : d'abord le domicile, puis la position.
    const needs = !state.home ? "home" : needPosition ? "position" : null;
    const calloutText = {
      home: "Indiquez votre domicile pour savoir quand partir.",
      position: "Indiquez où vous êtes pour savoir quand partir.",
    };
    const home = state.home
      ? { value: esc(state.home.label.split(",")[0]), detail: homeDetail }
      : { value: "Non renseigné", detail: "Touchez pour indiquer votre adresse" };
    // L'annotation se place juste au-dessus de la ligne qui manque.
    const callout = (what) =>
      needs === what ? `<li class="trip-callout" id="callout">${calloutText[what]}</li>` : "";
    const row = (what, action, icon, label, value, detail, { link = "", ids = {} } = {}) => `
      <li class="trip-row trip-${what}${needs === what ? " is-missing" : ""}">
        <button type="button" class="trip-button" data-action="${action}" aria-haspopup="dialog"${
          needs === what ? ' aria-describedby="callout"' : ""
        }>
          <span class="trip-icon">${icon}</span>
          <span class="trip-text">
            <span class="trip-label">${label}</span>
            <span class="trip-value"${ids.value ? ` id="${ids.value}"` : ""}>${value}</span>
            <span class="trip-detail"${ids.detail ? ` id="${ids.detail}"` : ""}>${detail}</span>
          </span>
        </button>
        ${link}
      </li>`;
    root.innerHTML = `
      <div class="screen">
        ${hero}
        <ol class="trip" aria-label="Votre trajet">
          ${callout("position")}
          ${row("position", "open-position", ICONS.here, "Votre position", "", "", {
            ids: { value: "position-value", detail: "position-detail" },
          })}
          ${row("station", "open-station", ICONS.stop, "Arrêt proche", station.value, station.detail, {
            link: station.route
              ? `<a class="trip-link" href="${station.route}" target="_blank" rel="noopener">Itinéraire<span class="visually-hidden"> à pied jusqu'à l'arrêt (Google Maps)</span></a>`
              : "",
          })}
          ${callout("home")}
          ${row("home", "open-home", ICONS.home, "Domicile", home.value, home.detail)}
        </ol>
        ${partial ? `<p class="warning">Certaines lignes n'ont pas répondu : le résultat peut être incomplet.</p>` : ""}
        ${
          meta
            ? `<p class="meta">
                Mis à jour à ${clock(now)}.
                <button type="button" class="link-button" data-action="refresh">Actualiser</button>
              </p>`
            : ""
        }
      </div>`;
    paintPosition();
    paintCountdown();
  }

  function renderLast() {
    const { result, origins, dests, now, partial } = state.last;
    const option = chosenOption(result);
    const lostPin = state.pinnedOrigin && !isPinned(option);
    const night = network.nightHint ? ` ${network.nightHint}` : "";

    let hero;
    let leaveBy = null;
    if (option && !isEnded(option, now)) {
      hero = heroCountdown(option);
      leaveBy = option.leaveBy;
    } else if (option) {
      hero = heroText(
        "Service terminé",
        "Plus de tram ce soir",
        `Premier tram ${badges([option.next.lineCode])} vers chez vous à ${clock(option.next.dep)}.`,
        "",
        "late",
      );
    } else if (result.status === "missed") {
      hero = heroText(
        "Dernier tram manqué",
        "Trop tard à pied",
        `Le dernier tram direct part avant que vous puissiez rejoindre l'arrêt.${esc(night)}`,
        "",
        "late",
      );
    } else if (result.status === "over") {
      hero = heroText(
        "Service terminé",
        "Plus de tram ce soir",
        `Le dernier tram direct vers chez vous est parti.${esc(night)}`,
        "",
        "late",
      );
    } else if (result.status === "noline") {
      hero = heroText(
        "Pas de tram direct",
        "Aucune ligne commune",
        "Aucune ligne ne relie directement les arrêts proches de vous à ceux de chez vous. Les correspondances arriveront dans une prochaine version.",
      );
    } else {
      hero = heroText(
        "Aucun tram direct",
        "Plus de tram d'ici",
        `Aucun tram ne relie les arrêts proches de vous à chez vous d'ici la fin du service.${esc(night)}`,
      );
    }

    let station;
    if (option) {
      const how = isPinned(option) ? ", choisi par vous" : lostPin ? ", le vôtre n'a plus de tram" : "";
      station = {
        value: `${badges(option.lineCodes)} ${esc(option.origin.station.name)}`,
        detail: `${option.origin.walk.minutes} min à pied${how}`,
        route: walkLink(location.here, option.origin.station),
      };
    } else {
      const near = origins[0];
      const why = result.status === "over" ? "plus de tram ce soir" : "sans tram direct";
      station = near
        ? {
            value: esc(near.station.name),
            detail: `${near.walk.minutes} min à pied, ${why}`,
            route: walkLink(location.here, near.station),
          }
        : { value: "Aucun", detail: "" };
    }

    const dest = option?.dest ?? dests[0];
    const homeDetail = dest ? `Descente à ${esc(dest.station.name)}` : "";

    renderScreen({ hero, station, homeDetail, now, partial, leaveBy });
  }

  function renderAtHome() {
    renderScreen({
      hero: heroText("Vous y êtes", "À deux pas de chez vous"),
      station: { value: "Inutile", detail: "Vous êtes à moins de 300 m" },
    });
  }

  function renderError(err) {
    const text = err?.message || "Une erreur inattendue est survenue.";
    renderScreen({
      hero: heroText(
        "Horaires indisponibles",
        "Pas de réponse",
        esc(text),
        `<button type="button" class="button" data-action="refresh">Réessayer</button>`,
      ),
      station: { value: "Inconnu", detail: "Horaires indisponibles" },
    });
  }

  // ---------- Feuilles de réglage ----------

  function openStationSheet() {
    // Sans position, choisir un arrêt n'a pas de sens : on demande d'abord où vous êtes.
    if (state.home && !location.here) return openPositionSheet();
    const now = Date.now();
    const options = state.last ? optionsByOrigin(state.last.result.options) : [];
    const current = state.last ? chosenOption(state.last.result) : null;
    const auto = !isPinned(current);
    const primary = state.last?.result.primary;

    const item = (id, main, detail, pressed) => `
      <li>
        <button type="button" class="sheet-option" data-action="pick-station" data-station="${esc(id)}" aria-pressed="${pressed}">
          <span class="sheet-option-main">${main}</span>
          <span class="sheet-option-detail">${detail}</span>
        </button>
      </li>`;

    const items = options.map((o) =>
      item(
        o.origin.station.id,
        `${badges(o.lineCodes)} ${esc(o.origin.station.name)}`,
        `${o.origin.walk.minutes} min à pied, ${
          isEnded(o, now) ? `premier tram à ${clock(o.next.dep)}` : `partez avant ${clock(o.leaveBy)}`
        }`,
        !auto && o === current,
      ),
    );

    const body = openSheet(
      "Arrêt de départ",
      `
      ${
        options.length
          ? `<ul class="sheet-options">
              ${item("", "Automatique", `L'arrêt qui vous ramène le plus tôt${primary ? `, ${esc(primary.origin.station.name)}` : ""}`, auto)}
              ${items.join("")}
            </ul>`
          : `<p class="sheet-text">${
              !state.home
                ? "Indiquez d'abord votre domicile : l'arrêt dépend de l'endroit où vous rentrez."
                : state.last
                  ? "Aucun arrêt proche n'a de tram direct vers chez vous."
                  : "Recherche des arrêts autour de vous…"
            }</p>`
      }
      ${
        current && location.here
          ? `<a class="sheet-link" href="${walkLink(location.here, current.origin.station)}" target="_blank" rel="noopener">Itinéraire à pied jusqu'à ${esc(current.origin.station.name)}</a>`
          : ""
      }
      <button type="button" class="button button-quiet" data-action="manual-origin">Je ne suis pas ici</button>`,
    );
    body.querySelector('[aria-pressed="true"]')?.focus();
  }

  function openHomeSheet() {
    const dest = state.last && chosenOption(state.last.result)?.dest;
    const body = openSheet(
      "Adresse du domicile",
      `
      <div class="sheet-field"></div>
      <p class="sheet-text">${
        state.home
          ? `Actuellement : ${esc(state.home.label)}`
          : "Terminus cherche le tram qui vous ramène au plus près de chez vous. Votre adresse reste enregistrée dans ce navigateur uniquement."
      }</p>
      ${
        dest
          ? `<a class="sheet-link" href="${walkLink(dest.station, state.home)}" target="_blank" rel="noopener">Itinéraire à pied depuis ${esc(dest.station.name)}</a>`
          : ""
      }`,
      { tall: true },
    );
    const field = createAddressField(body.querySelector(".sheet-field"), {
      label: state.home ? "Nouvelle adresse" : "Votre adresse",
      placeholder: `Ex. ${area.addressExample}`,
      area,
      types: "StreetAddress",
      hint: state.home
        ? `Adresses de ${area.label} uniquement. Elle reste enregistrée dans ce navigateur.`
        : `Adresses de ${area.label} uniquement.`,
      onSelect(address) {
        state.home = saveHome(network, address);
        closeSheet();
        start();
      },
    });
    if (!state.home) field.focus();
  }

  // ---------- Actions ----------

  function onClick(e) {
    const target = e.target.closest("[data-action]");
    const action = target?.dataset.action;
    if (!action) return;
    if (action === "open-station") {
      openStationSheet();
    } else if (action === "open-position") {
      openPositionSheet();
    } else if (action === "open-home") {
      openHomeSheet();
    } else if (action === "pick-station") {
      state.pinnedOrigin = target.dataset.station || null;
      closeSheet();
      if (state.last) renderLast();
    } else if (action === "refresh") {
      adapter.clearCache?.();
      if (location.here) compute({ visible: true });
      else start();
    } else if (action === "manual-origin") {
      openPositionSheet();
    } else if (action === "retry-gps") {
      closeSheet();
      location.reset();
      start();
    }
  }

  // ---------- Montage ----------

  const tick = setInterval(paintCountdown, TICK_MS);
  const unsubscribe = location.subscribe(onLocation);
  document.addEventListener("click", onClick);
  document.addEventListener("visibilitychange", onVisibility);
  start();

  return {
    unmount() {
      state.unmounted = true;
      clearInterval(tick);
      clearInterval(state.timer);
      unsubscribe();
      document.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
      setComputing(false);
    },
  };
}
