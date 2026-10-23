// Généré par tools/build-transfers.mjs (npm run transfers). Ne pas modifier à la main.
// Correspondances à pied tram entre stations proches de noms différents (moins de 400 m
// à vol d'oiseau, au plus 600 m de marche, changement de ligne), marche par les rues calculée par
// l'IGN à la génération. Lu par transferMap
// (js/features/last-ride/planner.js) : [station A, station B, mètres, tracé encodé (encodeLine) ou null
// si l'IGN n'a pas répondu (estimation)]. Identifiants des stations : buildIndex(stops.js).

export default {
  generatedAt: "2026-10-23",
  rows: [
    ["capc musee d art contemporain","jardin public",499,[4484909,-57058,-86,-28,-39,-452,37,-7]], // CAPC Musée d'Art Contemporain ↔ Jardin Public
    ["place de la bourse","quinconces fleuve",357,[4484161,-56954,174,-70,-5,-25,118,-34]], // Place de la Bourse ↔ Quinconces Fleuve
    ["sainte catherine","musee d aquitaine",373,[4483758,-57327,-4,-52,-58,10,-3,-51,-14,-50,-24,-63,-21,-34,-78,41]], // Sainte-Catherine ↔ Musée d'Aquitaine
  ],
  // Paires écartées, marche de plus de 600 m : [station A, station B, mètres] (non utilisées,
  // gardées pour ne pas les redemander à l'IGN à la prochaine génération).
  tooLong: [

  ],
};
