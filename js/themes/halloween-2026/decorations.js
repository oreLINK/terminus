// Animations du thème Halloween 2026 : des groupes de fantômes qui traversent la page de temps en
// temps, brume au bas de l'écran, chauves-souris qui s'envolent d'« Actualiser », araignée qui
// descend quand il faut partir, et le 31 octobre un « Joyeux Halloween » (une seule fois) et plus
// de fantômes.
// Profondeur : chaque fantôme a une profondeur au hasard. Lointain, il est petit, lent, pâle, un peu
// flou, et passe derrière le contenu (vu à travers le verre) ; proche, il est grand, rapide, net, et
// passe devant. Les trajectoires sont prises dans la page et non dans l'écran : quand on fait
// défiler, un fantôme suit le contenu, comme s'il traversait la page elle-même.
// Garde-fous : rien ne bouge si le mouvement est réduit (seuls la brume, fixe, et le décor de
// theme.css restent) ; aucun fantôme ni chauve-souris sous 10 minutes ni quand c'est trop tard
// (data-tone urgent ou late), ni quand la page est cachée. Un fantôme touché disparaît (« pouf »).

import { readJSON, writeJSON } from "../../core/storage.js";

const GREETED_KEY = "dt.season-greeting.v1"; // jour déjà salué, pour ne saluer qu'une fois
const WAVE_EVERY_MS = [45_000, 90_000]; // délai entre deux groupes de fantômes, au hasard
const WAVE_EVERY_31_MS = [20_000, 45_000]; // le 31 octobre
const FIRST_WAVE_MS = 8_000;
const WAVE_SIZE = [2, 4]; // fantômes par groupe
const MAX_GHOSTS = 6; // jamais plus à la fois
const BACK_DEPTH = 0.45; // en deçà, le fantôme passe derrière le contenu

const GHOST = `<svg viewBox="0 0 64 72" aria-hidden="true"><path d="M32 4C17 4 7 15 7 30v36l8-6 8.5 6 8.5-6 8.5 6 8.5-6 8 6V30C57 15 47 4 32 4Z" fill="#f4effa"/><ellipse cx="24" cy="29" rx="4" ry="5.5" fill="#1e1430"/><ellipse cx="40" cy="29" rx="4" ry="5.5" fill="#1e1430"/><ellipse cx="32" cy="43" rx="3.5" ry="4.5" fill="#1e1430"/></svg>`;
const BAT = `<svg viewBox="0 0 56 32" aria-hidden="true"><path d="M28 12c-2-4-4-5-4-5l1 5c-5-6-14-7-25-3 6 1 9 5 9 9 3-2 7-2 9 1 2-3 6-3 10 0 4-3 8-3 10 0 2-3 6-3 9-1 0-4 3-8 9-9-11-4-20-3-25 3l1-5s-2 1-4 5Z" fill="#0d0815" stroke="#3b1d5c" stroke-width="1"/></svg>`;
const SPIDER = `<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="#f3ece2" stroke-width="1.4" stroke-linecap="round" fill="none"><path d="M9 11 3 7M9 13l-6 0M9 14l-5 5M15 11l6-4M15 13h6M15 14l5 5M10 9 7 4M14 9l3-5"/></g><ellipse cx="12" cy="13" rx="4" ry="5" fill="#0d0815" stroke="#f3ece2" stroke-width="1"/><circle cx="10.6" cy="11.5" r="0.9" fill="#ff8a1f"/><circle cx="13.4" cy="11.5" r="0.9" fill="#ff8a1f"/></svg>`;

const between = ([a, b]) => a + Math.random() * (b - a);

export function start({ now }) {
  const html = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pressing = () => ["urgent", "late"].includes(html.dataset.tone);
  const paused = () => document.visibilityState !== "visible" || pressing();

  // Jour du 31 octobre, à l'heure de Paris.
  const day = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(now());
  const isHalloween = () => day().endsWith("-10-31");

  // Brume : dans le fond d'ambiance, derrière tout le contenu.
  const fog = document.createElement("div");
  fog.className = "season-fog";
  document.querySelector(".ambient")?.append(fog);

  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  };

  greet();
  if (still) {
    return () => {
      for (const id of timers) clearTimeout(id);
      fog.remove();
      document.querySelector(".season-toast")?.remove();
    };
  }

  // Deux calques pris dans la page (sur toute sa hauteur, pas sur l'écran) : derrière le contenu pour
  // les fantômes lointains, devant pour les proches, les chauves-souris et l'araignée. Transparents
  // aux touchers, sauf sur les fantômes proches.
  const layer = (where) => {
    const el = document.createElement("div");
    el.className = `season-layer is-${where}`;
    el.setAttribute("aria-hidden", "true");
    document.body.append(el);
    return el;
  };
  const back = layer("back");
  const front = layer("front");
  // Position dans la page d'un point de l'écran.
  const pageY = (viewportY) => viewportY + window.scrollY;

  // ---------- Fantômes ----------

  const lerp = (a, b, t) => a + (b - a) * t;

  function ghost(depth, delay) {
    const near = depth >= BACK_DEPTH;
    const el = document.createElement("div");
    el.className = "season-ghost";
    el.innerHTML = GHOST;
    // Lointain : petit, pâle, un peu flou ; proche : grand, net. La taille fixe aussi la vitesse.
    const size = lerp(1.75, 5, depth); // rem
    el.style.width = `${size}rem`;
    el.style.height = `${size * 1.15}rem`;
    el.style.opacity = lerp(0.22, 0.66, depth).toFixed(2);
    el.style.filter = `blur(${lerp(2.2, 0, depth).toFixed(1)}px) drop-shadow(0 0 ${lerp(0.2, 0.6, depth)}rem rgb(220 200 255 / 0.45))`;
    el.style.zIndex = String(Math.round(depth * 100));
    // Hauteur prise dans la partie de la page visible à cet instant, puis fixe dans la page.
    el.style.top = `${pageY(between([0.06, 0.82]) * window.innerHeight)}px`;
    if (!near) el.style.pointerEvents = "none";
    (near ? front : back).append(el);

    const ltr = Math.random() < 0.5;
    const from = ltr ? `-${size + 1}rem` : "calc(100vw + 1rem)";
    const to = ltr ? "calc(100vw + 1rem)" : `-${size + 1}rem`;
    const flip = ltr ? 1 : -1; // le fantôme regarde où il va
    const drift = `${between([-1, 1]) * lerp(1.5, 5, depth)}rem`;
    const flight = el.animate(
      [
        { transform: `translate(${from}, 0) scaleX(${flip})` },
        { transform: `translate(calc((${from} + ${to}) / 2), ${drift}) scaleX(${flip})`, offset: 0.5 },
        { transform: `translate(${to}, 0) scaleX(${flip})` },
      ],
      // Proche : vite (9 à 12 s) ; lointain : lentement (22 à 30 s).
      { duration: lerp(between([22_000, 30_000]), between([9_000, 12_000]), depth), delay, easing: "linear", fill: "backwards" },
    );
    flight.finished.then(() => el.remove(), () => {});
    // Easter egg : touché, un fantôme proche disparaît dans un « pouf ».
    if (near) {
      el.addEventListener(
        "pointerdown",
        () => {
          flight.pause();
          el.style.pointerEvents = "none";
          el.animate(
            [{ opacity: el.style.opacity }, { opacity: 0, filter: "blur(6px)", scale: "1.6" }],
            { duration: 420, easing: "ease-out", fill: "forwards" },
          ).finished.then(() => el.remove(), () => {});
        },
        { once: true },
      );
    }
  }

  // Un groupe : de deux à quatre fantômes, à des profondeurs et des départs différents.
  function wave() {
    const flying = document.querySelectorAll(".season-ghost").length;
    if (!paused() && flying < MAX_GHOSTS) {
      const count = Math.min(Math.round(between(WAVE_SIZE)), MAX_GHOSTS - flying);
      for (let i = 0; i < count; i++) ghost(Math.random(), i === 0 ? 0 : between([600, 4_000]));
    }
    later(wave, between(isHalloween() ? WAVE_EVERY_31_MS : WAVE_EVERY_MS));
  }
  later(wave, FIRST_WAVE_MS);

  // ---------- Chauves-souris à l'actualisation ----------

  function bats(e) {
    const button = e.target.closest?.('[data-action="refresh"]');
    if (!button || paused()) return;
    const r = button.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
      const el = document.createElement("div");
      el.className = "season-bat";
      el.innerHTML = BAT;
      el.style.left = `${r.left + r.width / 2 - 14}px`;
      el.style.top = `${pageY(r.top + r.height / 2 - 8)}px`;
      front.append(el);
      const dx = between([-160, 160]);
      const dy = -between([180, 360]);
      el.animate(
        [
          { transform: "translate(0, 0) scale(0.6)", opacity: 0 },
          { transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1)`, opacity: 1, offset: 0.25 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.8)`, opacity: 0 },
        ],
        { duration: between([1100, 1600]), delay: i * 90, easing: "ease-out", fill: "both" },
      ).finished.then(() => el.remove(), () => {});
    }
  }
  document.addEventListener("click", bats, true);

  // ---------- Araignée quand il faut partir ----------

  let spiderFor = null; // heure limite déjà saluée par l'araignée
  function spider() {
    const word = document.querySelector("#countdown .countdown-word");
    const hero = document.querySelector("#hero");
    const limit = document.querySelector(".hero-time")?.textContent;
    if (word?.textContent === "maintenant" && hero && limit !== spiderFor && document.visibilityState === "visible") {
      spiderFor = limit;
      const r = hero.getBoundingClientRect();
      const el = document.createElement("div");
      el.className = "season-spider";
      el.innerHTML = SPIDER;
      el.style.left = `${r.left + 30}px`;
      el.style.top = `${pageY(r.top + 6)}px`;
      front.append(el);
      el.animate(
        [
          { transform: "translateY(-2rem)" },
          { transform: "translateY(4.5rem)", offset: 0.3 },
          { transform: "translateY(4rem)", offset: 0.38 },
          { transform: "translateY(4.5rem)", offset: 0.7 },
          { transform: "translateY(-2rem)" },
        ],
        { duration: 5200, easing: "ease-in-out" },
      ).finished.then(() => el.remove(), () => {});
    }
    later(spider, 1000);
  }
  later(spider, 1000);

  // ---------- Le 31 octobre ----------

  function greet() {
    const today = day();
    if (!isHalloween() || readJSON(GREETED_KEY) === today) return;
    writeJSON(GREETED_KEY, today);
    const toast = document.createElement("p");
    toast.className = "season-toast";
    toast.setAttribute("role", "status");
    toast.textContent = "Joyeux Halloween 🎃";
    document.body.append(toast);
    later(() => toast.remove(), 4600);
  }

  return () => {
    for (const id of timers) clearTimeout(id);
    document.removeEventListener("click", bats, true);
    back.remove();
    front.remove();
    fog.remove();
    document.querySelector(".season-toast")?.remove();
  };
}
