// Accès au localStorage sans jamais échouer : en navigation privée stricte,
// le site fonctionne, simplement sans mémoire d'une visite à l'autre.

export function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
