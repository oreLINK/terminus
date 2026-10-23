import assert from "node:assert/strict";
import { test } from "node:test";

import { isPublicHoliday } from "../js/core/holidays.js";
import { buildIndex, serviceMorning, communeOf, zoneDests } from "../js/features/last-ride/planner.js";
import tbm from "../js/networks/bordeaux-tbm/index.js";

const night = tbm.features["night-ride"];
const SERVICE = { timeZone: "Europe/Paris", hour: night.serviceEndHour };
// La nuit de service de l'instant `iso` circule-t-elle ?
const runs = (iso) => night.runsOn(serviceMorning(Date.parse(iso), SERVICE));

test("jours fériés : dates fixes et dates qui suivent Pâques", () => {
  assert.ok(isPublicHoliday({ year: 2026, month: 11, day: 11 }));
  assert.ok(isPublicHoliday({ year: 2026, month: 4, day: 6 })); // lundi de Pâques (Pâques le 5 avril)
  assert.ok(isPublicHoliday({ year: 2026, month: 5, day: 14 })); // Ascension
  assert.ok(isPublicHoliday({ year: 2026, month: 5, day: 25 })); // lundi de Pentecôte
  assert.ok(isPublicHoliday({ year: 2027, month: 3, day: 29 })); // lundi de Pâques 2027 (Pâques le 28 mars)
  assert.ok(!isPublicHoliday({ year: 2026, month: 10, day: 1 }));
  assert.ok(!isPublicHoliday({ year: 2026, month: 4, day: 5 })); // dimanche de Pâques : pas férié en plus
});

test("TBNight : nuits du jeudi, vendredi, samedi, jugées sur le matin", () => {
  assert.ok(runs("2026-10-01T16:00:00Z")); // jeudi 18 h
  assert.ok(runs("2026-10-02T02:00:00Z")); // vendredi 4 h : toujours la nuit du jeudi
  assert.ok(runs("2026-10-02T20:00:00Z")); // vendredi 22 h
  assert.ok(runs("2026-10-03T20:00:00Z")); // samedi 22 h
  assert.ok(!runs("2026-10-04T20:00:00Z")); // dimanche 22 h
  assert.ok(!runs("2026-10-05T20:00:00Z")); // lundi 22 h
  assert.ok(!runs("2026-10-07T20:00:00Z")); // mercredi 22 h
});

test("TBNight : veilles de jours fériés", () => {
  assert.ok(runs("2026-11-10T20:00:00Z")); // mardi 10 novembre, veille du 11
  assert.ok(runs("2026-12-24T20:00:00Z")); // jeudi 24 décembre
  assert.ok(runs("2026-12-31T20:00:00Z")); // jeudi 31 décembre
  assert.ok(runs("2026-05-13T20:00:00Z")); // mercredi, veille de l'Ascension
});

test("commune d'une adresse de la Géoplateforme", () => {
  assert.equal(communeOf("12 Avenue de la Libération 33700 Mérignac"), "merignac");
  assert.equal(communeOf("3 Rue X 33160 Saint-Médard-en-Jalles"), "saint medard en jalles");
  assert.equal(communeOf("Place de la Victoire, Bordeaux"), null);
});

test("zone à la demande : le dernier arrêt fixe de la ligne devient une arrivée, sans marche", () => {
  const stops = [
    { ref: "V", name: "Victoire", lat: 44.83, lon: -0.57, lines: ["L2"] },
    { ref: "M", name: "Barrière du Médoc", lat: 44.86, lon: -0.6, lines: ["L2"] },
  ];
  const graph = { names: { V: "Victoire", M: "Barrière du Médoc" }, patterns: [{ line: "L2", direction: "0", stops: ["V", "M"] }] };
  const args = { zones: night.zones, graph, index: buildIndex(stops), lineCodes: { L2: "N2" } };
  const [d] = zoneDests({ ...args, commune: communeOf("1 Rue X 33110 Le Bouscat") });
  assert.equal(d.station.name, "Barrière du Médoc");
  assert.equal(d.walk.minutes, 0);
  assert.deepEqual(d.zone, { line: "N2", commune: "Le Bouscat" });
  // St-Aubin écrit « Saint-Aubin » par la Géoplateforme.
  assert.equal(zoneDests({ ...args, commune: communeOf("1 Rue X 33160 Saint-Aubin-de-Médoc") }).length, 1);
  // Commune hors des zones de la N2.
  assert.equal(zoneDests({ ...args, commune: communeOf("1 Rue X 33130 Bègles") }).length, 0);
});
