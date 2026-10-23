// Mode « Le dernier transport » : tram et bus de jour combinés, correspondances de l'un à l'autre
// comprises, sur le même écran et avec le même calcul que le dernier tram (last-ride). L'adaptateur du
// réseau assemble les données des deux modes (décision de l'auteur, 23/10/2026 : certains logements
// sont desservis par le bus et le tram). Mode par défaut de Bordeaux depuis le 23/10/2026. Sans les bus
// de nuit TBNight, qui ont leur propre mode (night-ride) : la description le dit.

import { mount } from "../last-ride/index.js";

export default {
  id: "last-transport",
  title: "Le dernier transport",
  short: "Dernier transport",
  description: "Quand partir pour rentrer en tram ou en bus de jour, l'un après l'autre s'il le faut, jusqu'à votre destination. Sans les bus de nuit TBNight : voyez « Le prochain bus de nuit ».",
  mount,
};
