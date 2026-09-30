// Réseau TBM, Bordeaux Métropole.
// Décrit la ville et, pour chaque type d'information qu'il sait fournir, l'adaptateur de données.

import { loadNetwork, loadTimetable, clearTimetableCache } from "./siri-lite.js";

export default {
  id: "bordeaux-tbm",
  city: "Bordeaux",
  name: "TBM, Bordeaux Métropole",

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
  lineColors: { A: "#831F82", B: "#E50040", C: "#D35098", D: "#9262A3", E: "#967651", F: "#F08700" },
  lineInk: "#FFFFFF",

  nightHint: "Pensez aux bus de nuit TBNight ou à Le Vélo.",
  attribution:
    "Horaires : Bordeaux Métropole, flux SIRI-Lite du réseau TBM (Licence Ouverte). Site indépendant, sans lien avec TBM ni Keolis.",

  // Adresse enregistrée avant les réseaux multiples, reprise une seule fois.
  legacyHomeKey: "dt.home.v1",

  // Types d'information disponibles sur ce réseau, avec leur adaptateur.
  features: {
    "last-ride": {
      vehicle: "tram",
      loadStops: loadNetwork, // → { lines: { [ref]: { ref, code } }, stops: [{ ref, name, lat, lon, lines }] }
      loadTimetable, // (lineRef, direction) → [{ id, line, headsign, calls: [...] }]
      // Ordre des arrêts par ligne et par sens, généré par tools/build-graph.mjs, chargé à la demande.
      loadGraph: () => import("./graph.js").then((m) => m.default), // → { names, patterns: [{ line, direction, stops }] }
      clearCache: clearTimetableCache,
    },
  },
};
