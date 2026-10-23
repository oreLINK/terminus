import assert from "node:assert/strict";
import { test } from "node:test";

import { buildPlaceIndex, searchPlaces } from "../js/core/place-search.js";
import { mergeStops } from "../js/core/compose.js";
import { distanceM, inBounds } from "../js/core/util.js";
import { normName } from "../js/core/text.js";
import tbm from "../js/networks/bordeaux-tbm/index.js";

const PLACES = [
  { name: "La Cité du Vin", aliases: ["Cité du Vin"], category: "Musée", lat: 44.8624, lon: -0.55, commune: "Bordeaux" },
  { name: "Tour Pey-Berland", aliases: ["Pey-Berland"], category: "Monument", lat: 44.8378, lon: -0.5773, commune: "Bordeaux" },
  { name: "Place de la Comédie", aliases: ["Grand Théâtre", "Opéra"], category: "Place", lat: 44.8424, lon: -0.5747, commune: "Bordeaux" },
];
const STOPS = {
  lines: { L1: { code: "B" }, L2: { code: "5" }, L3: { code: "N1" } },
  stops: [
    { ref: "s1", name: "Victoire", lat: 44.8309, lon: -0.5727, lines: ["L1", "L2"] },
    { ref: "s2", name: "Victoire", lat: 44.8310, lon: -0.5730, lines: ["L3"] },
    { ref: "s3", name: "Peylanne", lat: 44.8, lon: -0.6, lines: ["L2"] },
  ],
};
const index = buildPlaceIndex({ places: PLACES, stops: STOPS });
const labels = (q) => searchPlaces(index, q).map((r) => `${r.kind}:${r.label}`);

test("recherche : sans accents ni majuscules, début des mots, dans n'importe quel ordre", () => {
  assert.deepEqual(labels("CITE DU")[0], "place:La Cité du Vin");
  assert.deepEqual(labels("vin cite")[0], "place:La Cité du Vin");
  assert.deepEqual(labels("opéra"), ["place:Place de la Comédie"]);
  assert.deepEqual(labels("xyz"), []);
});

test("recherche : un mot tapé en entier passe avant un simple début de mot", () => {
  assert.deepEqual(labels("pey"), ["place:Tour Pey-Berland", "station:Peylanne"]);
});

test("stations : quais regroupés par nom, lignes dans l'ordre tram, bus, nuit ; pas de commune", () => {
  const [v] = searchPlaces(index, "victoire");
  assert.equal(v.kind, "station");
  assert.equal(v.detail, "Station · lignes B, 5, N1");
  assert.equal(v.commune, null);
  assert.ok(distanceM(v, { lat: 44.83095, lon: -0.57285 }) < 30);
});

test("catalogue de Bordeaux : lieux complets, dans la zone, noms uniques, et index du réseau", async () => {
  const places = await tbm.area.places();
  assert.ok(places.length >= 40, `${places.length} lieux`);
  const names = new Set();
  for (const p of places) {
    assert.ok(p.name && p.category && p.commune, p.name);
    assert.ok(inBounds(tbm.area.bounds, p), `${p.name} hors de la zone`);
    assert.ok(!names.has(normName(p.name)), `${p.name} en double`);
    names.add(normName(p.name));
  }
  const full = buildPlaceIndex({ places, stops: await tbm.area.stations() });
  assert.equal(searchPlaces(full, "cite du vin")[0].label, "La Cité du Vin");
  assert.equal(searchPlaces(full, "miroir")[0].label, "Place de la Bourse");
  assert.ok(searchPlaces(full, "gare saint jean").some((r) => r.kind === "station"));
});

test("stations de la recherche : tram, bus et TBNight réunis", async () => {
  const merged = mergeStops([(await import("../js/networks/bordeaux-tbm/stops.js")).default, (await import("../js/networks/bordeaux-tbm/night-stops.js")).default]);
  const all = await tbm.area.stations();
  assert.ok(all.stops.length > merged.stops.length);
});

test("destination choisie dans les suggestions : sa commune est gardée (zones à la demande)", async () => {
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const { saveHome, getHome } = await import("../js/core/home.js");
  saveHome({ id: "test" }, { label: "Rocher de Palmer", lat: 44.85, lon: -0.53, commune: "Cenon", kind: "place" });
  assert.deepEqual(getHome({ id: "test" }), { label: "Rocher de Palmer", lat: 44.85, lon: -0.53, commune: "Cenon" });
  saveHome({ id: "test" }, { label: "12 Rue X 33000 Bordeaux", lat: 44.84, lon: -0.57 });
  assert.equal(getHome({ id: "test" }).commune, undefined); // une adresse dit sa commune dans son libellé
});
