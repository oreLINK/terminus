// Généré par tools/build-timetable.mjs (npm run timetable). Ne pas modifier à la main.
// Horaires théoriques du soir, tram (GTFS statique de TBM, version 23/10/2026-04:51) :
// courses qui passent après 17 h, 6 lignes, du 2026-10-23 au 2026-11-12.
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
  nextDay: false, // le soir a aussi besoin du lendemain (bus de nuit rangés sur le jour du matin)
  firstDay: "2026-10-23",
  lastDay: "2026-11-12",
  days: {"2026-10-23":0,"2026-10-24":1,"2026-10-25":2,"2026-10-26":3,"2026-10-27":3,"2026-10-28":3,"2026-10-29":4,"2026-10-30":4,"2026-10-31":5,"2026-11-01":6,"2026-11-02":7,"2026-11-03":7,"2026-11-04":7,"2026-11-05":8,"2026-11-06":8,"2026-11-07":5,"2026-11-08":6,"2026-11-09":7,"2026-11-10":8,"2026-11-11":6,"2026-11-12":8},
};
