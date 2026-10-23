// Mode « Le dernier transport » : tram et bus de jour combinés, correspondances de l'un à l'autre
// comprises, sur le même écran et avec le même calcul que le dernier tram (last-ride). L'adaptateur du
// réseau assemble les données des deux modes (décision de l'auteur, 23/10/2026 : certains logements
// sont desservis par le bus et le tram ; il pourra devenir le mode par défaut une fois éprouvé).

import { mount } from "../last-ride/index.js";

export default {
  id: "last-transport",
  title: "Le dernier transport",
  short: "Dernier transport",
  description: "Quand partir pour rentrer en tram ou en bus, l'un après l'autre s'il le faut, jusqu'à votre destination.",
  mount,
};
