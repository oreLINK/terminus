// Généré par tools/build-timetable.mjs (npm run timetable). Ne pas modifier à la main.
// Horaires théoriques du soir, TBNight (GTFS statique de TBM, version 23/10/2026-04:51) :
// toutes les courses, 8 lignes, du 2026-10-23 au 2026-11-12.
// Lus par js/core/timetable.js. Heures en secondes depuis « midi moins 12 h » du jour de service
// (convention GTFS ; au-delà de 24 h, la nuit suivante).
//   days  : jour de service → type de jour, dont les courses sont dans day-<type>.js :
//     patterns : [route_id, sens, [quais…]] (ligne SIRI : bordeaux:Line:<route_id>:LOC)
//     profiles : écarts en secondes entre deux quais successifs
//     trips    : [trip_id, motif, profil, départ du premier quai] (course SIRI : bordeaux:ServiceJourney:<trip_id>:LOC)
// Quais : identifiants GTFS (ref SIRI : bordeaux:StopPoint:BP:<quai>:LOC) ; leurs noms viennent des
// arrêts du mode, déjà chargés.

export default {
  generatedAt: "2026-10-23",
  feedVersion: "23/10/2026-04:51",
  timeZone: "Europe/Paris",
  nextDay: true, // le soir a aussi besoin du lendemain (bus de nuit rangés sur le jour du matin)
  firstDay: "2026-10-23",
  lastDay: "2026-11-12",
  days: {"2026-10-23":0,"2026-10-24":1,"2026-10-25":2,"2026-10-26":2,"2026-10-27":2,"2026-10-28":2,"2026-10-29":3,"2026-10-30":3,"2026-10-31":4,"2026-11-01":2,"2026-11-02":2,"2026-11-03":2,"2026-11-04":2,"2026-11-05":3,"2026-11-06":3,"2026-11-07":4,"2026-11-08":2,"2026-11-09":2,"2026-11-10":3,"2026-11-11":2,"2026-11-12":3},
};
