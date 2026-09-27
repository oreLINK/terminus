// Position de la personne, partagée par la coquille (choix automatique de la ville)
// et par les types d'information. Deux sources : le GPS du navigateur, ou un lieu saisi.

const REASONS = {
  unsupported: "Ce navigateur ne donne pas accès à votre position. Touchez la carte de gauche pour l'indiquer.",
  1: "La localisation est refusée pour ce site. Autorisez-la dans les réglages du navigateur, ou indiquez où vous êtes.",
  2: "Votre position est introuvable pour le moment. Indiquez où vous êtes.",
  3: "La localisation prend trop de temps. Indiquez où vous êtes.",
};

const listeners = new Set();
let here = null; // { lat, lon, label?, accuracy?, source: "gps" | "manual" }
let issue = null; // raison lisible quand la position est inconnue
let watchId = null;

// Copie de la liste : un abonné peut se désabonner ou en ajouter un autre pendant l'envoi.
const emit = (type) => [...listeners].forEach((fn) => fn({ type, here, issue }));

function onPosition(pos) {
  here = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy, source: "gps" };
  issue = null;
  emit("position");
}

function onError(err) {
  if (here) return; // on garde la dernière position connue
  // Refus : le navigateur ne réessaiera pas. Sinon la surveillance continue
  // et prendra le relais dès qu'une position arrive.
  if (err.code === 1) stop();
  issue = REASONS[err.code] ?? REASONS[2];
  emit("issue");
}

function stop() {
  if (watchId != null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

export const location = {
  get here() {
    return here;
  },
  get issue() {
    return issue;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // Lance le GPS, sauf si un lieu a été saisi ou si la surveillance tourne déjà.
  start() {
    if (here?.source === "manual" || watchId != null) return;
    if (!("geolocation" in navigator)) {
      issue = REASONS.unsupported;
      emit("issue");
      return;
    }
    watchId = navigator.geolocation.watchPosition(onPosition, onError, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 20000,
    });
  },

  setManual(place) {
    stop();
    here = { lat: place.lat, lon: place.lon, label: place.label, source: "manual" };
    issue = null;
    emit("position");
  },

  // Oublie la position (GPS ou saisie) avant de relancer la localisation.
  reset() {
    stop();
    here = null;
    issue = null;
  },
};
