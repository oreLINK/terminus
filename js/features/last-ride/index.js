// Mode « Le dernier tram » : combien de temps avant de devoir partir
// à pied pour attraper le dernier tram qui ramène au domicile, directement ou avec correspondance.

import { buildIndex, candidateStations, transferMap, candidateLines, routeRequests, plan, serviceEndAfter, inServiceWindow, serviceMorning, addDays, communeOf, zoneDests, sameTrip, SERVICE_GAP_MS, WALK_MARGIN_MS } from "./planner.js";
import { createAddressField } from "../../core/address-field.js";
import { clock, walkBetween, walkLink, esc, distanceM } from "../../core/util.js";
import { fetchWalk, realWalk } from "../../core/walk-route.js";
import { eveningJourneys, mergeLive, isoDate } from "../../core/timetable.js";
import { decodeLine } from "../../core/line-trace.js";
import { openSheet, closeSheet, sheetCurrent, sheetAction, sheetActions, sheetNote } from "../../core/sheet.js";
import { location } from "../../core/location.js";
import { setComputing } from "../../core/computing.js";
import { setAmbient } from "../../core/ambient.js";
import { getHome, saveHome } from "../../core/home.js";
import { covers } from "../../networks/index.js";
import { lab, now as clockNow } from "../../core/lab.js";
import { readJSON, writeJSON } from "../../core/storage.js";
import { seasonText } from "../../core/season.js";
import { createRouteMap } from "./route-map.js";

const REFRESH_MS = 30 * 1000;
const MOVE_THRESHOLD_M = 150;
const TICK_MS = 10 * 1000;
// Ton du compte à rebours : vert, puis orange sous 20 min, rouge sous 10 min, noir quand c'est trop tard.
const SOON_MIN = 20;
const URGENT_MIN = 10;
const PULSE_MIN = 5;
// Au-delà d'une heure avant l'heure limite, le compteur affiche « plus d'1 h » et les horaires ne
// sont plus rechargés automatiquement jusqu'à ce qu'il reste une heure. Le temps réel ne couvre de
// toute façon qu'environ l'heure qui vient : avant, l'horaire prévu suffit.
const LIVE_MIN = 60;
// Âge maximal des horaires en cache : court pour les lignes du tracé affiché (temps réel), long pour
// les autres, qui ne servent qu'à vérifier qu'aucun tracé ne laisse partir plus tard.
const ROUTE_MAX_AGE_MS = 100 * 1000;
const OTHER_MAX_AGE_MS = 15 * 60 * 1000;

// Tracé affiché quand les deux diffèrent : « Plus pratique » (par défaut) ou « Plus tard possible »,
// au choix en haut de la tuile. Le choix est gardé dans ce navigateur, pour tous les réseaux.
const MODE_KEY = "dt.route-mode.v1";
const MODES = ["comfortable", "latest"];
// Adresse du domicile masquée dans sa pastille (par défaut), contre les regards par-dessus l'épaule.
const HIDE_HOME_KEY = "dt.home-hidden.v1";

// Pictogrammes des trois blocs : une cible pour la position, l'avant d'un tram pour l'arrêt,
// une maison pour le domicile.
const ICONS = {
  here: `<svg class="trip-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5"/></svg>`,
  home: `<svg class="trip-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11 12 4l8 7M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/></svg>`,
  go: `<svg class="route-go-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4 4 11l7 2 2 7 7-16Z"/></svg>`,
  refresh: `<svg class="meta-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>`,
  walk: `<svg class="summary-glyph" viewBox="0 0 24 24" aria-hidden="true"><circle cx="13" cy="4.5" r="1.8"/><path d="M12.5 8 10 14l3.5 3 1.5 4.5M10 14l-2 7M11.5 9.5 8 12v3M13 8.5l2.5 3.5H19"/></svg>`,
  expand: `<svg class="expand-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5"/></svg>`,
  // Œil : afficher l'adresse ; œil barré : la masquer (l'action que fait le bouton de l'en-tête).
  eye: `<svg class="picker-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg class="picker-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5.8c.6-.2 1.3-.3 2-.3 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.3 7.3A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5c1.8 0 3.3-.5 4.6-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2M3.5 3.5l17 17"/></svg>`,
};

// Barre fine où glisse un segment, comme un tram sur sa ligne : visible pendant un calcul.
const PROGRESS = `<div class="progress" aria-hidden="true"></div>`;

export default {
  id: "last-ride",
  title: "Le dernier tram",
  short: "Dernier tram",
  description: "Quand partir pour attraper le dernier tram jusqu'à votre destination, et par où passer.",
  mount,
};

// Monté aussi par d'autres modes (night-ride : TBNight) : tout ce qui dépend du
// véhicule vient de l'adaptateur (vehicle, plage horaire, nuits de service, zones à la demande).
// `goal` : « last », le dernier départ qui ramène encore (choix « Plus pratique » / « Plus tard
// possible ») ; « next », le prochain départ atteignable, sans choix (le prochain bus de nuit).
export function mount({ root, network, adapter, goal = "last" }) {
  const state = {
    home: getHome(network),
    index: null,
    graph: undefined, // graphe du réseau : undefined tant qu'il n'est pas chargé, null s'il n'y en a pas
    transfers: null, // correspondances à pied entre stations proches (transferMap), chargées avec les arrêts
    names: new Map(), // nom de chaque quai (ref SIRI → nom), pour les horaires inclus
    colors: new Map(), // couleurs des lignes données par les arrêts générés (bus) : code → { color, ink }
    lineCodes: {},
    timer: null,
    busy: false,
    pending: false,
    pendingVisible: false,
    lastComputedFrom: null,
    last: null, // dernier calcul : { result, origins, dests, now, partial }
    leaveBy: null, // heure limite affichée par le compte à rebours
    countdownHtml: null, // dernière valeur affichée, pour animer le passage d'une minute
    entered: false, // l'écran est apparu une fois : les rendus suivants ne rejouent pas l'apparition
    asleep: false, // hors de la plage horaire du réseau : écran d'attente, aucun calcul
    quietUntil: null, // heure limite à plus d'1 h : pas de rafraîchissement automatique avant cette heure
    routeLines: new Set(), // lignes des tracés proposés : leurs horaires sont rechargés plus souvent
    mode: readJSON(MODE_KEY) === "latest" ? "latest" : "comfortable",
    routeMap: null, // aperçu de carte de la tuile, créé au premier compte à rebours et gardé entre les rendus
    detailMap: null, // carte de la feuille « Votre trajet », tant qu'elle est ouverte
    // Marches réelles (IGN), par station : depuis la position (gardées tant qu'on reste à moins de
    // 150 m de `anchor`) et jusqu'à la destination (tant qu'elle ne change pas).
    walks: { origins: null, dests: null },
    homeHidden: readJSON(HIDE_HOME_KEY) !== false, // adresse masquée dans la pastille, sauf choix contraire
    unmounted: false,
  };

  const area = network.area;

  // Réglages du réseau, que le mode test (js/core/lab.js, local seulement) peut remplacer.
  const startHour = lab?.startHour ?? adapter.serviceStartHour;
  const endHour = lab?.endHour ?? adapter.serviceEndHour;
  const liveMs = (lab?.liveMin ?? LIVE_MIN) * 60000;
  const V = adapter.vehicle; // « tram », « bus de nuit »
  const which = goal === "next" ? "prochain" : "dernier";
  // Le prochain bus de nuit peut passer des heures après le début du compte à rebours : seule la fin
  // du service (serviceEnd) borne la soirée.
  const serviceGap = goal === "next" ? Infinity : SERVICE_GAP_MS;

  // Nuits de service (TBNight : jeudi, vendredi, samedi et veilles de fêtes), jugées sur le matin de
  // la nuit en cours. Sans `runsOn`, le véhicule circule tous les jours.
  const morning = () => serviceMorning(clockNow(), { timeZone: network.timeZone, hour: endHour ?? 0 });
  const runsTonight = () => !adapter.runsOn || adapter.runsOn(morning());

  // Dans la plage horaire du réseau (de serviceStartHour à serviceEndHour), ou toujours s'il n'en a pas.
  const hours = (h) => `${h} h`;
  const awake = () =>
    runsTonight() &&
    (startHour == null ||
      endHour == null ||
      inServiceWindow(clockNow(), { timeZone: network.timeZone, startHour, endHour }));

  // ---------- Écrans ----------

  // Premier écran, même sans domicile : le compteur attend et la carte Domicile invite à le renseigner.
  function showWaitingForHome() {
    state.last = null;
    renderScreen({
      hero: heroPending("Ajoutez votre destination pour lancer le calcul."),
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

  // Hors de la plage horaire, ou nuit sans service : écran d'attente neutre. Domicile et position
  // restent modifiables.
  function showAsleep() {
    state.last = null;
    if (!runsTonight()) {
      let m = morning();
      for (let i = 0; i < 14 && !adapter.runsOn(m); i++) m = addDays(m, 1);
      const evening = addDays(m, -1);
      const date = new Date(Date.UTC(evening.year, evening.month - 1, evening.day)).toLocaleDateString("fr-FR", {
        timeZone: "UTC",
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      return renderScreen({
        hero: heroText(
          "Pas de service cette nuit",
          `Dès ${date}`,
          `${esc(adapter.serviceName ?? V)} circule ${esc(adapter.nights ?? "")}, de ${hours(startHour)} à ${hours(endHour)} sur Terminus.`,
        ),
        meta: false,
      });
    }
    const start = hours(startHour);
    renderScreen({
      hero: heroText(
        "En attente",
        `Dès ${start}`,
        `Le compte à rebours du ${which} ${esc(adapter.vehicle)} fonctionne de ${start} à ${hours(endHour)}.`,
      ),
      meta: false,
    });
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
        if (!state.asleep) showMessage("Calcul du trajet…");
        state.lastComputedFrom = null;
        location.setManual(address); // l'abonnement ci-dessous lance le calcul
      },
    }).focus();
  }

  // ---------- Localisation ----------

  function start() {
    if (!state.home) return showWaitingForHome();
    state.lastComputedFrom = null;
    state.asleep = !awake();
    const here = location.here;
    if (lab?.screen) {
      showForced(lab.screen);
    } else if (state.asleep) {
      showAsleep();
    } else if (here) {
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
    if (state.asleep) return paintPosition();
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
      if (document.visibilityState === "visible" && !windowChanged() && !quiet()) compute();
    }, REFRESH_MS);
  }

  function onVisibility() {
    if (document.visibilityState === "visible" && !windowChanged() && !quiet() && location.here) compute();
  }

  const quiet = () => state.quietUntil != null && clockNow() < state.quietUntil;

  // Début ou fin de la plage horaire : on repart de zéro (écran d'attente ou premier calcul).
  function windowChanged() {
    if (!state.home || lab?.screen || awake() !== state.asleep) return false;
    start();
    return true;
  }

  // ---------- Calcul ----------

  async function ensureStops() {
    if (state.index) return;
    const [data, transfers] = await Promise.all([adapter.loadStops(), adapter.loadTransfers?.().catch(() => null)]);
    state.index = buildIndex(data.stops);
    state.names = new Map(data.stops.map((x) => [x.ref, x.name])); // noms des quais, pour les horaires inclus
    state.colors = new Map(
      Object.values(data.lines).filter((l) => l.color).map((l) => [l.code, { color: l.color, ink: l.textColor ?? "#FFFFFF" }]),
    );
    state.lineCodes = Object.fromEntries(Object.values(data.lines).map((l) => [l.ref, l.code]));
    // Sans fichier de correspondances, on change seulement dans une même station, comme avant.
    state.transfers = transferMap(transfers?.rows, state.index, decodeLine);
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
  // Le dernier recours (tout le réseau) n'est permis que pour un petit réseau : 12 (ligne, sens) pour
  // le tram, mais 124 pour les bus de jour, autant d'appels d'un coup (MAX_ALL_REQUESTS).
  const MAX_ALL_REQUESTS = 40;
  function loadStages(origins, dests) {
    const everything = bothWays(Object.keys(state.lineCodes));
    const all = everything.length <= MAX_ALL_REQUESTS ? [everything] : [];
    if (!state.graph) return [bothWays(candidateLines(origins, dests)), ...all];
    const args = { graph: state.graph, index: state.index, origins, dests, transfers: state.transfers };
    return [routeRequests(args), routeRequests({ ...args, extraTransfers: 1 }), ...all];
  }

  // Les courses des (ligne, sens) demandés, jusqu'à la fin du service. Un échec partiel est signalé
  // sans bloquer ; si rien ne répond, l'erreur remonte.
  async function loadJourneys(requests, until) {
    const maxAge = (r) => (state.routeLines.has(r.line) ? ROUTE_MAX_AGE_MS : OTHER_MAX_AGE_MS);
    const settled = await Promise.allSettled(
      requests.map((r) => adapter.loadTimetable(r.line, r.direction, { until, maxAge: maxAge(r) })),
    );
    const failed = settled.filter((r) => r.status === "rejected");
    if (settled.length && failed.length === settled.length) throw failed[0].reason;
    // Chaque course garde le sens demandé (le flux ne le redonne pas), pour mergeLive.
    const journeys = settled.flatMap((r, i) =>
      r.status === "fulfilled" ? r.value.map((j) => ({ ...j, direction: requests[i].direction })) : [],
    );
    return { journeys, failed: failed.length };
  }

  // `visible` : calcul demandé par la personne (position saisie, actualisation, nouveau domicile)
  // ou premier calcul. Les rafraîchissements automatiques restent silencieux.
  async function compute({ visible = false } = {}) {
    const here = location.here;
    if (state.unmounted || state.asleep || lab?.screen || !state.home || !here || !covers(network, here)) return;
    if (state.busy) {
      state.pending = true;
      state.pendingVisible ||= visible;
      return;
    }
    state.busy = true;
    const shown = visible || !state.lastComputedFrom;
    if (shown) setComputing(true, "Calcul du trajet…");
    try {
      // Méthode de calcul : celle du réseau, ou celle que le mode test force. Le graphe ne sert qu'à
      // l'ancienne méthode et aux zones à la demande : la nouvelle ne le charge pas (bus : 43 Ko).
      const method = lab?.method ?? adapter.method ?? "siri";
      await Promise.all([ensureStops(), method !== "offline" || adapter.zones ? ensureGraph() : null]);
      if (state.unmounted) return;

      if (walkBetween(here, state.home).straight < 300) {
        state.lastComputedFrom = here;
        state.last = null;
        return renderAtHome();
      }

      // Candidats ligne par ligne : la station la plus proche de chaque ligne, plus les plus proches.
      const origins = withRealWalks(candidateStations(state.index.stations, here, adapter.candidates?.origins ?? { radius: 2000, min: 2, max: 10 }), "origins", here);
      // Zones à la demande (TBNight) : si le domicile est dans une commune de zone, le dernier arrêt
      // fixe de la ligne y mène sans marche (on reste dans le bus), même s'il est aussi à portée à pied.
      const zones = zoneDests({
        zones: adapter.zones,
        commune: communeOf(state.home.label),
        graph: state.graph,
        index: state.index,
        lineCodes: state.lineCodes,
      });
      const near = withRealWalks(candidateStations(state.index.stations, state.home, adapter.candidates?.dests ?? { radius: 1500, min: 1, max: 8 }), "dests", state.home);
      const dests = [...near.filter((d) => !zones.some((z) => z.station.id === d.station.id)), ...zones];
      const loaded = new Set();
      let journeys = [];
      let failed = 0;
      let result = null;
      let now = clockNow();
      const serviceEnd =
        endHour == null ? Infinity : serviceEndAfter(now, { timeZone: network.timeZone, hour: endHour });
      // Nouvelle méthode (horaires théoriques inclus, temps réel ciblé) si elle est choisie et que les
      // horaires couvrent la soirée ; sinon, l'ancienne ci-dessous, avec le graphe chargé au besoin.
      const offline = method === "offline" ? await offlineJourneys(now, origins, dests, serviceEnd) : null;
      if (!offline) await ensureGraph();
      const stages = offline ? [] : loadStages(origins, dests);
      if (state.unmounted) return;
      if (offline) {
        ({ journeys, failed, result } = offline);
        now = clockNow();
      }
      for (const stage of stages) {
        const todo = stage.filter((r) => !loaded.has(`${r.line}|${r.direction}`));
        if (result && !todo.length) continue;
        for (const r of todo) loaded.add(`${r.line}|${r.direction}`);
        const got = await loadJourneys(todo, serviceEnd);
        if (state.unmounted) return;
        journeys = journeys.concat(got.journeys);
        failed += got.failed;
        now = clockNow();
        result = plan({ origins, dests, journeys, index: state.index, lineCodes: state.lineCodes, now, serviceEnd, serviceGap, transfers: state.transfers });
        if (result.options.length) break;
      }
      // Avec les horaires théoriques, les courses passées sont connues : le calcul voit seul que le
      // dernier est parti, sans cette déduction.
      const overHint = Boolean(!offline && state.graph && stages[0]?.length);
      // Mode test : la méthode réellement utilisée, lisible par la page d'essai et le bandeau.
      if (lab) document.documentElement.dataset.method = offline ? "offline" : "siri";
      state.lastComputedFrom = here;
      keep({ result: settle(result, overHint), origins, dests, now, partial: failed > 0, journeys, serviceEnd, overHint });
      renderLast();
      refineWalks(here);
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

  // ---------- Nouvelle méthode : horaires théoriques inclus, temps réel ciblé ----------

  // Calcul sur les horaires théoriques du soir (aucun appel), puis temps réel pour les seules lignes
  // et sens du trajet affiché (1 à 3 appels), et nouveau calcul ; un second tour si le temps réel a
  // déplacé le trajet sur d'autres lignes. null si les horaires manquent ou sont périmés.
  async function offlineJourneys(now, origins, dests, serviceEnd) {
    if (!adapter.evening) return null;
    const evening = addDays(morning(), -1);
    let journeys;
    try {
      journeys = await eveningJourneys(adapter.evening, isoDate(evening), isoDate(addDays(evening, 1)), new Set(Object.keys(state.lineCodes)), (ref) => state.names.get(ref) ?? ref);
    } catch {
      return null;
    }
    if (!journeys) return null;
    const run = () =>
      plan({ origins, dests, journeys, index: state.index, lineCodes: state.lineCodes, now: clockNow(), serviceEnd, serviceGap, transfers: state.transfers });
    let result = run();
    let failed = 0;
    const asked = new Set();
    for (let round = 0; round < 2 && result.options.length; round++) {
      const byId = new Map(journeys.map((j) => [j.id, j]));
      const todo = [];
      for (const option of [result.primary, result.comfortable, result.soonest]) {
        for (const leg of option?.last.legs ?? []) {
          const j = byId.get(leg.journeyId);
          const key = `${j?.line}|${j?.direction}`;
          if (j && !asked.has(key)) {
            asked.add(key);
            todo.push({ line: j.line, direction: j.direction });
          }
        }
      }
      if (!todo.length) break;
      try {
        const got = await loadJourneys(todo, serviceEnd);
        failed += got.failed;
        journeys = mergeLive(journeys, todo, got.journeys);
      } catch {
        failed += todo.length; // flux muet : les horaires théoriques restent
        break;
      }
      result = run();
    }
    return { journeys, failed, result };
  }

  // Les horaires ne couvrent que jusqu'à la fin du service : l'API ne renvoie alors presque plus
  // les courses passées, et « le dernier tram est parti » ne se voit plus dans les données.
  // Si le graphe relie les deux côtés et qu'il ne reste aucun tram, c'est que le dernier est parti.
  const settle = (result, overHint) => (result?.status === "none" && overHint ? { ...result, status: "over" } : result);

  function keep(last) {
    state.last = last;
    const { result } = last;
    state.routeLines = new Set(
      [result?.primary, result?.comfortable, result?.soonest].flatMap((o) => o?.last.legs.map((l) => l.line) ?? []),
    );
  }

  // ---------- Marche réelle ----------

  // Marches connues d'un côté, remises à zéro quand le point de référence bouge : la position de plus
  // de 150 m, la destination de plus de 20 m (nouvelle adresse).
  function walksFor(side, from) {
    const limit = side === "origins" ? MOVE_THRESHOLD_M : 20;
    const known = state.walks[side];
    if (!known || distanceM(known.anchor, from) > limit) {
      state.walks[side] = { anchor: from, byId: new Map(), asked: new Set() };
    }
    return state.walks[side];
  }

  // Stations candidates avec leur marche réelle quand elle est connue, sinon l'estimation.
  function withRealWalks(list, side, from) {
    const { byId } = walksFor(side, from);
    return list.map((x) => (byId.has(x.station.id) ? { ...x, walk: byId.get(x.station.id) } : x));
  }

  // Demande à l'IGN les marches encore inconnues (jusqu'aux arrêts autour de la position, depuis
  // ceux autour de la destination ; pas pour les zones à la demande, sans marche), puis refait le
  // calcul avec les horaires déjà chargés : l'heure limite, le choix de l'arrêt et la carte suivent
  // les rues. Pendant ce temps, l'estimation reste affichée ; un échec la garde.
  async function refineWalks(here) {
    // Seulement les stations qu'un trajet emprunte vraiment : ni l'IGN ni le téléphone ne travaillent
    // pour un arrêt sans tram utile (avec les candidats ligne par ligne, il y en a davantage).
    const { origins: allOrigins = [], dests: allDests = [], result } = state.last ?? {};
    const options = result?.options ?? [];
    const usedOrigins = new Set(options.map((o) => o.origin.station.id));
    const usedDests = new Set(options.flatMap((o) => o.catchable.map((t) => t.dest.station.id)));
    const origins = allOrigins.filter((o) => usedOrigins.has(o.station.id));
    const dests = allDests.filter((d) => usedDests.has(d.station.id));
    const jobs = [];
    const ask = (side, from, item, a, b) => {
      const known = walksFor(side, from);
      if (item.walk.real || item.zone || known.asked.has(item.station.id)) return;
      known.asked.add(item.station.id);
      jobs.push(
        fetchWalk(a, b).then((route) => {
          if (route && state.walks[side] === known) known.byId.set(item.station.id, realWalk(item.walk, route));
          return Boolean(route);
        }),
      );
    };
    for (const o of origins) ask("origins", here, o, here, o.station);
    for (const d of dests) ask("dests", state.home, d, d.station, state.home);
    if (!jobs.length) return;
    const got = await Promise.all(jobs);
    if (got.some(Boolean)) replan();
  }

  // Nouveau calcul sur les horaires du dernier, avec les marches réelles connues. Sans effet si un
  // calcul complet est en cours : il les appliquera lui-même.
  function replan() {
    const last = state.last;
    if (state.unmounted || state.busy || !last?.journeys || !location.here) return;
    const origins = withRealWalks(last.origins, "origins", location.here);
    const dests = withRealWalks(last.dests, "dests", state.home);
    const now = clockNow();
    const result = plan({
      origins,
      dests,
      journeys: last.journeys,
      index: state.index,
      lineCodes: state.lineCodes,
      now,
      serviceEnd: last.serviceEnd,
      serviceGap,
      transfers: state.transfers,
    });
    keep({ ...last, result: settle(result, last.overHint), origins, dests, now });
    renderLast();
  }

  // ---------- Rendu ----------

  // Couleur officielle d'une ligne : celle des arrêts générés (bus, avec leur couleur GTFS), sinon la
  // table du réseau (tram, TBNight) ; texte du badge assorti.
  const lineColorOf = (code) => state.colors.get(code)?.color ?? network.lineColors?.[code];
  const lineInkOf = (code) => state.colors.get(code)?.ink ?? network.lineInk ?? "#FFFFFF";

  const badges = (codes) =>
    codes
      .map((c) => {
        const color = lineColorOf(c);
        const style = color ? ` style="--line: ${color}; --line-ink: ${lineInkOf(c)}"` : "";
        return `<span class="line-badge"${style} aria-label="${esc(adapter.lineLabel ?? adapter.vehicle)} ${esc(c)}">${esc(c)}</span>`;
      })
      .join("");

  // Itinéraire du trajet affiché, à la manière d'un calculateur d'itinéraire : une colonne d'heures,
  // un tracé (pointillé à pied, plein à la couleur de la ligne en tram) et les étapes.
  function routeHtml(option) {
    const trip = option.last;
    const legs = trip.legs;
    const final = legs[legs.length - 1];
    const lineColor = (code) => lineColorOf(code) ?? "var(--ink)";
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
    const zone = trip.dest.zone;
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
      const prev = legs[i - 1];
      // Correspondance à pied : descente à la station du tronçon précédent, puis marche jusqu'à
      // celle-ci (distance par les rues, calculée à la génération).
      if (prev?.walkAfter) {
        steps.push(
          step({
            time: clock(prev.arr),
            top: prev.lineCode,
            bottom: "walk",
            dot: "is-stop",
            dotLine: prev.lineCode,
            body: `<strong class="route-stop">${esc(prev.to.name)}</strong>`,
          }),
          step({
            top: "walk",
            bottom: "walk",
            kind: "ride",
            body: `À pied, ${Math.max(1, Math.ceil(prev.walkAfter.seconds / 60))} min jusqu'à ${esc(leg.from.name)}`,
          }),
        );
      }
      const before = i === 0 || prev.walkAfter ? "walk" : prev.lineCode;
      const note = i === 0 ? "" : `<span class="route-note">correspondance</span>`;
      const name = `<strong class="route-stop">${esc(leg.from.name)}</strong>`;
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
        bottom: zone ? final.lineCode : "walk",
        dot: "is-stop",
        dotLine: final.lineCode,
        body: `<strong class="route-stop">${esc(final.to.name)}</strong>${
          zone ? ` <span class="route-note">dernier arrêt fixe</span>` : ""
        }`,
      }),
    );
    // Zone à la demande : on reste dans le bus, l'arrêt se réserve avant de monter. Pas d'heure
    // d'arrivée : elle dépend des réservations.
    if (zone) {
      steps.push(
        step({
          top: final.lineCode,
          dot: "is-end",
          kind: "home",
          body: `Zone à la demande, ${esc(zone.commune)} : réservez votre arrêt dans l'app TBM avant de monter`,
          action: adapter.zoneInfoUrl
            ? `<a class="route-go" href="${esc(adapter.zoneInfoUrl)}" target="_blank" rel="noopener" aria-label="Réserver un arrêt en zone à la demande (site TBM)">${ICONS.go}</a>`
            : "",
        }),
      );
      return `<ol class="route" aria-label="Itinéraire du trajet">${steps.join("")}</ol>`;
    }
    steps.push(
      step({
        time: clock(trip.arrHome),
        top: "walk",
        dot: "is-end",
        kind: "home",
        body: `Destination, ${trip.dest.walk.minutes} min à pied`,
        // De la station d'arrivée jusqu'au domicile, dans Google Maps : le pendant du bouton de départ.
        action: `<a class="route-go" href="${walkHome}" target="_blank" rel="noopener" aria-label="Itinéraire à pied de ${esc(final.to.name)} jusqu'à la destination (Google Maps)">${ICONS.go}</a>`,
      }),
    );
    return `<ol class="route" aria-label="Itinéraire du trajet">${steps.join("")}</ol>`;
  }

  const isEnded = (option, now) => option.next.dep - now > serviceGap;

  // Tracé affiché : celui du mode choisi. Sans tracé « pratique » (service terminé), le plus tard.
  // Sans choix affiché (les deux partent à la même heure), le plus pratique.
  // Le choix n'est proposé que s'il fait gagner au moins 2 minutes : en deçà, c'est du bruit.
  const MIN_GAIN_MS = 2 * 60 * 1000;
  const offersChoice = (result) =>
    goal === "last" &&
    result?.comfortable &&
    result.primary &&
    result.primary.leaveBy - result.comfortable.leaveBy >= MIN_GAIN_MS &&
    !sameTrip(result.comfortable, result.primary);
  const chosen = (result) =>
    goal === "next"
      ? result?.soonest || result?.primary || null
      : ((state.mode === "comfortable" || !offersChoice(result)) && result?.comfortable) || result?.primary || null;

  // Marche jusqu'à l'arrêt de départ, marge comprise : l'écart réel entre l'heure limite et le tram.
  const walkToMin = (option) => option.origin.walk.minutes + WALK_MARGIN_MS / 60000;
  const transfersText = (option) =>
    option.transfers === 0 ? "direct" : `${option.transfers} correspondance${option.transfers > 1 ? "s" : ""}`;
  const mapLineColor = (code) => lineColorOf(code) ?? "currentColor";

  // Résumé du trajet en deux lignes, à lire d'un coup d'œil : où marcher, puis quel tram jusqu'où.
  function summaryHtml(option) {
    const legs = option.last.legs;
    const final = legs[legs.length - 1];
    const zone = option.last.dest.zone;
    return `
      <span class="summary-line">${ICONS.walk}<span><strong>${walkToMin(option)} min</strong> à pied jusqu'à <strong class="summary-stop">${esc(legs[0].from.name)}</strong></span></span>
      <span class="summary-line">${badges(legs.map((l) => l.lineCode))}<span><strong>${clock(legs[0].dep)}</strong> → <span class="summary-stop">${esc(final.to.name)}</span>${
        zone ? ", puis zone à la demande" : ""
      }${legs.length > 1 ? ` · ${transfersText(option)}` : ""}</span></span>`;
  }

  // Choix entre les deux tracés, en haut de la tuile, seulement si « Plus tard possible » laisse
  // vraiment partir plus tard (deux trajets différents à la même heure limite : rien à choisir).
  // Chaque choix montre son heure limite : ce que l'on gagne se lit d'un coup d'œil.
  function modesHtml(result) {
    const { comfortable, primary } = result;
    if (!offersChoice(result)) return "";
    const button = (mode, label, option) => `
      <button type="button" class="route-mode" data-action="route-mode" data-value="${mode}" aria-pressed="${state.mode === mode}">
        <span class="route-mode-label">${label}</span>
        <span class="route-mode-time">avant ${clock(option.leaveBy)}</span>
      </button>`;
    // --active : position de la pastille qui glisse sous le choix en cours (0 à gauche, 1 à droite).
    return `<div class="route-modes" role="group" aria-label="Trajet proposé" style="--active: ${MODES.indexOf(state.mode)}">${button("comfortable", "Plus pratique", comfortable)}${button("latest", "Plus tard possible", primary)}</div>`;
  }

  // Pastille Domicile : la rue, floutée tant que l'adresse est masquée. L'œil, dans l'en-tête à
  // gauche du choix de la ville, l'affiche ou la masque ; il n'apparaît qu'avec un domicile.
  const privacyButton = document.getElementById("home-privacy");

  function paintHome() {
    if (privacyButton) {
      privacyButton.hidden = !state.home;
      privacyButton.innerHTML = state.homeHidden ? ICONS.eye : ICONS.eyeOff;
      privacyButton.setAttribute("aria-label", state.homeHidden ? "Afficher l'adresse de destination" : "Masquer l'adresse de destination");
      privacyButton.setAttribute("aria-pressed", String(!state.homeHidden));
    }
    const value = root.querySelector("#home-value");
    if (!value || !state.home) return;
    // La rue reste en place : seul le flou change, et se dissipe en fondu. Floutée, elle est
    // annoncée « adresse masquée » aux lecteurs d'écran.
    let street = value.querySelector(".home-street");
    if (!street) {
      value.innerHTML = `<span class="home-street">${esc(state.home.label.split(",")[0])}</span><span class="visually-hidden home-masked">adresse masquée</span>`;
      street = value.querySelector(".home-street");
    }
    street.classList.toggle("is-blurred", state.homeHidden);
    street.toggleAttribute("aria-hidden", state.homeHidden);
    value.querySelector(".home-masked").hidden = !state.homeHidden;
  }

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

  // Tuile du compte à rebours, pensée pour un téléphone tenu d'une main : le choix du tracé (s'il y
  // en a deux) ; l'heure (compteur, heure limite, source), posée sur la tuile ; le trajet, qui ouvre
  // son détail, avec sa carte carrée ; en bas, sous le pouce, l'itinéraire à pied et Actualiser.
  function heroCountdown(option, modes = "") {
    const last = option.last;
    const from = option.origin.station;
    return `
      <section class="hero glass tone-ok is-glance" id="hero">
        ${modes}
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
        <div class="trip-card">
          <p class="trip-summary">${summaryHtml(option)}</p>
          <div class="trip-card-map">
            <div class="route-map-slot"></div>
            <span class="trip-card-expand" aria-hidden="true">${ICONS.expand}</span>
          </div>
          <button type="button" class="trip-card-open" data-action="open-detail" aria-haspopup="dialog" aria-label="Voir le détail du trajet et la carte"></button>
        </div>
        <div class="hero-actions">
          <a class="hero-go" href="${walkLink(location.here, from)}" target="_blank" rel="noopener" aria-label="Itinéraire à pied jusqu'à ${esc(from.name)} (Google Maps)">${ICONS.go}<span>Itinéraire à pied</span></a>
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
    // Mode test : compteur fixé à une valeur choisie, pour voir chaque ton.
    const left = lab?.countdownMin != null ? lab.countdownMin * 60000 : state.leaveBy - clockNow();
    // Heure limite dépassée de plus d'une minute : ce tram-là est perdu, en attendant le prochain calcul.
    const late = left < -60000;
    const minutes = Math.max(0, Math.floor(left / 60000));
    const html = late
      ? `<span class="countdown-word">${esc(seasonText("late", "trop tard"))}</span>`
      : left > liveMs
        ? `<span class="countdown-word">plus d'1 h</span>`
        : countdownHtml(minutes);
    el.innerHTML = html;
    // La valeur change (nouvelle minute) : les chiffres glissent en place.
    if (state.countdownHtml && state.countdownHtml !== html) {
      el.classList.remove("is-ticking");
      void el.offsetWidth;
      el.classList.add("is-ticking");
    }
    state.countdownHtml = html;
    root.querySelector("#hero-label").textContent = late ? `Pour ce ${V}, c'est` : minutes < 1 ? "Partez" : "Partez dans";
    const hero = root.querySelector("#hero");
    const pulsing = !late && minutes < PULSE_MIN;
    setTone(hero, late ? "late" : minutes < URGENT_MIN ? "urgent" : minutes < SOON_MIN ? "soon" : "ok", pulsing);
    hero.classList.toggle("is-pulsing", pulsing);
  }

  function renderScreen({
    hero,
    now = clockNow(),
    partial = false,
    leaveBy = null,
    meta = true,
    needPosition = false,
  }) {
    state.leaveBy = leaveBy;
    // Rafraîchissements automatiques suspendus tant que l'heure limite est à plus d'une heure.
    state.quietUntil = leaveBy != null ? leaveBy - liveMs : null;
    // Ce qui manque pour calculer : d'abord le domicile, puis la position.
    const needs = !state.home ? "home" : needPosition ? "position" : null;
    const calloutText = {
      home: "Indiquez votre destination pour savoir quand partir.",
      position: "Indiquez où vous êtes pour savoir quand partir.",
    };
    const home = state.home ? "" : "Non renseignée"; // la rue, floutée ou non : paintHome
    // Deux pastilles côte à côte, en haut de l'écran : d'où vous partez et où vous rentrez. On les
    // touche rarement, elles laissent le bas de l'écran au trajet. L'annotation, sous la bande,
    // pointe vers la pastille qui manque (--col : 0 position, 1 domicile).
    const callout = needs
      ? `<p class="trip-callout" id="callout" style="--col: ${needs === "position" ? 0 : 1}">${calloutText[needs]}</p>`
      : "";
    // Par pastille : le pictogramme, puis l'intitulé au-dessus de la valeur.
    const col = (what, action, icon, label, value, id = "") => `
      <li class="trip-col trip-${what}${needs === what ? " is-missing" : ""}">
        <button type="button" class="trip-button" data-action="${action}" aria-haspopup="dialog"${
          needs === what ? ' aria-describedby="callout"' : ""
        }>
          <span class="trip-icon">${icon}</span>
          <span class="trip-text">
            <span class="trip-label">${label}</span>
            <span class="trip-value"${id ? ` id="${id}"` : ""}>${value}</span>
          </span>
        </button>
      </li>`;
    root.innerHTML = `
      <div class="screen${state.entered ? "" : " is-entering"}">
        <ol class="trip" aria-label="Votre trajet">
          ${col("position", "open-position", ICONS.here, "Position", "", "position-value")}
          ${col("home", "open-home", ICONS.home, "Destination", home, "home-value")}
        </ol>
        ${callout}
        ${hero}
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
    // Actualiser : en bas à droite de la tuile, pictogramme seul, sur la ligne de l'itinéraire à
    // pied quand il y en a une. La flèche tourne tant que le calcul demandé est en cours (classe
    // is-computing sur <body>, js/core/computing.js).
    if (meta) {
      const refresh = `<button type="button" class="hero-refresh" data-action="refresh" aria-label="Actualiser les horaires">${ICONS.refresh}</button>`;
      const actions = root.querySelector(".hero-actions");
      if (actions) actions.insertAdjacentHTML("beforeend", refresh);
      else root.querySelector(".hero")?.insertAdjacentHTML("beforeend", refresh);
    }
    paintPosition();
    paintHome();
    paintCountdown();
  }

  function renderLast() {
    const { result, now, partial } = state.last;
    const primary = result.primary ?? null;
    if (primary && !isEnded(primary, now)) {
      const option = chosen(result);
      renderScreen({ hero: heroCountdown(option, modesHtml(result)), now, partial, leaveBy: option.leaveBy });
      return placeMap(option);
    }
    renderScreen({ hero: endHero(result.status, primary), now, partial });
  }

  // Le même aperçu d'un rendu à l'autre : son élément prend la place réservée dans la tuile.
  function placeMap(option) {
    const slot = root.querySelector(".route-map-slot");
    if (!slot || !location.here) return;
    state.routeMap ??= createRouteMap({ lineColor: mapLineColor, icons: ICONS, loadShapes: adapter.loadShapes });
    slot.replaceWith(state.routeMap.el);
    state.routeMap.update({ here: location.here, home: state.home, option });
  }

  // Pas de compte à rebours : service terminé, dernier tram manqué ou parti, aucun trajet.
  function endHero(status, option) {
    const night = adapter.nightHint ? ` ${adapter.nightHint}` : "";
    if (option) {
      return heroText(
        "Service terminé",
        seasonText("over", `Plus de ${V} ce soir`, { vehicle: V }),
        `Premier ${V} ${badges([option.next.lineCode])} vers votre destination à ${clock(option.next.dep)}.`,
        "",
        "late",
      );
    }
    if (status === "missed") {
      return heroText(
        `Dernier ${V} manqué`,
        "Trop tard à pied",
        `Le dernier ${V} vers votre destination part avant que vous puissiez rejoindre l'arrêt.${esc(night)}`,
        "",
        "late",
      );
    }
    if (status === "over") {
      return heroText(
        "Service terminé",
        seasonText("over", `Plus de ${V} ce soir`, { vehicle: V }),
        `Le dernier ${V} vers votre destination est parti.${esc(night)}`,
        "",
        "late",
      );
    }
    return heroText(
      `Aucun ${V}`,
      `Plus de ${V} d'ici`,
      `Aucun ${V} ne relie les arrêts proches de vous à votre destination d'ici la fin du service, même avec correspondance.${esc(night)}`,
    );
  }

  // Mode test : un écran affiché tel quel, sans calcul ni appel à l'API.
  function showForced(screen) {
    state.last = null;
    if (screen === "asleep") return showAsleep();
    if (screen === "home") return renderAtHome();
    if (screen === "error") return renderError(new Error("Erreur simulée (mode test)."));
    renderScreen({ hero: endHero(screen, null) });
  }

  function renderAtHome() {
    renderScreen({
      hero: heroText("Vous y êtes", "À deux pas de votre destination"),
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

  // Le détail du tracé affiché : la carte, qu'on déplace au doigt (rien ne défile autour d'elle),
  // avec « Recentrer », puis les étapes heure par heure, qui défilent sous la carte.
  function openDetailSheet() {
    const option = chosen(state.last?.result);
    if (!option || !location.here) return;
    const map = createRouteMap({ lineColor: mapLineColor, icons: ICONS, interactive: true, loadShapes: adapter.loadShapes });
    const body = openSheet(
      "Votre trajet",
      `<div class="detail">
        <div class="detail-map">
          <button type="button" class="map-recenter" data-action="recenter">${ICONS.here}<span>Recentrer</span></button>
        </div>
        <div class="detail-steps">${routeHtml(option)}</div>
      </div>`,
      {
        onClose() {
          map.remove();
          if (state.detailMap === map) state.detailMap = null;
        },
      },
    );
    body.querySelector(".detail-map").prepend(map.el);
    state.detailMap = map;
    map.update({ here: location.here, home: state.home, option });
  }

  function openHomeSheet() {
    const dest = chosen(state.last?.result)?.dest;
    const body = openSheet(
      "Destination",
      `<div class="sheet-field"></div>
      ${
        state.home
          ? sheetCurrent("Actuellement", state.home.label)
          : sheetNote(
              `Terminus cherche le ${V} qui vous amène au plus près de votre destination. Son adresse reste enregistrée dans ce navigateur uniquement.`,
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
      label: state.home ? "Nouvelle adresse" : "Adresse de destination",
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

  // Le rendu recrée le choix du tracé : il repart de l'ancien choix, puis la pastille glisse vers
  // le nouveau et les libellés changent de couleur en fondu (rien si le mouvement est réduit, CSS).
  function slideModes(from, to) {
    const modes = root.querySelector(".route-modes");
    if (!modes) return;
    const buttons = modes.querySelectorAll(".route-mode");
    const show = (mode) => {
      modes.style.setProperty("--active", MODES.indexOf(mode));
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.value === mode)));
    };
    modes.classList.add("is-still");
    show(from);
    void modes.offsetWidth; // l'ancien état est posé avant le passage au nouveau
    modes.classList.remove("is-still");
    show(to);
  }

  function onClick(e) {
    const target = e.target.closest("[data-action]");
    const action = target?.dataset.action;
    if (!action) return;
    if (action === "open-detail") {
      openDetailSheet();
    } else if (action === "recenter") {
      state.detailMap?.recenter();
    } else if (action === "open-position") {
      openPositionSheet();
    } else if (action === "open-home") {
      openHomeSheet();
    } else if (action === "refresh") {
      adapter.clearCache?.();
      if (location.here) compute({ visible: true });
      else start();
    } else if (action === "route-mode") {
      const mode = target.dataset.value;
      if (mode === state.mode || !MODES.includes(mode) || !state.last?.result) return;
      const before = state.mode;
      state.mode = mode;
      writeJSON(MODE_KEY, mode);
      renderLast();
      slideModes(before, mode);
      // Le nouveau trajet apparaît en fondu ; le rendu remplace le bouton : le focus revient sur le choix fait.
      root.querySelector("#hero")?.classList.add("is-switched");
      root.querySelector(`[data-action="route-mode"][data-value="${mode}"]`)?.focus({ preventScroll: true });
    } else if (action === "toggle-home") {
      state.homeHidden = !state.homeHidden;
      writeJSON(HIDE_HOME_KEY, state.homeHidden);
      paintHome();
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
      if (privacyButton) privacyButton.hidden = true; // l'en-tête reste, l'œil s'en va avec l'écran
      state.routeMap?.remove();
      state.detailMap?.remove();
    },
  };
}
