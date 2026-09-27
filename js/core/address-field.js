// Champ d'adresse avec suggestions : combobox ARIA, clavier et tactile.

import { suggestAddresses } from "./geocode.js";
import { esc } from "./util.js";

let uid = 0;

export function createAddressField(host, { label, placeholder, area, types, hint = "", onSelect }) {
  const id = `addr${++uid}`;
  host.innerHTML = `
    <div class="field">
      <label class="field-label" for="${id}">${esc(label)}</label>
      <div class="combo">
        <input id="${id}" class="field-input" type="text" inputmode="search" enterkeyhint="search"
          role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-list"
          aria-describedby="${id}-hint" autocomplete="off" autocapitalize="off" spellcheck="false"
          placeholder="${esc(placeholder)}">
        <ul id="${id}-list" class="suggestions" role="listbox" aria-label="Adresses proposées" hidden></ul>
      </div>
      <p id="${id}-hint" class="field-hint" aria-live="polite">${esc(hint)}</p>
    </div>`;

  const input = host.querySelector("input");
  const list = host.querySelector("ul");
  const hintEl = host.querySelector(".field-hint");
  let items = [];
  let active = -1;
  let timer = null;
  let controller = null;

  const setHint = (text) => (hintEl.textContent = text);

  function close() {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    active = -1;
  }

  function highlight(i) {
    active = i;
    [...list.children].forEach((li, n) => li.setAttribute("aria-selected", String(n === i)));
    if (i >= 0) {
      input.setAttribute("aria-activedescendant", `${id}-opt${i}`);
      list.children[i].scrollIntoView({ block: "nearest" });
    } else {
      input.removeAttribute("aria-activedescendant");
    }
  }

  function render() {
    list.innerHTML = items
      .map((a, i) => `<li id="${id}-opt${i}" role="option" aria-selected="false" data-i="${i}">${esc(a.label)}</li>`)
      .join("");
    list.hidden = !items.length;
    input.setAttribute("aria-expanded", String(items.length > 0));
    active = -1;
  }

  function choose(i) {
    const item = items[i];
    if (!item) return;
    input.value = item.label;
    close();
    setHint("");
    onSelect(item);
  }

  async function search(text) {
    controller?.abort();
    controller = new AbortController();
    try {
      items = await suggestAddresses(text, { area, types, signal: controller.signal });
      render();
      setHint(items.length ? "" : `Aucune adresse trouvée (${area.label}). Essayez avec le nom de la commune.`);
    } catch (err) {
      if (err.name === "AbortError") return;
      items = [];
      render();
      setHint("La recherche d'adresse ne répond pas. Vérifiez votre connexion puis réessayez.");
    }
  }

  input.addEventListener("input", () => {
    clearTimeout(timer);
    const text = input.value.trim();
    if (text.length < 3) {
      controller?.abort();
      items = [];
      render();
      setHint(hint);
      return;
    }
    timer = setTimeout(() => search(text), 250);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      if (list.hidden) render();
      highlight((active + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      highlight(active <= 0 ? items.length - 1 : active - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) choose(active);
      else if (items.length === 1) choose(0);
    } else if (e.key === "Escape") {
      close();
    }
  });

  // mousedown plutôt que click : le choix se fait avant que le champ perde le focus.
  list.addEventListener("mousedown", (e) => {
    const li = e.target.closest("li[data-i]");
    if (!li) return;
    e.preventDefault();
    choose(Number(li.dataset.i));
  });

  input.addEventListener("blur", () => setTimeout(close, 120));

  return { focus: () => input.focus() };
}
