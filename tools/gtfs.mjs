// Gus — le GTFS statique de TBM pour les générateurs (build-bus-network, build-shapes,
// build-timetable) : téléchargement (environ 22 Mo), lecture des fichiers CSV, jours de service actifs
// et identifiants. La lecture passe par la commande unzip du système ; stop_times.txt (160 Mo) est lu
// en flux, ligne à ligne.

import { spawn, spawnSync } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { createInterface } from "node:readline";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const GTFS_URL = "https://bdx.mecatran.com/utw/ws/gtfsfeed/static/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt";
export const TIME_ZONE = "Europe/Paris";

// Identifiants GTFS ↔ identifiants SIRI de TBM (ceux des fichiers générés) : route_id « 59 » ↔
// « bordeaux:Line:59:LOC », stop_id « 3684 » ↔ « bordeaux:StopPoint:BP:3684:LOC ».
export const lineRef = (route) => `bordeaux:Line:${route}:LOC`;
export const stopRef = (stop) => `bordeaux:StopPoint:BP:${stop}:LOC`;
export const routeOf = (ref) => /^bordeaux:Line:(.+):LOC$/.exec(ref)?.[1];
export const stopOf = (ref) => /^bordeaux:StopPoint:BP:(.+):LOC$/.exec(ref)?.[1];

// « HH:MM:SS » → secondes depuis « midi moins 12 h » (au-delà de 24:00 après minuit).
export const secs = (hms) => {
  const [h, m, s] = hms.split(":").map(Number);
  return h * 3600 + m * 60 + s;
};

// Jour de la génération, heure de Paris : AAAA-MM-JJ.
export const todayIn = (timeZone = TIME_ZONE) => new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());

// Jours de service à générer : du jour de la génération aux `count` suivants, sans dépasser la fin
// du GTFS (feed_end_date, AAAAMMJJ). Format AAAA-MM-JJ.
export function nextDates(count, feedEnd, timeZone = TIME_ZONE) {
  const today = todayIn(timeZone);
  const dates = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(`${today}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    if (date.replaceAll("-", "") <= feedEnd) dates.push(date);
  }
  return dates;
}

// Services actifs un jour donné (calendar.txt et ses exceptions, calendar_dates.txt) :
// activeServices(read)(« AAAA-MM-JJ ») → Set de service_id.
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
export function activeServices(read) {
  const calendar = read("calendar.txt");
  const exceptions = read("calendar_dates.txt");
  return (date) => {
    const c = date.replaceAll("-", "");
    const day = WEEKDAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
    const on = new Set(calendar.filter((s) => s.start_date <= c && c <= s.end_date && s[day] === "1").map((s) => s.service_id));
    for (const e of exceptions) {
      if (e.date !== c) continue;
      if (e.exception_type === "1") on.add(e.service_id);
      else on.delete(e.service_id);
    }
    return on;
  };
}

// `inner` apparaît d'un seul tenant dans `outer` : course partielle (son motif est retiré).
export function isContained(inner, outer) {
  if (inner.length >= outer.length) return false;
  const start = outer.indexOf(inner[0]);
  return start >= 0 && inner.every((ref, i) => outer[start + i] === ref);
}

// Lecture CSV simple, guillemets compris (les noms de lignes peuvent contenir des virgules).
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) rows.push([...row, field]);
  const [head, ...body] = rows;
  const keys = head.map((h) => h.replace(/^﻿/, "").trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ""])));
}

// Une ligne CSV en champs (guillemets compris), pour la lecture en flux.
function splitCsvLine(line) {
  const out = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(field);
      field = "";
    } else field += c;
  }
  out.push(field);
  return out;
}

// Télécharge le GTFS dans un dossier temporaire et le passe à `use({ read, stream })`, puis efface tout.
// read(nom) : le fichier entier, en objets ; stream(nom, (ligne) => …) : ligne à ligne, pour les gros.
export async function withGtfs(use, url = GTFS_URL) {
  const dir = await mkdtemp(join(tmpdir(), "terminus-gtfs-"));
  try {
    const zip = join(dir, "gtfs.zip");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GTFS indisponible : HTTP ${res.status}`);
    await writeFile(zip, Buffer.from(await res.arrayBuffer()));
    const read = (name) => {
      const out = spawnSync("unzip", ["-p", zip, name], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
      if (out.status !== 0) throw new Error(`Lecture de ${name} impossible : ${out.stderr || out.error}`);
      return parseCsv(out.stdout);
    };
    const stream = (name, onRow) =>
      new Promise((resolve, reject) => {
        const child = spawn("unzip", ["-p", zip, name]);
        const lines = createInterface({ input: child.stdout });
        let keys = null;
        lines.on("line", (line) => {
          if (!line) return;
          const cells = splitCsvLine(line);
          if (!keys) keys = cells.map((k) => k.replace(/^\uFEFF/, "").trim());
          else onRow(Object.fromEntries(keys.map((k, i) => [k, cells[i] ?? ""])));
        });
        lines.on("close", resolve);
        child.on("error", reject);
      });
    return await use({ read, stream });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
