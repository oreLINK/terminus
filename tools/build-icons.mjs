// Génère, depuis icons/icon.svg (carré plein), les icônes du site :
//   icons/favicon.svg           onglet des navigateurs récents, coins arrondis ;
//   icons/favicon-32.png        onglet des navigateurs qui ne lisent pas le SVG ;
//   icons/apple-touch-icon.png  écran d'accueil de l'iPhone, 180 × 180, carré plein (l'iPhone
//                               arrondit lui-même les coins et n'accepte pas le SVG).
// Les PNG sont rendus par Chrome sans interface : chemin dans CHROME, sinon celui de macOS ou
// google-chrome / chromium dans le PATH. Usage : npm run icons, après une modification d'icon.svg.

import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = new URL("../icons/", import.meta.url);
const source = (await readFile(new URL("icon.svg", DIR), "utf8")).replace(/<!--[\s\S]*?-->\s*/, "");

// Favicon : le même dessin, découpé en carré à coins arrondis.
const favicon = source
  .replace(/<svg([^>]*)>/, `<svg$1><clipPath id="r"><rect width="64" height="64" rx="14"/></clipPath><g clip-path="url(#r)">`)
  .replace(/<\/svg>\s*$/, "</g></svg>\n");
await writeFile(
  new URL("favicon.svg", DIR),
  `<!-- Généré par tools/build-icons.mjs (npm run icons) depuis icon.svg. Ne pas modifier à la main. -->\n${favicon}`,
);

function chrome() {
  const candidates = [process.env.CHROME, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "google-chrome", "chromium", "chromium-browser"];
  for (const c of candidates.filter(Boolean)) {
    if (spawnSync(c, ["--version"], { stdio: "ignore" }).status === 0) return c;
  }
  throw new Error("Chrome introuvable : indiquez son chemin dans la variable CHROME.");
}

const browser = chrome();
const tmp = await mkdtemp(join(tmpdir(), "terminus-icons-"));
try {
  for (const [name, size, svg] of [["apple-touch-icon.png", 180, source], ["favicon-32.png", 32, favicon]]) {
    const page = join(tmp, `${size}.html`);
    await writeFile(page, `<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
    execFileSync(browser, [
      "--headless=new",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--default-background-color=00000000",
      `--window-size=${size},${size}`,
      `--screenshot=${fileURLToPath(new URL(name, DIR))}`,
      `file://${page}`,
    ], { stdio: "ignore" });
    console.log(`${name} (${size} × ${size})`);
  }
} finally {
  await rm(tmp, { recursive: true, force: true });
}
console.log(`favicon.svg → ${fileURLToPath(DIR)}`);
