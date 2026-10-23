// Mode « Le prochain bus de nuit » : le même écran que le dernier tram (last-ride), sur le réseau
// de nuit, mais il vise le prochain bus atteignable vers chez soi et non le dernier du service
// (choix de l'auteur, 22/10/2026 : en pleine nuit, on veut le premier bus qui ramène, pas le
// dernier). Le reste vient de l'adaptateur du réseau : véhicule, nuits de service, plage horaire
// jusqu'au matin, zones à la demande.

import { mount } from "../last-ride/index.js";

export default {
  id: "night-ride",
  title: "Le prochain bus de nuit",
  short: "Bus de nuit",
  description: "Quand partir pour attraper le prochain bus de nuit jusqu'à votre destination, et par où passer.",
  mount: (context) => mount({ ...context, goal: "next" }),
};
