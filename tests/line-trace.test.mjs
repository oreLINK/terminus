import assert from "node:assert/strict";
import { test } from "node:test";

import { encodeLine, decodeLine, simplifyLine, traceAlong, lengthM } from "../js/core/line-trace.js";
import shapes from "../js/networks/bordeaux-tbm/shapes.js";

// Tracé fictif en L : vers l'est le long d'une rue, puis vers le nord.
const L = [
  [44.84, -0.6],
  [44.84, -0.595],
  [44.84, -0.59],
  [44.845, -0.59],
  [44.85, -0.59],
];
const at = (lat, lon) => ({ lat, lon });

test("encodage des tracés : aller-retour au mètre près", () => {
  const back = decodeLine(encodeLine(L));
  back.forEach(([lat, lon], i) => {
    assert.ok(Math.abs(lat - L[i][0]) < 1e-5 && Math.abs(lon - L[i][1]) < 1e-5);
  });
});

test("simplification : les points alignés tombent, le coin reste", () => {
  const s = simplifyLine(L, 4);
  assert.deepEqual(s, [L[0], L[2], L[4]]);
});

test("découpage : le tronçon suit le coin du tracé, de quai à quai", () => {
  // Montée près du début, descente sur la branche nord : le tracé passe par le coin.
  const t = traceAlong([at(44.8401, -0.5995), at(44.8475, -0.5899)], [L]);
  assert.ok(t);
  assert.deepEqual(t[0], [44.8401, -0.5995]);
  assert.deepEqual(t.at(-1), [44.8475, -0.5899]);
  assert.ok(t.some(([lat, lon]) => lat === 44.84 && lon === -0.59), "passe par le coin");
  // Plus long que la ligne droite : il suit les voies.
  assert.ok(lengthM(t) > lengthM([t[0], t.at(-1)]) * 1.2);
});

test("découpage : dans l'autre sens, le tracé est pris à l'envers", () => {
  const t = traceAlong([at(44.8475, -0.5899), at(44.8401, -0.5995)], [L]);
  assert.ok(t);
  assert.ok(t.some(([lat, lon]) => lat === 44.84 && lon === -0.59));
});

test("découpage : un quai loin de tout tracé, ligne droite (null)", () => {
  assert.equal(traceAlong([at(44.86, -0.62), at(44.8475, -0.5899)], [L]), null);
  assert.equal(traceAlong([at(44.8401, -0.5995)], [L]), null);
  assert.equal(traceAlong([at(44.8401, -0.5995), at(44.8475, -0.5899)], []), null);
});

test("tracés TBM : presque tous les parcours du graphe suivent un tracé", async () => {
  for (const [sf, gf] of [["stops", "graph"], ["night-stops", "night-graph"]]) {
    const stops = (await import(`../js/networks/bordeaux-tbm/${sf}.js`)).default;
    const graph = (await import(`../js/networks/bordeaux-tbm/${gf}.js`)).default;
    const pos = new Map(stops.stops.map((s) => [s.ref, at(s.lat, s.lon)]));
    const code = Object.fromEntries(Object.values(stops.lines).map((l) => [l.ref, l.code]));
    let ok = 0;
    let total = 0;
    for (const p of graph.patterns) {
      const lines = (shapes.lines[code[p.line]] ?? []).map(decodeLine);
      const path = p.stops.map((r) => pos.get(r)).filter(Boolean);
      for (const piece of [path, path.slice(0, 3), path.slice(-3)]) {
        total++;
        if (traceAlong(piece, lines)) ok++;
      }
    }
    // Quelques branches manquent au GTFS (tram E vers Gare de Bègles) : la carte les relie en ligne droite.
    assert.ok(ok / total >= 0.9, `${gf} : ${ok}/${total} parcours suivent un tracé`);
  }
});
