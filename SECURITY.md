# Sécurité

Merci de signaler toute faille de Terminus **en privé**, jamais dans une issue ou une pull request publique.

## Signaler une faille

Dans l'onglet **Security** du dépôt, choisissez **Report a vulnerability** (signalement privé de GitHub). Décrivez :

- ce qui est touché (le site publié, un workflow GitHub Actions, les données générées…) ;
- comment reproduire le problème ;
- l'impact que vous envisagez.

Vous recevrez une réponse dès que possible. Terminus est un projet personnel, maintenu sur le temps libre de son auteur : le délai n'est pas garanti, mais chaque signalement est lu. Une fois la faille corrigée, vous pouvez être cité si vous le souhaitez.

## Périmètre

- **Version suivie** : le site publié et la branche `main`. Les autres branches ne sont pas maintenues.
- **Dans le périmètre** : le code du site (`index.html`, `css/`, `js/`), les workflows (`.github/workflows/`) et les outils de génération (`tools/`).
- **Hors périmètre** : les services tiers appelés par le site (API de TBM, Géoplateforme de l'IGN, GitHub Pages) ; signalez-leur directement leurs propres failles.

## Données

Terminus n'a pas de compte utilisateur et ne collecte pas de données personnelles sur un serveur : la destination reste dans le navigateur (voir la page Confidentialité du site). Une faille qui permettrait de lire ou d'envoyer ailleurs ces données locales est à signaler en priorité.
