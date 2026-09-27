PROJECT.md            description et fonctionnalités destinées aux utilisateurs
# CONTEXT.md — Terminus

Document de passation. Il décrit le projet, ses choix et son état pour qu'un développeur ou un LLM puisse le reprendre sans autre contexte. Lire en entier avant de modifier le code.

## 1. En une phrase

**Terminus** est un site web statique (hébergé sur GitHub Pages) qui dit à une personne, là où elle se trouve (aujourd'hui dans Bordeaux Métropole, d'autres villes pourront s'ajouter), quel arrêt de tram rejoindre pour rentrer chez elle, à quelle heure part le dernier tram, et donc à quelle heure elle doit quitter les lieux.

- Nom de projet interne : « Last TBM ». Nom public : **Terminus**, slogan « Le dernier tram pour rentrer ».
- Ne pas utiliser « TBM » dans le nom public : c'est la marque du réseau (Keolis pour Bordeaux Métropole). Le site est indépendant et le dit dans son pied de page.
- Périmètre actuel : **un réseau (TBM, Bordeaux), un type d'information (le dernier tram pour rentrer), trams uniquement (lignes A à F), trajets directs sans correspondance.** L'architecture accueille d'autres réseaux et d'autres types d'information (section 4).

## 2. Contraintes non négociables

- **100 % statique** : HTML, CSS et JavaScript en modules ES natifs. Pas de build, pas de framework, pas de dépendance npm à l'exécution. `package.json` ne sert qu'aux tests.
- **Aucun backend** : le navigateur appelle directement les API publiques.
- **Déploiement GitHub Pages**, en HTTPS (obligatoire pour la géolocalisation). Branches : `dev` (en cours), `main` (final, alimentée uniquement par pull request), `gh-pages` (site publié, écrite uniquement par l'Action `deploy.yml` à chaque merge dans `main`). L'« assemblage » copie `index.html`, `css/`, `js/` sans les transformer : ne jamais introduire d'étape de compilation. Détails dans `README.md`.
- **Interface en français, vouvoiement**, phrases courtes, casse de phrase, pas de jargon technique à l'écran.
- **Mobile d'abord** : usage typique la nuit, sur un trottoir, d'une main.
- Adresse du domicile stockée uniquement dans le `localStorage` du navigateur.

## 3. Parcours utilisateur

0. **En-tête** : logo à gauche, deux sélecteurs à droite. « Ville » (pictogramme de repère) ouvre une feuille : « Automatique » (selon la position) puis chaque ville couverte. « Information » ouvre une feuille : « Automatique » (le type par défaut, « Le dernier tram pour rentrer ») puis chaque type disponible sur le réseau choisi. Les choix sont mémorisés (`dt.prefs.v1`). Une position hors de toute ville couverte, en mode automatique, garde la dernière ville connue ; le type d'information affiche alors « Vous êtes hors du réseau de … », sans appeler l'API.

1. **Premier écran, toujours l'écran principal** (décrit au point 4), même à la première visite. Sans domicile enregistré : compteur en attente (« – »), bloc Domicile « Non renseigné » en couleur accent, et une annotation au-dessus des blocs, « Indiquez votre domicile pour savoir quand partir. », dont la pointe vise le bloc. Un toucher ouvre la feuille Domicile, champ déjà activé (autocomplétion limitée à la zone du réseau). Le choix est enregistré (`dt.homes.v1`). La localisation n'est demandée qu'une fois le domicile connu. Les étapes d'attente (localisation, calcul) gardent aussi l'écran principal, compteur en attente.
2. **Localisation** : `navigator.geolocation.watchPosition` (haute précision). Recalcul si la personne bouge de plus de 150 m.
3. **Localisation refusée, impossible ou trop lente** : l'écran principal reste affiché. Compteur « – » en gris, « Position inconnue » et la raison ; le bloc Position devient « Non renseignée » (couleur accent) avec une annotation qui le vise, et le bloc Arrêt proche « En attente ». Un toucher ouvre la feuille « Votre position » : champ d'adresse (adresses + lieux) et « Réessayer la localisation ». En cas de refus, la surveillance GPS s'arrête ; en cas d'échec temporaire (introuvable, délai), elle continue et reprend la main dès qu'une position arrive. Il n'existe plus d'écran qui remplace l'écran principal.
4. **Écran principal**, pensé pour un téléphone tenu d'une main et tenant dans la hauteur de l'écran :
   - **Compte à rebours** au centre, en très grand : « Partez dans 42 min » (ou « 1 h 05 »), c'est-à-dire le temps restant avant de devoir partir à pied pour attraper le dernier tram (dernier tram moins temps de marche jusqu'à l'arrêt). Mis à jour toutes les 10 s sans recalcul. En dessous, l'heure limite en évidence (« avant **00:47** »), puis « Dernier tram A à 00:59 » et la source de l'horaire, « Estimé sur l'horaire prévu » puis « Temps réel » (point vert) dès que la course est suivie en direct. **Code couleur** (chiffres colorés, fond du bloc teinté à 12 %) : vert à 20 min ou plus, orange sous 20 min, rouge sous 10 min (clignotant sous 5 min, sauf `prefers-reduced-motion`), noir (bloc noir, texte clair) quand c'est trop tard : heure limite dépassée de plus d'une minute, dernier tram manqué (`missed`) ou service terminé (`ended`). Gris quand une information manque (domicile, position) ou quand il n'y a rien à compter (pas de ligne directe, à deux pas de chez soi, erreur). Seuils `SOON_MIN`, `URGENT_MIN`, `PULSE_MIN` dans `js/features/last-ride/index.js`, classes `tone-ok|soon|urgent|late|none`.
   - **Calcul en cours** : les chiffres s'estompent légèrement et un segment glisse sur une fine ligne sous le bloc, comme un tram sur sa ligne (ligne fixe si `prefers-reduced-motion`). Affiché au moins 700 ms, et annoncé aux lecteurs d'écran (`#compute-status`). Il apparaît pour les calculs demandés (position saisie, « Actualiser », nouveau domicile, déplacement GPS de plus de 150 m) et pour le premier calcul ; les rafraîchissements automatiques toutes les 30 s restent silencieux.
   - **Le trajet, en trois lignes pleine largeur** sous le compteur, dans l'ordre du déplacement (position → arrêt → domicile), à portée de pouce. Chaque ligne : pictogramme, petit intitulé, valeur sur une ligne, précision. Les pictogrammes sont reliés par un trait discret, pointillé pour la marche, plein pour le tram. Si une information manque, une annotation s'affiche juste au-dessus de la ligne concernée :
     - **Votre position** (cible) : adresse de la position. Saisie à la main : l'adresse choisie. GPS : l'adresse la plus proche, trouvée par géocodage inverse (Géoplateforme, `reverse`, relancé au-delà de 50 m de déplacement), sinon « Position GPS », avec la précision. « Recherche… » pendant la localisation, « Non renseignée » si elle est inconnue, « Hors du réseau » si la position n'est pas dans la ville choisie. Un toucher ouvre la feuille « Votre position » : champ d'adresse avec autocomplétion en premier, « Utiliser ma localisation », adresse actuelle.
     - **Arrêt proche** (tram) : lignes, station de départ, temps de marche depuis la position et, si l'arrêt a été choisi à la main, « choisi par vous ». Un toucher ouvre une feuille (`<dialog>` ancré en bas) listant « Automatique » puis chaque station proche qui a un tram direct, avec son heure limite de départ. Le choix manuel est gardé pour la session (`state.pinnedOrigin`, non persisté) ; si l'arrêt choisi n'a plus de tram direct, retour au choix automatique avec une mention. La feuille propose aussi l'itinéraire à pied et « Je ne suis pas ici », qui ouvre la feuille « Votre position ». À droite de la ligne, un bouton « Itinéraire » ouvre l'itinéraire à pied dans Google Maps, de la position à l'arrêt.
     - **Domicile** (maison) : rue du domicile et station de descente. Un toucher ouvre une feuille avec l'adresse complète, l'itinéraire à pied depuis la station de descente et le champ pour changer d'adresse.
   - **Méta** : heure de mise à jour, « Actualiser ».
   - Les prochains départs, le plan du trajet et la liste d'arrêts alternatifs ont été retirés de l'écran : le choix d'arrêt passe par la feuille « Arrêt ».
5. **États particuliers** :
   Dans tous ces états, le compteur est remplacé par un message, et les trois lignes du trajet restent affichées.
   - `ended` : la journée commerciale a basculé, le prochain départ est dans plus de 2 h → « Plus de tram ce soir » + premier départ.
   - `missed` : des courses existent mais aucune n'est atteignable à pied à temps.
   - `over` : le trajet direct existait plus tôt dans la journée, mais le dernier tram est parti (fin de service, travaux nocturnes…) → bloc noir « Plus de tram ce soir ».
   - `none` : aucune course de la journée ne relie les deux côtés (gris).
   - Pas de ligne commune entre les deux côtés → message + liste des arrêts proches des deux côtés (les correspondances sont prévues plus tard).
   - À moins de 300 m du domicile → « Vous êtes à deux pas de chez vous ».
   - Erreur API → « Horaires indisponibles » + « Réessayer ».
6. **Pied de page** (sous la ligne de flottaison) : sources des données, mention d'indépendance.

Rafraîchissement : recalcul toutes les 30 s quand l'onglet est visible, et au retour sur l'onglet. Les horaires sont rechargés depuis l'API au plus toutes les 100 s (cache mémoire).

## 4. Architecture et structure des fichiers

Terminus est organisé pour accueillir plusieurs **réseaux** (une compagnie de transport, une ville) et plusieurs **types d'information** (aujourd'hui un seul : « Le dernier tram pour rentrer », identifiant `last-ride`).

- **Réseau** (`js/networks/<id>/index.js`) : un objet de configuration. Il décrit la ville (`id`, `city`, `name`), sa zone desservie (`coverage`, boîte qui sert au choix automatique de la ville), la zone des adresses (`area` : département pour la Géoplateforme, boîte, centre, exemple d'adresse), les couleurs de lignes, les mentions de source (`attribution`) et, dans `features`, **un adaptateur par type d'information qu'il sait fournir**. Le code propre à l'API du réseau vit à côté (pour TBM : `siri-lite.js`).
- **Type d'information** (`js/features/<id>/index.js`) : exporte `{ id, title, short, description, mount }`. `mount({ root, network, adapter })` dessine dans `<main>` et renvoie `{ unmount() }`, qui doit tout libérer (minuteries, écouteurs, abonnement à la position). Sa logique de calcul pure vit à côté (pour `last-ride` : `planner.js`).
- **Adaptateur `last-ride`** attendu d'un réseau : `vehicle` (mot affiché, « tram »), `loadStops()` → `{ lines: { [ref]: { ref, code } }, stops: [{ ref, name, lat, lon, lines }] }`, `loadTimetable(lineRef, direction)` → courses `[{ id, line, headsign, calls: [{ ref, name, dep, depLive, arr, arrLive, cancelled }] }]`, `clearCache()` facultatif.
- **Coquille** (`js/app.js`) : choisit le réseau puis le type d'information, monte le module, peint les sélecteurs de l'en-tête et le pied de page. Ville : choix manuel, sinon réseau dont `coverage` contient la position, sinon dernier réseau connu, sinon le premier. Type : choix manuel s'il existe sur ce réseau, sinon `DEFAULT_FEATURE` (`last-ride`). Une nouvelle position en mode automatique peut faire changer de ville (démontage puis remontage).
- **Commun** (`js/core/`) : position partagée (`location.js`), domicile par réseau (`home.js`), stockage sûr (`storage.js`), feuilles (`sheet.js`), champ et géocodage d'adresses paramétrés par la zone du réseau (`address-field.js`, `geocode.js`), indicateur de calcul (`computing.js`), utilitaires (`util.js`).

```
index.html                          coquille : en-tête (logo, sélecteurs ville et information), <main id="app">,
                                    #compute-status, <dialog id="sheet">, pied de page (#footer-sources)
css/style.css                       tout le style, jetons de design dans :root
js/app.js                           coquille : choix du réseau et du type d'information, sélecteurs, montage
js/core/location.js                 position GPS ou saisie, abonnements
js/core/home.js                     domicile par réseau (dt.homes.v1), reprise de dt.home.v1
js/core/storage.js                  lecture/écriture JSON dans localStorage, sans jamais échouer
js/core/sheet.js                    feuille de réglage (<dialog> ancré en bas)
js/core/address-field.js            champ d'adresse (combobox ARIA)
js/core/geocode.js                  autocomplétion d'adresses (Géoplateforme IGN), zone fournie par le réseau
js/core/computing.js                indicateur « calcul en cours »
js/core/util.js                     distance, marche, heures, échappement HTML, inBounds
js/networks/index.js                registre des réseaux, networkAt(position)
js/networks/bordeaux-tbm/index.js   réseau TBM : zone, couleurs, sources, adaptateurs
js/networks/bordeaux-tbm/siri-lite.js  appels SIRI-Lite, lecture des réponses, caches
js/features/index.js                registre des types d'information, DEFAULT_FEATURE
js/features/last-ride/index.js      « Le dernier tram pour rentrer » : écrans, calcul, feuilles
js/features/last-ride/planner.js    logique pure : stations, candidats, options
tests/planner.test.mjs              tests du calcul et de la lecture SIRI-Lite
tests/registry.test.mjs             cohérence des registres, choix de la ville, stockage du domicile
package.json                        "type": "module", scripts test et serve
README.md / PROJECT.md / CONTEXT.md documentation (voir section 13)
```

Règles d'architecture :

- **La logique de calcul reste pure** (`planner.js` et ses équivalents) : aucun accès au DOM, au réseau ou à `Date.now()`, le temps est passé en paramètre. Toute nouvelle logique de calcul va là, avec des tests.
- **Rien de propre à un réseau dans `core/` ni dans un type d'information** : noms, zones, couleurs, messages locaux (`nightHint`) et appels d'API passent par l'objet réseau et son adaptateur.
- **Aucun accès au DOM au chargement d'un module** : les éléments sont récupérés à l'usage, pour que registres et modules se chargent sous Node dans les tests.
- Un type d'information ne touche qu'à `<main>` et aux feuilles ; l'en-tête et le pied de page appartiennent à la coquille.

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
- **`PreviewInterval`** (durée ISO 8601) est plafonné par le serveur **à la fin de la journée commerciale en cours**. Avec `PT24H`, on obtient toutes les courses jusqu'au dernier tram, y compris après minuit. Vérifié le 27/09/2026 : Tram A sens 0 → dernière course à 23:26:47Z, soit 01:26 à Paris.
- **Structure d'`estimated-timetable`** : `Siri.ServiceDelivery.EstimatedTimetableDelivery[].EstimatedJourneyVersionFrame[].EstimatedVehicleJourney[]`. Chaque course a `LineRef`, `DirectionRef`, `VehicleJourneyRef`, `Cancellation`, `DestinationRef`, `EstimatedCalls.EstimatedCall[]`. Chaque arrêt de course a `StopPointRef`, `StopPointName[]`, `AimedArrivalTime`, `AimedDepartureTime` et, seulement quand le temps réel existe, `ExpectedArrivalTime`, `ExpectedDepartureTime`.
- **Heures en UTC** (suffixe `Z`). L'affichage se fait en `Europe/Paris` via `Intl.DateTimeFormat`.
- **Temps réel** : présent seulement pour les courses proches (environ l'heure qui vient). Au-delà, horaire théorique seul.
- **L'ordre des courses dans la réponse n'est pas garanti chronologique.** Le dernier élément du JSON n'est pas le dernier tram.
- **Courses partielles** : certaines courses s'arrêtent avant le terminus (vu : une course de la ligne A se terminant à Galin). D'où l'exigence de vérifier que la course dessert bien la station d'arrivée.
- La réponse peut contenir `"Status": false` tout en ayant des données. Le code ne rejette donc pas sur ce seul champ.
- Chaque course contient tous ses arrêts, y compris ceux déjà passés. Les réponses sont lourdes en journée (de l'ordre du Mo par ligne et par sens, bien compressé en gzip), légères en fin de soirée.
- **CORS** : un autre projet open source (github.com/adrienl82/Tbm) appelle cette API directement depuis le navigateur et affirme que les en-têtes CORS sont permissifs. **Non vérifié par nous depuis un navigateur.** C'est le premier point à contrôler en production. L'API répond depuis une ligne de commande (vérifié le 27/09/2026), ce qui ne dit rien des en-têtes CORS.

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
3. **Lignes à charger** (`sharedLines`) : intersection des lignes des deux côtés. Si vide → écran « Pas de tram direct ». Sinon, `estimated-timetable` pour chaque ligne, sens 0 et 1, en parallèle (`Promise.allSettled` : un échec partiel affiche un avertissement sans bloquer).
4. **Options** (`plan`) : pour chaque course, on repère la première occurrence de chaque station candidate. Pour chaque couple (station de départ O, station d'arrivée D) où O précède D dans la course, on ajoute un « trip » à l'option O→D. Le sens de circulation et les courses partielles sont ainsi gérés sans connaître la topologie des lignes. **Une option regroupe toutes les lignes** qui relient O à D (tronc commun C/D par exemple).
5. **Par option** : trips triés par heure de départ ; « atteignables » = départ ≥ maintenant + temps de marche vers O. `next` = premier atteignable, `last` = dernier atteignable, `leaveBy` = `last.dep` − marche, `arriveHome` = `next.arr` + marche depuis D. Les options sans trip atteignable sont écartées.
6. **Tri** : par `arriveHome` croissant, puis marche vers O. L'option `primary` est la première. `later` = l'option au `leaveBy` le plus tardif si elle dépasse celui de `primary` d'au moins 2 min. `alternatives` = jusqu'à 3 options avec des stations de départ différentes.
7. **Statuts** : `ok`, `ended` (prochain départ de `primary` dans plus de 2 h), `missed` (des trips existent mais aucun atteignable), `over` (aucun trip à venir, mais au moins une course a relié les deux côtés plus tôt dans la journée), `none` (aucune course ne les relie de la journée). `over` repose sur une hypothèse non vérifiée : que `estimated-timetable` garde les courses déjà passées de la journée commerciale en cours (le 27/09 à 21 h, le tram A sens 0 renvoyait 300 courses, soit plus qu'un demi-service, ce qui va dans ce sens). Si elles disparaissent, on retombe sur `none`.

Temps de marche (`util.js`) : distance à vol d'oiseau × 1,3, à 78 m/min (environ 4,7 km/h), arrondi à la minute supérieure, minimum 1 min. Pour l'heure de départ d'un arrêt, on utilise l'heure temps réel si elle existe, sinon l'heure théorique.

## 7. Stockage local

| Clé | Contenu |
|---|---|
| `dt.homes.v1` | `{ [networkId]: { label, lat, lon } }` : un domicile par réseau |
| `dt.home.v1` | ancien domicile unique ; lu une fois et recopié dans `dt.homes.v1` sous `bordeaux-tbm` (`legacyHomeKey`), jamais écrit |
| `dt.prefs.v1` | `{ city: "auto" \| networkId, feature: "auto" \| featureId, lastNetwork }` : choix de l'en-tête |
| `dt.network.v1` | cache du réseau TBM (`siri-lite.js`) : `{ at, data: { lines, stops } }`, lignes de tram et points d'arrêt filtrés, 24 h |

Tous les accès à `localStorage` sont dans des `try/catch` : le site fonctionne (sans mémoire) en navigation privée stricte. Changer le format d'une clé → incrémenter son suffixe de version.

## 8. Design

Intention : lisible d'une main, la nuit, dehors. **Un seul élément fort : le compte à rebours avant de partir, en très grand et centré**, couleur « lampadaire au sodium ». Tout le reste est calme : les trois lignes du trajet en bas de l'écran, qui ouvrent des feuilles de réglage.

- Thème : suit `prefers-color-scheme` (clair par défaut, sombre si le système l'est). Jetons dans `:root`.
- Couleurs sombres : fond `#12202E`, surface `#1A2C3E`, texte `#EEF2F5`, secondaire `#A5B4C2`, filets `#2C4257`, accent `#FFB547`, bientôt `#FF9A3D`, urgent `#FF7B6E`, temps réel `#6FD597`.
- Couleurs claires : fond `#F3F5F7`, surface `#FFFFFF`, texte `#12202E`, secondaire `#4D5B69`, filets `#D3DAE1`, accent `#8F5400`, bientôt `#A34700`, urgent `#B3261E`, temps réel `#1D6B3A`.
- Typographies (Google Fonts) : **Barlow Condensed** 500/700 pour les heures, titres et le logo (esprit signalétique) ; **Atkinson Hyperlegible** 400/700 pour le texte (lisibilité maximale). Chiffres tabulaires pour les heures.
- Logo : « Terminus » précédé d'une fin de ligne dessinée en CSS (un trait qui s'arrête sur une barre), reprise dans le favicon SVG.
- Badges de ligne : lettre blanche sur la couleur officielle de la ligne, relevée dans le GTFS TBM (`routes.txt`, `route_color` / `route_text_color`) le 27/09/2026 : A `#831F82`, B `#E50040`, C `#D35098`, D `#9262A3`, E `#967651`, F `#F08700`, texte `#FFFFFF` pour toutes. Table `lineColors` du réseau (`js/networks/bordeaux-tbm/index.js`) ; une ligne absente de la table garde le badge neutre (fond encre). Le blanc sur la ligne F (orange) est peu contrasté, mais c'est la charte officielle.
- Lignes du trajet (Position, Arrêt proche, Domicile) : très peu marquées, sans cadre ni fond ; seul l'espace les sépare, et le trait qui relie les pictogrammes. Intitulé 13 px gris, valeur 17 px en gras sur une ligne, précision 14 px. Une information manquante passe la ligne en couleur d'accent. Les trois colonnes côte à côte ont été abandonnées : sur un téléphone, les adresses y étaient coupées au bout de quinze caractères.
- **Contraintes téléphone** (vérifiées à 360 × 640, 375 × 667 et 390 × 844 dans Chromium, avec les vraies polices) : l'écran principal tient sans défilement vertical ni horizontal ; toute zone tactile fait au moins 44 px de haut ; la taille du compteur suit la largeur et la hauteur de l'écran (`min(44vw, 21dvh)`), avec des espacements réduits sous 700 px de haut.
- Feuilles : celles qui contiennent un champ (position, domicile) s'ouvrent en haut de l'écran, champ en premier (`openSheet(…, { tall: true })`), pour que le clavier ne cache ni le champ ni ses suggestions ; les listes de choix (arrêt, ville, information) montent du bas.
- Accessibilité : focus visible, combobox ARIA au clavier, `aria-live` sur la zone principale, contrastes suffisants, mouvement réduit respecté.
- À éviter : titres en capitales espacées, flèches ajoutées aux boutons, cartes identiques partout, animations décoratives.

## 9. Tests et vérification

- `npm test` (Node 18+) : 15 tests. `planner.test.mjs` (10) : le regroupement en stations, les lignes communes, le choix du dernier tram indépendamment de l'ordre du JSON, l'exclusion des courses partielles, les trams inatteignables à pied, les statuts `none`/`missed`/`over`/`ended`, et la lecture du format Mecatran. `registry.test.mjs` (5) : complétude des réseaux et des types d'information, adaptateur `last-ride`, choix de la ville d'après la position, domicile par réseau et reprise de `dt.home.v1`.
- Test local du site : `python3 -m http.server 8000` puis `http://localhost:8000` (les modules ES ne se chargent pas en `file://`).
- Le rendu a été vérifié dans Chromium headless avec des réponses d'API simulées, en clair et en sombre.

**Jamais vérifié en conditions réelles** (l'environnement de développement n'avait pas accès à ces domaines) : les appels navigateur vers `bdx.mecatran.com` (CORS), le format réel des réponses de la Géoplateforme, la géolocalisation sur un vrai téléphone.

## 10. Limites connues

- Pas de correspondance : si aucune ligne ne relie directement les deux côtés, pas de trajet proposé.
- Temps de marche estimés, pas calculés sur le réseau piéton.
- Poids des réponses `estimated-timetable` en journée (tout le reste de la journée pour chaque ligne concernée, deux sens).
- L'état « service terminé » repose sur une heuristique (prochain départ dans plus de 2 h).
- Perturbations : les messages (`general-message.json`) ne sont pas affichés. En revanche, les horaires publiés intègrent les travaux planifiés : vérifié dans le GTFS statique pour les travaux nocturnes du 28/09 au 02/10 (tram F sans course après 20 h 45, tram A limité à Stalingrad en fin de soirée). Qu'`estimated-timetable` reprenne ces horaires reste à vérifier un soir de travaux.

## 11. Pistes pour la suite, par priorité

1. **Valider en production** : CORS de l'API TBM et format de la Géoplateforme. Si le CORS bloque, ajouter un relais minimal (Cloudflare Worker) qui ne fait que transmettre les requêtes SIRI-Lite, et centraliser l'URL de base dans `siri-lite.js`.
2. **Correspondances** : trajets à un changement (par exemple B puis A). Le « dernier tram utile » devient la dernière course de la première ligne qui permet encore d'attraper la dernière course de la seconde, avec une marge de correspondance. À implémenter dans `planner.js`, avec des tests.
3. **Alléger les appels** : `stop-monitoring` aux stations candidates pour le temps réel des prochains passages, et `estimated-timetable` rechargé moins souvent pour le calcul du dernier tram.
4. **Perturbations** : afficher les messages `general-message.json` qui concernent les lignes du trajet.
5. **Itinéraire piéton réel** via le calcul d'itinéraire de la Géoplateforme, à la place de l'estimation × 1,3.
6. **Installable** : manifeste web et service worker, pour l'ajouter à l'écran d'accueil.
7. Élargir aux bus (TBNight en priorité pour les nuits) une fois les trams stabilisés.

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

À chaque modification du projet, vérifier ces trois documents et mettre à jour ceux dont le périmètre est concerné. Une modification fonctionnelle ou de l'expérience utilisateur implique `PROJECT.md` ; une modification des outils, tests, contributions, GitHub ou du déploiement implique `README.md` ; une modification des contraintes, de l'architecture, des algorithmes, des données ou de l'état de référence implique `CONTEXT.md`. Une même modification peut impliquer plusieurs fichiers. Ne pas modifier les documents sans rapport avec le changement, et ne pas laisser une documentation contredire le comportement effectif.

Le code et les tests établissent le comportement actuellement livré ; `CONTEXT.md` consigne les invariants et décisions de conception. Si le comportement change, mettre à jour les tests pertinents et les documents correspondants dans le même changement. Distinguer explicitement les faits vérifiés des hypothèses, en particulier pour les API, les règles GitHub et les contrôles de déploiement.
