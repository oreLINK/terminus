// Gus — génère js/networks/bordeaux-tbm/places.js, le catalogue des lieux connus de Bordeaux Métropole
// proposés dans la recherche d'adresse (avant les adresses de l'IGN, sans appel pendant l'utilisation).
// La liste ci-dessous est la source à relire et compléter : nom affiché, autres noms (alias),
// catégorie, et la recherche à faire. Les coordonnées et la commune viennent du géocodage des points
// d'intérêt de la Géoplateforme de l'IGN, une fois ici : rien n'est écrit de mémoire. Un lieu que
// l'IGN ne trouve pas dans la zone est signalé et laissé de côté ; relire la sortie avant de commiter.
// Usage : npm run places.

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import tbm from "../js/networks/bordeaux-tbm/index.js";
import { distanceM, inBounds } from "../js/core/util.js";
import { normName } from "../js/core/text.js";
import { buildIndex } from "../js/core/stations.js";
import { mergeStops } from "../js/core/compose.js";

const OUT = new URL("../js/networks/bordeaux-tbm/places.js", import.meta.url);
const SEARCH_URL = "https://data.geopf.fr/geocodage/search";
const SPACING_MS = 150; // l'IGN accepte 10 appels par seconde
const MAX_FROM_CENTER_M = 25000;

// [nom affiché, catégorie, recherche IGN, alias, options]. Options : `expect`, le nom attendu chez
// l'IGN s'il diffère du nom affiché ; `address`, une adresse postale à géocoder (index des adresses)
// pour un lieu absent des points d'intérêt de l'IGN, signalée « à vérifier » dans la sortie ; `at`, le
// nom d'une station du réseau dont on prend la position (aéroport : le point de l'IGN est sur
// l'aérodrome, à 730 m du terminal, que dessert l'arrêt Aéroport du tram A).
// Lieux voisins réunis : le Grand Théâtre et l'Opéra sur la place de la Comédie, le Miroir d'eau
// devant la place de la Bourse, le campus de la Victoire sur sa place.
const PLACES = [
  // Monuments et places
  ["Place de la Bourse", "Place", "place de la Bourse Bordeaux", ["Bourse", "Miroir d'eau"]],
  ["Place des Quinconces", "Place", "place des Quinconces Bordeaux", ["Quinconces", "Monument aux Girondins"]],
  ["Place de la Comédie", "Place", "place de la Comédie Bordeaux", ["Comédie", "Grand Théâtre", "Opéra national de Bordeaux"]],
  ["Cathédrale Saint-André", "Monument", "cathédrale Saint-André Bordeaux", ["Saint-André"]],
  ["Tour Pey-Berland", "Monument", "tour Pey-Berland Bordeaux", ["Pey-Berland"]],
  ["Place Pey-Berland", "Place", "place Pey-Berland Bordeaux", []],
  ["Hôtel de Ville de Bordeaux", "Monument", "Palais Rohan Bordeaux", ["Mairie de Bordeaux", "Palais Rohan"], { expect: "Palais Rohan" }],
  ["Porte Cailhau", "Monument", "porte Cailhau Bordeaux", []],
  ["Grosse Cloche", "Monument", "Grosse Cloche Bordeaux", ["Porte Saint-Éloi"]],
  ["Basilique Saint-Michel", "Monument", "basilique Saint-Michel Bordeaux", ["Flèche Saint-Michel"]],
  ["Basilique Saint-Seurin", "Monument", "basilique Saint-Seurin Bordeaux", []],
  ["Pont de pierre", "Monument", "pont de pierre Bordeaux", []],
  ["Pont Jacques Chaban-Delmas", "Monument", "pont Jacques Chaban-Delmas Bordeaux", ["Pont Chaban"]],
  ["Place de la Victoire", "Place", "place de la Victoire Bordeaux", ["Victoire", "Campus de la Victoire"]],
  ["Place Gambetta", "Place", "place Gambetta Bordeaux", ["Gambetta"]],
  ["Place du Parlement", "Place", "place du Parlement Bordeaux", []],
  ["Place Saint-Pierre", "Place", "place Saint-Pierre Bordeaux", []],
  ["Place des Grands Hommes", "Place", "place des Grands Hommes Bordeaux", ["Grands Hommes"]],
  ["Place Stalingrad", "Place", "place de Stalingrad Bordeaux", ["Stalingrad", "Lion bleu"]],
  ["Place de la Ferme de Richemont", "Place", "place de la Ferme de Richemont Bordeaux", []],
  ["Rue Sainte-Catherine", "Rue commerçante", "rue Sainte-Catherine Bordeaux", ["Sainte-Catherine", "Promenade Sainte-Catherine"]],
  ["Quai des Chartrons", "Quai", "quai des Chartrons Bordeaux", ["Chartrons"]],
  // Musées et culture
  ["La Cité du Vin", "Musée", "la Cité du Vin", ["Cité du Vin"]],
  ["Musée d'Aquitaine", "Musée", "musée d'Aquitaine Bordeaux", []],
  ["CAPC musée d'art contemporain", "Musée", "CAPC musée d'art contemporain Bordeaux", ["CAPC", "Entrepôt Lainé"]],
  ["Musée des Beaux-Arts", "Musée", "musée des Beaux-Arts Bordeaux", ["MusBA"]],
  ["Musée Mer Marine", "Musée", "musée Mer Marine Bordeaux", []],
  ["Musée des Arts décoratifs et du Design", "Musée", "musée des Arts décoratifs et du Design Bordeaux", ["MADD"]],
  ["Muséum de Bordeaux", "Musée", "Muséum Bordeaux", ["Muséum d'histoire naturelle"], { expect: "Museum d'Histoire Naturelle" }],
  ["Cap Sciences", "Musée", "Cap Sciences Bordeaux", []],
  ["Bassins des Lumières", "Musée", "Bassins des Lumières Bordeaux", ["Base sous-marine"]],
  ["MÉCA", "Musée", "", ["Frac Nouvelle-Aquitaine", "Maison de l'économie créative"], { address: "5 parvis Corto Maltese 33800 Bordeaux" }],
  // Lieux de sortie
  ["Darwin", "Lieu de vie", "Darwin écosystème Bordeaux", ["Caserne Niel"]],
  ["Marché des Capucins", "Marché", "marché des Capucins Bordeaux", ["Capucins"]],
  ["Halles de Bacalan", "Marché", "", [], { address: "10 quai de Bacalan 33300 Bordeaux" }],
  ["Bassins à flot", "Quartier", "bassins à flot Bordeaux", []],
  ["Mériadeck", "Centre commercial", "centre commercial Mériadeck Bordeaux", []],
  // Salles et stades
  ["Matmut Atlantique", "Stade", "stade Matmut Atlantique Bordeaux", ["Stade de Bordeaux", "Nouveau stade"]],
  ["Stade Chaban-Delmas", "Stade", "stade Chaban-Delmas Bordeaux", ["Parc Lescure"]],
  ["Arkéa Arena", "Salle de spectacle", "", ["Arena"], { address: "48 avenue Jean Alfonséa 33270 Floirac" }],
  ["Patinoire Mériadeck", "Salle de sport", "patinoire Mériadeck Bordeaux", ["Patinoire"]],
  ["Rocher de Palmer", "Salle de spectacle", "", ["Palmer"], { address: "1 rue Aristide Briand 33150 Cenon" }],
  ["Krakatoa", "Salle de spectacle", "", [], { address: "3 avenue Victor Hugo 33700 Mérignac" }],
  ["Théâtre Fémina", "Salle de spectacle", "", ["Fémina"], { address: "10 rue de Grassi 33000 Bordeaux" }],
  ["Parc des expositions", "Salle d'exposition", "parc des expositions Bordeaux", ["Parc des expos", "Bordeaux Lac"]],
  ["Palais des congrès", "Salle d'exposition", "palais des congrès Bordeaux", []],
  // Transports, études, santé
  ["Gare Saint-Jean", "Gare", "gare de Bordeaux Saint-Jean", ["Gare de Bordeaux", "Saint-Jean"]],
  ["Aéroport de Bordeaux-Mérignac", "Aéroport", "", ["Aéroport"], { at: "Aéroport", commune: "Mérignac" }],
  ["Campus de Talence-Pessac", "Université", "université de Bordeaux campus Talence", ["Université de Bordeaux", "Campus", "Fac"], { expect: "Campus Universitaire de Pessac Talence Gradignan" }],
  ["Hôpital Pellegrin", "Hôpital", "hôpital Pellegrin Bordeaux", ["CHU Pellegrin", "CHU"]],
  ["Hôpital Saint-André", "Hôpital", "hôpital Saint-André Bordeaux", []],
  ["Hôpital Haut-Lévêque", "Hôpital", "hôpital Haut-Lévêque Pessac", []],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const first = (x) => (Array.isArray(x) ? x[0] : x);
const { area } = tbm;

// Mots qui ne distinguent pas un lieu d'un autre, ignorés pour comparer les noms.
const FILLER = new Set("de du des la le les l d et a au aux en sur bordeaux place rue quai musee parc jardin site campus".split(" "));
const words = (s) => normName(s).split(" ").filter((w) => w.length > 1 && !FILLER.has(w));
// Le nom trouvé correspond-il au lieu cherché ? Tous ses mots distinctifs (au moins un) se retrouvent
// dans le nom de l'IGN (ou l'inverse pour un nom IGN plus court), au début d'un mot.
function sameName(ours, theirs) {
  const a = words(ours);
  const b = words(theirs);
  const has = (list, w) => list.some((x) => x.startsWith(w) || w.startsWith(x));
  return a.length > 0 && b.length > 0 && (a.every((w) => has(b, w)) || b.every((w) => has(a, w)));
}
// Catégories de l'IGN qui ne désignent pas le lieu lui-même (l'arrêt voisin, un parking, une commune).
const NOT_THE_PLACE = /station de tram|arrêt|transport|parking|administratif|lieu-dit|quartier/i;

async function search(params) {
  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({ lat: String(area.center.lat), lon: String(area.center.lon), ...params });
  const res = await fetch(url);
  await sleep(SPACING_MS);
  if (!res.ok) throw new Error(`IGN ${res.status}`);
  return (await res.json()).features ?? [];
}

// Le lieu : un point d'intérêt de l'IGN de même nom ; pour une place, une rue ou un quai, d'abord la
// voie elle-même (index des adresses). null si rien de sûr : le lieu est laissé de côté.
// Stations du réseau (tram, bus, TBNight), pour l'option `at`.
const stationsData = await Promise.all(["stops.js", "bus-stops.js", "night-stops.js"].map(async (f) => (await import(new URL(`../js/networks/bordeaux-tbm/${f}`, import.meta.url))).default));
const stations = buildIndex(mergeStops(stationsData).stops).stations;

async function locate(name, category, query, { expect, address, at, commune } = {}) {
  if (at) {
    const st = stations.find((x) => normName(x.name) === normName(at));
    return st ? { lat: st.lat, lon: st.lon, name: `station ${st.name}`, city: commune, category: "position de la station" } : null;
  }
  if (address) {
    // Adresse postale : le numéro (ou la voie) dans la bonne commune, celle écrite dans l'adresse.
    const city = normName(address.replace(/^.*\d{5}\s+/, ""));
    const f = (await search({ q: address, index: "address", limit: "3" })).find((x) => normName(x.properties?.city ?? "") === city && ["housenumber", "street"].includes(x.properties?.type));
    return f ? { lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], name: f.properties.label, city: f.properties.city, category: `adresse, à vérifier` } : null;
  }
  const found = [];
  if (/^(Place|Rue commerçante|Quai)$/.test(category)) {
    for (const f of await search({ q: query, index: "address", type: "street", limit: "5" })) {
      found.push({ lat: f.geometry?.coordinates?.[1], lon: f.geometry?.coordinates?.[0], name: f.properties?.name ?? f.properties?.street, city: f.properties?.city, dep: String(f.properties?.postcode ?? "").slice(0, 2), category: "voie" });
    }
  }
  for (const f of await search({ q: query, index: "poi", limit: "10" })) {
    found.push({ lat: f.geometry?.coordinates?.[1], lon: f.geometry?.coordinates?.[0], name: first(f.properties?.name) ?? f.properties?.toponym, city: first(f.properties?.city), dep: first(f.properties?.depcode), category: first(f.properties?.category) ?? "" });
  }
  // Un parc doit être un parc ou un jardin (et non la mairie de quartier ou le golf du même nom).
  const fits = (p) => category !== "Parc" || /parc|jardin|espace vert|bois/i.test(p.category);
  return found.find((p) => p.dep === area.department && p.city && !NOT_THE_PLACE.test(p.category) && fits(p) && inBounds(area.bounds, p) && distanceM(area.center, p) <= MAX_FROM_CENTER_M && sameName(expect ?? name, p.name)) ?? null;
}

const places = [];
const missing = [];
for (const [name, category, query, aliases, options] of PLACES) {
  const hit = await locate(name, category, query || name, options).catch(() => null);
  if (!hit) {
    missing.push(name);
    continue;
  }
  places.push({ name, aliases, category, lat: +hit.lat.toFixed(5), lon: +hit.lon.toFixed(5), commune: hit.city, ign: `${hit.name} (${hit.category}, ${hit.city})` });
}

const names = new Set();
for (const p of places) {
  const k = normName(p.name);
  if (names.has(k)) throw new Error(`Nom en double : ${p.name}`);
  names.add(k);
}

const j = JSON.stringify;
await writeFile(
  OUT,
  `// Généré par tools/build-places.mjs (npm run places). Ne pas modifier à la main : la liste des lieux
// est dans l'outil. Lieux connus proposés dans la recherche d'adresse (js/core/place-search.js) :
// nom, autres noms, catégorie, position et commune venues du géocodage des points d'intérêt de l'IGN.
// En commentaire : le point d'intérêt retenu par l'IGN, pour relire.

export default {
  generatedAt: ${j(new Date().toISOString().slice(0, 10))},
  places: [
${places.map(({ ign, ...p }) => `    ${j(p)}, // ${ign}`).join("\n")}
  ],
};
`,
);
console.log(`${places.length} lieux → ${fileURLToPath(OUT)}`);
for (const p of places) console.log(`  ${p.name.padEnd(42)} ← ${p.ign}`);
if (missing.length) console.log(`Introuvables dans la zone (laissés de côté) : ${missing.join(", ")}`);
