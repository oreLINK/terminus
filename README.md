# Terminus : guide développeur

Terminus est un site statique qui aide à déterminer quel tram direct prendre pour rentrer chez soi dans Bordeaux Métropole. La description destinée aux utilisateurs se trouve dans [PROJECT.md](PROJECT.md) ; le contexte technique détaillé et les invariants du projet sont dans [CONTEXT.md](CONTEXT.md).

## Technologies et architecture

- HTML, CSS et JavaScript moderne en modules ES natifs ; aucun framework, build ni dépendance npm à l'exécution.
- APIs publiques appelées directement depuis le navigateur : SIRI-Lite de Bordeaux Métropole et géocodage de la Géoplateforme IGN.
- GitHub Pages pour l'hébergement statique.
- Node.js 18 ou plus récent pour les tests ; Python 3 pour le serveur local.
- La logique de calcul (`js/features/last-ride/planner.js`) est pure et se teste avec `node:test` sans navigateur, comme les registres de réseaux et de types d'information.

`package.json` ne déclare aucune dépendance : ses scripts servent aux tests et au serveur local.

## Installation et développement

Clonez le dépôt, puis démarrez un serveur HTTP à la racine :

```sh
git clone <url-du-depot>
cd terminus
npm run serve
```

Ouvrez `http://localhost:8000`. Le site utilise des modules ES et ne fonctionne pas en ouvrant directement `index.html` avec `file://`. La géolocalisation est disponible sur `localhost` et en production sur HTTPS.

Exécutez la suite de tests avant de proposer un changement :

```sh
npm test
```

Ajoutez ou adaptez un test lorsque le comportement calculé change. Toute modification de `planner.js` doit être accompagnée d'un test dans `tests/planner.test.mjs`. Un nouveau réseau ou type d'information doit passer `tests/registry.test.mjs`.

## Contributions et GitHub

Convention de contribution du projet :

- Créez une branche de travail à partir de `main`, avec un préfixe adapté (`feat/`, `fix/`, `docs/` ou `chore/`).
- Proposez les changements par pull request vers `main` ; évitez les commits directs sur `main`.
- Décrivez dans la PR le contexte, les changements, la validation exécutée et l'impact utilisateur ou technique. Gardez une PR limitée à un objectif cohérent.
- Lancez `npm test` avant de publier la PR. Si une vérification échoue, corrigez-la ou expliquez clairement le blocage.
- Mettez à jour les fichiers Markdown concernés avec chaque changement : `PROJECT.md` pour l'expérience utilisateur, `README.md` pour le développement et la contribution, `CONTEXT.md` pour les règles et le contexte technique. Consultez la matrice détaillée de `CONTEXT.md`.

Ces règles sont des conventions de dépôt, pas des protections GitHub configurées. Aucun workflow GitHub Actions n'est présent actuellement. Si des Actions sont ajoutées, elles doivent au minimum exécuter `npm test` sur les pull requests et les changements de `main`, sans introduire d'étape de build ni de dépendance d'exécution. Ne pas présenter un contrôle comme actif tant qu'il n'existe pas dans le dépôt ou dans les paramètres GitHub.

## Déploiement GitHub Pages

Le site est prévu pour être publié depuis la branche `main`, dossier `/ (root)` : dans **Settings > Pages**, sélectionnez **Deploy from a branch**, puis `main` et `/ (root)`. `index.html` doit rester à la racine. L'URL prend la forme `https://<utilisateur>.github.io/<repo>/`.

GitHub Pages fournit HTTPS, requis pour la géolocalisation. Le dépôt ne contient pas actuellement de workflow de déploiement Actions.

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
index.html                           coquille HTML : en-tête, <main>, feuille, pied de page
css/style.css                        styles et jetons de design
js/app.js                            choix de la ville et de l'information, montage
js/core/                             position, domicile, stockage, feuilles, adresses, utilitaires
js/networks/index.js                 registre des réseaux
js/networks/bordeaux-tbm/            réseau TBM : configuration et client SIRI-Lite
js/features/index.js                 registre des types d'information
js/features/last-ride/               « Le dernier tram pour rentrer » : écrans et calcul pur
tests/planner.test.mjs               tests du calcul et du parsing SIRI-Lite
tests/registry.test.mjs              tests des registres et du stockage du domicile
```

Les consignes de conception, les formats des API et les limites vérifiées sont détaillés dans [CONTEXT.md](CONTEXT.md).
