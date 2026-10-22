// Type d'information « Le dernier bus de nuit pour rentrer » : le même écran que le dernier tram
// (last-ride), sur le réseau de nuit. Tout ce qui change vient de l'adaptateur du réseau : véhicule,
// nuits de service, plage horaire jusqu'au matin, zones à la demande.

import { mount } from "../last-ride/index.js";

export default {
  id: "night-ride",
  title: "Le dernier bus de nuit pour rentrer",
  short: "Bus de nuit",
  description: "Combien de temps il vous reste avant de partir pour attraper le dernier bus de nuit vers chez vous.",
  mount,
};
