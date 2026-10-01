# Terminus : guide développeur

Terminus est un site statique qui aide à déterminer quel tram prendre pour rentrer chez soi dans Bordeaux Métropole, directement ou avec correspondance. La description destinée aux utilisateurs se trouve dans [PROJECT.md](PROJECT.md) ; le contexte technique détaillé et les invariants du projet sont dans [CONTEXT.md](CONTEXT.md).

## Technologies et architecture

- HTML, CSS et JavaScript moderne en modules ES natifs ; aucun framework, build ni dépendance npm à l'exécution.
- APIs publiques appelées directement depuis le navigateur : SIRI-Lite de Bordeaux Métropole et géocodage de la Géoplateforme IGN.
- GitHub Pages pour l'hébergement statique.
- Node.js 18 ou plus récent pour les tests ; Python 3 pour le serveur local.
- Polices (Barlow Condensed, Atkinson Hyperlegible) hébergées dans `fonts/`, sous licence SIL OFL 1.1 : aucune ressource n'est chargée depuis un service tiers au démarrage.
- La logique de calcul (`js/features/last-ride/planner.js`) est pure et se teste avec `node:test` sans navigateur, comme les registres de réseaux et de types d'information.

`package.json` ne déclare aucune dépendance : ses scripts servent aux tests et au serveur local.

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

Ajoutez ou adaptez un test lorsque le comportement calculé change. Toute modification de `planner.js` doit être accompagnée d'un test dans `tests/planner.test.mjs`. Un nouveau réseau ou type d'information doit passer `tests/registry.test.mjs`.

### Graphe du réseau

`js/networks/bordeaux-tbm/graph.js` décrit l'ordre des arrêts de chaque ligne de tram, par sens. Le calcul s'en sert pour n'appeler les horaires que des lignes et des sens utiles au trajet (1 à 4 appels au lieu de 4 à 12). Il est généré depuis l'API SIRI-Lite et versionné :

```sh
npm run graph
```

Relancez-le après un changement de desserte (nouvelle ligne, prolongement, nouveaux quais), **en journée** : le soir, certaines branches n'ont plus de course et manqueraient au graphe. Relisez le diff avant de commiter. Un graphe périmé ne casse rien (le calcul charge alors tout le réseau), il le rend seulement plus lent.

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

Mettez à jour les fichiers Markdown concernés avec chaque changement : `PROJECT.md` pour l'expérience utilisateur, `README.md` pour le développement et la contribution, `CONTEXT.md` pour les règles et le contexte technique. Consultez la matrice détaillée de `CONTEXT.md`.

### Actions

- `.github/workflows/tests.yml` (**Tests**) : `npm test` à chaque push sur `dev` et sur chaque pull request vers `main`.
- `.github/workflows/deploy.yml` (**Déploiement GitHub Pages**) : à chaque push sur `main` (donc à chaque merge), et à la demande depuis l'onglet Actions. Relance les tests, assemble le site dans `_site/` (`index.html`, `mentions-legales.html`, `confidentialite.html`, `css/`, `js/`, `fonts/`, `.nojekyll` et `version.json` avec le commit et la date), puis le pousse sur `gh-pages`. La branche est créée au premier déploiement et garde l'historique des versions. Il n'y a pas de compilation : le site reste statique, sans dépendance d'exécution.

La version en ligne est consultable à `https://<utilisateur>.github.io/<repo>/version.json`.

### Réglages GitHub (à faire une fois, dans l'interface)

Ces réglages vivent dans GitHub, pas dans le dépôt : vérifiez-les dans **Settings** avant de les tenir pour acquis.

1. **Protection de `main`** : *Settings > Rules > Rulesets > New branch ruleset*. Cible : `main` (*Include default branch*). Règles : *Restrict deletions*, *Block force pushes*, *Require a pull request before merging*, *Require status checks to pass* avec le contrôle **Tests**. Statut : *Active*.
2. **Publication** : après le premier déploiement, *Settings > Pages > Build and deployment > Source : Deploy from a branch*, branche `gh-pages`, dossier `/ (root)`.
3. **Droits de l'Action** : *Settings > Actions > General > Workflow permissions* peut rester sur *Read repository contents* : le workflow de déploiement demande lui-même l'écriture (`permissions: contents: write`).

## Déploiement GitHub Pages

Le site est servi depuis la branche `gh-pages`, alimentée par l'Action de déploiement à chaque merge dans `main` (voir ci-dessus). `index.html` doit rester à la racine du dépôt, car l'Action copie `index.html`, les pages légales, `css/`, `js/` et `fonts/` tels quels. L'URL prend la forme `https://<utilisateur>.github.io/<repo>/`.

GitHub Pages fournit HTTPS, requis pour la géolocalisation. Si un nouveau dossier doit être servi (images, manifeste…), ajoutez-le à l'étape « Assembler le site » de `deploy.yml`.

## Architecture

Le site est découpé en trois couches pour accueillir d'autres villes et d'autres informations :

- `js/networks/` : un dossier par réseau de transport (ville, zone, couleurs de lignes, sources, adaptateurs d'API).
- `js/features/` : un dossier par type d'information (aujourd'hui « Le dernier tram pour rentrer », `last-ride`).
- `js/core/` : ce qui est commun (position, domicile, stockage, feuilles, champ d'adresse, géocodage).

`js/app.js` choisit la ville et le type d'information (automatiquement ou via les sélecteurs de l'en-tête) et monte le module correspondant. Les interfaces sont détaillées dans [CONTEXT.md](CONTEXT.md), section 4.

### Ajouter un réseau

1. Créez `js/networks/<id>/index.js` sur le modèle de `bordeaux-tbm/index.js` : `id`, `city`, `name`, `coverage`, `area`, `lineColors`, `attribution` et, dans `features`, un adaptateur par type d'information fourni.
2. Placez le code propre à son API à côté (par exemple `siri-lite.js` pour TBM).
3. Inscrivez-le dans `NETWORKS` (`js/networks/index.js`).
4. Lancez `npm test` : `tests/registry.test.mjs` vérifie que la configuration est complète.

### Ajouter un type d'information

1. Créez `js/features/<id>/index.js` qui exporte `{ id, title, short, description, mount }`. `mount({ root, network, adapter })` dessine dans `<main>` et renvoie `{ unmount() }`, qui libère minuteries et écouteurs.
2. Mettez sa logique de calcul dans un module pur à côté, avec des tests.
3. Inscrivez-le dans `FEATURES` (`js/features/index.js`), puis ajoutez son adaptateur dans chaque réseau qui sait le fournir.

## Structure

```text
index.html                           coquille HTML : fond d'ambiance, en-tête, <main>, feuille, pied de page
mentions-legales.html                mentions légales
confidentialite.html                 données personnelles et bouton d'effacement (js/legal.js)
fonts/                               polices woff2 et licences OFL
css/style.css                        styles et jetons de design
js/app.js                            choix de la ville et de l'information, montage
js/core/                             position, domicile, stockage, feuilles, adresses, utilitaires
js/networks/index.js                 registre des réseaux
js/networks/bordeaux-tbm/            réseau TBM : configuration, client SIRI-Lite, graphe généré
tools/build-graph.mjs                génération du graphe du réseau (npm run graph)
tools/serve.py                       serveur local sans cache (npm run serve)
lab/                                page de tests locale (heure simulée, écrans forcés), jamais publiée
js/features/index.js                 registre des types d'information
js/features/last-ride/               « Le dernier tram pour rentrer » : écrans et calcul pur
tests/planner.test.mjs               tests du calcul et du parsing SIRI-Lite
tests/registry.test.mjs              tests des registres et du stockage du domicile
```

Les consignes de conception, les formats des API et les limites vérifiées sont détaillés dans [CONTEXT.md](CONTEXT.md).
