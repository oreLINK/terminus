import assert from "node:assert/strict";
import { test } from "node:test";

import { parseJourneys } from "../js/networks/bordeaux-tbm/siri-lite.js";
import { buildIndex, nearestStations, sharedLines, plan } from "../js/features/last-ride/planner.js";

// Ligne A fictive d'ouest en est : Ouest -> Centre -> Pont -> Est, un quai par sens.
const A = "bordeaux:Line:59:LOC";
const B = "bordeaux:Line:60:LOC";
const STOPS = [
  { ref: "O0", name: "Ouest", lat: 44.84, lon: -0.62, lines: [A] },
  { ref: "O1", name: "Ouest", lat: 44.8401, lon: -0.6201, lines: [A] },
  { ref: "C0", name: "Centre", lat: 44.84, lon: -0.58, lines: [A, B] },
  { ref: "C1", name: "Centre", lat: 44.8401, lon: -0.5801, lines: [A, B] },
  { ref: "P0", name: "Pont", lat: 44.84, lon: -0.56, lines: [A] },
  { ref: "E0", name: "Est", lat: 44.84, lon: -0.54, lines: [A] },
  { ref: "N0", name: "Nord", lat: 44.87, lon: -0.58, lines: [B] },
];
const CODES = { [A]: "A", [B]: "B" };
const NOW = Date.parse("2026-09-27T21:00:00Z");
const min = (m) => NOW + m * 60000;

const call = (ref, name, t, live = false) => ({ ref, name, dep: t, depLive: live, arr: t, arrLive: live, cancelled: false });
const eastbound = (id, start, { toEnd = true } = {}) => ({
  id,
  line: A,
  headsign: toEnd ? "Est" : "Pont",
  calls: [
    call("O0", "Ouest", start),
    call("C0", "Centre", start + 4 * 60000),
    call("P0", "Pont", start + 7 * 60000),
    ...(toEnd ? [call("E0", "Est", start + 10 * 60000)] : []),
  ],
});
const westbound = (id, start) => ({
  id,
  line: A,
  headsign: "Ouest",
  calls: [call("E0", "Est", start), call("P0", "Pont", start + 3 * 60000), call("C1", "Centre", start + 6 * 60000), call("O1", "Ouest", start + 10 * 60000)],
});

const index = buildIndex(STOPS);
const here = { lat: 44.8402, lon: -0.5803 }; // devant Centre
const home = { lat: 44.8405, lon: -0.5405 }; // à côté d'Est

function run(journeys, now = NOW) {
  const origins = nearestStations(index.stations, here, { radius: 2000, min: 2, max: 8 });
  const dests = nearestStations(index.stations, home, { radius: 1500, min: 1, max: 5 });
  return plan({ origins, dests, journeys, index, lineCodes: CODES, now });
}

test("les quais homonymes forment une seule station", () => {
  assert.equal(index.stations.length, 5);
  assert.deepEqual(index.stations.find((s) => s.name === "Centre").refs.sort(), ["C0", "C1"]);
});

test("seules les lignes communes aux deux côtés sont interrogées", () => {
  const origins = nearestStations(index.stations, here, { radius: 1000, min: 1, max: 8 });
  const dests = nearestStations(index.stations, home, { radius: 500, min: 1, max: 5 });
  assert.deepEqual(sharedLines(origins, dests), [A]);
});

test("dernier tram : le plus tardif dans le bon sens, pas le dernier de la liste", () => {
  const journeys = [eastbound("j3", min(60)), eastbound("j1", min(10)), eastbound("j2", min(30)), westbound("w1", min(90))];
  const r = run(journeys);
  assert.equal(r.status, "ok");
  assert.equal(r.primary.origin.station.name, "Centre");
  assert.equal(r.primary.dest.station.name, "Est");
  assert.equal(r.primary.last.journeyId, "j3");
  assert.equal(r.primary.next.journeyId, "j1");
  assert.equal(r.primary.leaveBy, r.primary.last.dep - r.primary.origin.walk.minutes * 60000);
});

test("une course partielle qui s'arrête avant l'arrivée n'est pas le dernier tram vers Est", () => {
  const journeys = [eastbound("full", min(20)), eastbound("partial", min(50), { toEnd: false })];
  const r = run(journeys);
  const toEst = r.options.find((o) => o.dest.station.name === "Est");
  assert.equal(toEst.last.journeyId, "full");
});

test("un tram qu'on ne peut pas rejoindre à pied à temps est ignoré", () => {
  // "gone" passe à Centre maintenant : impossible d'y être à temps, même à 1 min à pied.
  const r = run([eastbound("gone", min(-4)), eastbound("ok", min(15))]);
  assert.equal(r.primary.next.journeyId, "ok");
});

test("plus aucun tram atteignable : statut missed", () => {
  const r = run([eastbound("gone", min(-10))]);
  assert.equal(r.status, "none");
  const r2 = run([eastbound("tight", min(-4))]);
  assert.equal(r2.status, "missed");
});

test("service terminé : le prochain départ est demain matin", () => {
  const r = run([eastbound("morning", min(4 * 60))]);
  assert.equal(r.status, "ended");
});

test("parseJourneys lit le format Mecatran et privilégie le temps réel", () => {
  const json = {
    Siri: {
      ServiceDelivery: {
        EstimatedTimetableDelivery: [
          {
            Status: false,
            EstimatedJourneyVersionFrame: [
              {
                EstimatedVehicleJourney: [
                  {
                    LineRef: { value: A },
                    DirectionRef: { value: "0" },
                    VehicleJourneyRef: { value: "bordeaux:ServiceJourney:x:LOC" },
                    Cancellation: false,
                    EstimatedCalls: {
                      EstimatedCall: [
                        {
                          StopPointRef: { value: "C0" },
                          StopPointName: [{ value: "Centre", lang: "fr" }],
                          AimedDepartureTime: "2026-09-27T21:10:00Z",
                          ExpectedDepartureTime: "2026-09-27T21:12:00Z",
                        },
                        {
                          StopPointRef: { value: "E0" },
                          StopPointName: [{ value: "Est", lang: "fr" }],
                          AimedArrivalTime: "2026-09-27T21:20:00Z",
                          AimedDepartureTime: "2026-09-27T21:20:00Z",
                        },
                      ],
                    },
                  },
                  { LineRef: { value: A }, Cancellation: true, EstimatedCalls: { EstimatedCall: [] } },
                ],
              },
            ],
          },
        ],
      },
    },
  };
  const [j, ...rest] = parseJourneys(json);
  assert.equal(rest.length, 0);
  assert.equal(j.headsign, "Est");
  assert.equal(j.calls[0].dep, Date.parse("2026-09-27T21:12:00Z"));
  assert.equal(j.calls[0].depLive, true);
  assert.equal(j.calls[1].depLive, false);
});
