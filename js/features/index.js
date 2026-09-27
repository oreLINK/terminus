// Registre des types d'information. Ajouter un type : créer son dossier (sur le modèle
// de last-ride/), l'inscrire dans FEATURES, puis déclarer son adaptateur dans chaque
// réseau qui sait le fournir (network.features[id]).
//
// Un type d'information expose :
//   id, title (phrase complète), short (libellé du sélecteur), description,
//   mount({ root, network, adapter }) → { unmount() }

import lastRide from "./last-ride/index.js";

export const FEATURES = [lastRide];

// Choix du mode automatique.
export const DEFAULT_FEATURE = "last-ride";

export const featuresFor = (network) => FEATURES.filter((f) => network.features[f.id]);
