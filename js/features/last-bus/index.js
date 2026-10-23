// Mode « Le dernier bus » : le même écran et le même calcul que le dernier tram (last-ride), sur les
// bus de jour. Tout ce qui change vient de l'adaptateur du réseau : véhicule, arrêts, horaires,
// tracés, correspondances à pied (décision de l'auteur, 23/10/2026 : certains logements ne sont
// desservis que par le bus).

import { mount } from "../last-ride/index.js";

export default {
  id: "last-bus",
  title: "Le dernier bus",
  short: "Dernier bus",
  description: "Quand partir pour attraper le dernier bus jusqu'à votre destination, et par où passer.",
  mount,
};
