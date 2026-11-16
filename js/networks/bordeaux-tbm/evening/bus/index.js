// Généré par tools/build-timetable.mjs (npm run timetable). Ne pas modifier à la main.
// Horaires théoriques du soir, bus de jour (GTFS statique de TBM, version 16/11/2026-04:51) :
// courses qui passent après 17 h, 61 lignes, du 2026-11-16 au 2026-12-06.
// Lus par js/core/timetable.js. Heures en secondes depuis « midi moins 12 h » du jour de service
// (convention GTFS ; au-delà de 24 h, la nuit suivante).
//   days  : jour de service → type de jour, dont les courses sont dans day-<type>.js :
//     patterns : [route_id, sens, [quais…]] (ligne SIRI : bordeaux:Line:<route_id>:LOC)
//     profiles : écarts en secondes entre deux quais successifs
//     trips    : [trip_id, motif, profil, départ du premier quai] (course SIRI : bordeaux:ServiceJourney:<trip_id>:LOC)
// Quais : identifiants GTFS (ref SIRI : bordeaux:StopPoint:BP:<quai>:LOC) ; leurs noms viennent des
// arrêts du mode, déjà chargés.

export default {
  generatedAt: "2026-11-16",
  feedVersion: "16/11/2026-04:51",
  timeZone: "Europe/Paris",
  nextDay: false, // le soir a aussi besoin du lendemain (bus de nuit rangés sur le jour du matin)
  firstDay: "2026-11-16",
  lastDay: "2026-12-06",
  days: {"2026-11-16":0,"2026-11-17":1,"2026-11-18":2,"2026-11-19":3,"2026-11-20":4,"2026-11-21":5,"2026-11-22":6,"2026-11-23":7,"2026-11-24":8,"2026-11-25":9,"2026-11-26":10,"2026-11-27":11,"2026-11-28":12,"2026-11-29":13,"2026-11-30":7,"2026-12-01":8,"2026-12-02":14,"2026-12-03":10,"2026-12-04":11,"2026-12-05":15,"2026-12-06":16},
};
