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

export function walkBetween(a, b) {
  const straight = distanceM(a, b);
  const meters = straight * DETOUR_FACTOR;
  return { straight, meters, minutes: Math.max(1, Math.ceil(meters / WALK_M_PER_MIN)) };
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
