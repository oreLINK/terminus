// Jours fériés en France métropolitaine (hors Alsace-Moselle), calculés : onze dates, dont
// trois qui suivent Pâques. Une date est { year, month, day } (mois de 1 à 12).

// Dimanche de Pâques (calendrier grégorien), algorithme de Meeus / Jones / Butcher.
function easter(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(year, month - 1, day);
}

const FIXED = ["1-1", "5-1", "5-8", "7-14", "8-15", "11-1", "11-11", "12-25"];
// Lundi de Pâques, Ascension, lundi de Pentecôte : jours après Pâques.
const AFTER_EASTER = [1, 39, 50];
const DAY_MS = 24 * 3600 * 1000;

export function isPublicHoliday({ year, month, day }) {
  if (FIXED.includes(`${month}-${day}`)) return true;
  const t = Date.UTC(year, month - 1, day);
  return AFTER_EASTER.some((n) => easter(year) + n * DAY_MS === t);
}
