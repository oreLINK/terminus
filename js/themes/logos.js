// Coco — le logo du site, choisi par thème (`logo` dans js/themes/index.js). Ce catalogue garde les
// logos retenus lors du choix du 23/10/2026 (planche « Logos Terminus ») : en changer = remplacer
// l'identifiant dans index.js, sans autre code. Leur style est dans css/style.css (section « Logo »).
// Le logo du thème par défaut est aussi écrit en dur dans index.html et les pages légales, pour
// s'afficher sans script (un test vérifie que ces copies suivent le catalogue).
// Chaque logo est du HTML (police du téléphone) ou un SVG (lettres dessinées au trait, identiques
// partout), dimensionné en em : il suit la taille de .wordmark.

// Lettres au trait, hauteur 10 : largeur et tracé.
const STROKE = {
  T: [8, "M0 0H8M4 0V10"],
  E: [6, "M6 0H0V10H6M0 5H4.8"],
  R: [6.6, "M0 10V0H3.6A2.5 2.5 0 0 1 3.6 5H0M3.2 5L6.6 10"],
  M: [8.4, "M0 10V0L4.2 6.2L8.4 0V10"],
  I: [0, "M0 0V10"],
  N: [7, "M0 10V0L7 10V0"],
  U: [7, "M0 0V6.5A3.5 3.5 0 0 0 7 6.5V0"],
  S: [6.6, "M6.2 1.6C5.4 .5 4.4 0 3.3 0 1.6 0 .4 1.1 .4 2.6c0 1.6 1.4 2.1 2.9 2.4s3.3.9 3.3 2.6C6.6 9.1 5.2 10 3.3 10 1.9 10 .9 9.4 0 8.4"],
};

// Positions des lettres de « TERMINUS » ; `wideI` : plus d'espace autour du I (bougie).
function layout(wideI = 0) {
  let x = 0;
  return [..."TERMINUS"].map((ch) => {
    const pad = ch === "I" ? wideI : 0;
    const at = x + pad;
    x = at + STROKE[ch][0] + 2.6 + pad;
    return { ch, x: at };
  });
}

// Tracés des lettres (sauf celles de `skip`), avec un liseré de la couleur du fond si `under`.
function strokes(letters, { skip = [], under = false } = {}) {
  const paths = letters
    .filter(({ ch }) => !skip.includes(ch))
    .map(({ ch, x }) => `<path transform="translate(${x} 0)" d="${STROKE[ch][1]}"/>`)
    .join("");
  const halo = under ? `<g class="logo-halo" stroke-width="4.3">${paths}</g>` : "";
  return `${halo}<g class="logo-ink" stroke-width="1.9">${paths}</g>`;
}

// SVG à l'échelle du texte : 10 unités = 0,75 em (hauteur des capitales).
const svg = ([x, y, w, h], inner, cls = "") =>
  `<svg class="logo-svg ${cls}" viewBox="${x} ${y} ${w} ${h}" style="height:${+(h * 0.075).toFixed(3)}em" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

// Afficheur à points 5 × 7, comme la girouette d'un tram.
const DOTS = {
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
};
// Points de l'afficheur, lettre par lettre (un <g> par lettre). `dead` : rangs des points allumés
// qui ne s'allument plus ; `loose` : transformation d'une lettre décrochée, par rang de lettre.
function ledDots({ dead = new Set(), loose = {} } = {}) {
  let x = 0;
  let lit = 0;
  const groups = [..."TERMINUS"].map((ch, n) => {
    const rows = DOTS[ch];
    let dots = "";
    rows.forEach((row, y) =>
      [...row].forEach((on, dx) => {
        const isOn = on === "1" && !dead.has(lit++);
        dots += `<circle cx="${x + dx + 0.5}" cy="${y + 0.5}" r=".37" class="${isOn ? `on l${n}` : "off"}"/>`;
      }),
    );
    x += rows[0].length + 1;
    return loose[n] ? `<g transform="${loose[n]}">${dots}</g>` : dots;
  });
  return { dots: groups.join(""), w: x - 1 };
}

function led(cls = "") {
  const { dots, w } = ledDots();
  return `<svg class="logo-svg logo-led ${cls}" viewBox="-1.3 -1.3 ${w + 2.6} 9.6" style="height:1.3em" aria-hidden="true"><rect x="-1.3" y="-1.3" width="${w + 2.6}" height="9.6" rx="1.3" class="logo-panel"/>${dots}</svg>`;
}

// H09 : la girouette décrochée. Le panneau penche (pivot sur le crochet de gauche) et se balance,
// pendu à deux câbles qui montent hors de l'écran ; celui de droite, effiloché, crache des
// étincelles et fait baisser l'affichage (court-circuit). Points morts, U qui pend, coin cassé,
// fissure et rouille. Les câbles dépassent du dessin (overflow visible) : ils montent dans la
// marge de l'en-tête jusqu'au bord de l'écran.
function brokenLed() {
  const { dots, w } = ledDots({ dead: new Set([3, 17, 41, 58, 77, 90]), loose: { 6: "translate(.2 .45) rotate(6 36.5 3.5)" } });
  const right = w - 4; // crochet de droite, dans le repère du panneau
  const spark = (x, y, cls) =>
    `<g class="logo-spark ${cls}" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y}l1.6 -1.1M${x} ${y}l2 .5M${x} ${y}l.6 1.7M${x} ${y}l-1.4 -1.4M${x} ${y}l-.4 1.8"/><circle cx="${x}" cy="${y}" r=".5"/></g>`;
  const sign =
    `<path d="M-1.3 -.3Q-1.3 -1.3 -.3 -1.3H${w + 0.3}Q${w + 1.3} -1.3 ${w + 1.3} -.3V7.3Q${w + 1.3} 8.3 ${w + 0.3} 8.3H2.4L-1.3 5.2Z" class="logo-panel logo-rim"/>` +
    `<g class="logo-rust"><circle cx="${w - 0.4}" cy="7" r="1.2"/><circle cx="${w - 2}" cy="7.8" r=".7"/><circle cx="1.6" cy="-.4" r=".8"/></g>` +
    `<g class="logo-dots">${dots}</g>` +
    `<path d="M31.2 -1.3L32.4 .8L31.6 1.9L33.4 4.4" class="logo-crack"/>` +
    `<path d="M${right + 0.15} -16.3C${right + 0.5} -9 ${right + 1.4} -6 ${right + 0.6} -3.2" class="logo-cable"/>` +
    `<path d="M${right + 0.6} -3.2L${right} -1.3M${right + 0.6} -3.2C${right + 1.6} -3 ${right + 2.4} -2.4 ${right + 2.4} -1.8M${right + 0.6} -3.2L${right - 0.6} -2.4" class="logo-strand"/>` +
    `<circle cx="${right}" cy="-1.3" r=".55" class="logo-hook"/>` +
    spark(right + 0.6, -2.7, "is-first") +
    spark(right + 2.4, -1.8, "is-second");
  return `<svg class="logo-svg logo-led is-haunted is-broken" viewBox="-2.6 -2.4 ${w + 5.4} 14" style="height:1.75em" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `<path d="M3.6 -15C3.2 -10 4.6 -8 3.9 -4.4C3.7 -3.2 4 -2.2 4 -1.3" class="logo-cable"/><rect x="3.1" y="-8.6" width="1.6" height="1.3" rx=".2" class="logo-tape"/>` +
    `<g class="logo-sign" style="transform-origin:4px -1.3px">${sign}</g>` +
    `<circle cx="4" cy="-1.3" r=".55" class="logo-hook"/></svg>`;
}

// Enveloppe commune : lue « Terminus » par les lecteurs d'écran, quel que soit le dessin.
const logo = (inner, cls = "") => `<span class="logo ${cls}" role="img" aria-label="Terminus">${inner}</span>`;
const letters = () => [..."TERMINUS"].map((c) => `<span><b>${c}</b></span>`).join("");
const MOON_CRESCENT = `<svg class="logo-moon" viewBox="0 0 10 10" aria-hidden="true"><path d="M6.6 .8A4.5 4.5 0 1 0 9.4 7.6 3.7 3.7 0 1 1 6.6 .8Z"/></svg>`;

export const LOGOS = {
  T06: { name: "Pastilles de ligne", html: () => logo(letters(), "logo-badges") },
  T07: { name: "Pastille T", html: () => logo(`<span class="logo-pt"><b>T</b></span>erminus`, "logo-pt-word") },
  T08: { name: "Point en direct", html: () => logo(`term<span class="logo-i">ı<i class="logo-live"></i></span>nus`) },
  T09: { name: "Point final", html: () => logo(`terminus<span class="logo-stop"></span>`) },
  T10: { name: "Girouette", html: () => logo(led()) },
  T11: { name: "Palettes", html: () => logo(letters(), "logo-flap") },
  T12: { name: "Plaque de station", html: () => logo("Terminus", "logo-plate") },
  T13: {
    name: "Ticket",
    html: () =>
      logo(
        `terminus<span class="logo-stub"><svg viewBox="0 0 12 10" aria-hidden="true"><path d="M1 5H8.6M10.4 1.4V8.6"/></svg></span>`,
        "logo-ticket",
      ),
  },
  H09: { name: "Girouette hantée", html: () => logo(brokenLed()) },
  H10: {
    name: "Pleine lune",
    html: () =>
      logo(
        svg(
          [-1.6, -7, 71, 18.6],
          `<circle cx="54" cy="1.4" r="7.6" class="logo-fullmoon"/><g class="logo-craters"><circle cx="50.6" cy="-.4" r="1.2"/><circle cx="57.4" cy="3.6" r=".9"/><circle cx="55.6" cy="-3.4" r=".7"/></g>` +
            `<path class="logo-bat" d="M42 -4.6q1.1-.9 2.1 0q.5-.8 1-.2q.5-.6 1 .2q1-.9 2.1 0q-1.2.4-1.6 1.4q-.6-.5-1 .1q-.4-.6-1-.1q-.4-1-1.6-1.4Z"/>` +
            strokes(layout(), { under: true }),
        ),
      ),
  },
  H11: {
    name: "Bougie",
    html: () => {
      const word = layout(1.8);
      const x = word.find((l) => l.ch === "I").x;
      return logo(
        svg(
          [-1.6, -4.6, 74.6, 16.2],
          strokes(word, { skip: ["I"] }) +
            `<circle cx="${x}" cy="-.4" r="3.2" class="logo-glow"/>` +
            `<rect x="${x - 1.3}" y="2.6" width="2.6" height="7.6" rx=".5" class="logo-candle"/>` +
            `<path d="M${x} 2.6V1.5" class="logo-wick"/>` +
            `<g class="logo-flame"><path d="M${x} -2.8C${x + 1.4} -.9 ${x + 1.2} 1.4 ${x} 1.4C${x - 1.2} 1.4 ${x - 1.4} -.9 ${x} -2.8Z"/><path class="logo-flame-core" d="M${x} -.9C${x + 0.7} 0 ${x + 0.6} 1.1 ${x} 1.1C${x - 0.6} 1.1 ${x - 0.7} 0 ${x} -.9Z"/></g>`,
        ),
      );
    },
  },
};

// HTML du logo `id` (un identifiant inconnu donne le texte seul, sans casser l'en-tête).
export const logoHtml = (id) => LOGOS[id]?.html() ?? logo("Terminus");
