// Registre des réseaux de transport. Ajouter un réseau : créer son dossier
// (sur le modèle de bordeaux-tbm/) puis l'inscrire dans NETWORKS.

import { inBounds } from "../core/util.js";
import bordeauxTbm from "./bordeaux-tbm/index.js";

export const NETWORKS = [bordeauxTbm];

export const getNetwork = (id) => NETWORKS.find((n) => n.id === id) ?? null;

export const covers = (network, point) => inBounds(network.coverage, point);

// Le réseau qui dessert ce point, s'il y en a un.
export const networkAt = (point) => NETWORKS.find((n) => covers(n, point)) ?? null;
