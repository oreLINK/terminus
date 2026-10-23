// GTFS statique de TBM : téléchargement (environ 22 Mo) et lecture des fichiers CSV, partagés par
// les générateurs (build-shapes.mjs, build-timetable.mjs). La lecture passe par la commande unzip du
// système ; stop_times.txt (160 Mo) est lu en flux, ligne à ligne.

import { spawn, spawnSync } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { createInterface } from "node:readline";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const GTFS_URL = "https://bdx.mecatran.com/utw/ws/gtfsfeed/static/bordeaux?apiKey=opendata-bordeaux-metropole-flux-gtfs-rt";

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
