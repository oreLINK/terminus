import assert from "node:assert/strict";
import { test } from "node:test";

import { parseJourneys } from "../js/networks/bordeaux-tbm/siri-lite.js";
import { buildIndex, nearestStations, candidateLines, routeRequests, plan, serviceEndAfter, inServiceWindow, TRANSFER_MS, WALK_MARGIN_MS } from "../js/features/last-ride/planner.js";

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

// Ligne B fictive, du nord vers Centre, où elle croise la ligne A.
const southbound = (id, start) => ({
  id,
  line: B,
  headsign: "Centre",
  calls: [call("N0", "Nord", start), call("C0", "Centre", start + 8 * 60000)],
});
// Course de la ligne A qui ne part que de Pont (renfort de fin de soirée).
const fromPont = (id, start) => ({
  id,
  line: A,
  headsign: "Est",
  calls: [call("P0", "Pont", start), call("E0", "Est", start + 3 * 60000)],
});

const index = buildIndex(STOPS);
const here = { lat: 44.8402, lon: -0.5803 }; // devant Centre
const nord = { lat: 44.8702, lon: -0.5803 }; // devant Nord, sur la ligne B seulement
const home = { lat: 44.8405, lon: -0.5405 }; // à côté d'Est

// Comme le réseau TBM : le service se termine à 3 h du matin, heure de Paris.
const SERVICE = { timeZone: "Europe/Paris", hour: 3 };

function run(journeys, now = NOW, from = here) {
  const origins = nearestStations(index.stations, from, { radius: 2000, min: 2, max: 8 });
  const dests = nearestStations(index.stations, home, { radius: 1500, min: 1, max: 5 });
  return plan({ origins, dests, journeys, index, lineCodes: CODES, now, serviceEnd: serviceEndAfter(now, SERVICE) });
}

test("les quais homonymes forment une seule station", () => {
  assert.equal(index.stations.length, 5);
  assert.deepEqual(index.stations.find((s) => s.name === "Centre").refs.sort(), ["C0", "C1"]);
});

test("les lignes des deux côtés sont interrogées, pour trouver les correspondances", () => {
  const origins = nearestStations(index.stations, nord, { radius: 1000, min: 1, max: 8 });
  const dests = nearestStations(index.stations, home, { radius: 500, min: 1, max: 5 });
  assert.deepEqual(candidateLines(origins, dests).sort(), [A, B].sort());
});

test("dernier tram : le plus tardif dans le bon sens, pas le dernier de la liste", () => {
  const journeys = [eastbound("j3", min(60)), eastbound("j1", min(10)), eastbound("j2", min(30)), westbound("w1", min(90))];
  const r = run(journeys);
  assert.equal(r.status, "ok");
  assert.equal(r.primary.origin.station.name, "Centre");
  assert.equal(r.primary.dest.station.name, "Est");
  assert.equal(r.primary.last.journeyId, "j3");
  assert.equal(r.primary.next.journeyId, "j1");
  // Marche jusqu'à l'arrêt, plus la marge.
  assert.equal(r.primary.leaveBy, r.primary.last.dep - r.primary.origin.walk.minutes * 60000 - WALK_MARGIN_MS);
});

test("une course partielle qui s'arrête avant l'arrivée n'est pas le dernier tram vers Est", () => {
  const journeys = [eastbound("full", min(20)), eastbound("partial", min(50), { toEnd: false })];
  const r = run(journeys);
  const toEst = r.options.find((o) => o.dest.station.name === "Est" && o.transfers === 0);
  assert.equal(toEst.last.journeyId, "full");
});

test("un tram qu'on ne peut pas rejoindre à pied à temps est ignoré", () => {
  // "gone" passe à Centre maintenant : impossible d'y être à temps, même à 1 min à pied.
  const r = run([eastbound("gone", min(-4)), eastbound("ok", min(15))]);
  assert.equal(r.primary.next.journeyId, "ok");
});

test("plus aucun tram atteignable : statut missed", () => {
  const r = run([eastbound("tight", min(-4))]);
  assert.equal(r.status, "missed");
});

test("le dernier tram est parti : statut over, pas none", () => {
  // Fin de service ou travaux nocturnes : la ligne a roulé plus tôt, plus rien ensuite.
  const r = run([eastbound("early", min(-90)), eastbound("gone", min(-10)), westbound("w1", min(20))]);
  assert.equal(r.status, "over");
  assert.equal(r.options.length, 0);
});

test("aucun tram ne relie les deux côtés de la journée : statut none", () => {
  // Seulement des trams vers l'ouest, et une course partielle qui s'arrête avant Est.
  const r = run([westbound("w1", min(-30)), westbound("w2", min(20)), eastbound("short", min(-20), { toEnd: false })]);
  assert.equal(r.status, "none");
});

test("fin du service : la prochaine fois qu'il est 3 h du matin à Paris", () => {
  const paris = (iso) => Date.parse(iso); // heures d'été : Paris = UTC + 2
  // L'après-midi : 3 h du lendemain.
  assert.equal(serviceEndAfter(paris("2026-09-27T12:00:00Z"), SERVICE), paris("2026-09-28T01:00:00Z"));
  // Après minuit : 3 h le jour même.
  assert.equal(serviceEndAfter(paris("2026-09-27T22:30:00Z"), SERVICE), paris("2026-09-28T01:00:00Z"));
  // 3 h pile ou après : 3 h du lendemain.
  assert.equal(serviceEndAfter(paris("2026-09-28T01:00:00Z"), SERVICE), paris("2026-09-29T01:00:00Z"));
  // En hiver, Paris = UTC + 1.
  assert.equal(serviceEndAfter(paris("2026-12-01T12:00:00Z"), SERVICE), paris("2026-12-02T02:00:00Z"));
});

test("plage horaire : de 18 h à 3 h, heure de Paris, en passant minuit", () => {
  const WINDOW = { timeZone: "Europe/Paris", startHour: 18, endHour: 3 };
  const at = (iso) => inServiceWindow(Date.parse(iso), WINDOW);
  assert.equal(at("2026-09-27T15:59:00Z"), false); // 17 h 59
  assert.equal(at("2026-09-27T16:00:00Z"), true); // 18 h pile
  assert.equal(at("2026-09-27T21:30:00Z"), true); // 23 h 30
  assert.equal(at("2026-09-28T00:30:00Z"), true); // 2 h 30
  assert.equal(at("2026-09-28T01:00:00Z"), false); // 3 h pile
  assert.equal(at("2026-09-28T10:00:00Z"), false); // midi
  // En hiver, Paris = UTC + 1.
  assert.equal(at("2026-12-01T16:30:00Z"), false); // 17 h 30
  assert.equal(at("2026-12-01T17:30:00Z"), true); // 18 h 30
});

test("service terminé : il est plus de 3 h et le premier tram est dans plus de 2 h", () => {
  // 3 h 05 à Paris : le service de la veille est fini, le premier tram part à 5 h 30.
  const at = Date.parse("2026-09-28T01:05:00Z");
  const r = run([eastbound("morning", at + 145 * 60000)], at);
  assert.equal(r.status, "ended");
});

test("le dernier tram est celui du soir, pas un tram du lendemain après 3 h", () => {
  // L'API renvoie aussi les courses du lendemain (environ 12 h à venir).
  const journeys = [eastbound("soir1", min(10)), eastbound("soir2", min(40)), eastbound("matin1", min(7 * 60)), eastbound("midi", min(13 * 60))];
  const r = run(journeys);
  assert.equal(r.status, "ok");
  assert.equal(r.primary.last.journeyId, "soir2");
  assert.equal(r.primary.leaveBy, min(40) + 4 * 60000 - r.primary.origin.walk.minutes * 60000 - WALK_MARGIN_MS);
});

test("après le dernier tram du soir : plus de tram ce soir, même si le lendemain est connu", () => {
  const r = run([eastbound("soir", min(-30)), eastbound("matin1", min(7 * 60)), eastbound("midi", min(13 * 60))]);
  assert.equal(r.status, "over");
});

test("correspondance : le dernier B qui attrape encore le dernier A", () => {
  // B arrive à Centre 8 min après Nord ; A passe à Centre 4 min après Ouest.
  const journeys = [
    southbound("b1", min(10)), // Centre à +18 → A de +24
    southbound("b2", min(30)), // Centre à +38 → A de +44
    southbound("b3", min(50)), // Centre à +58 → plus de A
    eastbound("a1", min(20)),
    eastbound("a2", min(40)),
  ];
  const r = run(journeys, NOW, nord);
  assert.equal(r.status, "ok");
  assert.equal(r.primary.origin.station.name, "Nord");
  assert.equal(r.primary.transfers, 1);
  assert.equal(r.primary.last.journeyId, "b2");
  assert.deepEqual(r.primary.last.legs.map((l) => l.journeyId), ["b2", "a2"]);
  assert.equal(r.primary.last.legs[1].from.name, "Centre");
  assert.equal(r.primary.next.legs[1].journeyId, "a1");
  assert.equal(r.primary.dest.station.name, "Est");
  assert.equal(r.primary.leaveBy, min(30) - r.primary.origin.walk.minutes * 60000 - WALK_MARGIN_MS);
});

test("correspondance : il faut le temps de changer de quai", () => {
  // B arrive à Centre à +38. A en repart à +39 : moins que la marge. À +40 : juste la marge.
  assert.ok(60000 < TRANSFER_MS && TRANSFER_MS <= 2 * 60000);
  assert.notEqual(run([southbound("b1", min(30)), eastbound("a1", min(35))], NOW, nord).status, "ok");
  assert.equal(run([southbound("b1", min(30)), eastbound("a1", min(36))], NOW, nord).status, "ok");
});

test("un seul tracé : celui qui laisse partir le plus tard, même avec une correspondance", () => {
  // Direct : dernier A complet à +20. Plus tard : A partiel jusqu'à Pont, puis renfort Pont → Est.
  const journeys = [eastbound("full", min(20)), eastbound("partial", min(50), { toEnd: false }), fromPont("p1", min(60))];
  const r = run(journeys);
  assert.equal(r.primary.transfers, 1);
  assert.deepEqual(r.primary.last.legs.map((l) => l.journeyId), ["partial", "p1"]);
  assert.equal(r.primary.last.legs[1].from.name, "Pont");
  assert.equal(r.later, undefined);
  assert.equal(r.alternatives, undefined);
});

test("à heure limite égale, le tracé avec le moins de correspondances", () => {
  // Même A au départ de Centre : direct jusqu'à Est, ou descente à Pont pour un renfort plus tardif
  // qui n'arrive pas avant. Le direct suffit.
  const journeys = [eastbound("full", min(20)), fromPont("p1", min(40))];
  const r = run(journeys);
  assert.equal(r.primary.origin.station.name, "Centre");
  assert.equal(r.primary.transfers, 0);
});

test("le dernier direct manqué, la correspondance prend le relais", () => {
  const journeys = [eastbound("gone", min(-4)), eastbound("partial", min(50), { toEnd: false }), fromPont("p1", min(60))];
  const r = run(journeys);
  assert.equal(r.status, "ok");
  // Depuis Centre, plus de direct : il reste le A partiel puis la correspondance à Pont.
  const fromCentre = r.options.filter((o) => o.origin.station.name === "Centre");
  assert.deepEqual(fromCentre.map((o) => o.transfers), [1]);
  assert.equal(fromCentre[0].last.journeyId, "partial");
  // Pont est aussi à portée de marche, mais le A partiel depuis Centre laisse partir plus tard.
  assert.equal(r.primary.origin.station.name, "Centre");
  assert.equal(r.primary.transfers, 1);
});

test("une correspondance ne se prend jamais après la fin du service (tram du lendemain matin)", () => {
  // 23 h à Paris, fin du service à 3 h (+240). Le dernier B arrive à Centre à +238 ; le A suivant
  // part à 4 h 30 (+330), le lendemain : pas de trajet ce soir.
  const r = run([southbound("b1", min(230)), eastbound("a-matin", min(326))], NOW, nord);
  assert.equal(r.options.length, 0);
  assert.notEqual(r.status, "ok");
  // Le même B avec un A encore dans la soirée : trajet possible.
  const ok = run([southbound("b1", min(200)), eastbound("a-soir", min(206))], NOW, nord);
  assert.deepEqual(ok.primary.last.legs.map((l) => l.journeyId), ["b1", "a-soir"]);
});

// Graphe fictif du même réseau : ordre des quais par ligne et par sens.
const GRAPH = {
  names: Object.fromEntries(STOPS.map((s) => [s.ref, s.name])),
  patterns: [
    { line: A, direction: "0", stops: ["O0", "C0", "P0", "E0"] },
    { line: A, direction: "1", stops: ["E0", "P0", "C1", "O1"] },
    { line: B, direction: "0", stops: ["N0", "C0"] },
    { line: B, direction: "1", stops: ["C1", "N0"] },
  ],
};
const requests = (from, opts = {}, graph = GRAPH) =>
  routeRequests({
    graph,
    index,
    origins: nearestStations(index.stations, from, { radius: 500, min: 1, max: 8 }),
    dests: nearestStations(index.stations, home, { radius: 500, min: 1, max: 5 }),
    ...opts,
  })
    .map((r) => `${CODES[r.line]}${r.direction}`)
    .sort();

test("graphe : un trajet direct ne charge qu'une ligne, dans un seul sens", () => {
  assert.deepEqual(requests(here), ["A0"]);
});

test("graphe : une correspondance charge les deux lignes, dans le bon sens", () => {
  assert.deepEqual(requests(nord), ["A0", "B0"]);
});

test("graphe : une correspondance de plus seulement si on la demande", () => {
  // Centre → Ouest par A1, puis Ouest → Est par A0 : deux tronçons, un de plus que le direct.
  assert.deepEqual(requests(here, { extraTransfers: 1 }), ["A0", "A1"]);
});

test("graphe : un arrêt inconnu est ignoré, et sans trajet la liste est vide", () => {
  const onlyB = { names: GRAPH.names, patterns: [{ line: B, direction: "0", stops: ["N0", "ZZ", "C0"] }] };
  assert.deepEqual(requests(here, {}, onlyB), []);
  assert.deepEqual(requests(nord, { maxTransfers: 0 }), []);
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
