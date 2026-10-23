import assert from "node:assert/strict";
import { test } from "node:test";

import { buildIndex, transferMap } from "../js/features/last-ride/planner.js";
import { decodeLine } from "../js/core/line-trace.js";
import { distanceM } from "../js/core/util.js";
import tbm from "../js/networks/bordeaux-tbm/index.js";

// Chaque mode qui déclare des correspondances à pied : elles relient des stations connues de ses
// arrêts, par une marche réaliste (au moins la ligne droite, au plus 3 fois), dont le tracé part et
// arrive près d'un quai de chacune des deux stations (une station de bus regroupe des quais de même
// nom parfois distants de plusieurs centaines de mètres : son centre ne dit rien).
for (const [id, adapter] of Object.entries(tbm.features)) {
  if (!adapter.loadTransfers) continue;
  test(`correspondances à pied (${id}) : stations connues, distances et tracés cohérents`, async () => {
    const stops = await adapter.loadStops();
    const index = buildIndex(stops.stops);
    const byId = new Map(index.stations.map((s) => [s.id, s]));
    const quais = new Map(index.stations.map((s) => [s.id, stops.stops.filter((q) => s.refs.includes(q.ref))]));
    const { rows } = await adapter.loadTransfers();
    assert.ok(rows.length > 0);
    for (const [a, b, meters, encoded] of rows) {
      assert.ok(byId.has(a) && byId.has(b), `${a} ↔ ${b} : station inconnue de ${id}`);
      // Distance entre les quais les plus proches des deux stations.
      const straight = Math.min(...quais.get(a).flatMap((p) => quais.get(b).map((q) => distanceM(p, q))));
      assert.ok(meters >= straight * 0.5 && meters <= Math.max(straight * 3, 900), `${a} ↔ ${b} : ${meters} m pour ${Math.round(straight)} m à vol d'oiseau`);
      if (encoded) {
        const path = decodeLine(encoded);
        const [first, last] = [path[0], path[path.length - 1]];
        const near = (p, id) => quais.get(id).some((q) => distanceM({ lat: p[0], lon: p[1] }, q) < 150);
        assert.ok(near(first, a) && near(last, b), `${a} ↔ ${b} : le tracé ne relie pas les deux stations`);
      }
    }
    // Chargées dans les deux sens.
    const map = transferMap(rows, index, decodeLine);
    const [a, b] = rows[0];
    assert.ok(map.get(a).some((w) => w.to === b) && map.get(b).some((w) => w.to === a));
  });
}
