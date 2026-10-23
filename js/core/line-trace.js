// Tom — le tracé des lignes (voies du tram, rues du bus) : encodage compact, simplification, et découpage
// d'un tracé entre l'arrêt de montée et celui de descente, pour que la carte suive les voies au lieu
// de relier les arrêts en ligne droite. Fonctions pures, sans navigateur (testées avec Node, et
// utilisées par tools/build-shapes.mjs).

const M_PER_DEG_LAT = 110540;
const mPerDegLon = (lat) => 111320 * Math.cos((lat * Math.PI) / 180);

// ---------- Encodage ----------

// Un tracé devient une liste d'entiers en cent-millièmes de degré (environ 1 m) : le premier point
// en entier, puis les écarts d'un point au suivant. Compact, et lisible dans un diff.
export function encodeLine(points) {
  const out = [];
  let pLat = 0;
  let pLon = 0;
  for (const [lat, lon] of points) {
    const iLat = Math.round(lat * 1e5);
    const iLon = Math.round(lon * 1e5);
    out.push(iLat - pLat, iLon - pLon);
    pLat = iLat;
    pLon = iLon;
  }
  return out;
}

export function decodeLine(encoded) {
  const points = [];
  let lat = 0;
  let lon = 0;
  for (let i = 0; i + 1 < encoded.length; i += 2) {
    lat += encoded[i];
    lon += encoded[i + 1];
    points.push([lat / 1e5, lon / 1e5]);
  }
  return points;
}

// ---------- Géométrie ----------

// Projection d'un point sur le segment [a, b], en mètres autour de a : position t (0 à 1) et distance.
function projectOnSegment(p, a, b) {
  const kx = mPerDegLon(a[0]);
  const ax = 0;
  const ay = 0;
  const bx = (b[1] - a[1]) * kx;
  const by = (b[0] - a[0]) * M_PER_DEG_LAT;
  const px = (p[1] - a[1]) * kx;
  const py = (p[0] - a[0]) * M_PER_DEG_LAT;
  const len2 = bx * bx + by * by;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * bx + (py - ay) * by) / len2));
  const dist = Math.hypot(px - t * bx, py - t * by);
  return { t, dist, point: [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])] };
}

export function lengthM(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    total += Math.hypot((b[1] - a[1]) * mPerDegLon(a[0]), (b[0] - a[0]) * M_PER_DEG_LAT);
  }
  return total;
}

// Simplification de Douglas-Peucker : on garde les points qui s'écartent de plus de `toleranceM`
// mètres de la corde. Itérative (une pile), pour les longs tracés.
export function simplifyLine(points, toleranceM) {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [i, j] = stack.pop();
    let worst = -1;
    let worstDist = 0;
    for (let k = i + 1; k < j; k++) {
      const d = projectOnSegment(points[k], points[i], points[j]).dist;
      if (d > worstDist) {
        worst = k;
        worstDist = d;
      }
    }
    if (worst !== -1 && worstDist > toleranceM) {
      keep[worst] = 1;
      stack.push([i, worst], [worst, j]);
    }
  }
  return points.filter((_, k) => keep[k]);
}

// Le point du tracé le plus proche de p, à partir du segment `from` (pour chercher la descente
// après la montée, même sur une ligne qui boucle).
function nearestOnLine(line, p, from = 0) {
  let best = null;
  for (let s = from; s < line.length - 1; s++) {
    const q = projectOnSegment(p, line[s], line[s + 1]);
    if (!best || q.dist < best.dist) best = { ...q, seg: s };
  }
  return best;
}

// Distance de p au tracé, en mètres.
export const distanceToLine = (line, p) => nearestOnLine(line, p)?.dist ?? Infinity;

// ---------- Découpage d'un tronçon ----------

// Le tronçon d'un trajet suivant le tracé de sa ligne. `path` : les quais parcourus, de la montée à
// la descente ({ lat, lon }). `lines` : les tracés possibles de la ligne (points [lat, lon]), toutes
// branches confondues ; chacun est aussi essayé à l'envers, les deux sens d'un tram partageant les
// mêmes voies (tools/build-shapes.mjs ne garde qu'un tracé par voie). On garde le tracé qui passe au
// plus près des quais, dans le bon sens (la descente après la montée), puis on le coupe entre les deux. Renvoie des points
// [lat, lon] qui partent du quai de montée et finissent au quai de descente, ou null si aucun tracé
// ne colle (la carte relie alors les quais en ligne droite).
// `maxGapM` : écart maximal entre les quais de montée et de descente et le tracé. Les quais du milieu
// peuvent s'en écarter davantage (`maxMiddleGapM` : un arrêt de bus dans une rue parallèle) : ils
// servent surtout à départager les tracés.
export function traceAlong(path, lines, { maxGapM = 60, maxMiddleGapM = 300 } = {}) {
  if (!lines?.length || path.length < 2) return null;
  const stops = path.map((p) => [p.lat, p.lon]);
  const first = stops[0];
  const last = stops[stops.length - 1];
  const straight = lengthM(stops);
  let best = null;
  for (const line of lines.flatMap((l) => [l, [...l].reverse()])) {
    if (line.length < 2) continue;
    const start = nearestOnLine(line, first);
    if (!start || start.dist > maxGapM) continue;
    const end = nearestOnLine(line, last, start.seg);
    if (!end || end.dist > maxGapM || (end.seg === start.seg && end.t < start.t)) continue;
    const slice = [start.point, ...line.slice(start.seg + 1, end.seg + 1), end.point];
    // Un tracé qui fait un grand détour (une boucle prise à l'envers) n'est pas le bon.
    if (lengthM(slice) > straight * 2.5 + 300) continue;
    // Écart moyen des quais intermédiaires au morceau de tracé : le plus faible l'emporte.
    const middle = stops.slice(1, -1);
    const gaps = middle.map((p) => distanceToLine(slice, p));
    if (gaps.some((g) => g > maxMiddleGapM)) continue;
    const score = (start.dist + end.dist + gaps.reduce((a, b) => a + b, 0)) / (2 + gaps.length);
    if (!best || score < best.score) best = { score, slice };
  }
  return best ? [first, ...best.slice, last] : null;
}
