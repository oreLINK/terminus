import assert from "node:assert/strict";
import { test } from "node:test";

import { LOCAL, lab, now } from "../js/core/lab.js";

test("mode test : inerte hors de localhost, l'horloge est l'heure réelle", () => {
  assert.equal(LOCAL, false);
  assert.equal(lab, null);
  assert.ok(Math.abs(now() - Date.now()) < 50);
});
