// Généré par tools/build-transfers.mjs (npm run transfers). Ne pas modifier à la main.
// Correspondances à pied TBNight entre stations proches de noms différents (moins de 400 m,
// changement de ligne), marche par les rues calculée par l'IGN à la génération. Lu par transferMap
// (js/features/last-ride/planner.js) : [station A, station B, mètres, tracé encodé (encodeLine) ou null
// si l'IGN n'a pas répondu (estimation)]. Identifiants des stations : buildIndex(night-stops.js).

export default {
  generatedAt: "2026-10-23",
  rows: [
    ["bourse du travail","costedoat",131,[4483210,-57830,-9,39,-86,-24]], // Bourse du Travail ↔ Costedoat
    ["bourse du travail","republique",472,[4483216,-57857,-15,66,321,-53,-5,-73]], // Bourse du Travail ↔ République
    ["galerie des beaux arts","gambetta meriadeck",182,[4483909,-58166,-25,-13,23,-8,-17,-108,34,-7]], // Galerie des Beaux Arts ↔ Gambetta Mériadeck
    ["gambetta","gambetta meriadeck",331,[4484086,-58091,-41,8,-28,-18,-20,-211,-73,10]], // Gambetta ↔ Gambetta Mériadeck
    ["gambetta","saint seurin",382,[4484086,-58091,74,-17,-11,-197,3,-23,50,-139]], // Gambetta ↔ Saint-Seurin
    ["gare saint jean rue saint vincent de paul","gare saint jean",197,[4482649,-55747,-24,22,-5,34,8,9,61,23,36,-12,3,-18]], // Gare Saint-Jean (rue Saint-Vincent de Paul) ↔ Gare Saint-Jean
    ["gare saint jean sous la halle","gare saint jean",191,[4482603,-55722,22,-3,-5,34,8,9,58,23,39,-12,3,-18]], // Gare Saint-Jean (sous la Halle) ↔ Gare Saint-Jean
    ["gare saint jean sous la halle","gare saint jean rue saint vincent de paul",56,[4482603,-55722,19,-1,27,-24]], // Gare Saint-Jean (sous la Halle) ↔ Gare Saint-Jean (rue Saint-Vincent de Paul)
    ["jardin public","quinconces",441,[4484677,-57686,-17,-11,-20,57,-41,-24,-26,77,-47,-10,-34,20,-21,33,-11,37,7,116]], // Jardin Public ↔ Quinconces
    ["journu auber","medoc place saint martial",380,[4485942,-56905,-10,-6,-130,179,106,149]], // Journu Auber ↔ Médoc (Place Saint-Martial)
    ["leybardie","cite chantecrit",488,[4486128,-56271,36,51,216,-314,18,58,20,36]], // Leybardie ↔ Cité Chantecrit
    ["quai de brazza","lajaunie",235,[4485575,-55002,43,88,68,117,-5,7,14,22]], // Quai de Brazza ↔ Lajaunie
    ["saint michel","salinieres",482,[4483446,-56304,43,-44,-21,-35,43,-48,-19,-32,126,-175,-8,-46,-25,-64]], // Saint Michel ↔ Salinières
    ["tourny","quinconces",420,[4484563,-57765,-36,-29,-6,18,-13,1,18,178,-34,20,-26,46,-7,53,8,87]], // Tourny ↔ Quinconces
    ["victoire somme","victoire",214,[4482983,-57235,67,-14,-6,-25,6,-16,43,-27,16,-59]], // Victoire (Somme) ↔ Victoire
  ],
};
