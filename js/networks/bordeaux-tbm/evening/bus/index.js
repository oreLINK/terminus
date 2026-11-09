// Généré par tools/build-timetable.mjs (npm run timetable). Ne pas modifier à la main.
// Horaires théoriques du soir, bus de jour (GTFS statique de TBM, version 09/11/2026-04:51) :
// courses qui passent après 17 h, 61 lignes, du 2026-11-09 au 2026-11-29.
// Lus par js/core/timetable.js. Heures en secondes depuis « midi moins 12 h » du jour de service
// (convention GTFS ; au-delà de 24 h, la nuit suivante).
//   days  : jour de service → type de jour, dont les courses sont dans day-<type>.js :
//     patterns : [route_id, sens, [quais…]] (ligne SIRI : bordeaux:Line:<route_id>:LOC)
//     profiles : écarts en secondes entre deux quais successifs
//     trips    : [trip_id, motif, profil, départ du premier quai] (course SIRI : bordeaux:ServiceJourney:<trip_id>:LOC)
// Quais : identifiants GTFS (ref SIRI : bordeaux:StopPoint:BP:<quai>:LOC) ; leurs noms viennent des
// arrêts du mode, déjà chargés.

export default {
  generatedAt: "2026-11-09",
  feedVersion: "09/11/2026-04:51",
  timeZone: "Europe/Paris",
  nextDay: false, // le soir a aussi besoin du lendemain (bus de nuit rangés sur le jour du matin)
  firstDay: "2026-11-09",
  lastDay: "2026-11-29",
  days: {"2026-11-09":0,"2026-11-10":1,"2026-11-11":2,"2026-11-12":3,"2026-11-13":4,"2026-11-14":5,"2026-11-15":6,"2026-11-16":7,"2026-11-17":8,"2026-11-18":9,"2026-11-19":10,"2026-11-20":11,"2026-11-21":12,"2026-11-22":13,"2026-11-23":14,"2026-11-24":15,"2026-11-25":16,"2026-11-26":17,"2026-11-27":18,"2026-11-28":19,"2026-11-29":20},
};
