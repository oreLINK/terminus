// Réseau TBM, Bordeaux Métropole.
// Décrit la ville et, pour chaque mode qu'il sait fournir, l'adaptateur de données.

import { loadTimetable, clearTimetableCache } from "./siri-lite.js";
import { isPublicHoliday } from "../../core/holidays.js";
import { mergeStops, mergeGraphs, mergeShapes, loadMerged } from "../../core/compose.js";

// Horaires théoriques du soir (tools/build-timetable.mjs), un dossier par mode : un index et un
// fichier par type de jour, chargés à la demande. `refs` traduit les identifiants GTFS en identifiants SIRI (vérifié le
// 23/10/2026 : route_id 59 = bordeaux:Line:59:LOC, quai 3684 = bordeaux:StopPoint:BP:3684:LOC,
// trip_id b_268440007_23 = bordeaux:ServiceJourney:b_268440007_23:LOC).
const gtfsRefs = {
  line: (route) => `bordeaux:Line:${route}:LOC`,
  stop: (stop) => `bordeaux:StopPoint:BP:${stop}:LOC`,
  journey: (trip) => `bordeaux:ServiceJourney:${trip}:LOC`,
};
const evening = (kind) => ({
  loadIndex: () => import(`./evening/${kind}/index.js`).then((m) => m.default),
  loadDay: (type) => import(`./evening/${kind}/day-${type}.js`).then((m) => m.default),
  refs: gtfsRefs,
});

// Fichiers générés, chargés à la demande ; un mode qui combine tram et bus les assemble (compose.js).
const data = (file) => () => import(`./${file}`).then((m) => m.default);

// Ancien cache du réseau (lignes et arrêts lus dans l'API, ~24 h), remplacé par stops.js : on libère la place.
try {
  localStorage.removeItem("dt.network.v1");
} catch {
  // Stockage indisponible : rien à effacer.
}

export default {
  id: "bordeaux-tbm",
  city: "Bordeaux",
  timeZone: "Europe/Paris",
  name: "TBM, Bordeaux Métropole",

  // Mode affiché tant que la personne n'en a pas choisi un autre dans la fenêtre Mode.
  defaultFeature: "last-transport", // tram et bus de jour combinés (choix de l'auteur, 23/10/2026)

  // Zone desservie : sert au choix automatique de la ville d'après la position.
  // Boîte approximative autour de Bordeaux Métropole (non relevée sur un tracé officiel).
  coverage: { south: 44.7, north: 45.05, west: -0.9, east: -0.35 },

  // Zone des adresses : autocomplétion limitée à la Gironde.
  area: {
    label: "Gironde",
    department: "33",
    bounds: { south: 44.1, north: 45.6, west: -1.3, east: 0.35 },
    center: { lat: 44.84, lon: -0.58 },
    addressExample: "12 cours Victor Hugo, Bordeaux",
  },

  // Couleurs officielles des lignes : GTFS TBM, routes.txt (route_color), relevées le 27/09/2026.
  // Texte blanc pour toutes les lignes (route_text_color FFFFFF).
  // TBNight : couleur unique choisie pour le site (pas de couleur officielle relevée).
  lineColors: {
    A: "#831F82",
    B: "#E50040",
    C: "#D35098",
    D: "#9262A3",
    E: "#967651",
    F: "#F08700",
    ...Object.fromEntries(["N1", "N2", "N3", "N4", "N5", "N6", "N7", "N8"].map((c) => [c, "#2E3192"])),
  },
  lineInk: "#FFFFFF",

  attribution:
    "Horaires : Bordeaux Métropole, flux SIRI-Lite du réseau TBM (Licence Ouverte). Site indépendant, sans lien avec TBM ni Keolis.",

  // Adresse enregistrée avant les réseaux multiples, reprise une seule fois.
  legacyHomeKey: "dt.home.v1",

  // Modes disponibles sur ce réseau, avec leur adaptateur.
  features: {
    "last-ride": {
      vehicle: "tram",
      nightHint: "Pensez aux bus de nuit TBNight ou à Le Vélo.",
      // Le dernier tram est celui de la soirée : dernier départ avant 3 h du matin (heure locale).
      serviceEndHour: 3,
      // Le compte à rebours ne tourne qu'en soirée, de 18 h jusqu'à la fin du service ; un écran
      // d'attente s'affiche le reste du temps, sans appel à l'API.
      serviceStartHour: 18,
      // Lignes et arrêts de tram, générés par tools/build-graph.mjs : aucun appel à l'API.
      loadStops: () => import("./stops.js").then((m) => m.default), // → { lines: { [ref]: { ref, code } }, stops: [{ ref, name, lat, lon, lines }] }
      loadTimetable, // (lineRef, direction, { until, maxAge }) → [{ id, line, headsign, calls: [...] }]
      // Ordre des arrêts par ligne et par sens, généré par tools/build-graph.mjs, chargé à la demande.
      loadGraph: () => import("./graph.js").then((m) => m.default), // → { names, patterns: [{ line, direction, stops }] }
      // Tracé réel des lignes (GTFS, tools/build-shapes.mjs), pour la carte ; chargé avec elle.
      loadShapes: () => import("./shapes.js").then((m) => m.default), // → { lines: { [code]: [encodeLine(…)] } }
      evening: evening("tram"), // horaires théoriques du soir, pour la nouvelle méthode de calcul
      // Correspondances à pied entre stations proches (tools/build-transfers.mjs), chargées avec les arrêts.
      loadTransfers: () => import("./transfers.js").then((m) => m.default),
      // Méthode de calcul : « siri » (horaires SIRI par ligne, l'ancienne) ou « offline » (horaires
      // théoriques inclus, temps réel ciblé). « offline » depuis le 23/10/2026, après la comparaison
      // de 17 h 39 (npm run compare) ; sans horaires pour la soirée, il revient de lui-même à « siri ».
      method: "offline",
      clearCache: clearTimetableCache,
    },

    // Bus de jour : 62 lignes qui roulent encore après 18 h (hors scolaires et TBNight), données tirées
    // du GTFS par tools/build-bus-network.mjs (arrêts, graphe), build-timetable, build-shapes et
    // build-transfers. Nouvelle méthode d'emblée : l'ancienne demanderait de 6 à 25 appels SIRI par
    // calcul (mesuré le 23/10/2026) ; elle reste en secours si les horaires inclus manquent.
    "last-bus": {
      vehicle: "bus",
      nightHint: "Pensez au tram, ou aux bus de nuit TBNight les nuits où ils circulent.",
      serviceEndHour: 3,
      serviceStartHour: 18,
      loadStops: () => import("./bus-stops.js").then((m) => m.default), // lignes avec leur couleur
      loadTimetable,
      loadGraph: () => import("./bus-graph.js").then((m) => m.default), // pour l'ancienne méthode seulement
      loadShapes: () => import("./bus-shapes.js").then((m) => m.default),
      loadTransfers: () => import("./bus-transfers.js").then((m) => m.default),
      evening: evening("bus"),
      method: "offline",
      clearCache: clearTimetableCache,
    },

    // Tram et bus de jour ensemble : trajets, correspondances de l'un à l'autre (dans une même station,
    // ou à pied entre stations proches, transport-transfers.js) et marche jusqu'aux arrêts. Arrêts,
    // horaires, tracés et graphe sont ceux des deux modes, assemblés au chargement ; seules les
    // correspondances à pied tram ↔ bus sont générées en plus (tools/build-transfers.mjs).
    "last-transport": {
      vehicle: "transport",
      lineLabel: "ligne", // « ligne A », « ligne 4 » pour les lecteurs d'écran (et non « transport A »)
      nightHint: "Pensez aux bus de nuit TBNight les nuits où ils circulent, ou à Le Vélo.",
      serviceEndHour: 3,
      serviceStartHour: 18,
      loadStops: loadMerged(mergeStops, data("stops.js"), data("bus-stops.js")),
      loadTimetable,
      loadGraph: loadMerged(mergeGraphs, data("graph.js"), data("bus-graph.js")), // ancienne méthode seulement
      loadShapes: loadMerged(mergeShapes, data("shapes.js"), data("bus-shapes.js")),
      loadTransfers: data("transport-transfers.js"),
      evening: [evening("tram"), evening("bus")],
      method: "offline",
      // Plus de lignes autour de soi (68) : plus de candidats, pour garder la station la plus proche de
      // chaque ligne (la marche réelle n'est demandée que pour celles qu'un trajet emprunte).
      candidates: { origins: { radius: 2000, min: 2, max: 16 }, dests: { radius: 1500, min: 1, max: 12 } },
      clearCache: clearTimetableCache,
    },

    // TBNight, réseau de nuit : https://www.infotbm.com/fr/reseau-de-nuit.html (relevé le 01/10/2026).
    // N1 en continu (Base sous-marine ↔ Gradignan, 1 h 10 – 5 h 15, toutes les 30 min) ; N2 à N8 en
    // un seul sens, deux départs vers 1 h 45 et 4 h, puis une zone à la demande.
    "night-ride": {
      vehicle: "bus de nuit",
      serviceName: "TBNight",
      // Dernier départ à 5 h 15 (N1) : la fin du service est à 6 h pour ne couper aucune course.
      serviceEndHour: 6,
      serviceStartHour: 18,
      // Nuits du jeudi, vendredi, samedi et veilles de jours fériés : le matin est un vendredi, un
      // samedi, un dimanche ou un jour férié. Les autres nuits, aucun appel à l'API.
      runsOn: (morning) => [5, 6, 0].includes(morning.weekday) || isPublicHoliday(morning),
      nights: "les nuits du jeudi, du vendredi, du samedi et les veilles de jours fériés",
      // Zones à la demande, par ligne, au-delà de son dernier arrêt fixe (arrêt à réserver dans
      // l'app TBM avant de monter). Les quartiers de Bordeaux (Caudéran pour N2, Mondésir et
      // Saint-Augustin pour N3) ne sont pas repérables par la commune : seuls les arrêts fixes comptent.
      zones: [
        { line: "N2", communes: ["Le Bouscat", "Le Haillan", "Saint-Aubin-de-Médoc", "Saint-Médard-en-Jalles"] },
        { line: "N3", communes: ["Martignas-sur-Jalle", "Mérignac"] },
        { line: "N4", communes: ["Gradignan", "Pessac", "Talence"] },
        { line: "N5", communes: ["Bègles", "Talence", "Villenave-d'Ornon"] },
        { line: "N6", communes: ["Artigues-près-Bordeaux", "Bouliac", "Cenon", "Floirac"] },
        {
          line: "N7",
          communes: [
            "Ambarès-et-Lagrave",
            "Ambès",
            "Bassens",
            "Carbon-Blanc",
            "Lormont",
            "Saint-Louis-de-Montferrand",
            "Saint-Vincent-de-Paul",
          ],
        },
        { line: "N8", communes: ["Blanquefort", "Bruges", "Eysines", "Parempuyre", "Le Taillan-Médoc"] },
      ],
      zoneInfoUrl: "https://www.infotbm.com/fr/reseau-de-nuit.html",
      // Lignes, arrêts et graphe TBNight, générés par tools/build-graph.mjs --night.
      loadStops: () => import("./night-stops.js").then((m) => m.default),
      loadTimetable,
      loadGraph: () => import("./night-graph.js").then((m) => m.default),
      loadShapes: () => import("./shapes.js").then((m) => m.default), // N1 à N8, dans le même fichier
      evening: evening("night"),
      loadTransfers: () => import("./night-transfers.js").then((m) => m.default),
      clearCache: clearTimetableCache,
    },
  },
};
