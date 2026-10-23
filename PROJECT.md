# Terminus

*Le dernier tram pour rentrer chez vous, à Bordeaux Métropole.*

Terminus vous aide à savoir quel tram prendre pour rentrer chez vous et à quelle heure quitter votre point de départ. Le service est indépendant du réseau TBM.

## Les modes

Terminus propose deux modes, selon le véhicule qui vous amène à destination :

- **Le dernier tram** (par défaut à Bordeaux) : les trams des lignes A à F, tous les soirs. Le compte à rebours fonctionne de 18 h à 3 h du matin.
- **Le prochain bus de nuit** : le prochain bus TBNight que vous pouvez attraper pour rentrer, et non le dernier de la nuit. Les nuits du jeudi, du vendredi, du samedi et les veilles de jours fériés ; le compte à rebours fonctionne de 18 h jusqu'à la fin du service, vers 5 h 15. Détails plus bas.

Les deux modes ont le même écran ; ils sont calculés séparément, sans correspondance du tram au bus de nuit. Le choix entre « Plus pratique » et « Plus tard possible » n'existe que pour le dernier tram.

## Comment ça marche

En haut à droite, trois petits boutons règlent ce que Terminus vous montre :

- **L'œil** : affiche ou floute l'adresse de votre destination.
- **La ville** (repère) : en automatique, signalé par un éclair, Terminus la choisit d'après votre position. Vous pouvez aussi la fixer. Seule Bordeaux est disponible pour le moment.
- **Le mode** (grille) : à Bordeaux, « Le dernier tram » par défaut. Vous pouvez choisir aussi « Le prochain bus de nuit », avec les bus TBNight ; votre choix est mémorisé.

1. Dès l'ouverture, vous arrivez sur l'écran principal. À la première visite, une annotation vous invite à indiquer votre destination : touchez « Destination » et saisissez votre adresse. Les suggestions d'adresses sont limitées à la Gironde.
2. Autorisez la localisation pour indiquer automatiquement où vous vous trouvez. Si elle n'est pas disponible, vous pouvez saisir votre position ou choisir un lieu.
3. Terminus recherche les arrêts de tram proches de votre position et de votre destination, puis les trajets possibles, directs ou avec correspondance.
4. L'écran principal, pensé pour le téléphone, affiche en très grand le temps qu'il vous reste avant de partir à pied pour attraper le dernier tram, et l'heure limite. Dessous, le trajet en deux lignes (la marche jusqu'à l'arrêt, puis le tram et sa station d'arrivée) avec un aperçu de carte, et en bas un grand bouton « Itinéraire à pied » vers l'arrêt, avec « Actualiser » à côté. Toute la fenêtre prend la couleur de la situation. Il se met à jour tout seul.
5. Touchez le trajet pour son détail : la carte, que vous pouvez déplacer, et les étapes heure par heure, correspondances comprises, jusqu'à votre destination.
6. En haut, votre position (son adresse) et votre destination, dont l'adresse reste floutée tant que vous ne touchez pas l'œil de l'en-tête. Touchez-les pour les modifier : réessayer la localisation ou saisir votre adresse actuelle, changer de destination.

Vous pouvez aussi actualiser les horaires ou corriger votre position (pastille « Position »). Si votre position est inconnue (localisation refusée ou introuvable), le compte à rebours reste en attente et « Votre position » vous invite à indiquer où vous êtes, ou à réessayer la localisation.

## Ce que vous trouverez

- Un compte à rebours jusqu'à l'heure où partir, calculé à partir du dernier tram que vous pouvez rejoindre à pied et qui vous amène encore à destination. Avec une correspondance, c'est le dernier tram qui vous permet d'attraper le suivant : Terminus indique la station où changer et l'heure du second tram, en comptant 2 minutes pour changer de quai. Il garde aussi 2 minutes de marge sur la marche jusqu'à l'arrêt. Il indique s'il repose sur l'horaire prévu (estimé) ou sur le temps réel, signalé par un point rouge qui clignote, dès que celui-ci est disponible. Sa couleur, qui teinte tout l'écran, indique la marge : vert quand vous avez le temps, orange sous 20 minutes, rouge sous 10 minutes, noir quand il est trop tard. Elle reste grise tant qu'il manque votre position ou votre domicile.
- L'itinéraire du dernier trajet, étape par étape, dans son détail, avec les liens vers l'itinéraire à pied jusqu'à l'arrêt et depuis l'arrêt d'arrivée.
- Un indicateur discret pendant le calcul du trajet, quand vous indiquez votre position ou actualisez.
- Deux trajets au choix en haut de l'écran, quand ils diffèrent : « Plus pratique », qui part tard sans longue marche ni correspondance inutile, et « Plus tard possible », le dernier tram possible sur tout le trajet, quitte à marcher jusqu'à un arrêt plus éloigné ou à prendre une correspondance. Chacun affiche son heure limite de départ ; le choix est mémorisé. Tout le trajet se fait dans la même soirée : jamais un tram du lendemain matin pour le finir.
- Votre adresse floutée par défaut dans la pastille Destination, contre les regards indiscrets : l'œil en haut de l'écran, à côté du choix de la ville, l'affiche ou la masque (le choix est mémorisé).
- L'itinéraire sur une carte (fond Plan IGN) : un aperçu sous le résumé du trajet, et la carte complète dans le détail du trajet, avec la marche jusqu'à l'arrêt, le trajet en tram à la couleur de la ligne, les arrêts de montée, de correspondance et de descente, puis la marche jusqu'à la destination. Le tram et le bus de nuit y suivent le vrai tracé de leur ligne, et la marche suit les rues.
- Quand le dernier tram direct est parti, le compte à rebours passe au dernier trajet avec correspondance, s'il en reste un.
- Une actualisation régulière des informations lorsque la page est ouverte.

### Mode « Le prochain bus de nuit » (TBNight)

- Le compte à rebours vise le prochain bus de nuit que vous pouvez rejoindre à pied et qui vous amène à destination : celui qui vous fait arriver le plus tôt, sans long détour à pied ni correspondance inutile. Une fois parti, Terminus passe au suivant.
- Le même écran que pour le tram, avec les 8 lignes TBNight : la N1 entre la Base sous-marine et Gradignan toute la nuit, et les N2 à N8, qui partent de la Base sous-marine, de Victoire ou de la gare Saint-Jean vers 1 h 45 et vers 4 h.
- TBNight circule les nuits du jeudi, du vendredi, du samedi et les veilles de jours fériés. Les autres soirs, Terminus vous indique la prochaine nuit de service, sans rien calculer.
- Si votre destination se trouve dans une commune desservie par une zone à la demande (Mérignac, Pessac, Lormont, Eysines…), l'itinéraire vous mène jusqu'au dernier arrêt fixe de la ligne et vous rappelle de réserver votre arrêt dans l'application TBM avant de monter. L'heure d'arrivée à destination n'est alors pas connue : elle dépend des réservations.
- Le compte à rebours fonctionne de 18 h jusqu'à la fin du service, vers 5 h 15.

## À savoir

- Terminus couvre les trams des lignes A à F et les bus de nuit TBNight, et propose des trajets directs ou avec une ou deux correspondances, dans une même station. Tram et bus de nuit sont calculés séparément, sans correspondance de l'un à l'autre.
- Les temps de marche suivent les rues, d'après le calcul d'itinéraire de l'IGN, à une allure d'environ 4,7 km/h. Juste après l'ouverture, ou si ce calcul ne répond pas, ce sont des estimations à vol d'oiseau, corrigées dès que possible : l'heure limite peut alors bouger d'une ou deux minutes.
- Les horaires en temps réel ne sont pas toujours disponibles. Les départs éloignés dans le temps peuvent être des horaires prévus.
- Les travaux programmés sont pris en compte quand ils figurent dans les horaires publiés par le réseau. Les messages de perturbation ne sont pas encore affichés.
- Si aucun trajet n'est possible, même avec correspondance, si le dernier tram est déjà hors d'atteinte ou si le service est terminé (y compris plus tôt que d'habitude, un soir de travaux), Terminus l'indique. Il ne remplace pas les informations officielles du réseau.
- L'adresse de destination est enregistrée dans le navigateur utilisé, et nulle part ailleurs. Terminus ne dépose aucun cookie et ne mesure pas l'audience ; la page « Confidentialité », en bas de l'écran, détaille ce qui est échangé et permet d'effacer vos données. Les horaires et les suggestions d'adresses sont fournis par les services publics de transport et de géocodage ; les liens d'itinéraire ouvrent Google Maps.

## Thèmes de saison

Selon la période de l'année, Terminus change d'habit : couleurs, décor, petites animations. Le thème est appliqué automatiquement à ses dates ; le reste du temps, c'est le thème Terminus. Il ne change jamais le sens de l'écran : les couleurs du compte à rebours restent les mêmes.

- **Halloween 2026**, du 15 octobre 2026 à 18 h au 1er novembre 2026 à 8 h : la nuit violette et l'orange citrouille, un logo citrouille, une toile d'araignée dans le coin, une lueur de bougie derrière l'heure, une maison hantée et une citrouille sur la carte, une brume qui dérive en bas de l'écran. De temps en temps, quelques fantômes traversent la page, petits et lents au loin, derrière la tuile, grands et rapides au premier plan ; ils suivent la page quand vous la faites défiler (touchez un fantôme proche, il disparaît) ; des chauves-souris s'envolent quand vous actualisez ; une araignée descend quand il faut partir. Le 31 octobre, un peu plus de fantômes et un « Joyeux Halloween ». Les animations s'arrêtent quand il reste moins de 10 minutes, et ne se lancent pas si votre téléphone demande de réduire les animations.

## Villes, transports et fonctionnalités

🟢 disponible · 🟡 à venir (voir « Futur ») · 🔴 ni disponible ni prévu pour l'instant

Une colonne par ville. Seule Bordeaux Métropole (réseau TBM) est couverte pour le moment.

| | | Bordeaux Métropole | Autres villes |
|---|---|:---:|:---:|
| **Modes** | Le dernier tram | 🟢 | 🔴 |
| | Le prochain bus de nuit | 🟢 | 🔴 |
| **Transports** | Tram | 🟢 | 🔴 |
| | Bus de nuit (TBNight) | 🟢 | 🔴 |
| | Vélos en libre-service du réseau (Le Vélo TBM) | 🟡 | 🔴 |
| | Trottinettes et vélos Dott | 🟡 | 🔴 |
| | Marche jusqu'à la destination | 🟡 | 🔴 |
| | Navette fluviale (BatCub) | 🔴 | 🔴 |
| | Train (TER) | 🔴 | 🔴 |
| **Fonctionnalités** | Compte à rebours jusqu'au dernier tram | 🟢 | 🔴 |
| | Correspondances entre trams (jusqu'à deux) | 🟢 | 🔴 |
| | Temps réel quand il est disponible | 🟢 | 🔴 |
| | Itinéraire complet du dernier trajet | 🟢 | 🔴 |
| | Itinéraire à pied jusqu'à l'arrêt (Google Maps) | 🟢 | 🔴 |
| | Zones à la demande TBNight (rappel de réservation) | 🟢 | 🔴 |
| | Perturbations du réseau | 🟡 | 🔴 |
| | Lieux connus et stations dans la recherche d'adresse | 🟡 | 🔴 |
| | Météo du trajet | 🟡 | 🔴 |
| | Rester au sec | 🟡 | 🔴 |
| | Partager mon trajet | 🟡 | 🔴 |
| | Besoin d'aide | 🟡 | 🔴 |
| | Me prévenir avant de partir | 🟡 | 🔴 |
| | Réglages | 🟡 | 🔴 |
| | Plusieurs langues | 🟡 | 🔴 |
| | Installation sur l'écran d'accueil | 🟡 | 🔴 |
| | Thèmes de saison (Halloween 2026) | 🟢 | 🔴 |

## Futur

Ce qui est prévu, sans date ni ordre garanti. Une fonctionnalité quitte cette liste dès qu'elle est disponible.

**Rentrer autrement**

- **Un vélo quand le tram est parti** : les vélos en libre-service Le Vélo TBM disponibles près de vous, et le temps pour rentrer à vélo.
- **Dott, trottinettes et vélos** : un bouton qui ouvre l'application Dott, l'opérateur privé de trottinettes et de vélos en libre-service à Bordeaux, pour rentrer sans attendre de tram.
- **Rentrer à pied** : quand plus aucun tram n'est possible, le temps qu'il faut pour rentrer à pied.

**Le trajet**

- **La météo du trajet** : le temps et la température prévus pendant votre trajet, en un coup d'œil.
- **Rester au sec** : si la pluie est annoncée avant le dernier tram, l'heure à laquelle partir pour l'éviter. Une indication, pas une garantie : les prévisions de pluie à l'heure près restent incertaines.
- **Les perturbations** : les messages du réseau qui concernent les lignes de votre trajet.

**Chercher plus vite**

- **Les lieux connus de Bordeaux** : dans la recherche d'adresse, dès les premières lettres tapées, les lieux célèbres apparaissent parmi les suggestions (la Cité du Vin, la place Pey-Berland, la place de la Victoire…), pour votre position comme pour votre destination.
- **Les stations et les arrêts** : chercher directement une station de tram ou un arrêt de bus par son nom, dans les mêmes suggestions.

**Votre sécurité**

- **Partager mon trajet** : un bouton qui ouvre le partage de votre téléphone avec un message prêt à envoyer à un proche, par exemple « Je pars de la place de la Victoire à 23 h 40, je serai à la maison vers 0 h 10 ». Votre adresse n'y figure pas.
- **Besoin d'aide** : un accès direct pour appeler le 17 ou le 112, ou écrire au 114 par SMS, et pour partager votre position, avec une sirène et un écran qui clignote pour attirer l'attention. Il ne remplacera pas les services d'urgence.
- **Me prévenir avant de partir** : une notification quelques minutes avant l'heure limite, même quand Terminus n'est pas à l'écran (après l'avoir installé sur l'écran d'accueil).

**Terminus à votre façon**

- **Réglages** : un menu unique pour la langue, le mode affiché, votre vitesse de marche et la marge que vous voulez garder avant le tram.
- **Plusieurs langues**, en commençant par l'anglais.
- **Terminus sur l'écran d'accueil** : l'installer comme une application, qui s'ouvre plus vite, même avec une connexion faible.

Terminus est un projet indépendant, sans lien avec TBM ni Keolis Bordeaux Métropole Mobilités.
