PROJECT.md            description et fonctionnalités destinées aux utilisateurs
# CONTEXT.md — Terminus

Document de passation. Il décrit le projet, ses choix et son état pour qu'un développeur ou un LLM puisse le reprendre sans autre contexte. Lire en entier avant de modifier le code.

## 1. En une phrase

**Terminus** est un site web statique (hébergé sur GitHub Pages) qui dit à une personne, là où elle se trouve (aujourd'hui dans Bordeaux Métropole, d'autres villes pourront s'ajouter), quel arrêt de tram rejoindre pour rentrer chez elle, à quelle heure part le dernier tram, et donc à quelle heure elle doit quitter les lieux.

- Nom de projet interne : « Last TBM ». Nom public : **Terminus**, slogan « Le dernier tram pour rentrer ».
- Ne pas utiliser « TBM » dans le nom public : c'est la marque du réseau (Keolis pour Bordeaux Métropole). Le site est indépendant et le dit dans son pied de page.
- Périmètre actuel : **un réseau (TBM, Bordeaux), un type d'information (le dernier tram pour rentrer), trams uniquement (lignes A à F), trajets directs ou avec une ou deux correspondances dans une même station.** L'architecture accueille d'autres réseaux et d'autres types d'information (section 4).

## 2. Contraintes non négociables

- **100 % statique** : HTML, CSS et JavaScript en modules ES natifs. Pas de build, pas de framework, pas de dépendance npm à l'exécution. `package.json` ne sert qu'aux tests.
- **Aucun backend** : le navigateur appelle directement les API publiques.
- **Déploiement GitHub Pages**, en HTTPS (obligatoire pour la géolocalisation). Branches : `dev` (en cours), `main` (final, alimentée uniquement par pull request), `gh-pages` (site publié, écrite uniquement par l'Action `deploy.yml` à chaque merge dans `main`). L'« assemblage » copie `index.html`, `css/`, `js/` sans les transformer : ne jamais introduire d'étape de compilation. Détails dans `README.md`.
- **Interface en français, vouvoiement**, phrases courtes, casse de phrase, pas de jargon technique à l'écran.
- **Mobile d'abord** : usage typique la nuit, sur un trottoir, d'une main.
- Adresse du domicile stockée uniquement dans le `localStorage` du navigateur.

## 3. Parcours utilisateur

0. **En-tête**, compact pour laisser la place au reste : logo à gauche, deux sélecteurs à droite. « Ville » affiche un repère suivi d'un éclair en mode automatique, ou le repère et le nom de la ville quand elle a été choisie à la main (`paintChrome`, `js/app.js`) ; « Information » n'affiche qu'un pictogramme (grille), son nom reste pour les lecteurs d'écran. « Ville » ouvre une feuille : « Automatique » (selon la position) puis chaque ville couverte. « Information » ouvre une feuille : « Automatique » (le type par défaut, « Le dernier tram pour rentrer ») puis chaque type disponible sur le réseau choisi. Les choix sont mémorisés (`dt.prefs.v1`). Une position hors de toute ville couverte, en mode automatique, garde la dernière ville connue ; le type d'information affiche alors « Vous êtes hors du réseau de … », sans appeler l'API.

1. **Premier écran, toujours l'écran principal** (décrit au point 4), même à la première visite. Sans domicile enregistré : compteur en attente (« – »), bloc Domicile « Non renseigné » en couleur accent, et une annotation au-dessus des blocs, « Indiquez votre domicile pour savoir quand partir. », dont la pointe vise le bloc. Un toucher ouvre la feuille Domicile, champ déjà activé (autocomplétion limitée à la zone du réseau). Le choix est enregistré (`dt.homes.v1`). La localisation n'est demandée qu'une fois le domicile connu. Les étapes d'attente (localisation, calcul) gardent aussi l'écran principal, compteur en attente.
2. **Localisation** : `navigator.geolocation.watchPosition` (haute précision). Recalcul si la personne bouge de plus de 150 m.
3. **Localisation refusée, impossible ou trop lente** : l'écran principal reste affiché. Compteur « – » en gris, « Position inconnue » et la raison ; le bloc Position devient « Non renseignée » (couleur accent) avec une annotation qui le vise. Un toucher ouvre la feuille « Votre position » : champ d'adresse (adresses + lieux) et « Réessayer la localisation ». En cas de refus, la surveillance GPS s'arrête ; en cas d'échec temporaire (introuvable, délai), elle continue et reprend la main dès qu'une position arrive. Il n'existe plus d'écran qui remplace l'écran principal.
4. **Écran principal**, pensé pour un téléphone tenu d'une main et tenant dans la hauteur de l'écran :
   - **Compte à rebours** au centre, en très grand : « Partez dans 42 min » (ou « 1 h 05 »), c'est-à-dire le temps restant avant de devoir partir à pied pour attraper le dernier tram qui ramène encore au domicile (dernier tram moins temps de marche jusqu'à l'arrêt, moins une marge de 2 min, `WALK_MARGIN_MS`). Avec correspondance, c'est le dernier tram de départ qui permet encore d'attraper la suite du trajet. Mis à jour toutes les 10 s sans recalcul. En dessous, l'heure limite en évidence (« avant **00:47** »), juste sous elle la source de l'horaire, « Estimé sur l'horaire prévu » (rond vide) puis « Temps réel », précédé d'un point rouge qui clignote lentement (voyant « en direct », `--live-dot`), dès que la course du départ est suivie en direct, puis **l'itinéraire du dernier trajet** (`routeHtml`), à la manière d'un calculateur d'itinéraire : heures à gauche, tracé au centre (pointillé à pied, plein à la couleur officielle de chaque ligne), étapes à droite. Étapes : départ à pied (heure limite, au ton du compteur ; « À pied, 7 min », marge de 2 min comprise), station de montée (nom souligné en pointillé : un toucher ouvre la feuille « Arrêt de départ » ; à droite un bouton rond à flèche de navigation qui ouvre l'itinéraire à pied Google Maps depuis la position actuelle), trajet en tram (badge, direction, durée), station de correspondance (« correspondance », heure du tram suivant), station de descente, domicile (heure d'arrivée, « Domicile, 2 min à pied », et à droite le même bouton rond à flèche : itinéraire à pied Google Maps de la station d'arrivée au domicile). **Un seul tracé** est proposé : celui qui laisse partir le plus tard (le dernier tram possible sur tout le trajet). Aucune autre option n'est signalée ni ne peut être choisie (demande de l'auteur, 01/10/2026). **Code couleur** (chiffres colorés et **toute la fenêtre** en camaïeu, voir section 8) : vert à 20 min ou plus, orange sous 20 min, rouge sous 10 min (chiffres qui clignotent et fond qui « respire » sous 5 min, sauf `prefers-reduced-motion`), noir (fenêtre noire, texte clair) quand c'est trop tard : heure limite dépassée de plus d'une minute, dernier tram manqué (`missed`) ou service terminé (`ended`). Gris quand une information manque (domicile, position) ou quand il n'y a rien à compter (aucun trajet, à deux pas de chez soi, erreur). Seuils `SOON_MIN`, `URGENT_MIN`, `PULSE_MIN` dans `js/features/last-ride/index.js`, classes `tone-ok|soon|urgent|late|none` sur le compteur, et `data-tone` sur `<html>` via `setAmbient` (`js/core/ambient.js`).
   - **Calcul en cours** : les chiffres s'estompent légèrement et un segment glisse sur une fine ligne sous le bloc, comme un tram sur sa ligne (ligne fixe si `prefers-reduced-motion`). Affiché au moins 700 ms, et annoncé aux lecteurs d'écran (`#compute-status`). Il apparaît pour les calculs demandés (position saisie, « Actualiser », nouveau domicile, déplacement GPS de plus de 150 m) et pour le premier calcul ; les rafraîchissements automatiques toutes les 30 s restent silencieux.
   - **Le trajet, en deux colonnes côte à côte** (Position, Domicile) directement sur le fond sous le compteur, sans panneau (pictogrammes dans des pastilles de verre). Chaque colonne n'a que deux lignes : l'intitulé et la valeur (deux lignes de texte au plus). La colonne « Arrêt proche » a été retirée le 30/09/2026 : l'arrêt est dans l'itinéraire, et son nom ouvre la feuille de choix. Si une information manque, une annotation s'affiche au-dessus de la bande et pointe vers la colonne concernée (`--col` : 0 position, 1 domicile) :
     - **Position** (cible) : adresse de la position. Saisie à la main : l'adresse choisie. GPS : l'adresse la plus proche, trouvée par géocodage inverse (Géoplateforme, `reverse`, relancé au-delà de 50 m de déplacement), sinon « Position GPS ». « Recherche… » pendant la localisation, « Non renseignée » si elle est inconnue, « Hors du réseau » si la position n'est pas dans la ville choisie. Un toucher ouvre la feuille « Votre position » : champ d'adresse avec autocomplétion en premier, « Utiliser ma localisation », adresse actuelle.
     - **Arrêt de départ** (plus de colonne) : n'est pas au choix, c'est celui du tracé recommandé. Un toucher sur le nom de la station de montée dans l'itinéraire ouvre une feuille (`<dialog>` ancré en bas) qui rappelle l'arrêt et la marche (« Le dernier tram possible part de »), propose l'itinéraire à pied jusqu'à lui et « Je ne suis pas ici », qui ouvre la feuille « Votre position ». Sans compte à rebours (service terminé, aucun trajet), la feuille n'est plus accessible depuis l'écran principal.
     - **Domicile** (maison) : rue du domicile. Un toucher ouvre une feuille avec l'adresse complète, l'itinéraire à pied depuis la station de descente et le champ pour changer d'adresse.
   - **Méta** : « Mis à jour à HH:MM », seul, sous la bande. **Actualiser** est un bouton rond à pictogramme seul, en haut à droite de la tuile du temps (`.hero-refresh`, marges de 12 px) ; sa flèche tourne tant que le calcul demandé est en cours (classe `is-computing` sur `<body>`).
   - Les prochains départs, le plan du trajet et la liste d'arrêts alternatifs ont été retirés de l'écran : le choix d'arrêt passe par la feuille « Arrêt ».
5. **États particuliers** :
   Dans tous ces états, le compteur est remplacé par un message, et les deux colonnes du trajet restent affichées.
   - `ended` : la journée commerciale a basculé, le prochain départ est dans plus de 2 h → « Plus de tram ce soir » + premier départ.
   - `missed` : des courses existent mais aucune n'est atteignable à pied à temps.
   - `over` : le trajet existait plus tôt dans la journée, mais le dernier tram est parti (fin de service, travaux nocturnes…) → bloc noir « Plus de tram ce soir ».
   - `none` : aucune course de la journée ne relie les deux côtés, même avec deux correspondances (gris).
   - À moins de 300 m du domicile → « Vous êtes à deux pas de chez vous ».
   - Erreur API → « Horaires indisponibles » + « Réessayer ».
6. **Pied de page** (sous la ligne de flottaison), centré, sans filet au-dessus : liens « Mentions légales » et « Confidentialité ». Les sources des données ne s'y affichent plus (30/09/2026) : elles sont sur la page Mentions légales. Le champ `attribution` du réseau reste dans sa configuration, sans être affiché.
7. **Pages légales** (`mentions-legales.html`, `confidentialite.html`, même style, sans JavaScript sauf le bouton « Effacer mes données de ce navigateur », `js/legal.js`, qui retire les clés `dt.*`). Éditeur : particulier non professionnel, identité non publiée (LCEN art. 6, III, 2, choix de l'auteur le 30/09/2026), contact par les issues GitHub ; hébergeur GitHub, Inc. La page Confidentialité décrit les flux réels : stockage local (section 7), position non enregistrée et envoyée seulement au géocodage inverse de l'IGN, services contactés (GitHub Pages, SIRI-Lite TBM, Géoplateforme, Google Maps sur toucher d'un lien), pas de cookie ni de mesure d'audience. **À mettre à jour si un flux de données change.**

Rafraîchissement : recalcul toutes les 30 s quand l'onglet est visible, et au retour sur l'onglet. Les horaires sont rechargés depuis l'API au plus toutes les 100 s (cache mémoire). Tant que l'heure limite est à plus d'1 h (`LIVE_MIN`), le compteur affiche « plus d'1 h » et ces recalculs automatiques sont suspendus : l'horaire prévu suffit, le temps réel ne couvrant qu'environ l'heure qui vient. Le calcul reprend dès qu'il reste 1 h ; « Actualiser », un nouveau domicile ou un déplacement de plus de 150 m relancent le calcul à tout moment (choix de l'auteur, 01/10/2026).

## 4. Architecture et structure des fichiers

Terminus est organisé pour accueillir plusieurs **réseaux** (une compagnie de transport, une ville) et plusieurs **types d'information** (aujourd'hui un seul : « Le dernier tram pour rentrer », identifiant `last-ride`).

- **Réseau** (`js/networks/<id>/index.js`) : un objet de configuration. Il décrit la ville (`id`, `city`, `name`), sa zone desservie (`coverage`, boîte qui sert au choix automatique de la ville), la zone des adresses (`area` : département pour la Géoplateforme, boîte, centre, exemple d'adresse), les couleurs de lignes, les mentions de source (`attribution`) et, dans `features`, **un adaptateur par type d'information qu'il sait fournir**. Le code propre à l'API du réseau vit à côté (pour TBM : `siri-lite.js`).
- **Type d'information** (`js/features/<id>/index.js`) : exporte `{ id, title, short, description, mount }`. `mount({ root, network, adapter })` dessine dans `<main>` et renvoie `{ unmount() }`, qui doit tout libérer (minuteries, écouteurs, abonnement à la position). Sa logique de calcul pure vit à côté (pour `last-ride` : `planner.js`).
- **Adaptateur `last-ride`** attendu d'un réseau : `vehicle` (mot affiché, « tram »), `serviceEndHour` facultatif (heure locale de fin du service du soir, 3 pour TBM ; le réseau déclare alors son `timeZone`), `serviceStartHour` facultatif (avec `serviceEndHour` : début de la plage horaire où le compte à rebours fonctionne, 18 pour TBM ; hors de la plage, écran d'attente neutre « Dès 18 h » sans appel à l'API, domicile et position restant modifiables ; `inServiceWindow` dans `planner.js`, bascule vérifiée à chaque rafraîchissement de 30 s et au retour sur l'onglet), `loadStops()` → `{ lines: { [ref]: { ref, code } }, stops: [{ ref, name, lat, lon, lines }] }`, `loadTimetable(lineRef, direction)` → courses `[{ id, line, headsign, calls: [{ ref, name, dep, depLive, arr, arrLive, cancelled }] }]`, `clearCache()` facultatif, `loadGraph()` facultatif → `{ generatedAt, names: { [ref]: nom }, patterns: [{ line, direction, stops: [ref] }] }` (ordre des arrêts par ligne et par sens, voir section 6 ; sans lui, les horaires sont chargés à l'aveugle).
- **Coquille** (`js/app.js`) : choisit le réseau puis le type d'information, monte le module, peint les sélecteurs de l'en-tête et le pied de page. Ville : choix manuel, sinon réseau dont `coverage` contient la position, sinon dernier réseau connu, sinon le premier. Type : choix manuel s'il existe sur ce réseau, sinon `DEFAULT_FEATURE` (`last-ride`). Une nouvelle position en mode automatique peut faire changer de ville (démontage puis remontage).
- **Commun** (`js/core/`) : position partagée (`location.js`), domicile par réseau (`home.js`), stockage sûr (`storage.js`), feuilles (`sheet.js`), champ et géocodage d'adresses paramétrés par la zone du réseau (`address-field.js`, `geocode.js`), indicateur de calcul (`computing.js`), utilitaires (`util.js`).

```
index.html                          coquille : fond d'ambiance (.ambient), en-tête (logo, sélecteurs ville et
                                    information), <main id="app">, #compute-status, <dialog id="sheet">,
                                    pied de page (#footer-sources, liens légaux)
mentions-legales.html               mentions légales (éditeur, hébergeur, sources)
confidentialite.html                données personnelles, bouton d'effacement (js/legal.js)
css/style.css                       tout le style, jetons de design dans :root, @font-face
fonts/                              polices woff2 (sous-ensemble latin) et leurs licences OFL
js/app.js                           coquille : choix du réseau et du type d'information, sélecteurs, montage
js/core/location.js                 position GPS ou saisie, abonnements
js/core/home.js                     domicile par réseau (dt.homes.v1), reprise de dt.home.v1
js/core/storage.js                  lecture/écriture JSON dans localStorage, sans jamais échouer
js/core/sheet.js                    feuille de réglage (<dialog> ancré en bas)
js/core/address-field.js            champ d'adresse (combobox ARIA)
js/core/geocode.js                  autocomplétion d'adresses (Géoplateforme IGN), zone fournie par le réseau
js/core/computing.js                indicateur « calcul en cours »
js/core/ambient.js                  ton de la fenêtre (data-tone sur <html>) et couleur de la barre du navigateur
js/core/util.js                     distance, marche, heures, échappement HTML, inBounds
js/networks/index.js                registre des réseaux, networkAt(position)
js/networks/bordeaux-tbm/index.js   réseau TBM : zone, couleurs, sources, adaptateurs
js/networks/bordeaux-tbm/siri-lite.js  appels SIRI-Lite, lecture des réponses, caches
js/networks/bordeaux-tbm/graph.js   graphe du réseau (généré, versionné) : ordre des arrêts par ligne et par sens
tools/build-graph.mjs               génère graph.js depuis l'API (npm run graph)
tools/serve.py                      serveur local sans cache (npm run serve)
lab/index.html                      page de tests, locale seulement, jamais publiée (voir section 9)
js/core/lab.js                      réglages du mode test, inertes hors de localhost ; horloge du site now()
js/features/index.js                registre des types d'information, DEFAULT_FEATURE
js/features/last-ride/index.js      « Le dernier tram pour rentrer » : écrans, calcul, feuilles
js/features/last-ride/planner.js    logique pure : stations, candidats, options
tests/planner.test.mjs              tests du calcul et de la lecture SIRI-Lite
tests/registry.test.mjs             cohérence des registres, choix de la ville, stockage du domicile
package.json                        "type": "module", scripts test, serve et graph
README.md / PROJECT.md / CONTEXT.md documentation (voir section 13)
```

Règles d'architecture :

- **La logique de calcul reste pure** (`planner.js` et ses équivalents) : aucun accès au DOM, au réseau ou à `Date.now()`, le temps est passé en paramètre. Toute nouvelle logique de calcul va là, avec des tests.
- **Rien de propre à un réseau dans `core/` ni dans un type d'information** : noms, zones, couleurs, messages locaux (`nightHint`) et appels d'API passent par l'objet réseau et son adaptateur.
- **Aucun accès au DOM au chargement d'un module** : les éléments sont récupérés à l'usage, pour que registres et modules se chargent sous Node dans les tests.
- Un type d'information ne touche qu'à `<main>` et aux feuilles ; l'en-tête et le pied de page appartiennent à la coquille. Seule exception : le ton de la fenêtre, qu'il règle par `setAmbient` et remet à « none » en se démontant.

## 5. Sources de données

### 5.1 SIRI-Lite TBM (horaires, arrêts, lignes)

- Base : `https://bdx.mecatran.com/utw/ws/siri/2.0/bordeaux/<méthode>.json`
- Clé open data publique, sans inscription : `AccountKey=opendata-bordeaux-metropole-flux-gtfs-rt`
- Documentation : jeu de données « Réseau urbain et scolaire TBM » sur transport.data.gouv.fr, PDF « Documentation Bordeaux KB2M SIRI-lite ».
- Format JSON propre à Mecatran : racine `{"Siri": {...}}`, et les références sont encapsulées (`{"value": "..."}` ou `[{"value": "...", "lang": "fr"}]`). La fonction `val()` de `siri-lite.js` normalise ces trois formes.

Méthodes utilisées :

| Méthode | Paramètres | Usage | Cache |
|---|---|---|---|
| `lines-discovery.json` | aucun | identifier les lignes de tram | localStorage 24 h (avec les arrêts) |
| `stoppoints-discovery.json` | aucun (bbox optionnelle) | points d'arrêt physiques, coordonnées, lignes desservies | localStorage 24 h |
| `estimated-timetable.json` | `LineRef`, `DirectionRef` (0 ou 1, obligatoires), `PreviewInterval` | toutes les courses restantes d'une ligne dans un sens | mémoire 100 s |

Faits établis sur ces données :

- **Lignes de tram** (via `lines-discovery`) : A = `bordeaux:Line:59:LOC`, B = `60`, C = `61`, D = `62`, E = `163`, F = `164`. Détection dans le code : nom commençant par « Tram » et code d'une lettre A à F (les « Navette Tram 100… » sont des bus de substitution et sont exclues).
- **Arrêts** : `Siri.StopPointsDelivery.AnnotatedStopPointRef[]` avec `StopPointRef.value`, `StopName.value`, `Location.latitude/longitude`, `Lines[].value`. Environ 5 200 points pour tout le réseau. Un point = un quai (un sens), plusieurs points partagent un même nom.
- **`PreviewInterval`** (durée ISO 8601) : avec `PT24H`, la réponse contient toute la journée commerciale en cours (courses déjà passées comprises) **et environ les 12 heures à venir, nuit comprise**. Vérifié le 01/10/2026 à 00:04 : ligne B sens 1, courses du 30/09 04:16 au 01/10 12:01, avec un trou de nuit de 00:52 à 04:16 ; ligne C pareil (00:49 → 03:46). L'ancienne affirmation « plafonné à la fin de la journée commerciale » (vérifiée le 27/09 à 21 h, quand les 12 heures tombaient encore sur la nuit) était fausse : elle a fait afficher « Partez dans 12 h 30 » en fin de soirée, le « dernier tram » étant celui du lendemain midi. D'où la fin de service à 3 h du matin (section 6, étape 5), règle de l'auteur : le dernier tram est pensé comme le dernier de la soirée.
- **Structure d'`estimated-timetable`** : `Siri.ServiceDelivery.EstimatedTimetableDelivery[].EstimatedJourneyVersionFrame[].EstimatedVehicleJourney[]`. Chaque course a `LineRef`, `DirectionRef`, `VehicleJourneyRef`, `Cancellation`, `DestinationRef`, `EstimatedCalls.EstimatedCall[]`. Chaque arrêt de course a `StopPointRef`, `StopPointName[]`, `AimedArrivalTime`, `AimedDepartureTime` et, seulement quand le temps réel existe, `ExpectedArrivalTime`, `ExpectedDepartureTime`.
- **Heures en UTC** (suffixe `Z`). L'affichage se fait en `Europe/Paris` via `Intl.DateTimeFormat`.
- **Temps réel** : présent seulement pour les courses proches (environ l'heure qui vient). Au-delà, horaire théorique seul.
- **L'ordre des courses dans la réponse n'est pas garanti chronologique.** Le dernier élément du JSON n'est pas le dernier tram.
- **Courses partielles** : certaines courses s'arrêtent avant le terminus (vu : une course de la ligne A se terminant à Galin). D'où l'exigence de vérifier que la course dessert bien la station d'arrivée.
- La réponse peut contenir `"Status": false` tout en ayant des données. Le code ne rejette donc pas sur ce seul champ.
- Chaque course contient tous ses arrêts, y compris ceux déjà passés. Les réponses sont lourdes en journée (de l'ordre du Mo par ligne et par sens, bien compressé en gzip), légères en fin de soirée.
- **CORS** : ouvert. Le serveur renvoie l'origine de la requête dans `Access-Control-Allow-Origin` (avec `Access-Control-Allow-Credentials: true`) : vérifié le 30/09/2026 avec `curl -H "Origin: https://example.github.io"`, et par le site lui-même dans Chromium headless depuis `http://localhost:8765`, appels réels à `estimated-timetable` compris. Pas encore vérifié depuis le domaine GitHub Pages publié.
- **Graphe** (`tools/build-graph.mjs`, 30/09/2026) : `estimated-timetable` sur les 6 lignes × 2 sens donne 45 séquences d'arrêts distinctes (271 quais) une fois les courses partielles retirées : branches (A vers Le Haillan / Floirac, B vers Pessac Centre / France Alouette et Berges de la Garonne / Claveau, C, D, E, F) et quelques motifs de travaux sur d'autres quais (Stalingrad, Gaviniès). Environ 52 Ko, 4 Ko compressé.

Non utilisé pour l'instant mais disponible : `stop-monitoring.json` (passages à un arrêt, `MonitoringRef` obligatoire, `LineRef`, `PreviewInterval` défaut 2 h, `MaximumStopVisits`), `general-message.json` (perturbations), `check-status.json`, et les flux GTFS / GTFS-RT (positions des véhicules, retards, alertes) du même jeu de données.

### 5.2 Géoplateforme IGN (adresses)

- Principal : autocomplétion `https://data.geopf.fr/geocodage/completion/?text=…&terr=33&type=…&maximumResponses=7`. `terr=33` limite à la Gironde. `type` = `StreetAddress` pour le domicile, `StreetAddress,PositionOfInterest` pour la position manuelle. Réponse attendue : `results[]` avec `fulltext`, `x` (longitude), `y` (latitude). Limite : 10 requêtes/s par IP, d'où un debounce de 250 ms et un minimum de 3 caractères.
- Repli si la complétion échoue : `https://data.geopf.fr/geocodage/search?q=…&autocomplete=1&index=address` (GeoJSON), filtré côté client sur `properties.postcode` commençant par `33`.
- Toute coordonnée hors de la zone d'adresses du réseau (`area.bounds`, la Gironde pour TBM) est écartée (`inBounds` dans `core/util.js`). Le département (`terr`) et le code postal du repli viennent aussi de `area`.
- Géocodage inverse (adresse de la position GPS) : `https://data.geopf.fr/geocodage/reverse?lat=…&lon=…&index=address&limit=1`, réponse GeoJSON `features[0].properties.{ label, name }`, en-têtes CORS ouverts (`Access-Control-Allow-Origin: *`). Vérifié le 27/09/2026 en ligne de commande.
- **Format de réponse réel non vérifié en production.**

## 6. Algorithme (js/features/last-ride/planner.js)

1. **Stations** (`buildIndex`) : regroupement des points d'arrêt de tram par nom normalisé (minuscules, sans accents ni ponctuation). Deux homonymes à plus de 600 m restent deux stations. Chaque station garde ses `refs` (quais) et ses lignes. Résolution d'un arrêt de course vers une station : par `StopPointRef`, sinon par nom s'il n'y a qu'une station de ce nom.
2. **Candidats** (`nearestStations`) : côté départ, stations à moins de 2 km à vol d'oiseau (au moins 2, au plus 8) ; côté domicile, moins de 1,5 km (au moins 1, au plus 5).
3. **Horaires à charger, par paliers** (`loadStages` dans `index.js`). Chaque palier donne des couples (ligne, sens) ; `estimated-timetable` est appelé pour ceux qui ne sont pas encore chargés, en parallèle (`Promise.allSettled` : un échec partiel affiche un avertissement sans bloquer), puis `plan` est relancé. Le calcul s'arrête au premier palier qui donne une option.
   - **Avec graphe** (`routeRequests`, pur) : chaque quai des motifs est résolu en station (`stationFor`). `fwd[s]` = nombre minimal de tronçons en tram depuis une station de départ, `bwd[s]` = vers une station proche du domicile, calculés par passes successives sur les motifs. Un motif sert si l'on peut y monter en i et descendre en j > i avec `fwd[i] + 1 + bwd[j]` ≤ limite, où limite = trajet le plus simple + `extraTransfers`, plafonnée à `MAX_TRANSFERS + 1` tronçons. Paliers : `extraTransfers` = 0, puis 1, puis tout le réseau dans les deux sens.
   - **Mesuré sur le vrai réseau** (30/09/2026, 7 trajets types) : avec 0, 1 à 4 appels (direct Comédie → Pessac Centre : 1 ; Pessac Centre → Bassens, B puis A : 2) contre 4 à 12 sans graphe. Avec 1, 8 à 11 appels : le réseau est si maillé qu'une correspondance de plus ouvre presque tout. D'où le palier 0 d'abord.
   - **Sans graphe**, ou s'il ne relie pas les deux côtés : lignes des stations des deux côtés (`candidateLines`) dans les deux sens, puis tout le réseau.
   - **Graphe périmé** : le dernier palier (tout le réseau) rattrape un motif manquant, au prix d'appels en plus.
   - **Conséquence acceptée** : quand un trajet est trouvé au premier palier, les options qui demanderaient une correspondance de plus ne sont pas cherchées. Le tracé « qui laisse partir le plus tard » est donc le plus tardif parmi les lignes chargées : une correspondance plus tardive par d'autres lignes n'est trouvée qu'une fois le dernier trajet du premier palier parti, puisque le palier suivant est alors chargé. Choix fait pour limiter les appels à l'API.
4. **Profils à rebours** (`buildProfiles`), un par nombre exact de correspondances k = 0, 1, 2 (`MAX_TRANSFERS`). `profiles[k]` associe à chaque station la liste des départs en tram qui ramènent au domicile avec exactement k correspondances, chacun avec l'arrivée au domicile la plus tôt (marche comprise). Chaque course est parcourue de son dernier arrêt vers le premier en gardant la meilleure descente parmi les arrêts suivants : pour k = 0, une station proche du domicile (arrivée + marche) ; pour k ≥ 1, une station où le premier départ de `profiles[k − 1]` après l'arrivée + `TRANSFER_MS` (2 min pour changer de quai, choix de l'auteur le 30/09/2026) existe, en excluant la même course. Chaque liste ne garde que les départs utiles (`frontier` : un départ plus tardif qui arrive au plus tard aussi tôt rend le précédent inutile). Elle est donc triée par départ **et** par arrivée, et le premier départ après une heure donnée est le plus rapide (recherche dichotomique, `firstFrom`). Le sens de circulation, les boucles et les courses partielles sont gérés sans connaître la topologie des lignes ; une course partielle peut servir de premier tronçon si une correspondance finit le trajet. Les correspondances se font dans une même station (quais regroupés par nom), pas à pied entre deux stations.
5. **Options** (`plan`) : une par couple (station de départ O, nombre de correspondances k), clé `O|k`. Toutes lignes confondues pour le premier tronçon (tronc commun C/D par exemple). Les départs du profil de O sont transformés en trajets (`itinerary` : champs du premier tronçon à la racine, `legs[]`, `transfers`, `arrHome`, `dest`). « Atteignables » = départ ≥ maintenant + temps de marche vers O + 2 min de marge (`WALK_MARGIN_MS`). Seuls comptent les départs **avant la fin du service** (`serviceEnd`, calculé par `serviceEndAfter` : la prochaine fois qu'il est 3 h du matin à Bordeaux, `serviceEndHour` de l'adaptateur dans le fuseau `timeZone` du réseau). La règle vaut pour **chaque tronçon**, correspondances comprises : elle est appliquée dès `buildProfiles`, qui n'accepte aucune montée à partir de `serviceEnd`. Tout le trajet tient dans la même journée de service ; jamais un tram du lendemain matin, ni d'un jour suivant, pour finir le trajet. Après le dernier tram et avant 3 h : statut `over` (« Plus de tram ce soir »), même si l'API connaît déjà les courses du matin. `next` = premier atteignable, `last` = dernier atteignable, `leaveBy` = `last.dep` − marche − marge, `arriveHome` = `next.arrHome`, `dest` = station de descente de `last`. Une option avec plus de correspondances depuis la même station est écartée si une option avec moins de correspondances part au moins aussi tard et arrive au moins aussi tôt.
6. **Tri** : par `leaveBy` décroissant (le dernier tram possible sur tout le trajet), puis moins de correspondances, puis marche vers O, puis arrivée au domicile. L'option `primary` est la première, et la seule affichée (demande de l'auteur, 01/10/2026 : un seul tracé, pas de choix).
7. **Statuts** : `ok`, `ended` (prochain départ de `primary` dans plus de 2 h), `missed` (des départs restent mais aucun atteignable), `over` (aucun départ à venir, mais au moins un trajet a relié les deux côtés plus tôt dans la journée), `none` (aucun trajet de la journée, même avec correspondance). `over` repose sur une hypothèse non vérifiée : que `estimated-timetable` garde les courses déjà passées de la journée commerciale en cours (le 27/09 à 21 h, le tram A sens 0 renvoyait 300 courses, soit plus qu'un demi-service, ce qui va dans ce sens). Si elles disparaissent, on retombe sur `none`.

Temps de marche (`util.js`) : distance à vol d'oiseau × 1,3, à 78 m/min (environ 4,7 km/h), arrondi à la minute supérieure, minimum 1 min. Pour l'heure de départ d'un arrêt, on utilise l'heure temps réel si elle existe, sinon l'heure théorique.

## 7. Stockage local

| Clé | Contenu |
|---|---|
| `dt.homes.v1` | `{ [networkId]: { label, lat, lon } }` : un domicile par réseau |
| `dt.home.v1` | ancien domicile unique ; lu une fois et recopié dans `dt.homes.v1` sous `bordeaux-tbm` (`legacyHomeKey`), jamais écrit |
| `dt.prefs.v1` | `{ city: "auto" \| networkId, feature: "auto" \| featureId, lastNetwork }` : choix de l'en-tête |
| `dt.lab.v1` | réglages du mode test, local seulement (`lab/index.html`) : `{ clock, setAt, startHour, endHour, liveMin, countdownMin, screen }` |
| `dt.network.v1` | cache du réseau TBM (`siri-lite.js`) : `{ at, data: { lines, stops } }`, lignes de tram et points d'arrêt filtrés, 24 h |

Tous les accès à `localStorage` sont dans des `try/catch` : le site fonctionne (sans mémoire) en navigation privée stricte. Changer le format d'une clé → incrémenter son suffixe de version.

## 8. Design

Intention : lisible d'une main, la nuit, dehors. **Un seul élément fort : le compte à rebours avant de partir, en très grand et centré.** La situation se lit d'un coup d'œil à la couleur de **toute la fenêtre** ; le contenu flotte dessus sur des panneaux de verre (demandé le 30/09/2026 : « couleur adaptée à la situation sur l'ensemble de la fenêtre, camaïeu, animation fluide, liquid glass »).

- **Ambiance** (`.ambient`, fixe sous tout le reste) : un fond et trois grandes taches floues du même ton (`--amb-1` à `--amb-4`, un camaïeu par ton et par thème, sous `:root[data-tone=…]`) qui dérivent lentement (32 à 53 s, `drift-a|b|c`). Les couleurs sont déclarées par `@property` : le changement de ton se fond en 1,2 s, texte (`--ink`, `--muted`) compris, pour ne jamais avoir un texte clair sur fond encore clair. Le compteur est un panneau de verre en deux parties, la tête (compte à rebours, heure limite, source) et l'itinéraire, séparées par de l'espace seul (pas de filet) ; l'itinéraire est un bloc à la largeur de son contenu, centré dans la tuile ; tous les points du tracé sont ronds ; une lueur du ton éclaire le haut du verre. Les chiffres glissent en place quand la minute change (`tick`), l'écran monte en place au premier affichage (`enter`, une seule fois par montage), la flèche « Actualiser » tourne pendant un calcul. Sous 5 min, le fond « respire » (`breathe`). `prefers-reduced-motion` : ni dérive ni respiration. `ambient.js` règle aussi la couleur de la barre du navigateur (`theme-color`), à tenir en phase avec `--amb-1`.
- **Trop tard** (`data-tone="late"`) : toute l'interface passe en sombre (fond noir, texte clair, accent et surfaces sombres), en clair comme en sombre.
- **Verre** (`.glass` : compteur, pages légales ; variantes pour les sélecteurs et les feuilles) : fond translucide (`--glass-bg`), `backdrop-filter: blur(22px) saturate(170%)`, reflet en dégradé et liseré clair en haut, ombre douce. Sans `backdrop-filter`, verre presque opaque. Les feuilles de réglage sont plus opaques (82 %) : on y lit et on y tape.

- Thème : suit `prefers-color-scheme` (clair par défaut, sombre si le système l'est). Jetons dans `:root`.
- Couleurs sombres : fond `#12202E`, surface `#1A2C3E`, texte `#EEF2F5`, secondaire `#A5B4C2`, filets `#2C4257`, accent `#FFB547`, bientôt `#FF9A3D`, urgent `#FF7B6E`, temps réel `#6FD597`.
- Couleurs claires : fond `#F3F5F7`, surface `#FFFFFF`, texte `#12202E`, secondaire `#4D5B69`, filets `#D3DAE1`, accent `#8F5400`, bientôt `#A34700`, urgent `#B3261E`, temps réel `#1D6B3A`.
- Typographies (hébergées dans `fonts/`, sous-ensemble latin, licence SIL OFL 1.1, préchargées pour Barlow 700 et Atkinson 400 ; plus aucun appel à Google Fonts depuis le 30/09/2026) : **Barlow Condensed** 500/700 pour les heures, titres et le logo (esprit signalétique) ; **Atkinson Hyperlegible** 400/700 pour le texte (lisibilité maximale). Chiffres tabulaires pour les heures.
- Logo : « Terminus » précédé d'une fin de ligne dessinée en CSS (un trait qui s'arrête sur une barre), reprise dans le favicon SVG.
- Badges de ligne : lettre blanche sur la couleur officielle de la ligne, relevée dans le GTFS TBM (`routes.txt`, `route_color` / `route_text_color`) le 27/09/2026 : A `#831F82`, B `#E50040`, C `#D35098`, D `#9262A3`, E `#967651`, F `#F08700`, texte `#FFFFFF` pour toutes. Table `lineColors` du réseau (`js/networks/bordeaux-tbm/index.js`) ; une ligne absente de la table garde le badge neutre (fond encre). Le blanc sur la ligne F (orange) est peu contrasté, mais c'est la charte officielle.
- Trajet (Position, Domicile) : deux colonnes posées directement sur le fond, comme la ligne « Mis à jour » (pas de panneau de verre, demande de l'auteur le 30/09/2026) ; seuls les pictogrammes sont dans des pastilles de verre de 40 px, sans trait entre elles. Deux lignes : intitulé 12 px gris, valeur 15 px en gras sur **deux lignes de texte au plus** (`line-clamp`). Une information manquante passe la colonne en couleur d'accent. Les colonnes avaient été abandonnées une première fois (adresses coupées à quinze caractères sur une ligne) ; elles reviennent à la demande de l'auteur (30/09/2026), avec la valeur sur deux lignes pour limiter les coupures. La troisième ligne (précision GPS, temps de marche, station de descente) a été retirée le 30/09/2026 : elle répétait l'itinéraire.
- Itinéraire du compteur : lignes aérées (44 px par étape, 40 px par trajet en tram ; 36 et 32 px sous 700 px de haut), texte à sa largeur (`minmax(0, max-content)`) pour que le bouton d'itinéraire suive le nom de l'arrêt au lieu d'aller à droite, colonne d'heures 2,9 rem, tracé 1,25 rem (demi-segments au-dessus et au-dessous de chaque point, qui s'emboîtent d'une étape à l'autre), étapes coupées par « … » si elles débordent.
- **Espacement des sections** (30/09/2026, « plus épuré ») : 20 px sous l'en-tête, 32 px entre la tuile et la bande Position / Domicile, 52 px entre la bande et « Mis à jour », puis 28 px jusqu'au pied de page : « Mis à jour » se lit avec le pied de page, pas avec la bande. Aucun filet.
- **Contraintes téléphone** (vérifiées à 360 × 640, 375 × 667 et 390 × 844 dans Chromium, avec les vraies polices) : l'écran principal tient sans défilement vertical ni horizontal ; toute zone tactile fait au moins 44 px de haut ; la taille du compteur suit la largeur et la hauteur de l'écran (`min(40vw, 16svh)`). **Aucune taille (police, marge, hauteur d'écran) ne dépend de `dvh`** : sur mobile, la barre d'adresse se replie au défilement et `dvh` change, ce qui faisait varier la taille du compte à rebours pendant un défilement (signalé le 30/09/2026). On utilise `svh` (hauteur stable, barre dépliée), avec `vh` en repli ; `dvh` reste seulement pour la hauteur maximale des feuilles, avec des espacements réduits sous 700 px de haut. Revérifié le 30/09/2026 à 360 × 640 après l'aération de l'itinéraire : trajet direct, tout tient ; trajet à une correspondance (7 étapes), la bande Position / Domicile passe sous la ligne de flottaison (choix accepté : lisibilité de l'itinéraire d'abord). Avec deux correspondances (9 étapes), le bas de la bande peut passer sous la ligne de flottaison.
- Feuilles : **toutes montent du bas** (30/09/2026, demande de l'auteur ; les feuilles à champ s'ouvraient auparavant en haut pour éviter le clavier). Quand le clavier virtuel s'ouvre, `sheet.js` mesure la partie cachée avec `visualViewport` et remonte la feuille d'autant (`--keyboard` : marge basse et hauteur maximale). Non vérifié sur un vrai téléphone.
- **Feuilles, même anatomie partout** (briques de `js/core/sheet.js`, 30/09/2026) : tête avec poignée, titre et bouton rond de fermeture (croix) ; puis, dans cet ordre, le champ d'adresse, les choix en cartes (`sheetOptions` : carte de verre, un seul liseré d'accent et une coche pour le choix en cours, sans second contour de focus ; « Automatique » est toujours précédé de l'éclair, `AUTOMATIC`, le même que dans l'en-tête), la valeur actuelle (`sheetCurrent`, « Actuellement » + adresse), les actions secondaires en lignes avec pictogramme dans une seule carte (`sheetActions` / `sheetAction` : « Utiliser ma localisation », « Itinéraire à pied… », « Je ne suis pas ici »), une note grise (`sheetNote`). Entrée et sortie animées (glissement depuis le bord, voile fondu, sortie en 180 ms), Échap et le toucher du voile passent par la même sortie ; une feuille se ferme aussi en tirant sa tête vers le bas (plus de 80 px). Les choix se lisent par `data-value` (`pick-city`, `pick-feature`). Toute nouvelle feuille doit utiliser ces briques.
- Accessibilité : focus visible, combobox ARIA au clavier, `aria-live` sur la zone principale, contrastes suffisants, mouvement réduit respecté.
- À éviter : titres en capitales espacées, flèches ajoutées aux boutons, cartes identiques partout. Les seules animations sont l'ambiance (lente, qui porte le ton), le calcul en cours et l'urgence sous 5 min.

## 9. Tests et vérification

- `npm test` (Node 18+) : 24 tests. `planner.test.mjs` (18) : le regroupement en stations, les lignes à charger sans graphe, les (ligne, sens) choisis d'après le graphe (direct, correspondance, correspondance de plus sur demande, arrêt inconnu et graphe sans trajet), le choix du dernier tram indépendamment de l'ordre du JSON, l'exclusion des courses partielles, les trams inatteignables à pied, les statuts `none`/`missed`/`over`/`ended`, les correspondances (dernier B qui attrape encore le dernier A, marge de changement de quai, direct préféré et correspondance plus tardive signalée, relais par la correspondance quand le direct est manqué), et la lecture du format Mecatran. `registry.test.mjs` (6) : complétude des réseaux et des types d'information, adaptateur `last-ride`, format du graphe (sens 0/1, chaque ligne dans les deux sens, chaque quai nommé), choix de la ville d'après la position, domicile par réseau et reprise de `dt.home.v1`.
- **Mode test (lab)**, pour les tests visuels à toute heure : `npm run serve`, puis `http://localhost:8000/lab/`. La page enregistre des réglages dans `dt.lab.v1`, que le site lit via `js/core/lab.js` : heure simulée (elle avance à partir de l'heure choisie ; `now()` remplace `Date.now()` dans `last-ride`, pas dans les caches), plage horaire, seuil « plus d'1 h », compteur forcé à N minutes (tons et pulsation), écran forcé sans appel à l'API (attente, manqué, terminé, aucun tram, erreur, à deux pas). Un bandeau rayé « Mode test » rappelle l'heure simulée et permet de quitter. Sécurité : `lab/` n'est pas copié par `deploy.yml`, et `lab` vaut `null` hors de `localhost` / `127.0.0.1`, même si la clé existe (test `tests/lab.test.mjs`). Choix de l'auteur, 01/10/2026 : pas de page de tests publiée.
- Test local du site : `npm run serve` (`tools/serve.py`, qui envoie `Cache-Control: no-store`) puis `http://localhost:8000` (les modules ES ne se chargent pas en `file://`). Avec `python3 -m http.server`, sans en-tête de cache, le navigateur garde les anciens modules plusieurs heures : constaté le 30/09/2026, l'ancien calcul sans correspondance s'exécutait encore après la mise à jour.
- Le rendu a été vérifié dans Chromium headless avec des réponses d'API simulées, en clair et en sombre.

**Jamais vérifié en conditions réelles** : le format réel des réponses de la Géoplateforme, la géolocalisation sur un vrai téléphone, le site publié sur GitHub Pages. Les appels navigateur vers `bdx.mecatran.com` fonctionnent depuis `localhost` (30/09/2026, voir 5.1).

## 10. Limites connues

- Correspondances : deux au plus, dans une même station (pas de marche entre deux stations proches de noms différents), avec une marge fixe de 2 min qui ne tient pas compte de la disposition des quais. Le temps réel de la course de correspondance n'est connu que si elle part dans l'heure.
- Le graphe (`graph.js`) est une photo du réseau au jour de sa génération. Il faut le régénérer (`npm run graph`, en journée) après un changement de desserte : nouvelle ligne, prolongement, nouveaux quais. Sinon, le repli charge tout le réseau et le calcul reste juste, mais plus lent.
- Temps de marche estimés, pas calculés sur le réseau piéton.
- Poids des réponses `estimated-timetable` en journée (tout le reste de la journée pour chaque ligne concernée, deux sens).
- La fin de service est une heure fixe (3 h du matin à Bordeaux) : un tram exceptionnel après 3 h (nuit de fête) serait ignoré. La nuit d'un changement d'heure, la coupure peut être décalée d'une heure. L'état « service terminé » (`ended`, prochain départ dans plus de 2 h) ne se voit plus en pratique : entre 3 h et 18 h, l'écran d'attente le remplace. Avant 18 h, aucune information, même pour prévoir sa soirée (choix de l'auteur, 01/10/2026).
- Perturbations : les messages (`general-message.json`) ne sont pas affichés. En revanche, les horaires publiés intègrent les travaux planifiés : vérifié dans le GTFS statique pour les travaux nocturnes du 28/09 au 02/10 (tram F sans course après 20 h 45, tram A limité à Stalingrad en fin de soirée). Qu'`estimated-timetable` reprenne ces horaires reste à vérifier un soir de travaux.

## 11. Pistes pour la suite, par priorité

1. **Valider en production** : le site publié sur GitHub Pages (appels TBM depuis ce domaine) et le format de la Géoplateforme. Le CORS de l'API TBM est ouvert (5.1).
2. **Correspondances à pied** entre stations proches de noms différents, et marge de correspondance par station.
3. **Graphe à jour tout seul** : une Action planifiée (par exemple hebdomadaire) qui lance `npm run graph` et ouvre une pull request si `graph.js` change.
4. **Alléger encore les appels** (le graphe limite déjà les lignes et les sens chargés) : actualisation adaptative sous 1 h (toutes les minutes sous 15 min, plus rarement au-delà ; au-dessus d'1 h, c'est déjà fait) ; `stop-monitoring` à la seule station de départ pour le temps réel, `estimated-timetable` gardé en `localStorage` pour la soirée ; `PreviewInterval` limité à quelques heures en journée, où les réponses sont lourdes. Pour les bus : même graphe (motifs de lignes par sens), étendu aux arrêts de bus, avec des correspondances à pied entre arrêts proches.
5. **Perturbations** : afficher les messages `general-message.json` qui concernent les lignes du trajet.
6. **Itinéraire piéton réel** via le calcul d'itinéraire de la Géoplateforme, à la place de l'estimation × 1,3.
7. **Installable** : manifeste web et service worker, pour l'ajouter à l'écran d'accueil.
8. Élargir aux bus (TBNight en priorité pour les nuits) une fois les trams stabilisés.

## 12. Conventions de code

- JavaScript moderne en modules ES, sans transpilation. Fonctions courtes, noms en anglais, commentaires et textes d'interface en français.
- Tout texte venant d'une API passe par `esc()` avant d'être injecté dans le HTML.
- Les erreurs affichées disent ce qui s'est passé et quoi faire, sans s'excuser.
- Toute modification de `planner.js` s'accompagne d'un test dans `tests/planner.test.mjs`.
- Tout nouveau réseau ou type d'information doit passer `tests/registry.test.mjs` ; ajouter un test si son interface s'enrichit.

## 13. Documentation et règles implicites

Les fichiers Markdown ont des publics et des responsabilités distincts :

- **`CONTEXT.md`** est le contexte global destiné aux développeurs et aux LLM. Il décrit les contraintes, l'architecture, les choix techniques, l'état vérifié, les limites et les règles à respecter pour modifier le projet.
- **`README.md`** est destiné aux développeurs. Il explique le but technique du dépôt, les technologies, l'installation et les commandes, ainsi que les conventions de contribution, GitHub, les PR, les Actions et le déploiement.
- **`PROJECT.md`** est destiné aux utilisateurs. Il présente Terminus, son fonctionnement, ses fonctionnalités, les informations nécessaires à son utilisation et ses limites, sans instructions de développement.

À chaque modification du projet, vérifier ces trois documents et mettre à jour ceux dont le périmètre est concerné. Une modification fonctionnelle ou de l'expérience utilisateur implique `PROJECT.md` ; une modification des outils, tests, contributions, GitHub ou du déploiement implique `README.md` ; une modification des contraintes, de l'architecture, des algorithmes, des données ou de l'état de référence implique `CONTEXT.md`. Une même modification peut impliquer plusieurs fichiers. Ne pas modifier les documents sans rapport avec le changement, et ne pas laisser une documentation contredire le comportement effectif. `PROJECT.md` contient une section « Futur » (fonctionnalités prévues, vues par l'utilisateur) : le changement qui livre une de ces fonctionnalités la retire de la liste et la décrit dans les sections « Comment ça marche », « Ce que vous trouverez » ou « À savoir ». Il passe aussi son état de 🟡 à 🟢 dans le tableau « Villes, transports et fonctionnalités » (une colonne par ville) ; toute nouvelle ville (nouvelle colonne), tout nouveau transport ou toute idée ajoutée à « Futur » (nouvelle ligne) y figure aussi.

Le code et les tests établissent le comportement actuellement livré ; `CONTEXT.md` consigne les invariants et décisions de conception. Si le comportement change, mettre à jour les tests pertinents et les documents correspondants dans le même changement. Distinguer explicitement les faits vérifiés des hypothèses, en particulier pour les API, les règles GitHub et les contrôles de déploiement.
