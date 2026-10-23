// Registre des modes. Ajouter un mode : créer son dossier (sur le modèle
// de last-ride/), l'inscrire dans FEATURES, puis déclarer son adaptateur dans chaque
// réseau qui sait le fournir (network.features[id]).
//
// Un mode expose :
//   id, title (phrase complète), short (libellé du sélecteur), description,
//   mount({ root, network, adapter }) → { unmount() }

import lastRide from "./last-ride/index.js";
import lastBus from "./last-bus/index.js";
import nightRide from "./night-ride/index.js";

// Dans l'ordre de la fenêtre Mode.
export const FEATURES = [lastRide, lastBus, nightRide];

// Mode par défaut d'un réseau qui n'en déclare pas (network.defaultFeature).
export const DEFAULT_FEATURE = "last-ride";

export const featuresFor = (network) => FEATURES.filter((f) => network.features[f.id]);
