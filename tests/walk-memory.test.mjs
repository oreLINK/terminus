import assert from "node:assert/strict";
import { test, beforeEach } from "node:test";

// Stockage local simulé (Node n'en a pas) : le module le lit à l'usage.
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
const { recallWalks, rememberWalks } = await import("../js/core/walk-memory.js");

const home = { lat: 44.8378, lon: -0.5797 };
const st = (id, lat, lon) => ({ id, lat, lon });
const victoire = st("victoire", 44.8309, -0.5727);
const walk = { straight: 760, meters: 1012.4, minutes: 13, path: [[44.8309, -0.5727], [44.834, -0.576], [44.8378, -0.5797]], real: true };
const DAY = 24 * 3600 * 1000;
const NOW = Date.parse("2026-10-23T20:00:00Z");

beforeEach(() => store.clear());

test("marche gardée puis reprise pour la même destination et la même station", () => {
  rememberWalks("bordeaux-tbm", home, [victoire], new Map([["victoire", walk]]), NOW);
  const got = recallWalks("bordeaux-tbm", { lat: home.lat + 0.0001, lon: home.lon }, [victoire], NOW + DAY);
  const w = got.get("victoire");
  assert.ok(w?.real);
  assert.equal(w.meters, 1012);
  assert.equal(w.minutes, 13);
  assert.deepEqual(w.path.at(-1), [44.8378, -0.5797]);
});

test("rien de repris pour une autre destination, un autre réseau, un autre centre de station ou au bout d'un mois", () => {
  rememberWalks("bordeaux-tbm", home, [victoire], new Map([["victoire", walk]]), NOW);
  assert.equal(recallWalks("bordeaux-tbm", { lat: 44.85, lon: -0.57 }, [victoire], NOW).size, 0);
  assert.equal(recallWalks("autre-reseau", home, [victoire], NOW).size, 0);
  assert.equal(recallWalks("bordeaux-tbm", home, [st("victoire", 44.8311, -0.5727)], NOW).size, 0);
  assert.equal(recallWalks("bordeaux-tbm", home, [victoire], NOW + 31 * DAY).size, 0);
});

test("seules les marches réelles sont gardées ; une nouvelle destination remplace l'ancienne", () => {
  rememberWalks("bordeaux-tbm", home, [victoire], new Map([["victoire", { ...walk, real: false }]]), NOW);
  assert.equal(recallWalks("bordeaux-tbm", home, [victoire], NOW).size, 0);
  rememberWalks("bordeaux-tbm", home, [victoire], new Map([["victoire", walk]]), NOW);
  const elsewhere = { lat: 44.86, lon: -0.6 };
  rememberWalks("bordeaux-tbm", elsewhere, [victoire], new Map([["victoire", walk]]), NOW);
  assert.equal(recallWalks("bordeaux-tbm", home, [victoire], NOW).size, 0);
  assert.equal(recallWalks("bordeaux-tbm", elsewhere, [victoire], NOW).size, 1);
});

test("clé dt. : effacée par le bouton de la page Confidentialité", () => {
  rememberWalks("bordeaux-tbm", home, [victoire], new Map([["victoire", walk]]), NOW);
  assert.ok([...store.keys()].every((k) => k.startsWith("dt.")));
});
