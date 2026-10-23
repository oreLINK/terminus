// Heures et jours dans le fuseau d'un réseau ou d'un thème, changements d'heure compris. Une date
// locale est { year, month, day, weekday } (mois de 1 à 12, 0 = dimanche). Fonctions pures.

const MS_PER_DAY = 24 * 3600 * 1000;

// Heure locale d'un instant dans un fuseau : { year, month, day, hour, minute, second }.
function localParts(ms, timeZone) {
  return Object.fromEntries(
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
      .map((p) => [p.type, Number(p.value)]),
  );
}

// Heure locale lue comme si elle était UTC : l'écart avec l'instant donne le décalage du fuseau.
const localAsUtc = (p) => Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
const offsetAt = (ms, timeZone) => localAsUtc(localParts(ms, timeZone)) - Math.floor(ms / 1000) * 1000;

// Instant (ms) d'une heure locale « AAAA-MM-JJ HH:MM » dans un fuseau : on part de l'heure lue comme
// UTC, puis on retire le décalage du fuseau à cet instant (deux passes suffisent, même la nuit d'un
// changement d'heure).
export function zonedTime(local, timeZone) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(local);
  if (!m) throw new Error(`Date illisible : « ${local} » (attendu AAAA-MM-JJ HH:MM)`);
  const [, y, mo, d, h, mi] = m.map(Number);
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  let t = asUtc;
  for (let i = 0; i < 2; i++) t = asUtc - offsetAt(t, timeZone);
  return t;
}

// Fin du service en cours : la prochaine occurrence, après `now`, de l'heure `hour` dans le
// fuseau du réseau (3 h du matin à Bordeaux). Le dernier tram est le dernier départ avant elle.
// L'API renvoie environ les 12 heures à venir, nuit comprise : sans cette coupure, le « dernier
// tram » du soir serait un tram du lendemain midi. La nuit d'un changement d'heure, la coupure
// peut être décalée d'une heure.
export function serviceEndAfter(now, { timeZone, hour }) {
  const parts = localParts(now, timeZone);
  const local = localAsUtc(parts);
  const offset = local - Math.floor(now / 1000) * 1000;
  let end = Date.UTC(parts.year, parts.month - 1, parts.day, hour);
  if (end <= local) end += MS_PER_DAY;
  return end - offset;
}

// Date locale d'un instant dans un fuseau.
function localDate(ms, timeZone) {
  return addDays(localParts(ms, timeZone), 0);
}

export function addDays({ year, month, day }, n) {
  const d = new Date(Date.UTC(year, month - 1, day + n));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), weekday: d.getUTCDay() };
}

// Matin de la nuit de service en cours : la date locale de sa fin. La nuit du jeudi au vendredi
// a pour matin le vendredi, à 18 h le jeudi comme à 4 h le vendredi.
export const serviceMorning = (now, { timeZone, hour }) => localDate(serviceEndAfter(now, { timeZone, hour }), timeZone);

// Plage horaire où le compte à rebours fonctionne (de 18 h à 3 h à Bordeaux), qui peut passer
// minuit. On y est quand sa fin arrive avant son prochain début.
export function inServiceWindow(now, { timeZone, startHour, endHour }) {
  return serviceEndAfter(now, { timeZone, hour: endHour }) < serviceEndAfter(now, { timeZone, hour: startHour });
}

// Jour au format AAAA-MM-JJ.
export const isoDate = ({ year, month, day }) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
