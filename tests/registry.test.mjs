import assert from "node:assert/strict";
import { test } from "node:test";

// localStorage minimal pour tester le stockage hors navigateur.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { NETWORKS, getNetwork, networkAt } = await import("../js/networks/index.js");
const { FEATURES, DEFAULT_FEATURE, featuresFor } = await import("../js/features/index.js");
const { getHome, saveHome } = await import("../js/core/home.js");

test("chaque réseau est complet et ne déclare que des types d'information connus", () => {
  const known = new Set(FEATURES.map((f) => f.id));
  const ids = new Set();
  for (const n of NETWORKS) {
    assert.ok(n.id && n.city && n.name && n.attribution, n.id);
    assert.ok(!ids.has(n.id), `identifiant en double : ${n.id}`);
    ids.add(n.id);
    for (const key of ["south", "north", "west", "east"]) {
      assert.ok(Number.isFinite(n.coverage[key]), `${n.id} coverage.${key}`);
      assert.ok(Number.isFinite(n.area.bounds[key]), `${n.id} area.bounds.${key}`);
    }
    assert.ok(n.area.department && n.area.label && n.area.center, n.id);
    assert.ok(Object.keys(n.features).length > 0, `${n.id} ne fournit aucune information`);
    for (const id of Object.keys(n.features)) assert.ok(known.has(id), `${n.id} : type inconnu ${id}`);
  }
});

test("chaque type d'information expose son interface", () => {
  assert.ok(FEATURES.some((f) => f.id === DEFAULT_FEATURE));
  for (const f of FEATURES) {
    assert.ok(f.id && f.title && f.short && f.description, f.id);
    assert.equal(typeof f.mount, "function", f.id);
  }
});

test("l'adaptateur du dernier tram fournit les fonctions attendues", () => {
  for (const n of NETWORKS) {
    const a = n.features["last-ride"];
    if (!a) continue;
    assert.equal(typeof a.loadStops, "function", n.id);
    assert.equal(typeof a.loadTimetable, "function", n.id);
    assert.ok(a.vehicle, n.id);
  }
});

test("la ville est choisie d'après la position", () => {
  assert.equal(networkAt({ lat: 44.8378, lon: -0.5792 })?.id, "bordeaux-tbm"); // place de la Comédie
  assert.equal(networkAt({ lat: 48.8566, lon: 2.3522 }), null); // Paris : aucun réseau
  assert.equal(networkAt(null), null);
  assert.deepEqual(featuresFor(getNetwork("bordeaux-tbm")).map((f) => f.id), ["last-ride"]);
});

test("le domicile est rangé par réseau et l'ancienne adresse est reprise", () => {
  const bdx = getNetwork("bordeaux-tbm");
  store.clear();
  store.set("dt.home.v1", JSON.stringify({ label: "Ancienne", lat: 44.84, lon: -0.57 }));
  assert.equal(getHome(bdx).label, "Ancienne");
  assert.equal(JSON.parse(store.get("dt.homes.v1"))["bordeaux-tbm"].label, "Ancienne");

  saveHome(bdx, { label: "Nouvelle", lat: 44.85, lon: -0.56, extra: "ignoré" });
  assert.deepEqual(getHome(bdx), { label: "Nouvelle", lat: 44.85, lon: -0.56 });
  assert.equal(getHome({ id: "ailleurs" }), null);
});
