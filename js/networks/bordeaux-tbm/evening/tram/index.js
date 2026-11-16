// Généré par tools/build-timetable.mjs (npm run timetable). Ne pas modifier à la main.
// Horaires théoriques du soir, tram (GTFS statique de TBM, version 16/11/2026-04:51) :
// courses qui passent après 17 h, 6 lignes, du 2026-11-16 au 2026-12-06.
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
  days: {"2026-11-16":0,"2026-11-17":1,"2026-11-18":2,"2026-11-19":3,"2026-11-20":3,"2026-11-21":4,"2026-11-22":5,"2026-11-23":6,"2026-11-24":6,"2026-11-25":6,"2026-11-26":7,"2026-11-27":7,"2026-11-28":4,"2026-11-29":5,"2026-11-30":6,"2026-12-01":6,"2026-12-02":6,"2026-12-03":7,"2026-12-04":7,"2026-12-05":4,"2026-12-06":5},
};
