# Thèmes de Terminus

Un **thème** habille le site selon la saison : couleurs, décor, animations, quelques textes. Il est **imposé par ses dates d'activation** : personne ne le choisit. En dehors de toute période, c'est le thème **Terminus**, celui de `css/style.css`.

Le thème ne change jamais le sens de l'écran : les couleurs du compte à rebours (vert, orange, rouge, noir) et la lisibilité restent celles de Terminus.

Vocabulaire du projet :

- **Apparence** : clair ou sombre, selon le réglage du téléphone.
- **Thème** : l'habillage de saison, décrit ici.
- **Mode** : ce que Terminus calcule (« Le dernier tram », « Le prochain bus de nuit »).
- **Fonctionnalité** : ce que propose un mode (compte à rebours, temps réel, carte…).

## Calendrier

Heures de Paris. Un thème est actif de son début (inclus) à sa fin (exclue).

| Thème | Identifiant | Début | Fin |
|---|---|---|---|
| Terminus | `terminus` | (par défaut) | (par défaut) |
| Halloween 2026 | `halloween-2026` | 2026-10-15 18:00 | 2026-11-01 08:00 |

## Changer les dates d'un thème

1. Dans `js/themes/index.js`, modifiez `from` et `to` du thème, au format `AAAA-MM-JJ HH:MM` (heure locale du fuseau `timeZone`, `Europe/Paris`).
2. Reportez les mêmes dates dans le tableau ci-dessus.
3. Lancez `npm test` : un test vérifie que ce tableau et `js/themes/index.js` disent la même chose, et que chaque thème a ses fichiers.

Sur un site ouvert, le thème change à l'heure dite : la page revérifie le calendrier chaque minute.

## Ajouter un thème

1. Créez un dossier `js/themes/<identifiant>/`, sur le modèle de `halloween-2026/` :
   - `theme.css` : les couleurs (jetons de `style.css` redéfinis sous `:root[data-season="<identifiant>"]`) et le décor fixe. Gardez les couleurs du compte à rebours (`--tone-ok`, `--tone-soon`, `--tone-urgent`) et ajoutez `--bar` (couleur de la barre du navigateur) avec chaque `--amb-1`.
   - `decorations.js` (facultatif) : les animations, un module qui exporte `start({ theme, now })` et renvoie une fonction qui les arrête. Respectez `prefers-reduced-motion`, arrêtez tout quand la page est cachée et rien sous 10 minutes (`data-tone` à `urgent` ou `late`).
2. Inscrivez-le dans `THEMES` (`js/themes/index.js`) : `id`, `name`, `from`, `to`, `timeZone`, `stylesheet`, `decorations`, et `texts` pour remplacer des textes (clés `late` : « trop tard », `over` : « Plus de {vehicle} ce soir »).
3. Ajoutez sa ligne au calendrier ci-dessus, puis `npm test`.

Deux périodes ne doivent pas se chevaucher : si c'est le cas, le premier thème de la liste l'emporte.

## Voir un thème hors de sa période

Sur le poste de développement (`npm run serve`, puis `http://localhost:8000/lab/`), réglez l'heure simulée dans la période du thème : le site l'applique comme s'il était cette date.

## Halloween 2026

Du 15 octobre 2026 à 18 h au 1er novembre 2026 à 8 h. La nuit d'Halloween : violet profond et orange citrouille, toujours en apparence sombre.

- **Couleurs** : fond violet nuit où la teinte de la situation reste visible, accent citrouille, verre violacé, texte blanc os.
- **Décor fixe** : citrouille à la place de la fin de ligne du logo, toile d'araignée dans le coin de la tuile, lueur de bougie qui vacille derrière l'heure (jamais sur les chiffres), citrouille et maison hantée sur la carte.
- **Animations** : toutes les 45 s à 1 min 30 environ, un groupe de deux à quatre fantômes traverse la page (six au plus à la fois), pour un effet de profondeur : chacun a sa profondeur, au hasard. Lointain, il est petit, lent (22 à 30 s), pâle et un peu flou, et passe derrière la tuile, vu à travers le verre ; proche, il est grand, rapide (9 à 12 s) et net, et passe devant. Leur trajectoire est prise dans la page et non dans l'écran : quand on fait défiler, un fantôme suit le contenu. Aussi : brume qui dérive au bas de l'écran ; trois chauves-souris s'envolent d'« Actualiser » ; une araignée descend de sa toile quand le compte à rebours passe à « maintenant ».
- **Textes** : « Bouh… trop tard » à la place de « trop tard », « Le dernier tram s'est évaporé » à la place de « Plus de tram ce soir ».
- **Le 31 octobre** : des groupes plus fréquents (toutes les 20 à 45 s), et « Joyeux Halloween 🎃 » affiché une seule fois.
- **Easter egg** : un fantôme proche touché disparaît dans un « pouf » (les lointains, derrière le contenu, ne se touchent pas).
- **Garde-fous** : aucun fantôme ni chauve-souris sous 10 minutes ni quand c'est trop tard ; rien ne bouge si le téléphone demande de réduire les animations (le décor reste) ; tout s'arrête quand la page est cachée.
