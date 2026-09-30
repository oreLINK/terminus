// Type d'information « Le dernier tram pour rentrer » : combien de temps avant de devoir partir
// à pied pour attraper le dernier tram qui ramène au domicile, directement ou avec correspondance.

import { buildIndex, nearestStations, candidateLines, routeRequests, plan, serviceEndAfter, SERVICE_GAP_MS, WALK_MARGIN_MS } from "./planner.js";
import { createAddressField } from "../../core/address-field.js";
import { clock, walkBetween, walkLink, esc } from "../../core/util.js";
import { openSheet, closeSheet, sheetOptions, sheetCurrent, sheetAction, sheetActions, sheetNote, AUTOMATIC } from "../../core/sheet.js";
import { location } from "../../core/location.js";
import { setComputing } from "../../core/computing.js";
import { setAmbient } from "../../core/ambient.js";
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
  home: `<svg class="trip-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/></svg>`,
  go: `<svg class="route-go-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4 4 11l7 2 2 7 7-16Z"/></svg>`,
  refresh: `<svg class="meta-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>`,
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
    graph: undefined, // graphe du réseau : undefined tant qu'il n'est pas chargé, null s'il n'y en a pas
    lineCodes: {},
    timer: null,
    busy: false,
    pending: false,
    pendingVisible: false,
    lastComputedFrom: null,
    pinnedOption: null, // clé de l'option choisie à la main (arrêt et correspondances), sinon automatique
    last: null, // dernier calcul : { result, origins, dests, now, partial }
    leaveBy: null, // heure limite affichée par le compte à rebours
    countdownHtml: null, // dernière valeur affichée, pour animer le passage d'une minute
    entered: false, // l'écran est apparu une fois : les rendus suivants ne rejouent pas l'apparition
    unmounted: false,
  };

  const area = network.area;

  // ---------- Écrans ----------

  // Premier écran, même sans domicile : le compteur attend et la carte Domicile invite à le renseigner.
  function showWaitingForHome() {
    state.last = null;
    renderScreen({
      hero: heroPending("Ajoutez votre domicile pour lancer le calcul."),
      meta: false,
    });
  }

  // Étape en cours (localisation, calcul) : l'écran principal reste en place, compteur en attente.
  function showMessage(title, text = "") {
    renderScreen({
      hero: heroPending(esc(title), esc(text)),
      meta: false,
    });
  }

  // Position inconnue ou hors du réseau : l'écran principal reste affiché, compteur en attente,
  // et le bloc Position invite à l'indiquer.
  function showLocationUnknown(reason, title = "Position inconnue") {
    state.last = null;
    renderScreen({
      hero: heroPending(esc(title), esc(reason)),
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
      `<div class="sheet-field"></div>
      ${known ? sheetCurrent(location.here?.source === "gps" ? "Actuellement, selon le GPS" : "Actuellement", known) : sheetNote(reason)}
      ${sheetActions(sheetAction({ icon: "locate", label: "Utiliser ma localisation", action: "retry-gps" }))}`,
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

  // Graphe du réseau (ordre des arrêts par ligne et par sens), chargé une fois. Absent ou en
  // échec : null, et les horaires sont chargés sans lui.
  async function ensureGraph() {
    if (state.graph !== undefined) return;
    try {
      state.graph = (await adapter.loadGraph?.()) ?? null;
    } catch {
      state.graph = null;
    }
  }

  const bothWays = (lines) => lines.flatMap((line) => ["0", "1"].map((direction) => ({ line, direction })));

  // Horaires à charger, par paliers du plus léger au réseau entier : le calcul s'arrête au premier
  // palier qui donne un trajet. Avec le graphe : le trajet le plus simple, puis une correspondance
  // de plus. Sans graphe : les lignes des deux côtés. Le dernier palier rattrape un graphe périmé.
  function loadStages(origins, dests) {
    const all = bothWays(Object.keys(state.lineCodes));
    if (!state.graph) return [bothWays(candidateLines(origins, dests)), all];
    const args = { graph: state.graph, index: state.index, origins, dests };
    return [routeRequests(args), routeRequests({ ...args, extraTransfers: 1 }), all];
  }

  // Les courses des (ligne, sens) demandés. Un échec partiel est signalé
  // sans bloquer ; si rien ne répond, l'erreur remonte.
  async function loadJourneys(requests) {
    const settled = await Promise.allSettled(requests.map((r) => adapter.loadTimetable(r.line, r.direction)));
    const failed = settled.filter((r) => r.status === "rejected");
    if (settled.length && failed.length === settled.length) throw failed[0].reason;
    return { journeys: settled.filter((r) => r.status === "fulfilled").flatMap((r) => r.value), failed: failed.length };
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
      await Promise.all([ensureStops(), ensureGraph()]);
      if (state.unmounted) return;

      if (walkBetween(here, state.home).straight < 300) {
        state.lastComputedFrom = here;
        state.last = null;
        return renderAtHome();
      }

      const origins = nearestStations(state.index.stations, here, { radius: 2000, min: 2, max: 8 });
      const dests = nearestStations(state.index.stations, state.home, { radius: 1500, min: 1, max: 5 });
      const loaded = new Set();
      let journeys = [];
      let failed = 0;
      let result = null;
      let now = Date.now();
      for (const stage of loadStages(origins, dests)) {
        const todo = stage.filter((r) => !loaded.has(`${r.line}|${r.direction}`));
        if (result && !todo.length) continue;
        for (const r of todo) loaded.add(`${r.line}|${r.direction}`);
        const got = await loadJourneys(todo);
        if (state.unmounted) return;
        journeys = journeys.concat(got.journeys);
        failed += got.failed;
        now = Date.now();
        const serviceEnd =
          adapter.serviceEndHour == null
            ? Infinity
            : serviceEndAfter(now, { timeZone: network.timeZone, hour: adapter.serviceEndHour });
        result = plan({ origins, dests, journeys, index: state.index, lineCodes: state.lineCodes, now, serviceEnd });
        if (result.options.length) break;
      }

      state.lastComputedFrom = here;
      state.last = { result, origins, dests, now, partial: failed > 0 };
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

  // Les options de la feuille Arrêt : de la plus proche à la plus lointaine, direct d'abord.
  const optionsByWalk = (options) =>
    [...options].sort((a, b) => a.origin.walk.meters - b.origin.walk.meters || a.transfers - b.transfers);

  // L'option choisie à la main si elle ramène encore au domicile, sinon le choix automatique.
  function chosenOption(result) {
    const pinned = state.pinnedOption && result.options.find((o) => o.key === state.pinnedOption);
    return pinned || result.primary || null;
  }

  const isPinned = (option) => option && option.key === state.pinnedOption;

  const transfersLabel = (n) => (n === 0 ? "direct" : n === 1 ? "1 correspondance" : `${n} correspondances`);

  // Itinéraire du dernier trajet, à la manière d'un calculateur d'itinéraire : une colonne d'heures,
  // un tracé (pointillé à pied, plein à la couleur de la ligne en tram) et les étapes.
  function routeHtml(option) {
    const trip = option.last;
    const legs = trip.legs;
    const final = legs[legs.length - 1];
    const lineColor = (code) => network.lineColors?.[code] ?? "var(--ink)";
    const seg = (kind) =>
      kind === "walk"
        ? `<span class="rail-seg is-walk"></span>`
        : kind
          ? `<span class="rail-seg" style="--seg: ${lineColor(kind)}"></span>`
          : `<span class="rail-seg"></span>`;
    const step = ({ time = "", top = null, bottom = null, dot = "", dotLine = null, kind = "stop", body, action = "" }) => `
      <li class="route-step is-${kind}">
        <span class="route-time">${time}</span>
        <span class="route-rail" aria-hidden="true">${seg(top)}${
          dot ? `<span class="rail-dot ${dot}"${dotLine ? ` style="--dot: ${lineColor(dotLine)}"` : ""}></span>` : ""
        }${seg(bottom)}</span>
        <span class="route-body">${body}</span>
        ${action}
      </li>`;
    const walkTo = walkLink(location.here, option.origin.station);
    const walkHome = walkLink(trip.dest.station, state.home);
    const minutes = (a, b) => Math.max(1, Math.round((b - a) / 60000));

    const steps = [
      step({
        time: clock(option.leaveBy),
        bottom: "walk",
        dot: "is-start",
        kind: "walk",
        // Durée de marche marge comprise : c'est l'écart réel entre l'heure limite et le tram.
        body: `À pied, ${option.origin.walk.minutes + WALK_MARGIN_MS / 60000} min`,
      }),
    ];
    legs.forEach((leg, i) => {
      const before = i === 0 ? "walk" : legs[i - 1].lineCode;
      const note =
        i === 0
          ? isPinned(option)
            ? `<span class="route-note">choisi par vous</span>`
            : ""
          : `<span class="route-note">correspondance</span>`;
      // L'arrêt de départ se touche pour en choisir un autre (feuille Arrêt de départ).
      const name =
        i === 0
          ? `<button type="button" class="route-stop route-stop-button" data-action="open-station" aria-haspopup="dialog">${esc(leg.from.name)}<span class="visually-hidden">, changer d'arrêt</span></button>`
          : `<strong class="route-stop">${esc(leg.from.name)}</strong>`;
      steps.push(
        step({
          time: clock(leg.dep),
          top: before,
          bottom: leg.lineCode,
          dot: "is-stop",
          dotLine: leg.lineCode,
          body: `${name} ${note}`,
          // Depuis la position actuelle jusqu'à l'arrêt de départ, dans Google Maps.
          action:
            i === 0
              ? `<a class="route-go" href="${walkTo}" target="_blank" rel="noopener" aria-label="Itinéraire à pied jusqu'à ${esc(leg.from.name)} (Google Maps)">${ICONS.go}</a>`
              : "",
        }),
        step({
          top: leg.lineCode,
          bottom: leg.lineCode,
          kind: "ride",
          body: `${badges([leg.lineCode])} vers ${esc(leg.headsign)}, ${minutes(leg.dep, leg.arr)} min`,
        }),
      );
    });
    steps.push(
      step({
        time: clock(final.arr),
        top: final.lineCode,
        bottom: "walk",
        dot: "is-stop",
        dotLine: final.lineCode,
        body: `<strong class="route-stop">${esc(final.to.name)}</strong>`,
      }),
      step({
        time: clock(trip.arrHome),
        top: "walk",
        dot: "is-end",
        kind: "home",
        body: `Domicile, ${trip.dest.walk.minutes} min à pied`,
        // De la station d'arrivée jusqu'au domicile, dans Google Maps : le pendant du bouton de départ.
        action: `<a class="route-go" href="${walkHome}" target="_blank" rel="noopener" aria-label="Itinéraire à pied de ${esc(final.to.name)} jusqu'au domicile (Google Maps)">${ICONS.go}</a>`,
      }),
    );
    return `<ol class="route" aria-label="Itinéraire du dernier trajet">${steps.join("")}</ol>`;
  }

  const isEnded = (option, now) => option.next.dep - now > SERVICE_GAP_MS;

  // Valeur de la colonne Position, d'après la position partagée et son adresse.
  function positionValue() {
    const here = location.here;
    if (!here) return location.issue || !state.home ? "Non renseignée" : "Recherche…";
    if (!covers(network, here)) return "Hors du réseau";
    const name = location.address?.name;
    if (here.source === "manual") return esc(name ?? here.label);
    return name ? esc(name) : "Position GPS";
  }

  function paintPosition() {
    const value = root.querySelector("#position-value");
    if (!value) return;
    value.innerHTML = positionValue();
  }

  // Le ton colore les chiffres du compteur et toute la fenêtre (fond d'ambiance).
  function setTone(el, tone, pulsing = false) {
    el.classList.remove("tone-none", "tone-ok", "tone-soon", "tone-urgent", "tone-late");
    el.classList.add(`tone-${tone}`);
    setAmbient(tone, { pulsing });
  }

  // Depuis le même arrêt, l'option qui laisse partir le plus tard, si c'est au moins 2 min plus tard
  // (en général : avec une correspondance). Les autres arrêts restent dans la feuille Arrêt.
  function laterFromSameStop(option, options) {
    const best = options
      .filter((o) => o !== option && o.origin.station.id === option.origin.station.id)
      .reduce((b, o) => (!b || o.leaveBy > b.leaveBy ? o : b), null);
    return best && best.leaveBy - option.leaveBy >= 2 * 60000 ? best : null;
  }

  function heroCountdown(option, later) {
    const last = option.last;
    return `
      <section class="hero glass tone-ok" id="hero">
        <div class="hero-head">
          <p class="hero-label" id="hero-label">Partez dans</p>
          <p class="countdown" id="countdown"></p>
          <p class="hero-sub">avant <strong class="hero-time">${clock(option.leaveBy)}</strong></p>
          ${
            last.depLive
              ? `<p class="hero-source is-live">Temps réel</p>`
              : `<p class="hero-source">Estimé sur l'horaire prévu</p>`
          }
        </div>
        <div class="hero-route">
          ${routeHtml(option)}
          ${
            later
              ? `<button type="button" class="hero-later" data-action="pick-option" data-value="${esc(later.key)}">${
                  later.transfers ? "Avec correspondance" : "En direct"
                } : avant ${clock(later.leaveBy)}</button>`
              : ""
          }
        </div>
        ${PROGRESS}
      </section>`;
  }

  function heroText(label, big, sub = "", extra = "", tone = "none") {
    return `
      <section class="hero glass hero-quiet tone-${tone}">
        <p class="hero-label">${esc(label)}</p>
        <p class="hero-big">${esc(big)}</p>
        ${sub ? `<p class="hero-sub">${sub}</p>` : ""}
        ${extra}
        ${PROGRESS}
      </section>`;
  }

  function heroPending(sub, note = "") {
    return `
      <section class="hero glass hero-quiet tone-none" role="status">
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
    const html = late ? `<span class="countdown-word">trop tard</span>` : countdownHtml(minutes);
    el.innerHTML = html;
    // La valeur change (nouvelle minute) : les chiffres glissent en place.
    if (state.countdownHtml && state.countdownHtml !== html) {
      el.classList.remove("is-ticking");
      void el.offsetWidth;
      el.classList.add("is-ticking");
    }
    state.countdownHtml = html;
    root.querySelector("#hero-label").textContent = late ? "Pour ce tram, c'est" : minutes < 1 ? "Partez" : "Partez dans";
    const hero = root.querySelector("#hero");
    const pulsing = !late && minutes < PULSE_MIN;
    setTone(hero, late ? "late" : minutes < URGENT_MIN ? "urgent" : minutes < SOON_MIN ? "soon" : "ok", pulsing);
    hero.classList.toggle("is-pulsing", pulsing);
  }

  function renderScreen({
    hero,
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
      ? esc(state.home.label.split(",")[0])
      : "Non renseigné";
    // Deux colonnes côte à côte, d'où vous partez et où vous rentrez. L'annotation, au-dessus de la bande,
    // pointe vers la colonne qui manque (--col : 0 position, 1 domicile).
    const callout = needs
      ? `<p class="trip-callout" id="callout" style="--col: ${needs === "position" ? 0 : 1}">${calloutText[needs]}</p>`
      : "";
    // Deux lignes par colonne : l'intitulé et la valeur. Le reste (marche, descente) est dans l'itinéraire.
    const col = (what, action, icon, label, value, id = "") => `
      <li class="trip-col trip-${what}${needs === what ? " is-missing" : ""}">
        <button type="button" class="trip-button" data-action="${action}" aria-haspopup="dialog"${
          needs === what ? ' aria-describedby="callout"' : ""
        }>
          <span class="trip-icon">${icon}</span>
          <span class="trip-label">${label}</span>
          <span class="trip-value"${id ? ` id="${id}"` : ""}>${value}</span>
        </button>
      </li>`;
    root.innerHTML = `
      <div class="screen${state.entered ? "" : " is-entering"}">
        ${hero}
        ${callout}
        <ol class="trip" aria-label="Votre trajet">
          ${col("position", "open-position", ICONS.here, "Position", "", "position-value")}
          ${col("home", "open-home", ICONS.home, "Domicile", home)}
        </ol>
        ${partial ? `<p class="warning">Certaines lignes n'ont pas répondu : le résultat peut être incomplet.</p>` : ""}
        ${
          meta
            ? `<p class="meta">Mis à jour à ${clock(now)}</p>`
            : ""
        }
      </div>`;
    // Ton de l'écran affiché ; le compte à rebours le précise ensuite toutes les 10 s.
    const tone = root.querySelector(".hero")?.className.match(/tone-(\w+)/)?.[1] ?? "none";
    setAmbient(tone);
    state.entered = true;
    // Actualiser : en haut à droite de la tuile, pictogramme seul. La flèche tourne tant que le
    // calcul demandé est en cours (classe is-computing sur <body>, js/core/computing.js).
    if (meta) {
      root
        .querySelector(".hero")
        ?.insertAdjacentHTML(
          "afterbegin",
          `<button type="button" class="hero-refresh" data-action="refresh" aria-label="Actualiser les horaires">${ICONS.refresh}</button>`,
        );
    }
    paintPosition();
    paintCountdown();
  }

  function renderLast() {
    const { result, now, partial } = state.last;
    const option = chosenOption(result);
    const night = network.nightHint ? ` ${network.nightHint}` : "";

    let hero;
    let leaveBy = null;
    if (option && !isEnded(option, now)) {
      hero = heroCountdown(option, isPinned(option) ? null : laterFromSameStop(option, result.options));
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
        `Le dernier tram vers chez vous part avant que vous puissiez rejoindre l'arrêt.${esc(night)}`,
        "",
        "late",
      );
    } else if (result.status === "over") {
      hero = heroText(
        "Service terminé",
        "Plus de tram ce soir",
        `Le dernier tram vers chez vous est parti.${esc(night)}`,
        "",
        "late",
      );
    } else {
      hero = heroText(
        "Aucun tram",
        "Plus de tram d'ici",
        `Aucun tram ne relie les arrêts proches de vous à chez vous d'ici la fin du service, même avec correspondance.${esc(night)}`,
      );
    }

    renderScreen({ hero, now, partial, leaveBy });
  }

  function renderAtHome() {
    renderScreen({
      hero: heroText("Vous y êtes", "À deux pas de chez vous"),
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
    });
  }

  // ---------- Feuilles de réglage ----------

  function openStationSheet() {
    // Sans position, choisir un arrêt n'a pas de sens : on demande d'abord où vous êtes.
    if (state.home && !location.here) return openPositionSheet();
    const now = Date.now();
    const options = state.last ? optionsByWalk(state.last.result.options) : [];
    const current = state.last ? chosenOption(state.last.result) : null;
    const auto = !isPinned(current);
    const primary = state.last?.result.primary;

    const choices = [
      {
        action: "pick-option",
        value: "",
        main: AUTOMATIC,
        detail: `L'arrêt qui vous ramène le plus tôt${primary ? `, ${esc(primary.origin.station.name)}` : ""}`,
        pressed: auto,
      },
      ...options.map((o) => ({
        action: "pick-option",
        value: o.key,
        main: `${badges(o.lineCodes)} ${esc(o.origin.station.name)}`,
        detail: `${o.origin.walk.minutes} min à pied, ${transfersLabel(o.transfers)}, ${
          isEnded(o, now) ? `premier tram à ${clock(o.next.dep)}` : `partez avant ${clock(o.leaveBy)}`
        }`,
        pressed: !auto && o === current,
      })),
    ];

    const body = openSheet(
      "Arrêt de départ",
      `${
        options.length
          ? sheetOptions(choices)
          : sheetNote(
              !state.home
                ? "Indiquez d'abord votre domicile : l'arrêt dépend de l'endroit où vous rentrez."
                : state.last
                  ? "Aucun arrêt proche n'a de tram vers chez vous, même avec correspondance."
                  : "Recherche des arrêts autour de vous…",
            )
      }
      ${sheetActions(
        current && location.here
          ? sheetAction({
              icon: "go",
              label: `Itinéraire à pied jusqu'à ${current.origin.station.name}`,
              href: walkLink(location.here, current.origin.station),
            })
          : "",
        sheetAction({ icon: "pin", label: "Je ne suis pas ici", action: "manual-origin" }),
      )}`,
    );
    body.querySelector('[aria-pressed="true"]')?.focus();
  }

  function openHomeSheet() {
    const dest = state.last && chosenOption(state.last.result)?.dest;
    const body = openSheet(
      "Adresse du domicile",
      `<div class="sheet-field"></div>
      ${
        state.home
          ? sheetCurrent("Actuellement", state.home.label)
          : sheetNote(
              "Terminus cherche le tram qui vous ramène au plus près de chez vous. Votre adresse reste enregistrée dans ce navigateur uniquement.",
            )
      }
      ${
        dest
          ? sheetActions(
              sheetAction({
                icon: "go",
                label: `Itinéraire à pied depuis ${dest.station.name}`,
                href: walkLink(dest.station, state.home),
              }),
            )
          : ""
      }`,
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
    } else if (action === "pick-option") {
      state.pinnedOption = target.dataset.value || null;
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
      setAmbient("none");
    },
  };
}
