// Distances, temps de marche et formatage.

const EARTH_RADIUS_M = 6371000;
const DETOUR_FACTOR = 1.3; // les rues ne vont pas en ligne droite
const WALK_M_PER_MIN = 78; // environ 4,7 km/h

export function distanceM(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Minutes de marche pour une distance, arrondies à la minute supérieure, au moins 1.
export const walkMinutes = (meters) => Math.max(1, Math.ceil(meters / WALK_M_PER_MIN));

// Estimation sans itinéraire : la distance à vol d'oiseau, allongée de 30 % pour les rues.
// La marche réelle (js/core/walk-route.js) la remplace quand elle est connue.
export function walkBetween(a, b) {
  const straight = distanceM(a, b);
  const meters = straight * DETOUR_FACTOR;
  return { straight, meters, minutes: walkMinutes(meters) };
}

const clockFormat = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

export const clock = (ms) => clockFormat.format(ms);

export function distanceLabel(meters) {
  if (meters < 1000) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

export function walkLink(from, to) {
  const params = new URLSearchParams({
    api: "1",
    origin: `${from.lat},${from.lon}`,
    destination: `${to.lat},${to.lon}`,
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

export function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Boîte englobante { south, north, west, east } en degrés.
export function inBounds(bounds, point) {
  return (
    !!point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon) &&
    point.lat > bounds.south &&
    point.lat < bounds.north &&
    point.lon > bounds.west &&
    point.lon < bounds.east
  );
}

// Instant (ms) d'une heure locale « AAAA-MM-JJ HH:MM » dans un fuseau, changements d'heure compris :
// on part de l'heure lue comme UTC, puis on retire le décalage du fuseau à cet instant (deux passes
// suffisent, même la nuit d'un changement d'heure).
export function zonedTime(local, timeZone) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(local);
  if (!m) throw new Error(`Date de thème illisible : « ${local} » (attendu AAAA-MM-JJ HH:MM)`);
  const [, y, mo, d, h, mi] = m.map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  let t = asUtc;
  for (let i = 0; i < 2; i++) t = asUtc - offsetAt(t, timeZone);
  return t;
}

function offsetAt(ms, timeZone) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(ms)
      .map((x) => [x.type, Number(x.value)]),
  );
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
}
