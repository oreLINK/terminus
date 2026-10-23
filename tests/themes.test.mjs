import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { THEMES, DEFAULT_THEME, activeTheme, zonedTime, themeStart, themeEnd } from "../js/themes/index.js";

const themesDir = new URL("../js/themes/", import.meta.url);
const halloween = THEMES.find((t) => t.id === "halloween-2026");

test("heure de Paris : changements d'heure compris", () => {
  // 15 octobre, heure d'été (UTC+2) ; 1er novembre, heure d'hiver (UTC+1).
  assert.equal(zonedTime("2026-10-15 18:00", "Europe/Paris"), Date.parse("2026-10-15T16:00:00Z"));
  assert.equal(zonedTime("2026-11-01 08:00", "Europe/Paris"), Date.parse("2026-11-01T07:00:00Z"));
  assert.throws(() => zonedTime("15/10/2026 18h", "Europe/Paris"));
});

test("Halloween 2026 : du 15 octobre à 18 h au 1er novembre à 8 h, heure de Paris", () => {
  assert.equal(activeTheme(Date.parse("2026-10-15T15:59:00Z")).id, DEFAULT_THEME.id);
  assert.equal(activeTheme(Date.parse("2026-10-15T16:00:00Z")).id, "halloween-2026");
  assert.equal(activeTheme(Date.parse("2026-10-31T22:00:00Z")).id, "halloween-2026");
  assert.equal(activeTheme(Date.parse("2026-11-01T06:59:00Z")).id, "halloween-2026");
  assert.equal(activeTheme(Date.parse("2026-11-01T07:00:00Z")).id, DEFAULT_THEME.id);
  assert.ok(halloween.texts.over.includes("{vehicle}"));
});

test("chaque thème est complet, avec ses fichiers, et les périodes ne se chevauchent pas", () => {
  const ids = new Set([DEFAULT_THEME.id]);
  for (const t of THEMES) {
    assert.ok(t.id && t.name && t.timeZone, t.id);
    assert.ok(!ids.has(t.id), `identifiant en double : ${t.id}`);
    ids.add(t.id);
    assert.ok(themeStart(t) < themeEnd(t), `${t.id} : la fin doit suivre le début`);
    if (t.stylesheet) assert.ok(existsSync(fileURLToPath(new URL(t.stylesheet, themesDir))), `${t.id} : ${t.stylesheet} absent`);
  }
  const sorted = [...THEMES].sort((a, b) => themeStart(a) - themeStart(b));
  for (let i = 1; i < sorted.length; i++) {
    assert.ok(themeEnd(sorted[i - 1]) <= themeStart(sorted[i]), `${sorted[i - 1].id} et ${sorted[i].id} se chevauchent`);
  }
});

test("THEMES.md et js/themes/index.js donnent le même calendrier", () => {
  const md = readFileSync(new URL("../THEMES.md", import.meta.url), "utf8");
  // Lignes du tableau : | Nom | `identifiant` | début | fin |
  const rows = [...md.matchAll(/^\|\s*([^|]+?)\s*\|\s*`([\w-]+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm)].map((m) => ({
    name: m[1],
    id: m[2],
    from: m[3],
    to: m[4],
  }));
  const documented = rows.filter((r) => r.id !== DEFAULT_THEME.id);
  assert.deepEqual(
    documented.map((r) => r.id).sort(),
    THEMES.map((t) => t.id).sort(),
    "chaque thème a sa ligne dans THEMES.md, et inversement",
  );
  for (const t of THEMES) {
    const row = documented.find((r) => r.id === t.id);
    assert.equal(row.name, t.name, `${t.id} : nom`);
    assert.equal(row.from, t.from, `${t.id} : début`);
    assert.equal(row.to, t.to, `${t.id} : fin`);
  }
  assert.ok(rows.some((r) => r.id === DEFAULT_THEME.id), "le thème Terminus figure au calendrier");
});
