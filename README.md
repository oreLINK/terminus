# Terminus : guide développeur

Terminus est un site statique qui dit quand partir pour attraper le dernier tram, bus ou bus de nuit jusqu'à sa destination dans Bordeaux Métropole, directement ou avec correspondance. La description destinée aux utilisateurs se trouve dans [PROJECT.md](PROJECT.md) ; le contexte technique détaillé et les invariants du projet sont dans [CONTEXT.md](CONTEXT.md).

## Technologies et architecture

- HTML, CSS et JavaScript moderne en modules ES natifs ; aucun framework, build ni dépendance npm à l'exécution.
- APIs publiques appelées directement depuis le navigateur : SIRI-Lite de Bordeaux Métropole (temps réel) et Géoplateforme IGN (géocodage, itinéraire piéton, fond de carte). Le GTFS statique de TBM n'est lu qu'à la génération des données.
- GitHub Pages pour l'hébergement statique.
- Node.js 18 ou plus récent pour les tests ; Python 3 pour le serveur local.
- Polices : celles de l'appareil (SF Pro sur iPhone, Roboto sur Android) : aucune police n'est téléchargée, aucune ressource n'est chargée depuis un service tiers au démarrage.
- La logique de calcul (`js/features/last-ride/planner.js`) est pure et se teste avec `node:test` sans navigateur, comme les registres de réseaux et de modes.

`package.json` ne déclare aucune dépendance : ses scripts servent aux tests, aux générateurs de données et au serveur local.

## Fonctionnalités techniques

Ce que le code sait faire, vu du développeur. Les fonctionnalités vues par l'utilisateur sont dans [PROJECT.md](PROJECT.md) (tableau « Disponibilité par ville ») ; le détail de chaque brique, dans [CONTEXT.md](CONTEXT.md). Les prénoms désignent les outils internes (tableau « Les outils internes », `CONTEXT.md`, section 4).

🟢 disponible · 🟡 prévu · 🔴 écarté pour l'instant

| | | État | Précisions |
|---|---|---|---|
| **Calcul** | Itinéraire à rebours avec jusqu'à deux correspondances (Bob) | 🟢 | Profils par nombre de correspondances, pur, testé ; le plus tard, le plus pratique, le prochain ; boucles écartées |
| | Correspondances à pied entre stations proches | 🟢 | Précalculées à la génération (IGN), aucun appel à l'exécution |
| | Stations candidates ligne par ligne (Inès) | 🟢 | La plus proche de chaque ligne, pour qu'une ligne dense ne masque pas les autres |
| | Nouvelle méthode : horaires du soir inclus (Léa) + temps réel ciblé (Rémi, Sam) | 🟢 | Bus et transport ; tram et TBNight encore sur l'ancienne méthode, en attente de la bascule |
| | Ancienne méthode : horaires SIRI par ligne, par paliers | 🟢 | Gardée en secours (données manquantes ou périmées) jusqu'à la fin des tests de fiabilité |
| | Modes combinés par assemblage des données (Colette) | 🟢 | « Le dernier transport » : arrêts, graphes, tracés et horaires du tram et du bus, sans fichier en double |
| | Profils gardés d'un recalcul à l'autre | 🟡 | Jusqu'à 3 calculs par actualisation, environ 0,3 s sur téléphone en mode transport |
| **Appels réseau** | Temps réel limité aux lignes du trajet affiché | 🟢 | 1 à 3 appels SIRI par calcul (nouvelle méthode), cache mémoire et `sessionStorage` |
| | Marche réelle par les rues (Max) | 🟢 | IGN, 2 appels à la fois, espacés, un nouvel essai sur refus ; seulement pour les stations empruntées |
| | Données du réseau incluses dans le site | 🟢 | Arrêts, graphes, tracés, correspondances, horaires : aucun appel pour les charger, un fichier par mode, chargé à la demande |
| | Mise en cache hors ligne (service worker) | 🟡 | 2ᵉ visite instantanée ; préalable à l'installation sur l'écran d'accueil |
| | Flux GTFS-RT des retards de tout le réseau | 🔴 | 2,7 Mo : trop lourd toutes les 30 s sur un téléphone |
| **Données** | Générateurs depuis le GTFS de TBM (Gus) | 🟢 | Arrêts et graphe des bus, horaires du soir sur 21 jours, tracés des lignes |
| | Correspondances à pied incrémentales | 🟢 | Cache commun par paire de quais, sens du tracé conservé ; l'IGN n'est appelé que pour les nouvelles paires |
| | Mise à jour automatique chaque lundi (Ravi) | 🟢 | Branche `data-refresh`, pull request, fusion si les tests passent, mise en ligne |
| | Arrêts et graphes du tram et de TBNight tirés du GTFS | 🟡 | Aujourd'hui générés depuis SIRI (`npm run graph`) ; rendrait `build-graph.mjs` inutile |
| | Identifiants courts dans les fichiers générés | 🟡 | Environ 30 à 40 % de moins sur les arrêts et les graphes |
| | Alerte de données périmées | 🟡 | Échec de l'Action si le GTFS expire bientôt ; signal dans le labo |
| **Avis** | Avis sur un trajet : Supabase, Edge Function et Turnstile | 🟡 | Un seul appel, à l'envoi ; table fermée au public (RLS), insertion par une Edge Function qui vérifie le jeton Turnstile et limite par IP hachée, clé `service_role` dans les secrets de la fonction ; script Turnstile chargé à l'ouverture de la feuille d'avis seulement |
| | Rapport d'analyse anonyme, sur consentement | 🟡 | Case décochée par défaut, contenu montré avant l'envoi ; jamais d'adresse, de coordonnées ni d'identifiant |
| **État du service** | Page d'état par ville : sources disponibles, dégradées ou indisponibles | 🟡 | Sources déclarées par le réseau ; vérifiées côté serveur toutes les 10 min (Edge Function Supabase lancée par `pg_cron`, proposition), la page ne fait qu'un appel en lecture ; historique 24 h |
| | Vérification depuis le téléphone | 🟡 | Bouton « Tester depuis mon appareil » : un appel léger par source, à la demande seulement (réseau de la personne, CORS) |
| | Maintien en vie du projet Supabase | 🟡 | Action hebdomadaire : un projet gratuit se met en pause après 7 jours sans activité |
| **Cartes** | Fond Plan IGN avec Leaflet, chargé à la première carte (Carla) | 🟢 | Leaflet copié dans `vendor/`, aperçu figé dans la tuile, carte interactive dans la feuille |
| | Tracé réel des lignes (Tom) | 🟢 | Encodé, simplifié, découpé entre la montée et la descente |
| | Tuiles vectorielles, Leaflet en secours | 🟡 | MapLibre GL JS, style par apparence et par thème |
| | Position des véhicules en temps réel | 🟡 | Flux GTFS-RT des véhicules (55 Ko), décodeur protobuf à écrire |
| **Habillage** | Thèmes de saison imposés par leurs dates (Coco) | 🟢 | Calendrier dans `js/themes/index.js` et `THEMES.md`, vérifiés par un test |
| | Logo par thème, catalogue de logos (Coco) | 🟢 | `logo` du thème dans `js/themes/index.js` ; 11 logos dans `js/themes/logos.js` (T13 et H09 en service, 9 en réserve), voir `THEMES.md` |
| | Apparence claire ou sombre, jetons de design | 🟢 | Jetons dans `:root`, couleur de la barre du navigateur lue dans le CSS |
| **Architecture** | Plusieurs réseaux et plusieurs modes | 🟢 | Un objet réseau avec un adaptateur par mode, registres testés |
| | Briques communes sans dépendance à une fonctionnalité | 🟢 | Dates, noms, stations, pictogrammes dans `js/core/` |
| | Écran de `last-ride` découpé (calcul, marches, rendu, feuilles) | 🟡 | `index.js` fait 1 200 lignes |
| | Table des modes unique par réseau | 🟡 | Lue par l'adaptateur et tous les générateurs : un mode = une ligne de configuration |
| **Outillage** | Tests `node:test` sans navigateur | 🟢 | Calcul, registres, horaires, correspondances, tracés, marche, thèmes, labo |
| | Mode test local (Simon) | 🟢 | Heure simulée, plage horaire, écrans forcés, choix de la méthode ; jamais publié |
| | Comparateur des deux méthodes (Jules) | 🟢 | `npm run compare -- --mode last-bus` ; écarts classés (fantômes, temps réel…) |
| | Serveur local sans cache | 🟢 | `npm run serve` |
| | Tests, déploiement et données par GitHub Actions | 🟢 | `tests.yml`, `deploy.yml`, `data.yml` |

## Installation et développement

Clonez le dépôt, puis démarrez un serveur HTTP à la racine :

```sh
git clone <url-du-depot>
cd terminus
npm run serve
```

Ouvrez `http://localhost:8000`. Le serveur (`tools/serve.py`) interdit le cache du navigateur : sans cela, les modules JS restent en cache plusieurs heures et l'ancien code s'exécute après une modification. Si vous utilisez un autre serveur, rechargez sans le cache (Cmd+Maj+R). Le site utilise des modules ES et ne fonctionne pas en ouvrant directement `index.html` avec `file://`. La géolocalisation est disponible sur `localhost` et en production sur HTTPS.

Pour tester l'affichage à n'importe quelle heure (heure simulée, plage horaire, compteur ou écran forcé), ouvrez `http://localhost:8000/lab/`. Ce mode ne fonctionne qu'en local et la page n'est pas publiée.

Exécutez la suite de tests avant de proposer un changement :

```sh
npm test
```

Ajoutez ou adaptez un test lorsque le comportement calculé change. Toute modification de `planner.js` doit être accompagnée d'un test dans `tests/planner.test.mjs`. Un nouveau réseau ou mode doit passer `tests/registry.test.mjs`.

### Graphe du réseau

`js/networks/bordeaux-tbm/graph.js` décrit l'ordre des arrêts de chaque ligne de tram, par sens. Le calcul s'en sert pour n'appeler les horaires que des lignes et des sens utiles au trajet (1 à 4 appels au lieu de 4 à 12). Il est généré depuis l'API SIRI-Lite et versionné :

```sh
npm run graph
```

Pour les bus de nuit TBNight, `npm run graph -- --night` génère `night-stops.js` et `night-graph.js`, à lancer un jeudi, vendredi ou samedi après-midi (l'API ne connaît alors que les courses de la nuit qui vient).

La même commande génère `js/networks/bordeaux-tbm/stops.js` : les lignes et arrêts de tram, que le site charge sans appeler l'API (`npm run graph -- --stops-only` ne régénère que lui).

`js/networks/bordeaux-tbm/shapes.js` contient le tracé réel des lignes de tram et TBNight, pour la carte. Il est tiré du GTFS statique de TBM (environ 22 Mo téléchargés, lus avec la commande `unzip` du système), simplifié et versionné :

```sh
npm run shapes
```

Relancez-la quand une ligne change de parcours. Sans tracé pour un tronçon, la carte relie les arrêts en ligne droite.

`js/networks/bordeaux-tbm/evening/` contient les horaires théoriques du soir (21 jours), tirés du même GTFS, pour la nouvelle méthode de calcul : celle des modes bus et transport ; le tram et TBNight restent sur l'ancienne jusqu'à la bascule (le réglage « Méthode de calcul » de la page `/lab/` force l'une ou l'autre). Ils s'épuisent : l'Action « Données du réseau » les régénère chaque semaine. Sans horaires pour la soirée, le site revient à l'ancienne méthode.

```sh
npm run timetable
npm run compare   # compare les deux méthodes sur le tram : à lancer de préférence le soir
```

Les bus de jour (`bus-stops.js`, `bus-graph.js`) sont tirés du GTFS, sans appel au flux SIRI : 62 lignes qui roulent le soir, hors lignes scolaires.

```sh
npm run bus
```

`js/networks/bordeaux-tbm/transfers.js`, `night-transfers.js`, `bus-transfers.js` et `transport-transfers.js` (tram et bus, avec les correspondances tram ↔ bus) contiennent les correspondances à pied entre stations proches de noms différents, avec leur marche par les rues calculée une fois par l'IGN. Relancez-les après `npm run graph` et `npm run bus` (les stations viennent des arrêts) ; la génération est incrémentale, l'IGN n'est appelé que pour les nouvelles paires :

```sh
npm run transfers
```

Relancez `npm run graph` après un changement de desserte (nouvelle ligne, prolongement, nouveaux quais), **en journée et hors travaux** : le soir ou un jour de travaux, certaines branches n'ont plus de course et manqueraient au graphe. Relisez le diff avant de commiter. Un graphe périmé ne casse rien (le calcul charge alors tout le réseau), il le rend seulement plus lent.

## Branches, contributions et GitHub

| Branche | Rôle | Alimentée par |
|---|---|---|
| `dev` | développements en cours | commits directs ou branches de travail fusionnées |
| `main` | code final, publié | **pull request depuis `dev` uniquement** |
| `gh-pages` | version publiée du site, servie par GitHub Pages | **l'Action de déploiement uniquement**, ne jamais y écrire à la main |

Déroulé :

1. Travaillez sur `dev`, ou sur une branche courte créée depuis `dev` (`feat/`, `fix/`, `docs/`, `chore/`) puis fusionnée dans `dev`.
2. Quand `dev` est prête, ouvrez une pull request `dev` → `main`. Décrivez le contexte, les changements, la validation exécutée et l'impact.
3. L'Action **Tests** doit passer sur la PR. Fusionnez-la.
4. Le merge déclenche l'Action **Déploiement GitHub Pages**, qui publie le site.

Si un changement modifie les données échangées (nouveau service appelé, nouvelle clé de stockage, position envoyée ailleurs), mettez à jour `confidentialite.html` dans le même changement.

Mettez à jour les fichiers Markdown concernés avec chaque changement : `PROJECT.md` pour l'expérience utilisateur (dont son tableau des fonctionnalités), `README.md` pour le développement et la contribution (dont le tableau « Fonctionnalités techniques »), `CONTEXT.md` pour les règles et le contexte technique. Consultez la matrice détaillée de `CONTEXT.md`, section 13.

### Actions

- `.github/workflows/tests.yml` (**Tests**) : `npm test` à la demande, à chaque push sur `dev` et sur chaque pull request vers `main`.
- `.github/workflows/deploy.yml` (**Déploiement GitHub Pages**) : à chaque push sur `main` (donc à chaque merge), et à la demande depuis l'onglet Actions. Relance les tests, assemble le site dans `_site/` (`index.html`, `mentions-legales.html`, `confidentialite.html`, `css/`, `js/`, `vendor/`, `.nojekyll` et `version.json` avec le commit et la date), puis le pousse sur `gh-pages`. La branche est créée au premier déploiement et garde l'historique des versions. Il n'y a pas de compilation : le site reste statique, sans dépendance d'exécution.
- `.github/workflows/data.yml` (**Données du réseau**) : chaque lundi à 4 h 17 UTC (6 h 17 à Paris l'été, 5 h 17 l'hiver) et à la demande. Crée la branche `data-refresh` depuis `main`, y recharge les arrêts des bus (`npm run bus`), les correspondances à pied (`npm run transfers`), les horaires du soir (`npm run timetable`) et les tracés (`npm run shapes`) depuis le GTFS, lance `npm test`, ouvre une pull request `data-refresh` → `main`, attend que ses vérifications (l'Action « Tests », lancée sur la branche) passent, la fusionne, supprime `data-refresh` et relance la mise en ligne. Une semaine en échec laisse la pull request ouverte ; la suivante la met à jour. Réglage à activer une fois : *Settings → Actions → General → « Allow GitHub Actions to create and approve pull requests »*. Jeton personnel en secret `DATA_PR_TOKEN` facultatif (si la protection de `main` l'exige). Ces fusions arrivent sur `main` sans passer par `dev` : fusionnez `main` dans `dev` (`git merge origin/main`) avant d'ouvrir une pull request `dev` → `main`, en gardant la version de `main` pour les fichiers générés (ou en les régénérant).

La version en ligne est consultable à `https://<utilisateur>.github.io/<repo>/version.json`.

### Réglages GitHub (à faire une fois, dans l'interface)

Ces réglages vivent dans GitHub, pas dans le dépôt : vérifiez-les dans **Settings** avant de les tenir pour acquis.

1. **Protection de `main`** : *Settings > Rules > Rulesets > New branch ruleset*. Cible : `main` (*Include default branch*). Règles : *Restrict deletions*, *Block force pushes*, *Require a pull request before merging*, *Require status checks to pass* avec le contrôle **Tests**. Statut : *Active*.
2. **Publication** : après le premier déploiement, *Settings > Pages > Build and deployment > Source : Deploy from a branch*, branche `gh-pages`, dossier `/ (root)`.
3. **Droits de l'Action** : *Settings > Actions > General > Workflow permissions* peut rester sur *Read repository contents* : le workflow de déploiement demande lui-même l'écriture (`permissions: contents: write`).

## Déploiement GitHub Pages

Le site est servi depuis la branche `gh-pages`, alimentée par l'Action de déploiement à chaque merge dans `main` (voir ci-dessus). `index.html` doit rester à la racine du dépôt, car l'Action copie `index.html`, les pages légales, `css/`, `js/` et `vendor/` tels quels. L'URL prend la forme `https://<utilisateur>.github.io/<repo>/`.

GitHub Pages fournit HTTPS, requis pour la géolocalisation. Si un nouveau dossier doit être servi (images, manifeste…), ajoutez-le à l'étape « Assembler le site » de `deploy.yml`.

## Architecture

Le site est découpé en trois couches pour accueillir d'autres villes et d'autres informations :

- `js/networks/` : un dossier par réseau de transport (ville, zone, couleurs de lignes, sources, adaptateurs d'API).
- `js/features/` : un dossier par mode (aujourd'hui quatre : « Le dernier tram », `last-ride`, « Le dernier bus », `last-bus`, « Le dernier transport », `last-transport`, et « Le prochain bus de nuit », `night-ride`).
- `js/core/` : ce qui est commun (position, destination, stockage, feuilles, champ d'adresse, géocodage, dates, index des stations, pictogrammes) et les outils internes nommés (Max, Inès, Léa, Rémi…, tableau dans `CONTEXT.md`, section 4).

`js/app.js` choisit la ville et le mode (automatiquement ou via les sélecteurs de l'en-tête) et monte le module correspondant. Les interfaces sont détaillées dans [CONTEXT.md](CONTEXT.md), section 4.

### Ajouter un réseau

1. Créez `js/networks/<id>/index.js` sur le modèle de `bordeaux-tbm/index.js` : `id`, `city`, `name`, `coverage`, `area`, `lineColors`, `attribution` et, dans `features`, un adaptateur par mode fourni.
2. Placez le code propre à son API à côté (par exemple `siri-lite.js` pour TBM).
3. Inscrivez-le dans `NETWORKS` (`js/networks/index.js`).
4. Lancez `npm test` : `tests/registry.test.mjs` vérifie que la configuration est complète.

### Ajouter un mode

1. Créez `js/features/<id>/index.js` qui exporte `{ id, title, short, description, mount }`. `mount({ root, network, adapter })` dessine dans `<main>` et renvoie `{ unmount() }`, qui libère minuteries et écouteurs.
2. Mettez sa logique de calcul dans un module pur à côté, avec des tests.
3. Inscrivez-le dans `FEATURES` (`js/features/index.js`), puis ajoutez son adaptateur dans chaque réseau qui sait le fournir.

## Structure

```text
index.html                           coquille HTML : fond d'ambiance, en-tête, <main>, feuille, pied de page
mentions-legales.html                mentions légales
confidentialite.html                 données personnelles et bouton d'effacement (js/legal.js)
vendor/leaflet/                      Leaflet 1.9.4 (carte), copié tel quel avec sa licence
css/style.css                        styles et jetons de design
js/app.js                            choix de la ville et de l'information, montage
js/core/                             position, destination, stockage, feuilles, adresses, dates, stations, icônes, utilitaires
js/networks/index.js                 registre des réseaux
js/networks/bordeaux-tbm/            réseau TBM : configuration, client SIRI-Lite, graphe généré
tools/build-graph.mjs                génération du graphe du réseau (npm run graph)
tools/build-bus-network.mjs          génération des arrêts et du graphe des bus de jour depuis le GTFS (npm run bus)
tools/build-transfers.mjs            génération des correspondances à pied (npm run transfers)
tools/build-shapes.mjs               génération du tracé des lignes depuis le GTFS (npm run shapes)
tools/build-timetable.mjs            génération des horaires du soir depuis le GTFS (npm run timetable)
tools/compare-methods.mjs            comparaison des deux méthodes de calcul (npm run compare)
tools/serve.py                       serveur local sans cache (npm run serve)
lab/                                page de tests locale (heure simulée, écrans forcés), jamais publiée
js/features/index.js                 registre des modes
js/themes/                           thèmes de saison (calendrier dans index.js, un dossier par thème)
js/core/season.js                    application du thème de saison actif
THEMES.md                            calendrier des thèmes et procédure pour en ajouter un
js/features/last-ride/               « Le dernier tram » : écrans et calcul pur
js/features/last-bus/                « Le dernier bus » (bus de jour), même écran
js/features/last-transport/          « Le dernier transport » (tram et bus combinés), même écran
js/features/night-ride/              « Le prochain bus de nuit » (TBNight), même écran
tests/planner.test.mjs               tests du calcul et du parsing SIRI-Lite
tests/registry.test.mjs              tests des registres et du stockage de la destination
tests/compose.test.mjs               tests de l'assemblage des données de plusieurs modes
tests/transfers.test.mjs             tests des correspondances à pied générées (stations, distances, tracés)
tests/timetable.test.mjs             tests des horaires inclus (heures GTFS, jours manquants, fusion avec le temps réel)
tests/walk-route.test.mjs            tests de l'itinéraire piéton (réponse IGN, nouvel essai, temps de marche)
tests/line-trace.test.mjs            tests des tracés de lignes (encodage, découpage, couverture TBM)
tests/themes.test.mjs                tests du calendrier des thèmes (dates, fichiers, accord avec THEMES.md)
```

Les consignes de conception, les formats des API et les limites vérifiées sont détaillés dans [CONTEXT.md](CONTEXT.md).
