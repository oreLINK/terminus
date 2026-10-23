// Carte du tracé affiché : la marche en pointillé, rue par rue quand l'itinéraire piéton est connu
// (walk.path, js/core/walk-route.js), sinon à vol d'oiseau ; le tram ou le bus de nuit sur le
// tracé réel de sa ligne (GTFS, shapes.js, découpé par traceAlong), à la couleur de la ligne. Sans
// tracé qui colle (branche absente du GTFS), le tronçon relie les quais en ligne droite.
// Deux usages : l'aperçu figé de la tuile (sans noms d'arrêts, gardé d'un rendu à l'autre : pas de
// rechargement des tuiles toutes les 30 s) et la carte interactive de la feuille « Votre trajet ».

import { createMap } from "../../core/map.js";
import { esc } from "../../core/util.js";
import { decodeLine, traceAlong } from "../../core/line-trace.js";

const ll = (p) => [p.lat, p.lon];

// Ce qui, s'il change, demande de recadrer la carte : les courses, les arrêts, les deux bouts.
const tripKey = ({ here, home, option }) =>
  [
    ...option.last.legs.map((l) => `${l.journeyId}@${l.from.id}`),
    option.last.dest.station.id,
    // La marche réelle arrive après l'estimation : son tracé, plus large, demande de recadrer.
    option.origin.walk.real ? "rue" : "vol",
    option.last.dest.walk?.real ? "rue" : "vol",
    here.lat.toFixed(4),
    here.lon.toFixed(4),
    home.lat.toFixed(4),
    home.lon.toFixed(4),
  ].join("|");

// `lineColor(code)` : couleur d'une ligne. `icons` : pictogrammes `here` et `home`, ceux de l'écran.
// `interactive` : carte de la feuille (gestes, noms d'arrêts), sinon aperçu figé.
// `loadShapes` : tracés réels des lignes (adaptateur du réseau), facultatif : sans eux, ou pour un
// tronçon qu'aucun tracé ne couvre, le tram relie les quais en ligne droite.
export function createRouteMap({ lineColor, icons, interactive = false, loadShapes = null }) {
  const el = document.createElement("div");
  el.className = `route-map${interactive ? " is-interactive" : ""}`;
  if (!interactive) el.setAttribute("aria-hidden", "true"); // l'aperçu double le résumé écrit
  let ready = null; // promesse de { L, map, layer }
  let framed = null; // clé du trajet cadré
  let wanted = null; // dernier trajet demandé
  let bounds = null;
  let removed = false;
  // Marges du cadrage. Aperçu : le haut reste libre pour l'icône « agrandir », le bas pour la
  // mention de source.
  const framing = interactive
    ? { padding: [40, 40] }
    : { paddingTopLeft: [12, 34], paddingBottomRight: [12, 18] };

  const visible = () => el.offsetWidth > 0 && el.offsetHeight > 0;

  // La taille de la carte change sans nouveau rendu : aperçu masqué puis réaffiché sur un petit
  // écran, barres du navigateur qui se replient, rotation. Jamais dessinée (elle était masquée) :
  // elle l'est maintenant. Sinon Leaflet apprend sa nouvelle taille ; l'aperçu se recadre, la
  // carte de la feuille garde le cadrage de la personne.
  const resized = new ResizeObserver(() => {
    if (removed || !wanted || !visible()) return;
    if (!ready) return void update(wanted);
    ready
      .then(({ map }) => {
        map.invalidateSize({ pan: false });
        if (!interactive && bounds) map.fitBounds(bounds, { ...framing, maxZoom: 17, animate: false });
      })
      .catch(() => {});
  });
  resized.observe(el);

  // Tracés décodés une fois par ligne ; un échec de chargement laisse les lignes droites.
  let shapes = null;
  const decoded = new Map();
  const linesFor = async (code) => {
    shapes ??= loadShapes ? loadShapes().catch(() => null) : Promise.resolve(null);
    const all = await shapes;
    if (!all?.lines?.[code]) return null;
    if (!decoded.has(code)) decoded.set(code, all.lines[code].map(decodeLine));
    return decoded.get(code);
  };

  function ensure() {
    ready ??= createMap(el, { interactive }).then((made) => {
      if (!made) throw new Error("Carte retirée de la page.");
      return { ...made, layer: made.L.layerGroup().addTo(made.map) };
    });
    ready.catch(() => (ready = null)); // un nouvel essai au prochain rendu
    return ready;
  }

  // `trip` : { here, home, option } (option : tracé affiché, voir plan). En zone à la demande, pas
  // de marche à l'arrivée : on reste dans le bus.
  async function update(trip) {
    wanted = trip;
    // Masquée (aperçu sur un petit écran) : ni Leaflet ni tuiles tant qu'elle n'a pas de taille ;
    // une carte créée sans taille se cadre mal et ne charge pas ses tuiles.
    if (!visible()) return;
    let made;
    let traced;
    try {
      [made, traced] = await Promise.all([ensure(), traceLegs(trip.option.last.legs)]);
    } catch {
      el.hidden = true; // sans carte, le reste de l'écran est complet
      return;
    }
    if (removed || wanted !== trip) return;
    el.hidden = false;
    const { L, map, layer } = made;
    // L'élément a pu changer de taille en changeant de place d'un rendu à l'autre.
    map.invalidateSize({ pan: false });
    layer.clearLayers();

    const { here, home, option } = trip;
    const legs = option.last.legs;
    const final = legs[legs.length - 1];
    const zone = option.last.dest.zone;

    // Marche : de a à b par les rues si l'itinéraire est connu (il part du point de la rue le plus
    // proche, d'où les deux bouts ajoutés), sinon en ligne droite.
    const walkPoints = (walk, a, b) => [ll(a), ...(walk?.path ?? []), ll(b)];
    const walks = [walkPoints(option.origin.walk, here, legs[0].from)];
    if (!zone) walks.push(walkPoints(option.last.dest.walk, final.to, home));
    for (const points of walks) L.polyline(points, { className: "map-walk", interactive: false }).addTo(layer);

    // Chaque tronçon, sur le tracé de sa ligne : un liseré clair sous le trait de la ligne, qui le
    // détache du fond.
    for (const points of traced) {
      L.polyline(points, { className: "map-casing", interactive: false }).addTo(layer);
    }
    traced.forEach((points, i) => {
      L.polyline(points, { className: "map-ride", color: lineColor(legs[i].lineCode), interactive: false }).addTo(layer);
    });

    bounds = L.latLngBounds([...walks.flat(), ...traced.flat()]);
    const key = tripKey(trip);
    if (key !== framed) {
      map.fitBounds(bounds, { ...framing, maxZoom: 17 });
      framed = key;
    }

    // Arrêts de montée, de correspondance et de descente. Sur la carte de la feuille, nommés, le
    // nom du côté du centre de la carte (direction « auto ») pour ne pas être coupé par le bord.
    const stop = (station, code) => {
      const marker = L.circleMarker(ll(station), {
        className: "map-stop",
        radius: interactive ? 6 : 4.5,
        color: lineColor(code),
        interactive: false,
      });
      if (interactive) {
        marker.bindTooltip(esc(station.name), { permanent: true, direction: "auto", className: "map-label" });
      }
      marker.addTo(layer);
    };
    for (const leg of legs) stop(leg.from, leg.lineCode);
    stop(final.to, final.lineCode);

    const size = interactive ? 30 : 24;
    const pin = (point, kind, label) =>
      L.marker(ll(point), {
        icon: L.divIcon({ className: `map-pin is-${kind}`, html: icons[kind], iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
        interactive: false,
        keyboard: false,
        title: label,
        alt: label,
      }).addTo(layer);
    pin(here, "here", "Votre position");
    if (!zone) pin(home, "home", "Destination");
  }

  // Points de chaque tronçon : le tracé de la ligne entre les deux quais, sinon les quais en ligne droite.
  async function traceLegs(legs) {
    return Promise.all(legs.map(async (leg) => traceAlong(leg.path, await linesFor(leg.lineCode)) ?? leg.path.map(ll)));
  }

  // Revient au cadrage du trajet entier (bouton « Recentrer »), en glissant sauf si le mouvement
  // est réduit.
  function recenter() {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    ready
      ?.then(({ map }) => {
        if (!bounds) return;
        if (still) map.fitBounds(bounds, { ...framing, maxZoom: 17, animate: false });
        else map.flyToBounds(bounds, { ...framing, maxZoom: 17, duration: 0.4 });
      })
      .catch(() => {});
  }

  function remove() {
    removed = true;
    resized.disconnect();
    ready?.then(({ map }) => map.remove()).catch(() => {});
  }

  return { el, update, recenter, remove };
}
