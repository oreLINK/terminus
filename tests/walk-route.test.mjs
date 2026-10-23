import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoute, realWalk, fetchWalk } from "../js/core/walk-route.js";
import { walkBetween, walkMinutes } from "../js/core/util.js";

// Extrait d'une vraie réponse de la Géoplateforme (profil pedestrian), raccourci.
const SAMPLE = {
  distance: 1709.1,
  distanceUnit: "meter",
  duration: 1683.6,
  geometry: { type: "LineString", coordinates: [[-0.575697, 44.837791], [-0.575595, 44.83781], [-0.568304, 44.8256]] },
};

test("itinéraire IGN : distance en mètres et tracé en [lat, lon]", () => {
  const r = parseRoute(SAMPLE);
  assert.equal(r.meters, 1709.1);
  assert.deepEqual(r.path[0], [44.837791, -0.575697]);
  assert.ok(Math.abs(parseRoute({ ...SAMPLE, distance: 1.7091, distanceUnit: "kilometer" }).meters - 1709.1) < 1e-3);
  assert.throws(() => parseRoute({ distance: 12 }));
  assert.throws(() => parseRoute(null));
});

test("marche réelle : la vraie distance au pas de Terminus, pas le temps de l'IGN", () => {
  const estimate = walkBetween({ lat: 44.837791, lon: -0.575697 }, { lat: 44.8256, lon: -0.568304 });
  const w = realWalk(estimate, parseRoute(SAMPLE));
  assert.equal(w.minutes, walkMinutes(1709.1)); // 22 min à 4,7 km/h, et non les 28 de l'IGN
  assert.equal(w.minutes, 22);
  assert.equal(w.straight, estimate.straight);
  assert.ok(w.real && w.path.length === 3);
});

test("appel IGN : un refus (429) est retenté, un échec renvoie null", async () => {
  const realFetch = globalThis.fetch;
  try {
    const answers = [{ status: 429 }, { status: 200, body: SAMPLE }];
    let calls = 0;
    globalThis.fetch = async () => {
      const a = answers[calls++];
      return { ok: a.status === 200, status: a.status, json: async () => a.body };
    };
    const r = await fetchWalk({ lat: 44.8378, lon: -0.5757 }, { lat: 44.8256, lon: -0.5683 }, { retryMs: 5 });
    assert.equal(calls, 2);
    assert.equal(r.meters, 1709.1);

    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
    assert.equal(await fetchWalk({ lat: 44.8, lon: -0.5 }, { lat: 44.81, lon: -0.51 }, { retryMs: 5 }), null);
  } finally {
    globalThis.fetch = realFetch;
  }
});
