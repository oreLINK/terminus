// Généré par tools/build-transfers.mjs (npm run transfers). Ne pas modifier à la main.
// Correspondances à pied bus entre stations proches de noms différents (moins de 400 m
// à vol d'oiseau, au plus 600 m de marche, changement de ligne), marche par les rues calculée par
// l'IGN à la génération. Lu par transferMap
// (js/features/last-ride/planner.js) : [station A, station B, mètres, tracé encodé (encodeLine) ou null
// si l'IGN n'a pas répondu (estimation)]. Identifiants des stations : buildIndex(bus-stops.js).

export default {
  generatedAt: "2026-10-23",
  rows: [
    ["4 pavillons vers buttiniere","4 pavillons",192,[4486558,-51445,15,63,28,11,14,31,66,25]], // 4 Pavillons (vers Buttinière) ↔ 4 Pavillons
    ["4 pavillons vers rocade","4 pavillons",263,[4486531,-51515,35,137,21,-3,19,18,9,23,66,25]], // 4 Pavillons (vers Rocade) ↔ 4 Pavillons
    ["4 pavillons vers rocade","college jean jaures",447,[4486531,-51515,35,137,-15,21,-58,-8,-1,6,-156,-42,-21,5,-30,-19]], // 4 Pavillons (vers Rocade) ↔ Collège Jean Jaurès
    ["4 pavillons vers rocade","leon blum#1",212,[4486531,-51515,35,137,-15,21,-10,2,-55,-12]], // 4 Pavillons (vers Rocade) ↔ Léon Blum
    ["45 eme parallele","45eme parallele",459,[4483213,-69280,-59,-207,-30,-74,-20,-31,-4,6,39,85,34,111]], // 45 ème Parallèle ↔ 45ème Parallèle
    ["45 eme parallele","cassin",316,[4483213,-69280,16,19,39,12,65,-2,32,-17,12,-13,5,-21,-7,-129]], // 45 ème Parallèle ↔ Cassin
    ["8 mai 1945#0","goya",363,[4485196,-51151,-4,30,80,21,-10,119,91,29,-8,56]], // 8 Mai 1945 ↔ Goya
    ["8 mai 1945#0","jean zay",429,[4485196,-51151,5,-25,79,21,9,-27,34,6,12,-94,5,-7,41,3,5,-41,14,-2,14,-92]], // 8 Mai 1945 ↔ Jean Zay
    ["8 mai 1945#1","jude",130,[4486556,-63840,40,10,46,32,-9,32]], // 8 Mai 1945 ↔ Jude
    ["8 mai 1945#1","simone de beauvoir",287,[4486556,-63840,40,10,46,32,-70,211]], // 8 Mai 1945 ↔ Simone de Beauvoir
    ["acacias#1","serpent",368,[4478955,-63683,69,129,3,21,15,16,54,146,9,8,0,12,41,25]], // Acacias ↔ Serpent
    ["afpa pessac","cap metiers",226,[4479014,-64977,32,-63,-124,-114]], // AFPA Pessac ↔ Cap Métiers
    ["allard","cimetiere nord av perie",268,[4487777,-59146,-200,79,3,46]], // Allard ↔ Cimetière Nord (av Périé)
    ["allard","cimetiere nord devant le cimetiere",253,[4487777,-59146,-37,20,-182,65]], // Allard ↔ Cimetière Nord (devant le Cimetière)
    ["allard","college rosa bonheur",332,[4487777,-59146,-71,32,-218,74]], // Allard ↔ Collège Rosa Bonheur
    ["allard","les jardins d auriane",397,[4487777,-59146,40,-23,16,-1,2,-42,-96,-351]], // Allard ↔ Les Jardins d'Auriane
    ["allee du nord","plaine des sports",434,[4491399,-74164,13,-36,-63,-42,-13,-6,-5,6,-8,-8,-76,43,-44,129,-9,12,-21,16,-11,-3,-18,-31]], // Allée du Nord ↔ Plaine des Sports
    ["allee du nord","saint aubin villepreux",325,[4491399,-74164,-102,307,4,19,-11,7,-5,31]], // Allée du Nord ↔ Saint-Aubin Villepreux
    ["allende#2","chateau de thouars",481,[4478872,-58701,31,-6,-26,-236,24,-5,-16,-122,-119,2]], // Allende ↔ Château de Thouars
    ["allende#2","piscine de thouars",480,[4478928,-58713,37,-10,2,-8,26,-17,80,-127,10,-6,7,-81,-6,-183,-38,15]], // Allende ↔ Piscine de Thouars
    ["alphonse dupeux","amedee larrieu",556,[4482925,-58708,32,106,44,94,10,18,44,36,-165,159,42,83]], // Alphonse Dupeux ↔ Amédée Larrieu
    ["alphonse dupeux","barriere de pessac",455,[4482925,-58708,-8,-26,-201,75,-129,-179]], // Alphonse Dupeux ↔ Barrière de Pessac
    ["alphonse dupeux","caserne boudet",173,[4482925,-58708,13,42,-119,47]], // Alphonse Dupeux ↔ Caserne Boudet
    ["alphonse dupeux","hotel de police",410,[4483056,-58845,61,111,259,-101]], // Alphonse Dupeux ↔ Hôtel de Police
    ["ambares eglise","clos saint pierre",196,[4492455,-48423,23,-17,13,4,74,162]], // Ambarès Eglise ↔ Clos Saint-Pierre
    ["amedee larrieu","albret",510,[4482932,-58212,50,93,254,-50,32,87,-16,68]], // Amédée Larrieu ↔ Albret
    ["anatole france#1","emile combes",337,[4484618,-53566,-15,48,10,7,-38,118,-7,86,6,15,12,4,69,-46]], // Anatole France ↔ Emile Combes
    ["anatole france#1","entre deux mers",244,[4484618,-53566,-73,231,10,7,-12,37]], // Anatole France ↔ Entre-Deux-Mers
    ["anciens abattoirs","gare de talence medoquine",588,[4481725,-60533,41,97,53,91,22,67,-92,78,5,21,-19,-8,-90,-84,-58,-14]], // Anciens Abattoirs ↔ Gare de Talence Médoquine
    ["andre ricard","cenon gare parc demi lune",261,[4485956,-53970,-9,79,-16,31,-14,10,-10,27,-20,20,-9,42,-54,-27]], // André Ricard ↔ Cenon Gare (Parc Demi-Lune)
    ["arc en ciel","college rosa bonheur",483,[4487604,-58559,-4,-63,-31,-6,-12,-19,-22,-408,-47,15]], // Arc-en-Ciel ↔ Collège Rosa Bonheur
    ["aristide briand#1","passage a niveau",386,[4482487,-62360,-26,-96,-142,11,-115,-19,-4,22]], // Aristide Briand ↔ Passage à niveau
    ["aristide briand#1","rue de paris",545,[4482487,-62360,15,78,15,248,19,102,-179,-27]], // Aristide Briand ↔ Rue de Paris
    ["arsonval","coulomb",420,[4477865,-65962,41,-33,-33,-78,-56,-173,17,-43,-2,-22,-12,-12,35,-73]], // Arsonval ↔ Coulomb
    ["arts metiers","inria",370,[4480574,-60040,20,12,6,-14,15,-7,14,13,99,-48,19,32,16,12,113,13]], // Arts & Métiers ↔ INRIA
    ["ausone#2","mesquita",389,[4489579,-50952,-30,-3,-32,27,-12,63,-36,70,-27,9,-52,52,-1,101,9,5]], // Ausone ↔ Mesquita
    ["avenue ausone","rue des ecus",533,[4487049,-59303,29,-111,103,-192,-37,-33,-20,-40,-75,-32,-41,-64,-5,3]], // Avenue Ausone ↔ Rue des Ecus
    ["avenue de capeyron","galaxie",331,[4486725,-71018,-76,11,-24,16,-21,44,-19,11,-28,66,-23,108]], // Avenue de Capeyron ↔ Galaxie
    ["avenue de la boetie vers cimetiere du taillan","college du taillan",582,[4490971,-67191,-11,111,-48,170,-2,10,6,8,157,6,47,12,8,-10,14,11,22,-12,41,2]], // Avenue de la Boétie (vers Cimetière du Taillan) ↔ Collège du Taillan
    ["avenue de la boetie","college du taillan",561,[4490970,-67165,-14,110,-44,145,-2,10,6,8,157,6,47,12,8,-10,14,11,22,-12,41,2]], // Avenue de la Boétie ↔ Collège du Taillan
    ["avenue de magudas","bosquets",371,[4485558,-65479,-78,-6,-5,70,-68,2,-8,194]], // Avenue de Magudas ↔ Bosquets
    ["avenue de magudas","les pins arret de descente",486,[4485558,-65479,20,-2,-29,-50,-10,-40,65,1,6,-8,13,-129,7,-217,-19,12]], // Avenue de Magudas ↔ Les Pins (arrêt de descente)
    ["avenue de magudas","strelitzias",323,[4485558,-65479,26,-3,10,37,22,17,1,91,40,9,-16,147]], // Avenue de Magudas ↔ Strélitzias
    ["avenue de magudas","vercors",248,[4485558,-65479,20,-2,-39,-76,0,-14,6,0,-5,-133,25,-6]], // Avenue de Magudas ↔ Vercors
    ["avenue du truc","merignac centre mediatheque",361,[4484375,-64554,-132,-102,-65,-6,6,-73,-6,-79]], // Avenue du Truc ↔ Mérignac Centre (Médiathèque)
    ["barriere de pessac boulevards","barriere de pessac",152,[4482574,-58996,-41,61,45,86]], // Barrière de Pessac (Boulevards) ↔ Barrière de Pessac
    ["barriere de pessac boulevards","caserne boudet",400,[4482593,-59010,-56,87,35,65,154,218]], // Barrière de Pessac (Boulevards) ↔ Caserne Boudet
    ["barriere de toulouse","taffanel",253,[4481401,-57292,-130,-61,-89,-23]], // Barrière de Toulouse ↔ Taffanel
    ["barriere du medoc boulevards","barriere du medoc av d eysines",174,[4485423,-59325,-105,-77,11,-51]], // Barrière du Médoc (Boulevards) ↔ Barrière du Médoc (av d'Eysines)
    ["barriere du medoc boulevards","barriere du medoc rue johnston",182,[4485423,-59325,-36,-27,-7,10,7,6,-49,80,-12,37]], // Barrière du Médoc (Boulevards) ↔ Barrière du Médoc (rue Johnston)
    ["barriere du medoc boulevards","parc bordelais#0",384,[4485423,-59325,-105,-77,73,-302]], // Barrière du Médoc (Boulevards) ↔ Parc Bordelais
    ["barriere du medoc rue johnston","arsenal",366,[4485326,-59219,-53,171,76,256]], // Barrière du Médoc (rue Johnston) ↔ Arsenal
    ["barriere judaique","moulin rouge",196,[4484013,-60036,-19,-247]], // Barrière Judaïque ↔ Moulin Rouge
    ["barriere saint augustin","allee des pins",476,[4483432,-59881,228,-21,-2,-150,-7,-65,-14,-63]], // Barrière Saint-Augustin ↔ Allée des Pins
    ["barriere saint augustin","barriere d ares",228,[4483432,-59881,-21,2,1,12,174,-17]], // Barrière Saint-Augustin ↔ Barrière d'Arès
    ["barriere saint augustin","stade chaban delmas",191,[4483323,-59781,1,-76,-117,11]], // Barrière Saint-Augustin ↔ Stade Chaban Delmas
    ["barriere saint medard","croix blanche",329,[4484656,-59763,-34,146,-65,147,-9,88]], // Barrière Saint-Médard ↔ Croix Blanche
    ["barthes","malartic",375,[4476896,-60234,27,118,173,69,13,92]], // Barthès ↔ Malartic
    ["barthes","malartic cote eau bourde",364,[4476896,-60234,27,118,173,69,12,79]], // Barthès ↔ Malartic (côté Eau Bourde)
    ["base sous marine","docteur vincent",409,[4487291,-55925,11,38,22,-8,17,25,19,12,185,64,-5,15,22,87]], // Base sous-marine ↔ Docteur Vincent
    ["bauducheu","ateliers",233,[4482243,-55944,-12,-12,-5,7,-11,-9,-78,115,-57,-31]], // Bauducheu ↔ Ateliers
    ["bazin","chemin bon air",487,[4482664,-65192,1,72,-72,5,-3,9,3,74,10,8,15,64,-118,-56,-68,-8]], // Bazin ↔ Chemin Bon Air
    ["beauregard","escarraguel pl escarraguel",531,[4500922,-52346,98,-153,-24,-48,-64,-77,46,-85,-56,-66,-1,-11,6,-6,-31,-35]], // Beauregard ↔ Escarraguel (Pl Escarraguel)
    ["bellevue#0","afpa pessac",211,[4479143,-65045,-13,62,-12,-1,-66,-68,-29,57]], // Bellevue ↔ AFPA Pessac
    ["bellevue#0","cap metiers",375,[4479144,-65098,1,37,-9,63,-6,15,-12,-1,-56,-60,-10,-8,-6,12,-124,-114]], // Bellevue ↔ Cap Métiers
    ["belvedere","pont saint jean rive droite",304,[4483540,-55121,-13,-13,9,-7,5,5,23,-20,56,-61,-91,-104,-17,30]], // Belvédère ↔ Pont Saint-Jean (rive droite)
    ["benedigues","montherlant rue racine",340,[4479914,-58335,-29,58,-10,5,1,8,-70,106,-32,37,-32,10,-57,-20]], // Bénédigues ↔ Montherlant (rue Racine)
    ["bernede","clemenceau#1",273,[4487829,-67790,-23,68,-189,12]], // Bernède ↔ Clemenceau
    ["berthelot","camille godard",332,[4485619,-57106,-110,-72,-2,-250]], // Berthelot ↔ Camille Godard
    ["berthelot","martinique",245,[4485619,-57106,-187,-119,8,-18]], // Berthelot ↔ Martinique
    ["bertin","caserne nansouty",298,[4481606,-56569,142,-47,121,0]], // Bertin ↔ Caserne Nansouty
    ["bertin","jardin des barrieres",419,[4481588,-56561,-145,64,-105,33,28,-160]], // Bertin ↔ Jardin des Barrières
    ["bibliotheque#0","quatre castera",363,[4480518,-54318,21,8,1,21,66,192,-2,35,-28,116,23,12]], // Bibliothèque ↔ Quatre Castéra
    ["bibliotheque#1","albret",420,[4483531,-58525,35,119,-8,19,-195,96,-56,35]], // Bibliothèque ↔ Albret
    ["bibliotheque#1","meriadeck",586,[4483531,-58525,-21,-75,12,-4,2,-15,96,-63,9,5,10,-18,142,-26,10,122,14,-2,8,93]], // Bibliothèque ↔ Mériadeck
    ["bibliotheque#1","meriadeck lateulade",542,[4483531,-58525,-21,-75,12,-4,2,-15,96,-63,9,5,10,-18,142,-26,10,122,41,-7]], // Bibliothèque ↔ Mériadeck Lateulade
    ["bibliotheque#1","patinoire",272,[4483498,-58686,17,58,9,9,96,-63,9,-23,-5,-24,-27,-50]], // Bibliothèque ↔ Patinoire
    ["bibliotheque#1","prefecture",282,[4483498,-58686,17,58,9,9,96,-63,9,5,10,-18,62,-12]], // Bibliothèque ↔ Préfecture
    ["bierge","bruca",387,[4477279,-57719,-2,-64,-22,-67,2,-19,216,-78,-3,-13]], // Bierge ↔ Bruca
    ["bierge","jules simon",494,[4477279,-57719,1,39,47,28,107,40,66,-85,-8,-40,-3,-60,21,-4,44,69]], // Bierge ↔ Jules Simon
    ["billaudel rue malbec","lafontaine",474,[4482486,-56355,-20,-30,167,-157,-34,-187,59,-16]], // Billaudel (rue Malbec) ↔ Lafontaine
    ["bleuets","caillou",482,[4485695,-63603,-11,-65,5,-2,72,38,236,204,5,2,5,-23]], // Bleuets ↔ Caillou
    ["bleuets","saint saens",527,[4485695,-63603,-5,-22,-31,19,-19,83,-48,122,-144,-61,-9,39,-81,-27]], // Bleuets ↔ Saint-Saëns
    ["boiron","stade cap de bos",569,[4478764,-67787,-11,-25,115,-112,-128,-261,8,-18,43,-30,56,-18]], // Boiron ↔ Stade Cap de Bos
    ["bois de mont","tristan",365,[4489846,-70695,-18,-25,8,-11,0,-10,-66,-283,72,-17]], // Bois de Mont ↔ Tristan
    ["bois fleuri","lauriers",286,[4487647,-51829,15,-96,173,90]], // Bois Fleuri ↔ Lauriers
    ["bois fleuri","lauriers tram a",352,[4487647,-51829,15,-96,229,118]], // Bois Fleuri ↔ Lauriers (Tram A)
    ["bordeaux carreire","terminus hopital pellegrin entree est",148,[4482741,-60181,-25,19,-9,-12,82,-53]], // Bordeaux Carreire ↔ Terminus Hôpital Pellegrin (Entrée Est)
    ["boulevard du haut livrac","cazalet",342,[4479804,-67330,49,-16,64,274,17,11,-4,45]], // Boulevard du Haut Livrac ↔ Cazalet
    ["boulevard du haut livrac","cazalet av de beutre",409,[4479804,-67330,49,-16,69,281,12,4,6,-10,39,-103]], // Boulevard du Haut Livrac ↔ Cazalet (av de Beutre)
    ["boulevard du haut livrac","haut livrac",393,[4479866,-67710,-8,104,-8,16,216,15,7,-18,19,-6,-5,21]], // Boulevard du Haut Livrac ↔ Haut Livrac
    ["boulevard george v","barriere de pessac",292,[4482406,-58720,124,-192,57,74]], // Boulevard George V ↔ Barrière de Pessac
    ["boulevard george v","caserne boudet",512,[4482406,-58720,124,-192,34,38,162,234]], // Boulevard George V ↔ Caserne Boudet
    ["boulevard pierre 1er","poincare",504,[4485998,-58943,36,1,80,-28,-45,-298,116,-29]], // Boulevard Pierre 1er ↔ Poincaré
    ["boulevard trarieux","le rouzic",347,[4484160,-54645,-10,-35,-9,-10,3,-7,-37,-138,123,-148]], // Boulevard Trarieux ↔ Le Rouzic
    ["bourse du travail","albret",134,[4483216,-57857,36,-157]], // Bourse du Travail ↔ Albret
    ["bourse du travail","costedoat",131,[4483210,-57830,-9,39,-86,-24]], // Bourse du Travail ↔ Costedoat
    ["bourse du travail","hopital saint andre",152,[4483216,-57857,-15,66,88,-13]], // Bourse du Travail ↔ Hôpital Saint-André
    ["bourse du travail","republique#1",415,[4483216,-57857,-15,66,276,-45,-2,-64]], // Bourse du Travail ↔ République
    ["boutaut","cracovie tram c et e",296,[4486857,-57742,10,129,174,-19]], // Boutaut ↔ Cracovie (Tram C et E)
    ["breteil","biblanque",117,[4488021,-64745,-46,-10,-34,67]], // Breteil ↔ Biblanque
    ["brignon","bruca",493,[4477547,-57505,-113,-107,67,-88,-9,-37,-3,-60,21,-4,-40,-159]], // Brignon ↔ Bruca
    ["brignon","jules simon",500,[4477547,-57505,-113,-107,66,-85,-8,-40,-3,-60,21,-4,11,24,76,104]], // Brignon ↔ Jules Simon
    ["brisson","espagnet",259,[4494521,-53926,116,99,-8,44,-32,81]], // Brisson ↔ Espagnet
    ["brun","boulevard roosevelt",494,[4481729,-57223,-25,1,-16,-180,18,-182,-18,-25,-89,141]], // Brun ↔ Boulevard Roosevelt
    ["brun","pont de cauderes",372,[4481729,-57223,-25,1,-16,-188,18,-174,-23,-31,-5,-23]], // Brun ↔ Pont de Cauderès
    ["brutails","carriet",354,[4488435,-52362,4,-28,-15,-4,-23,7,-30,-27,-44,-17,-7,-13,-22,9,15,65,-17,98,-8,10,3,15]], // Brutails ↔ Carriet
    ["brutails","magendie",363,[4488435,-52362,4,-28,-15,-4,-23,7,-30,-27,-44,-17,-7,-13,-22,9,-48,-185,8,-10]], // Brutails ↔ Magendie
    ["cage verte","carton",372,[4485902,-62925,-17,47,-2,-26,-17,-38,-76,-37,-116,-79,10,-48]], // Cage Verte ↔ Carton
    ["cage verte","docteur bert",384,[4485902,-62925,-12,44,-6,14,-6,-1,-227,-96,-15,75]], // Cage Verte ↔ Docteur Bert
    ["cage verte","fragonard",509,[4485912,-62953,29,-127,-6,-3,9,-55,-238,-61,13,-103]], // Cage Verte ↔ Fragonard
    ["cailleau","montsouris",422,[4490446,-51802,11,-6,13,-21,11,12,44,2,27,20,-5,45,7,12,-1,12,79,12,85,-5,3,53]], // Cailleau ↔ Montsouris
    ["camparian#1","bruca",466,[4477233,-57706,36,25,23,3,30,23,19,-104,5,-145,127,-43,-3,-13]], // Camparian ↔ Bruca
    ["camparian#1","jules simon",520,[4477233,-57706,36,25,23,3,22,20,120,46,66,-85,-8,-40,-3,-60,21,-4,44,69]], // Camparian ↔ Jules Simon
    ["campeyraut","bordeaux carreire",342,[4482625,-59717,-53,-64,5,-63,-15,-14,11,-16,76,-188]], // Campeyraut ↔ Bordeaux Carreire
    ["campeyraut","privat",271,[4482625,-59717,-41,-44,-19,-31,-3,-17,-10,-3,-18,-32,-42,-44,5,-3,-44,-41]], // Campeyraut ↔ Privat
    ["campeyraut","stade chaban delmas",394,[4482796,-59685,65,111,72,-108,50,65,30,-45,10,4,17,-26]], // Campeyraut ↔ Stade Chaban Delmas
    ["campus carreire","tauzin",565,[4482225,-60604,35,59,12,78,-238,116,14,22,20,55,14,47,-1,19,29,6]], // Campus Carreire ↔ Tauzin
    ["cantinolle tram d","cantinolle",87,[4489177,-66752,42,-27,-3,-13,17,-18]], // Cantinolle (tram D) ↔ Cantinolle
    ["cap de haut","moulin a vent",205,[4488537,-63660,-28,1,63,-162,-13,-30]], // Cap de Haut ↔ Moulin à Vent
    ["cap de haut","pompe au breteil",442,[4488624,-63675,-37,9,-7,-134,-26,-64,-18,-79,0,-163,37,-16]], // Cap de Haut ↔ Pompe au Breteil
    ["capella","venteille",285,[4487276,-68781,-7,115,-20,30,-37,-16,-93,-66]], // Capella ↔ Venteille
    ["capelle#1","racine#0",353,[4486377,-61734,-55,-93,-68,159,-63,109]], // Capelle ↔ Racine
    ["capucins","victoire somme",361,[4482990,-56841,32,-148,-14,-1,13,-111,-9,-4,-14,-133,-15,3]], // Capucins ↔ Victoire (Somme)
    ["cardinal","rosa bonheur",376,[4480542,-62619,50,-39,42,-73,51,-69,2,-9,-38,-133,31,-22]], // Cardinal ↔ Rosa Bonheur
    ["carnot#0","castaing",520,[4479575,-67240,-62,70,33,109,-123,101,117,154]], // Carnot ↔ Castaing
    ["carnot#0","cazalet bd du haut livrac",386,[4479605,-67265,80,-27,25,98,45,-25,74,2,49,-18,5,24]], // Carnot ↔ Cazalet (Bd du Haut Livrac)
    ["caserne nansouty","amedee saint germain",569,[4481873,-56616,-114,-2,-86,23,21,61,27,56,33,45,43,46,-27,73,28,66]], // Caserne Nansouty ↔ Amédée Saint-Germain
    ["caserne nansouty","beautiran",302,[4482029,-56909,-15,-56,116,-64,37,-108,-18,-7]], // Caserne Nansouty ↔ Beautiran
    ["caserne nansouty","brun",464,[4482029,-56909,-85,-313,-28,-10,-150,7]], // Caserne Nansouty ↔ Brun
    ["caserne nansouty","nansouty",308,[4482029,-56909,-85,-313,-37,-9]], // Caserne Nansouty ↔ Nansouty
    ["caserne nansouty","rue de begles",391,[4481873,-56616,-114,-2,-86,23,42,106,44,63]], // Caserne Nansouty ↔ Rue de Bègles
    ["cassagne","jean zay",290,[4485332,-51681,90,26,16,22,2,34,-22,168]], // Cassagne ↔ Jean Zay
    ["castelnau","pichey",296,[4484264,-66937,-50,101,-22,62,-30,5,-8,29,2,14,-63,22]], // Castelnau ↔ Pichey
    ["castillon","boulevard pierre 1er",472,[4485982,-59241,87,-27,45,298,-80,28,-36,-1]], // Castillon ↔ Boulevard Pierre 1er
    ["cazalet bd du haut livrac","cazalet av de beutre",241,[4479883,-67211,34,139,12,11,11,-10,39,-103]], // Cazalet (Bd du Haut Livrac) ↔ Cazalet (av de Beutre)
    ["cazalet bd du haut livrac","haut livrac",460,[4479883,-67211,-30,-135,192,-65,43,-152]], // Cazalet (Bd du Haut Livrac) ↔ Haut Livrac
    ["centre administratif","ermitage",262,[4486677,-59601,-17,19,-48,-294]], // Centre Administratif ↔ Ermitage
    ["centre administratif","lafont",473,[4486687,-59609,82,-60,84,-43,3,-10,-23,-111,145,-68]], // Centre Administratif ↔ Lafont
    ["chanzy","r p a mieux vivre",249,[4486615,-59046,47,12,89,-29,8,18,63,42]], // Chanzy ↔ R.P.A Mieux Vivre
    ["charles peguy","ciceron",532,[4480675,-65717,43,-19,-82,-402,-27,5,-34,22,-69,-12]], // Charles Péguy ↔ Cicéron
    ["charles perrault","la prairie#0",277,[4486504,-49795,99,-8,93,-48,16,10,12,40]], // Charles Perrault ↔ La Prairie
    ["charles perrens","campeyraut",352,[4482383,-59988,140,130,28,44,11,5,3,17,19,31,41,44]], // Charles Perrens ↔ Campeyraut
    ["charles perrens","campus carreire",369,[4482296,-60162,-18,-67,-8,-99,4,-121,-11,-83,-38,-72]], // Charles Perrens ↔ Campus Carreire
    ["chataigniers","mairie de saint aubin",419,[4491163,-71932,5,-60,73,30,45,-304,11,-14,-8,-31]], // Châtaigniers ↔ Mairie de Saint-Aubin
    ["chateau dillon","lycee jean monnet",338,[4491913,-63471,-137,65,-13,-12,-140,-39]], // Château Dillon ↔ Lycée Jean Monnet
    ["chemin long","parc peyandreau",335,[4483400,-66930,-25,129,-9,23,-21,23,13,83,-6,64,50,-28]], // Chemin Long ↔ Parc Peyandreau
    ["chevalier","croix blanche",380,[4484217,-59369,-6,-49,8,-6,294,60]], // Chevalier ↔ Croix Blanche
    ["chevalier","kieser",109,[4484217,-59369,-6,-49,8,-6,52,13]], // Chevalier ↔ Kieser
    ["cigales#0","desclaux",424,[4485663,-49101,-24,-137,3,-48,21,-47,32,-40,46,-141,28,-8,20,21]], // Cigales ↔ Desclaux
    ["cigales#0","mairie d artigues",538,[4485663,-49081,1,-11,102,44,174,51,9,-102,42,-116,-16,-27]], // Cigales ↔ Mairie d'Artigues
    ["cigales#0","taris",524,[4485663,-49101,-24,-137,3,-48,17,-39,-6,-6,-160,-30,-135,16]], // Cigales ↔ Taris
    ["cimetiere balanguey","gare routiere av du gal de gaulle",456,[4489544,-72616,28,304,69,-21,22,127,7,20,12,-11]], // Cimetière Balanguey ↔ Gare Routière (av du Gal de Gaulle)
    ["cimetiere d eysines","sirtema",331,[4488513,-65718,11,64,-28,33,-81,68,-111,61]], // Cimetière d'Eysines ↔ Sirtema
    ["cimetiere de lormont","lauriers",351,[4487825,-52088,22,14,-33,78,-44,-13,-16,131,81,43]], // Cimetière de Lormont ↔ Lauriers
    ["cimetiere de lormont","lauriers tram a",328,[4487825,-52088,52,36,51,12,-54,225,17,8]], // Cimetière de Lormont ↔ Lauriers (Tram A)
    ["cimetiere nord av perie","college rosa bonheur",138,[4487580,-59021,-3,-46,-89,27]], // Cimetière Nord (av Périé) ↔ Collège Rosa Bonheur
    ["cimetiere nord devant le cimetiere","cimetiere nord av perie",58,[4487558,-59061,19,-6,3,46]], // Cimetière Nord (devant le Cimetière) ↔ Cimetière Nord (av Périé)
    ["cimetiere nord","cimetiere nord av perie",104,[4487636,-59088,-59,21,3,46]], // Cimetière Nord ↔ Cimetière Nord (av Périé)
    ["cimetiere nord","cimetiere nord devant le cimetiere",90,[4487636,-59088,-78,27]], // Cimetière Nord ↔ Cimetière Nord (devant le Cimetière)
    ["cimetiere nord","college rosa bonheur",169,[4487636,-59088,-148,48]], // Cimetière Nord ↔ Collège Rosa Bonheur
    ["cimetiere nord","les jardins d auriane",560,[4487636,-59088,104,-38,77,-43,16,-1,2,-42,-96,-351]], // Cimetière Nord ↔ Les Jardins d'Auriane
    ["cimetiere","avenue jean jaures",375,[4481084,-62529,59,67,-135,60,-94,64,-9,-18]], // Cimetière ↔ Avenue Jean Jaurès
    ["cite cairon","pont de cauderes",339,[4481877,-57903,-189,294,-10,-29]], // Cité Cairon ↔ Pont de Cauderès
    ["cite sncf","capelle#0",269,[4481834,-54626,-119,-224,42,-16]], // Cité SNCF ↔ Capelle
    ["cite sncf","carle vernet",528,[4481834,-54626,-119,-224,266,-106]], // Cité SNCF ↔ Carle Vernet
    ["claudeville","bordeaux plage",542,[4487387,-57830,-6,-93,5,-6,293,-25,34,1,9,18,-10,96]], // Claudeville ↔ Bordeaux Plage
    ["clave","gare de pessac alouette",343,[4479085,-65644,-11,-80,47,-27,49,-15,97,13,52,-5]], // Clavé ↔ Gare de Pessac Alouette
    ["clemenceau#1","mairie du haillan",399,[4487584,-67704,-47,16,-37,27,-179,-144,-48,40,2,9]], // Clemenceau ↔ Mairie du Haillan
    ["clemenceau#1","rue du medoc",367,[4487617,-67710,-18,3,0,-15,62,-109,11,-30,4,-88,8,-12,-6,-29,32,-15,42,-34]], // Clemenceau ↔ Rue du Médoc
    ["clemenceau#2","fenelon",398,[4491199,-51279,-141,-98,-81,-86,-36,-47,-4,-46,7,-21]], // Clemenceau ↔ Fénelon
    ["clos saint pierre","clos du prieure",374,[4492565,-48274,-74,-162,-13,-4,-100,57,-44,9,-33,-2]], // Clos Saint-Pierre ↔ Clos du Prieuré
    ["colibris#1","croix vieille",554,[4491483,-73138,-58,128,-35,196,-19,49,-83,74,-14,0,-17,-126]], // Colibris ↔ Croix Vieille
    ["college albert camus rue du moulin a vent","gasteboy",279,[4488568,-64417,-7,27,81,42,20,3,88,69,12,-29]], // Collège Albert Camus (rue du Moulin à Vent) ↔ Gasteboy
    ["college albert camus rue du moulin a vent","pompe au breteil",245,[4488551,-64349,-21,83,6,160,42,-19]], // Collège Albert Camus (rue du Moulin à Vent) ↔ Pompe au Breteil
    ["college claude masse","ambares eglise",444,[4492768,-48321,-47,-23,-11,-16,-4,-26,-49,-5,-38,-56,-8,-2,-36,-43,-5,18,-20,6,-14,-11,-13,27,-28,4,-4,12,-13,-4,-23,17]], // Collège Claude Massé ↔ Ambarès Eglise
    ["college emile zola","le haillan centre",482,[4487142,-67374,59,-32,29,-38,9,-1,28,-48,55,-53,36,-21,2,-18,19,-9,9,-70,-9,-17,20,-61,-18,-14]], // Collège Emile Zola ↔ Le Haillan Centre
    ["college gerard philipe","unitec tram b",438,[4479949,-62392,-136,72,-18,26,-43,117,-50,49,-10,-8,-16,12,-25,-38]], // Collège Gérard Philipe ↔ Unitec (Tram B)
    ["college jean jaures","4 pavillons vers buttiniere",394,[4486285,-51415,30,19,21,-5,156,42,1,-6,48,10,10,-2,22,-25,-15,-63]], // Collège Jean Jaurès ↔ 4 Pavillons (vers Buttinière)
    ["college jean jaures","brossolette#0",83,[4486285,-51415,21,9,-12,72]], // Collège Jean Jaurès ↔ Brossolette
    ["college l lenoir","jardin botanique",441,[4484049,-55378,-2,-50,36,-3,157,-189,27,44,57,-70]], // Collège L. Lenoir ↔ Jardin Botanique
    ["college l lenoir","jardin botanique terminus",406,[4484049,-55378,-2,-50,36,-3,157,-189,27,44,33,-40]], // Collège L. Lenoir ↔ Jardin Botanique Terminus
    ["college manon cormier","lannes college manon cormier",134,[4489999,-50782,31,15,5,13,-17,104]], // Collège Manon Cormier ↔ Lannes (Collège Manon Cormier)
    ["college niki de saint phalle","pont de la maye vers courrejean",207,[4478061,-56599,56,11,57,-11,-11,99]], // Collège Niki de Saint Phalle ↔ Pont de la Maye (vers Courréjean)
    ["college niki de saint phalle","pont de la maye vers lycee v havel",199,[4478061,-56599,56,11,57,-11,-10,90]], // Collège Niki de Saint Phalle ↔ Pont de la Maye (vers Lycée V. Havel)
    ["college pablo neruda","ecole ferdinand buisson",518,[4479597,-56099,-52,196,-1,21,9,20,15,15,133,68,123,18]], // Collège Pablo Neruda ↔ Ecole Ferdinand Buisson
    ["college pablo neruda","parc de mussonville",371,[4479597,-56099,-52,196,-15,26,-142,-103]], // Collège Pablo Neruda ↔ Parc de Mussonville
    ["combes#0","eymet",464,[4483367,-54085,-23,33,96,166,40,-36,34,65,26,28,16,-16,22,-44,20,-11,6,16]], // Combes ↔ Eymet
    ["combes#1","centre administratif",344,[4486795,-59806,28,-19,10,1,23,102,-3,10,-84,43,-82,60]], // Combes ↔ Centre Administratif
    ["combes#1","rue des ecus",300,[4486799,-59809,24,-16,10,1,23,102,7,6,89,-26,51,-30]], // Combes ↔ Rue des Ecus
    ["compostelle","la paillere",531,[4479333,-60673,-12,87,-28,45,137,35,87,61,30,39,23,-126]], // Compostelle ↔ La Paillère
    ["costedoat","albret",287,[4483115,-57815,86,24,51,-223]], // Costedoat ↔ Albret
    ["costedoat","victoire",387,[4483115,-57815,-32,-20,7,261,25,77,15,28,-12,57]], // Costedoat ↔ Victoire
    ["cote de la garonne","acacias#0",290,[4488747,-52984,-102,-5,-2,12,-103,-14,-10,63]], // Côte de la Garonne ↔ Acacias
    ["courteault","eglise saint augustin",434,[4483519,-60812,-251,-150,4,-52,-39,-20,12,-52]], // Courteault ↔ Eglise Saint-Augustin
    ["cracovie","boutaut",184,[4486941,-57621,-74,8,-10,-129]], // Cracovie ↔ Boutaut
    ["cracovie","place ravezies",174,[4486941,-57621,-74,8,1,27,-64,7]], // Cracovie ↔ Place Ravezies
    ["cracovie","place ravezies cote parc relais",252,[4486941,-57621,-225,25]], // Cracovie ↔ Place Ravezies (côté Parc Relais)
    ["cracovie","rigal",435,[4486941,-57621,-137,15,-14,-357]], // Cracovie ↔ Rigal
    ["croix de leysotte","bontemps",347,[4480691,-57316,75,-34,-65,-274,-29,8]], // Croix de Leysotte ↔ Bontemps
    ["croustet","lycee daguin",347,[4483717,-64639,9,-62,-9,-16,-3,-22,-7,-253,5,-24,-5,-13,16,-28]], // Croustet ↔ Lycée Daguin
    ["dassault#1","aeroparc av dassault",298,[4484779,-69204,21,11,19,-1,179,-63,-3,-18,6,-16,0,-21]], // Dassault ↔ Aéroparc (av Dassault)
    ["dauphine#1","cauderan centre",314,[4485176,-61106,13,-35,103,46,61,55,41,-86]], // Dauphine ↔ Caudéran Centre
    ["dauphine#1","place ozanam",454,[4485176,-61106,8,-22,-39,4,-38,-34,-35,-77,3,-85,-23,-79,-69,21,-13,-64]], // Dauphine ↔ Place Ozanam
    ["demosthene","vigneau",552,[4482668,-66120,-13,-269,60,-28,175,-34,21,86]], // Demosthène ↔ Vigneau
    ["desbats","ausone#1",367,[4480376,-61810,-50,166,-197,-64]], // Desbats ↔ Ausone
    ["descartes","ciceron",517,[4480560,-65668,-55,19,-4,-70,7,-64,66,-303,1,-25,-69,-12]], // Descartes ↔ Cicéron
    ["deveaux rue deveaux","deveaux rue pasteur",135,[4484801,-62285,-66,-12,1,-76]], // Deveaux (rue Deveaux) ↔ Deveaux (rue Pasteur)
    ["deveaux rue deveaux","tridons",322,[4484801,-62285,66,-19,78,42,2,47,26,54,10,82]], // Deveaux (rue Deveaux) ↔ Tridons
    ["diane#1","germaine tillion",599,[4486614,-65502,-106,25,-44,-14,-39,-57,-47,-128,-17,-22,-19,-6,-43,248]], // Diane ↔ Germaine Tillion
    ["docteur ferie","bois de mont",543,[4490056,-71106,-64,34,48,211,-115,61,-80,70,-9,-1,-8,11,18,25]], // Docteur Férié ↔ Bois de Mont
    ["domaine de la plantation","denis papin",218,[4478960,-53540,75,19,39,0,18,21,14,0,-6,21,2,37]], // Domaine de la Plantation ↔ Denis Papin
    ["domaine de la plantation","rives d arcins",488,[4478960,-53540,75,19,39,0,18,21,14,0,-7,35,37,362]], // Domaine de la Plantation ↔ Rives d'Arcins
    ["domaine de la plantation","rives d arcins rue denis papin",433,[4478960,-53540,75,19,39,0,18,21,14,0,-7,35,31,293]], // Domaine de la Plantation ↔ Rives d'Arcins (rue Denis Papin)
    ["domaine de moulerin","domaine de muscadet",78,[4491598,-50948,57,57]], // Domaine de Moulerin ↔ Domaine de Muscadet
    ["domaine du gay","taris",472,[4485244,-48760,-21,-84,-50,-115,-38,-160,-19,-45,88,-91]], // Domaine du Gay ↔ Taris
    ["donnet","ateliers",594,[4482215,-56297,27,77,-127,145,101,106,-1,11,-78,115,-57,-31]], // Donnet ↔ Ateliers
    ["donnet","bauducheu",398,[4482215,-56297,27,77,-68,78,92,197,-3,21,-21,-21]], // Donnet ↔ Bauducheu
    ["dorgeles#1","rene coty",314,[4484364,-65363,-123,2,-101,-9,-12,-13,-12,11,-27,2]], // Dorgelès ↔ René Coty
    ["dubedout","auditorium de floirac",360,[4484700,-51146,19,195,39,254]], // Dubedout ↔ Auditorium de Floirac
    ["ducasse","stade daugere",210,[4488327,-59366,31,-21,7,10,12,-3,51,80,46,42]], // Ducasse ↔ Stade Daugère
    ["ducourneau","college ausone",431,[4486874,-59189,90,-63,57,3,3,-12,11,-1,34,-128,65,-126]], // Ducourneau ↔ Collège Ausone
    ["ducourneau","la vache",408,[4486874,-59189,90,-63,29,-2,28,5,7,10,10,-6,39,19,132,84]], // Ducourneau ↔ La Vache
    ["dupuy verdun","avenue du truc",416,[4484127,-64410,7,-30,46,16,18,-90,10,-12,151,62,16,-90]], // Dupuy-Verdun ↔ Avenue du Truc
    ["dupuy verdun","merignac centre",250,[4484127,-64410,51,-252,-38,-13]], // Dupuy-Verdun ↔ Mérignac Centre
    ["durcy","eglise de begles av jeanne d arc",282,[4479948,-54412,37,103,44,-51,100,-75]], // Durcy ↔ Eglise de Bègles (av Jeanne d'Arc)
    ["dutertre","lycee camille jullian",510,[4484099,-59260,-23,34,18,209,165,41,101,56]], // Dutertre ↔ Lycée Camille Jullian
    ["dutertre","piscine judaique",151,[4484099,-59260,-23,34,12,144]], // Dutertre ↔ Piscine Judaïque
    ["dutertre","saint bruno hotel de region",416,[4484072,-59282,4,56,-249,156,26,80]], // Dutertre ↔ Saint-Bruno - Hôtel de Région
    ["ecole arnaud lafon","zi chemin long",486,[4482848,-66700,42,249,70,-10,111,-40,4,-22,21,5,29,-11]], // Ecole Arnaud Lafon ↔ ZI Chemin Long
    ["ecole d architecture","la paillere",320,[4479328,-60510,72,15,35,15,59,38,46,49,10,-20,9,-52]], // Ecole d'Architecture ↔ La Paillère
    ["ecole ferdinand buisson","lenine",387,[4479824,-55761,-114,-15,-110,-59,-14,4,-4,12,4,19,46,89]], // Ecole Ferdinand Buisson ↔ Lénine
    ["eglise de begles av jeanne d arc","le dorat 2",472,[4480129,-54435,-64,44,-14,-51,-9,-120,-123,36,-25,-139]], // Eglise de Bègles (av Jeanne d'Arc) ↔ Le Dorat 2
    ["eglise de gradignan","gradignan centre",358,[4477238,-61441,36,13,-85,382]], // Eglise de Gradignan ↔ Gradignan Centre
    ["eglise de saint aubin","la haude",357,[4491190,-72486,8,-30,51,-3,12,-12,17,-91,21,-60,-2,-19,56,-44,24,-31]], // Eglise de Saint-Aubin ↔ La Haude
    ["eglise de saint aubin","mairie de saint aubin",240,[4491188,-72417,5,-92,12,-11,44,1,24,63,3,56]], // Eglise de Saint-Aubin ↔ Mairie de Saint-Aubin
    ["eglise de saint medard","mairie de saint medard",81,[4489548,-71838,3,59,31,-1]], // Eglise de Saint-Médard ↔ Mairie de Saint-Médard
    ["eglise romane","desclaux",100,[4485780,-49591,-28,49,36,40]], // Eglise Romane ↔ Desclaux
    ["eglise romane","mairie d artigues",394,[4485780,-49591,-28,49,84,91,98,127,41,82]], // Eglise Romane ↔ Mairie d'Artigues
    ["emile zola","centre de secours",223,[4490375,-50448,45,30,43,54,41,27,20,-21,8,-29]], // Emile Zola ↔ Centre de Secours
    ["ernest renan","arsenal",481,[4485204,-59149,-27,88,10,3,60,-85,84,304,18,47]], // Ernest Renan ↔ Arsenal
    ["ernest renan","barriere du medoc boulevards",356,[4485204,-59149,40,-104,79,-129,57,40,7,-10,36,27]], // Ernest Renan ↔ Barrière du Médoc (Boulevards)
    ["ernest renan","parc bordelais boulevards",367,[4485204,-59149,35,-94,75,-128,0,-18,-109,-83]], // Ernest Renan ↔ Parc Bordelais (Boulevards)
    ["escarraguel pl escarraguel","10 mai 1981",364,[4500896,-52827,31,35,-15,9,-18,61,-135,202,13,27]], // Escarraguel (Pl Escarraguel) ↔ 10 Mai 1981
    ["escarraguel rue cezanne","escarraguel pl escarraguel",51,[4500890,-52878,-10,35,16,16]], // Escarraguel (rue Cézanne) ↔ Escarraguel (Pl Escarraguel)
    ["europarc","coeur bersol",497,[4478118,-65417,31,-34,73,101,97,97,-1,33,-30,29,-86,126]], // Europarc ↔ Coeur Bersol
    ["eysines centre","biblanque",419,[4488280,-64804,-52,-19,-168,82,-85,-14,-34,67]], // Eysines Centre ↔ Biblanque
    ["facultes droit et lettres","unitec tram b",275,[4479823,-61955,-33,-11,2,-7,-16,-15,-73,-107,-22,0,-6,-11,1,-18,-25,-38]], // Facultés Droit et Lettres ↔ Unitec (Tram B)
    ["farvarque","bontemps",455,[4480459,-57346,2,-25,-30,-198,85,-1,156,-46]], // Farvarque ↔ Bontemps
    ["fauvettes#0","desclaux",392,[4485990,-49794,-100,65,-36,33,-48,59,-54,95,36,40]], // Fauvettes ↔ Desclaux
    ["fonfrede","beautiran",466,[4482506,-57259,-138,1,-35,189,-137,-56]], // Fonfrède ↔ Beautiran
    ["fonfrede","lafontaine",313,[4482549,-57256,22,1,-3,282,57,23]], // Fonfrède ↔ Lafontaine
    ["foret du bourgailh","parc d espagne",280,[4479974,-68496,-32,16,-23,-4,-5,13,-74,27,-98,59]], // Forêt du Bourgailh ↔ Parc d'Espagne
    ["foret du bourgailh","villeneuve",448,[4479974,-68496,-38,16,4,17,-9,13,-21,-5,-30,7,-87,45,-3,27,49,141,-5,4,23,69]], // Forêt du Bourgailh ↔ Villeneuve
    ["france alouette","le trinquet",423,[4479956,-66242,-8,-22,0,-50,21,-6,182,-24,65,12,54,23]], // France Alouette ↔ Le Trinquet
    ["franklin","peydavant",441,[4479895,-58658,-11,153,5,10,97,12,9,-6,7,7,97,-11,60,-24]], // Franklin ↔ Peydavant
    ["frankton","pepinieres",528,[4490740,-62190,51,-60,26,-9,113,-83,13,31,17,17,-6,26,13,9,3,-13,15,2,102,27,4,-62]], // Frankton ↔ Pépinières
    ["freres robinson","centre des impots",277,[4485121,-65540,153,9,94,20]], // Frères Robinson ↔ Centre des Impôts
    ["g faure","jeunesse",406,[4485156,-63455,19,-159,-153,-53,17,-95,-21,-15]], // G. Fauré ↔ Jeunesse
    ["g faure","trianon",279,[4485156,-63455,19,-159,34,-186]], // G. Fauré ↔ Trianon
    ["gadret","bords de jalles",135,[4488751,-70425,65,6,2,15,8,7,-4,50]], // Gadret ↔ Bords de Jalles
    ["galerie des beaux arts","gambetta meriadeck",182,[4483909,-58166,-25,-13,23,-8,-17,-108,34,-7]], // Galerie des Beaux Arts ↔ Gambetta Mériadeck
    ["galerie des beaux arts","gambetta meriadeck terminus",351,[4483909,-58166,-25,-13,23,-8,-17,-108,47,-10,-16,-166,20,-4]], // Galerie des Beaux Arts ↔ Gambetta Mériadeck (Terminus)
    ["galerie des beaux arts","meriadeck",317,[4483878,-58177,-37,15,-28,-346]], // Galerie des Beaux Arts ↔ Mériadeck
    ["galerie des beaux arts","meriadeck lateulade",422,[4483878,-58177,-37,15,-36,-439,27,-5]], // Galerie des Beaux Arts ↔ Mériadeck Lateulade
    ["galerie des beaux arts","palais de justice",190,[4483878,-58177,-167,56]], // Galerie des Beaux Arts ↔ Palais de Justice
    ["galerie des beaux arts","saint seurin",451,[4483909,-58166,-25,-13,160,-51,-3,-20,108,-55,-9,-119]], // Galerie des Beaux Arts ↔ Saint-Seurin
    ["galerie tatry","sousa mendes",261,[4486391,-57348,27,-32,89,147,-6,17,10,20,-9,40]], // Galerie Tatry ↔ Sousa Mendès
    ["gambetta","gambetta meriadeck",109,[4484086,-58091,-43,6,-26,-16,-4,-35]], // Gambetta ↔ Gambetta Mériadeck
    ["gambetta","gambetta meriadeck terminus",448,[4484086,-58091,-29,7,-4,-15,-9,-131,-11,-73,-6,-24,-22,3,7,-20,-13,-140,-58,9]], // Gambetta ↔ Gambetta Mériadeck (Terminus)
    ["gambetta","saint seurin",334,[4484086,-58091,74,-17,3,-11,-23,-305]], // Gambetta ↔ Saint-Seurin
    ["gare de blanquefort av du 11 novembre","gare de blanquefort tram e",351,[4491616,-62730,10,-6,10,13,42,28,41,59,21,68,12,158,20,1]], // Gare de Blanquefort (av du 11 Novembre) ↔ Gare de Blanquefort (Tram E)
    ["gare de bruges rue louis fleurenceau","gare de bruges",202,[4488546,-60994,16,-97,105,51]], // Gare de Bruges (rue Louis Fleurenceau) ↔ Gare de Bruges
    ["gare de bruges rue louis fleurenceau","gare de bruges tram e",292,[4488546,-60994,16,-97,136,65,48,9]], // Gare de Bruges (rue Louis Fleurenceau) ↔ Gare de Bruges (tram E)
    ["gare de bruges tram e","gare de bruges terminus",26,[4488746,-61017,-22,0]], // Gare de Bruges (tram E) ↔ Gare de Bruges (Terminus)
    ["gare routiere av du gal de gaulle","mairie de saint medard",455,[4489648,-72166,-68,68,-25,102,-7,88,3,129,53,-2,40,-11]], // Gare Routière (av du Gal de Gaulle) ↔ Mairie de Saint-Médard
    ["gare saint jean arret de descente","bauducheu",510,[4482486,-55705,56,21,14,-17,2,-24,-46,-5,-91,-48,-19,-13,-5,-15,-13,2,-141,-140]], // Gare Saint-Jean (arrêt de Descente) ↔ Bauducheu
    ["gare saint jean arret de descente","gare saint jean rue saint vincent de paul",211,[4482486,-55705,56,21,14,-17,2,-24,64,2,27,-24]], // Gare Saint-Jean (arrêt de Descente) ↔ Gare Saint-Jean (rue Saint-Vincent de Paul)
    ["gare saint jean arret de descente","gare saint jean sous la halle",154,[4482486,-55705,56,21,14,-17,2,-24,45,3]], // Gare Saint-Jean (arrêt de Descente) ↔ Gare Saint-Jean (sous la Halle)
    ["gare saint jean arret de montee","gare saint jean rue saint vincent de paul",69,[4482620,-55691,5,-34,24,-22]], // Gare Saint-Jean (arrêt de Montée) ↔ Gare Saint-Jean (rue Saint-Vincent de Paul)
    ["gare saint jean arret de montee","gare saint jean sous la halle",52,[4482620,-55691,5,-34,-22,3]], // Gare Saint-Jean (arrêt de Montée) ↔ Gare Saint-Jean (sous la Halle)
    ["gare saint jean arret de montee","meca",504,[4482620,-55691,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-54,128]], // Gare Saint-Jean (arrêt de Montée) ↔ MECA
    ["gare saint jean arret de montee","meca paludate",507,[4482620,-55691,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-55,130]], // Gare Saint-Jean (arrêt de Montée) ↔ MECA (Paludate)
    ["gare saint jean arret de montee","meca terres de borde",475,[4482620,-55691,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-25,54,-34,-4]], // Gare Saint-Jean (arrêt de Montée) ↔ MECA (Terres de Borde)
    ["gare saint jean rue saint vincent de paul","meca",563,[4482649,-55747,-24,22,-5,34,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-54,128]], // Gare Saint-Jean (rue Saint-Vincent de Paul) ↔ MECA
    ["gare saint jean rue saint vincent de paul","meca paludate",566,[4482649,-55747,-24,22,-5,34,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-55,130]], // Gare Saint-Jean (rue Saint-Vincent de Paul) ↔ MECA (Paludate)
    ["gare saint jean rue saint vincent de paul","meca terres de borde",534,[4482649,-55747,-24,22,-5,34,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-25,54,-34,-4]], // Gare Saint-Jean (rue Saint-Vincent de Paul) ↔ MECA (Terres de Borde)
    ["gare saint jean sous la halle","meca",557,[4482603,-55722,22,-3,-5,34,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-54,128]], // Gare Saint-Jean (sous la Halle) ↔ MECA
    ["gare saint jean sous la halle","meca paludate",559,[4482603,-55722,22,-3,-5,34,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-55,130]], // Gare Saint-Jean (sous la Halle) ↔ MECA (Paludate)
    ["gare saint jean sous la halle","meca terres de borde",528,[4482603,-55722,22,-3,-5,34,8,9,61,23,36,-12,6,12,30,21,35,39,127,105,-25,54,-34,-4]], // Gare Saint-Jean (sous la Halle) ↔ MECA (Terres de Borde)
    ["gare saint jean","ateliers",491,[4482433,-55771,-31,-20,-5,-15,-13,2,-153,-152,-5,7,-11,-9,-78,115,-55,-30]], // Gare Saint-Jean ↔ Ateliers
    ["gare saint jean","bauducheu",261,[4482433,-55771,-31,-20,-5,-15,-13,2,-141,-140]], // Gare Saint-Jean ↔ Bauducheu
    ["gare saint jean","gare saint jean rue saint vincent de paul",197,[4482728,-55689,-3,18,-36,12,-61,-23,-8,-9,5,-34,24,-22]], // Gare Saint-Jean ↔ Gare Saint-Jean (rue Saint-Vincent de Paul)
    ["gare saint jean","gare saint jean sous la halle",191,[4482728,-55689,-3,18,-39,12,-58,-23,-8,-9,5,-34,-22,3]], // Gare Saint-Jean ↔ Gare Saint-Jean (sous la Halle)
    ["gare saint jean","meca terres de borde",366,[4482728,-55689,-3,18,6,12,192,165,-25,54,-34,-4]], // Gare Saint-Jean ↔ MECA (Terres de Borde)
    ["gare saint jean","terres de borde",487,[4482433,-55771,-43,-7,-50,231,-10,23,-18,13,-120,2,-7,12,-8,70]], // Gare Saint-Jean ↔ Terres de Borde
    ["gay lussac","blancherie",231,[4484971,-49731,-19,11,-17,-2,-24,-24,-36,-104,-20,-77]], // Gay Lussac ↔ Blancherie
    ["general de gaulle","alcide lancon",394,[4490889,-63865,27,11,57,-252,67,9,41,17,10,-34]], // Général de Gaulle ↔ Alcide Lançon
    ["gestform","jacquard",520,[4485541,-67683,-134,-45,-17,5,-7,13,-37,419]], // Gestform ↔ Jacquard
    ["goillot","pichey",372,[4484194,-66354,-29,-258,-2,-102,-7,-12,-63,22]], // Goillot ↔ Pichey
    ["gouraud","pichey",181,[4484167,-66593,-7,-88,3,-33,-7,-12,-63,22]], // Gouraud ↔ Pichey
    ["goya","8 mai1945",372,[4485345,-50896,8,-56,-91,-29,10,-119,-80,-21,-5,41]], // Goya ↔ 8 Mai1945
    ["goya","la maregue",266,[4485343,-50882,-9,40,-16,12,-20,-13,-165,-43]], // Goya ↔ La Marègue
    ["grand veneur","la cascade",396,[4486992,-49786,-28,-25,3,-77,-10,-46,-12,-19,15,-34,50,-50,30,-42,6,-35,-3,-81]], // Grand Veneur ↔ La Cascade
    ["grangeneuve","pessac centre tram b",471,[4480448,-63666,62,85,32,56,30,74,17,112,-57,28,-75,53]], // Grangeneuve ↔ Pessac Centre (Tram B)
    ["grangeneuve","pessac centre trendel",330,[4480448,-63666,62,85,32,56,30,74,17,112,17,-3]], // Grangeneuve ↔ Pessac Centre (Trendel)
    ["halte ter la gorp","halte ter coty",262,[4492830,-49738,14,11,13,25,44,167,9,52,-21,34]], // Halte TER La Gorp ↔ Halte TER Coty
    ["hautefort","4 pavillons",414,[4487030,-51295,-13,54,-151,-34,-95,-16,-16,5,-62,-17]], // Hautefort ↔ 4 Pavillons
    ["henri barbusse","jean blanc",322,[4485625,-64218,-12,-154,-173,-66]], // Henri Barbusse ↔ Jean Blanc
    ["henri barbusse","merignac barbusse",53,[4485625,-64218,-2,-53,10,2]], // Henri Barbusse ↔ Mérignac Barbusse
    ["hopital haut leveque","cap metiers",441,[4478734,-65494,-65,48,-6,9,3,18,250,235]], // Hôpital Haut-Lévêque ↔ Cap Métiers
    ["hopital saint andre","albret",286,[4483289,-57804,-88,13,51,-223]], // Hôpital Saint-André ↔ Albret
    ["horizons bleus","moulin a vent",413,[4488822,-63723,-235,51,-7,-128,-21,-51]], // Horizons Bleus ↔ Moulin à Vent
    ["hotel de police","patinoire",286,[4483462,-58760,-23,-74,14,-7,7,-13,71,-22,14,8,52,89]], // Hôtel de Police ↔ Patinoire
    ["jardin des barrieres","fellonneau",335,[4481366,-56624,-28,160,-145,36,-32,28]], // Jardin des Barrières ↔ Fellonneau
    ["jardin public#1","quinconces",441,[4484677,-57686,-17,-11,-20,57,-41,-24,-26,77,-47,-10,-34,20,-21,33,-11,37,7,116]], // Jardin Public ↔ Quinconces
    ["jaubert","cardinal",317,[4480741,-62691,-44,-93,-12,-9,-39,44,-54,91,-50,39]], // Jaubert ↔ Cardinal
    ["jaubert","cimetiere",457,[4480754,-62664,43,88,32,-28,117,-75,133,145]], // Jaubert ↔ Cimetière
    ["jaubert","rosa bonheur",262,[4480741,-62691,-52,-113,-40,-138,31,-22]], // Jaubert ↔ Rosa Bonheur
    ["jean blanc","barbusse",314,[4485440,-64438,173,66,12,144]], // Jean Blanc ↔ Barbusse
    ["jean blanc","leon blum#0",439,[4485426,-64443,-171,-75,2,303]], // Jean Blanc ↔ Léon Blum
    ["jean blanc","merignac barbusse",291,[4485440,-64438,173,66,10,101,10,2]], // Jean Blanc ↔ Mérignac Barbusse
    ["jean hameau","sousa mendes",584,[4486802,-57091,19,44,-4,7,-122,-287,-167,103,-3,23,-14,5,-9,40]], // Jean Hameau ↔ Sousa Mendès
    ["jean jaures rue de la morandiere","mairie du haillan",255,[4487154,-67869,50,-19,32,17,-26,78,21,59,26,-20]], // Jean Jaurès (rue de la Morandière) ↔ Mairie du Haillan
    ["jean jaures#0","cenon gare",108,[4485757,-53243,-37,7,-37,-64]], // Jean Jaurès ↔ Cenon Gare
    ["jean jaures#0","cenon gare guesde",338,[4485392,-53773,129,204,16,-52,66,-20]], // Jean Jaurès ↔ Cenon Gare (Guesde)
    ["jean jaures#0","cenon gare parc demi lune",478,[4485768,-53245,-39,7,-98,-167,63,-6,107,-26,34,-37,8,-27]], // Jean Jaurès ↔ Cenon Gare (Parc Demi-Lune)
    ["jean jaures#0","cenon gare tram a",271,[4485757,-53243,-28,5,-98,-167,61,-6]], // Jean Jaurès ↔ Cenon Gare (Tram A)
    ["jean jaures#0","jean jaures#1",203,[4485392,-53773,-63,-106,-2,32,41,66]], // Jean Jaurès ↔ Jean Jaurès
    ["jean jaures#0","nouaux",325,[4485757,-53243,-210,27,-8,25,-16,8,0,62]], // Jean Jaurès ↔ Nouaux
    ["jean moulin#1","escarraguel pl escarraguel",230,[4500743,-52993,55,80,75,84,7,-14,16,16]], // Jean Moulin ↔ Escarraguel (Pl Escarraguel)
    ["jean zay","8 mai1945",486,[4485414,-51409,-14,92,-14,2,-5,41,-41,-3,-5,7,-12,94,-34,-6,-9,27,-79,-21,-14,96]], // Jean Zay ↔ 8 Mai1945
    ["jeanne d arc#0","barriere de pessac boulevards",332,[4482384,-59189,4,-4,145,258,41,-61]], // Jeanne d'Arc ↔ Barrière de Pessac (Boulevards)
    ["jeanne d arc#0","boulevard george v",489,[4482384,-59189,4,-4,145,258,-3,23,-124,192]], // Jeanne d'Arc ↔ Boulevard George V
    ["jeanne d arc#1","durcy",518,[4480292,-54562,-22,-28,-54,89,-151,110,-80,82,-37,-103]], // Jeanne d'Arc ↔ Durcy
    ["joliot curie#0","merignac centre",400,[4484118,-65117,-3,36,16,28,52,277,-2,92,-36,-9]], // Joliot Curie ↔ Mérignac Centre
    ["joliot curie#0","merignac centre mediatheque",250,[4484118,-65117,-3,36,16,28,45,233]], // Joliot Curie ↔ Mérignac Centre (Médiathèque)
    ["joliot curie#0","parc du chateau",443,[4484122,-65253,9,-95,-25,-15,-161,-3,-2,-6,-60,49,-21,9,-30,40]], // Joliot Curie ↔ Parc du Château
    ["joliot curie#0","rene coty",137,[4484122,-65253,9,-95,-13,-6,-2,-18,-27,2]], // Joliot Curie ↔ René Coty
    ["joliot curie#1","ausone#2",412,[4489527,-51374,41,2,1,34,-25,124,5,259,30,3]], // Joliot Curie ↔ Ausone
    ["joliot curie#1","toutaud",397,[4489520,-51374,-101,-9,-3,-143,9,-114,-2,-31,-47,23]], // Joliot Curie ↔ Toutaud
    ["joliot curie#2","la tresne",551,[4483755,-54897,11,22,72,-138,11,-50,224,-40,14,128]], // Joliot Curie ↔ La Tresne
    ["joliot curie#2","pont saint jean rive droite",514,[4483742,-54918,-141,-143,52,-100,0,-18,-124,-142,-17,30]], // Joliot Curie ↔ Pont Saint-Jean (rive droite)
    ["jouhaux","peylanne",494,[4480176,-57519,37,18,13,-223,119,-18,-2,-51,28,-113]], // Jouhaux ↔ Peylanne
    ["jules ferry#0","anatole france#1",312,[4484495,-53227,30,-102,20,-6,73,-231]], // Jules Ferry ↔ Anatole France
    ["jules ferry#0","entre deux mers",103,[4484495,-53227,9,-23,1,9,16,13,22,-63]], // Jules Ferry ↔ Entre-Deux-Mers
    ["jules ferry#0","rosa parks",332,[4484443,-53140,-65,73,-16,8,-198,-6]], // Jules Ferry ↔ Rosa Parks
    ["kennedy vers buttiniere","pierre loti",177,[4486746,-50758,42,110,-8,12,-9,-23,-38,17]], // Kennedy (vers Buttinière) ↔ Pierre Loti
    ["kennedy vers rocade","pierre loti",56,[4486733,-50698,12,50,-12,6]], // Kennedy (vers Rocade) ↔ Pierre Loti
    ["kennedy vers rocade","plaisance#1",394,[4486733,-50698,12,50,-119,50,-146,-24,-40,-28]], // Kennedy (vers Rocade) ↔ Plaisance
    ["kergomard#0","auditorium de floirac",145,[4484797,-50790,-44,-12,-11,4,16,102]], // Kergomard ↔ Auditorium de Floirac
    ["kergomard#0","dubedout",341,[4484797,-50790,-44,-12,-11,4,-23,-153,-19,-195]], // Kergomard ↔ Dubedout
    ["kergomard#1","beautiran",342,[4482342,-57256,26,-2,-35,189,-137,-56]], // Kergomard ↔ Beautiran
    ["kergomard#1","lafontaine",506,[4482355,-57257,13,-1,-35,189,292,119]], // Kergomard ↔ Lafontaine
    ["kergomard#1","rue de la reole",445,[4482342,-57256,26,-2,-35,189,-8,-3,-114,193,-30,-54]], // Kergomard ↔ Rue de la Réole
    ["kyrie","caserne nansouty",451,[4482344,-57064,-117,-48,-60,151,-6,-10,-128,78,-4,-16]], // Kyrié ↔ Caserne Nansouty
    ["kyrie","fonfrede",319,[4482344,-57064,80,32,47,-228,35,1]], // Kyrié ↔ Fonfrède
    ["kyrie","kergomard#1",181,[4482344,-57064,-11,-5,35,-189,-13,1]], // Kyrié ↔ Kergomard
    ["kyrie","rue de la reole",275,[4482344,-57064,-19,-8,-114,193,-30,-54]], // Kyrié ↔ Rue de la Réole
    ["kyrie","saint nicolas",498,[4482344,-57064,80,32,47,-228,195,11]], // Kyrié ↔ Saint-Nicolas
    ["l aiglon","jacques brel#1",442,[4486514,-67006,-40,105,-77,160,-12,5,2,14,-7,19,-58,115,33,24]], // L'Aiglon ↔ Jacques Brel
    ["l oree du bois","montherlant che de leysotte",406,[4479621,-57724,1,-54,30,-154,-6,-8,2,-15,-122,-104,-49,-17]], // L'Orée du Bois ↔ Montherlant (che de Leysotte)
    ["l oree du bois","montherlant rue racine",414,[4479621,-57724,1,-54,30,-154,-6,-8,2,-15,-45,-39,54,-149,28,12]], // L'Orée du Bois ↔ Montherlant (rue Racine)
    ["la forge cite le corbusier","sainte marie",135,[4480195,-64541,121,-10]], // La Forge (Cité Le Corbusier) ↔ Sainte-Marie
    ["la forge cite le corbusier","stade nautique",192,[4480182,-64540,62,-5,15,155]], // La Forge (Cité Le Corbusier) ↔ Stade Nautique
    ["la gorp","halte ter la gorp",289,[4492964,-49569,13,-20,10,-33,-17,-32,-24,4,-39,-12,-10,-14,-17,-60,-25,8,-6,9,-19,-19]], // La Gorp ↔ Halte TER La Gorp
    ["la haude","croix vieille",240,[4491377,-72776,-24,31,-65,54,-14,0,-17,-126]], // La Haude ↔ Croix Vieille
    ["la hutte","gare de bruges",506,[4488482,-60624,5,-34,26,-75,27,-115,7,-159,15,-84,105,51]], // La Hutte ↔ Gare de Bruges
    ["la lande#1","grand veneur",482,[4486668,-49840,23,-11,24,1,20,-17,86,-7,96,-72,17,-4,11,6,11,21,5,75,6,11,-3,26,28,25]], // La Lande ↔ Grand Veneur
    ["la lande#1","la prairie#0",88,[4486668,-49840,23,-11,15,3,18,47]], // La Lande ↔ La Prairie
    ["la madeleine","bersol",535,[4477432,-63721,-64,6,-5,-193,-10,-39,14,-18,2,-19,-15,-29,21,-37,116,-147]], // La Madeleine ↔ Bersol
    ["la medoquine","tauzin",557,[4481913,-59888,-8,-29,5,-35,-10,-11,-4,-22,-5,-93,-24,-124,2,-22,26,-9,84,24,131,7]], // La Médoquine ↔ Tauzin
    ["la morandiere av de magudas","gestform",392,[4485812,-67818,0,64,-13,35,-86,74,-24,8,-27,-4,-121,-42]], // La Morandière (av de Magudas) ↔ Gestform
    ["la morandiere av de magudas","la morandiere rue de la morandiere",186,[4485817,-67853,12,72,17,28,87,-6]], // La Morandière (av de Magudas) ↔ La Morandière (rue de La Morandière)
    ["la morandiere rue de la morandiere","betnoms",453,[4485933,-67759,-76,9,-28,-15,-17,11,-5,-149,3,-66,39,-170]], // La Morandière (rue de La Morandière) ↔ Betnoms
    ["la morandiere","betnoms",386,[4485768,-67689,31,-30,13,-35,-5,-149,3,-66,39,-170]], // La Morandière ↔ Betnoms
    ["la morandiere","gestform",266,[4485768,-67689,-55,44,-31,8,-141,-46]], // La Morandière ↔ Gestform
    ["la morandiere","la morandiere av de magudas",126,[4485768,-67689,22,-17,18,-31,6,-31,-2,-50]], // La Morandière ↔ La Morandière (av de Magudas)
    ["la morandiere","la morandiere rue de la morandiere",202,[4485768,-67689,32,-21,38,2,23,-33,18,-10,54,-8]], // La Morandière ↔ La Morandière (rue de La Morandière)
    ["la morlette","calmette#0",420,[4485487,-51804,-23,57,-18,1,-3,34,-27,36,-3,18,-145,-37,-18,-12,-68,-19]], // La Morlette ↔ Calmette
    ["la morlette","jean zay",316,[4485487,-51804,-26,69,-10,58,-17,19,6,59,-22,168]], // La Morlette ↔ Jean Zay
    ["la morlette","lagorgette",576,[4485535,-51879,-63,134,-13,57,-1,22,5,13,163,52,163,41]], // La Morlette ↔ Lagorgette
    ["la pargaud","avenue de la boetie",337,[4490808,-66894,88,2,14,-8,46,-155,14,-110]], // La Pargaud ↔ Avenue de la Boétie
    ["la pargaud","avenue de la boetie vers cimetiere du taillan",358,[4490808,-66894,88,2,14,-8,46,-155,15,-136]], // La Pargaud ↔ Avenue de la Boétie (vers Cimetière du Taillan)
    ["la prairie#1","lange",518,[4477947,-61182,-27,63,54,52,31,41,114,39,-10,50,4,19,59,36,-6,86,-5,6]], // La Prairie ↔ Lange
    ["la tresne","boulevard trarieux",284,[4484087,-54975,15,136,42,142,-3,7,9,10,10,35]], // La Tresne ↔ Boulevard Trarieux
    ["la vache","cimetiere nord",340,[4487337,-59075,43,19,94,19,162,-51]], // La Vache ↔ Cimetière Nord
    ["la vache","cimetiere nord av perie",309,[4487337,-59075,43,19,94,19,103,-30,3,46]], // La Vache ↔ Cimetière Nord (av Périé)
    ["la vache","college ausone",454,[4487209,-59142,-71,-49,-100,-54,-3,-17,34,-128,65,-126]], // La Vache ↔ Collège Ausone
    ["labottiere","barriere du medoc boulevards",363,[4485260,-59008,78,-248,49,-80,-7,-6,7,-10,36,27]], // Labottière ↔ Barrière du Médoc (Boulevards)
    ["labottiere","parc bordelais boulevards",527,[4485260,-59008,78,-248,49,-80,-182,-136]], // Labottière ↔ Parc Bordelais (Boulevards)
    ["lachassaigne","capdeville",388,[4484265,-59008,5,38,145,79,-9,118,-10,33,35,62]], // Lachassaigne ↔ Capdeville
    ["lachassaigne","croix blanche",505,[4484265,-59008,-16,-115,112,-90,149,28,30,-122]], // Lachassaigne ↔ Croix Blanche
    ["lachassaigne","kieser",381,[4484265,-59008,-16,-115,60,-48,-14,-234,-24,-6]], // Lachassaigne ↔ Kieser
    ["lakanal","racine#0",446,[4486482,-61496,-7,-29,-67,37,-105,74,-11,-50,-44,-26,-42,-95,-15,26]], // Lakanal ↔ Racine
    ["lamartine#1","cailleau",559,[4490403,-51320,51,-186,-30,-21,18,-81,-13,-13,36,-156,-50,-28,-6,-8,3,-24,8,27,22,14,4,-6]], // Lamartine ↔ Cailleau
    ["lamartine#1","pasteur",364,[4490371,-51239,-43,113,-144,-122,-44,-33,-18,-5]], // Lamartine ↔ Pasteur
    ["lamartine#1","residence meignan",280,[4490371,-51239,-41,99,-15,107,-19,73,2,15,25,12]], // Lamartine ↔ Résidence Meignan
    ["landiras","alphonse dupeux",282,[4483013,-58488,-49,-96,-26,-82,102,-39]], // Landiras ↔ Alphonse Dupeux
    ["landiras","amedee larrieu",356,[4483013,-58488,42,34,-165,159,42,83]], // Landiras ↔ Amédée Larrieu
    ["landiras","caserne boudet",301,[4483013,-58488,-49,-96,-26,-82,-119,47]], // Landiras ↔ Caserne Boudet
    ["langevin#0","leonard de vinci",498,[4478247,-64848,-88,-139,-2,-20,131,-184,30,-29,1,-33,-43,-41]], // Langevin ↔ Léonard de Vinci
    ["lartigue","cite administrative",359,[4484043,-59670,-19,-252,124,-12,-1,-10,12,-1]], // Lartigue ↔ Cité Administrative
    ["lartigue","croix blanche",435,[4484196,-59536,15,118,8,-6,294,60]], // Lartigue ↔ Croix Blanche
    ["lartigue","kieser",164,[4484196,-59536,15,118,8,-6,52,13]], // Lartigue ↔ Kieser
    ["lartigue","piscine judaique",425,[4484196,-59536,15,118,-40,37,-95,155,12,144]], // Lartigue ↔ Piscine Judaïque
    ["lavergne","lauriers",335,[4487682,-52087,-20,162,173,90]], // Lavergne ↔ Lauriers
    ["lavergne","lauriers tram a",401,[4487682,-52087,-20,162,229,118]], // Lavergne ↔ Lauriers (Tram A)
    ["le b e c","staps",246,[4479317,-61736,28,76,55,91,-3,16,-59,31]], // Le B.E.C ↔ STAPS
    ["le bocage","les buis",453,[4477954,-53318,-3,8,-12,-6,-12,9,-43,-30,-116,-7,-2,-54,-28,-49,90,-127]], // Le Bocage ↔ Les Buis
    ["le bocage","les etoiles",362,[4477918,-53263,9,-12,-5,-15,5,-17,-43,-30,-116,-7,-1,26,-89,-4,-4,21]], // Le Bocage ↔ Les Etoiles
    ["le burck","college noes",349,[4481500,-63452,-110,-71,-33,-3,-37,15,-11,-15,-10,1,-43,-119]], // Le Burck ↔ Collège Noès
    ["le dome","charles de gaulle",540,[4479219,-59145,-135,9,6,174,-14,153,14,27,47,59,10,37]], // Le Dôme ↔ Charles de Gaulle
    ["le galus","grange noire",297,[4484633,-67796,27,-5,28,31,15,4,15,-5,25,-24,19,-37,22,-83,-2,-29,-24,-14]], // Le Galus ↔ Grange Noire
    ["le galus","marronniers#0",325,[4484608,-67790,-214,-129,-12,-29,12,-46]], // Le Galus ↔ Marronniers
    ["le haillan centre","mairie du haillan",146,[4487381,-67756,-60,-49,-48,40,2,9]], // Le Haillan Centre ↔ Mairie du Haillan
    ["le monteil cite le corbusier","la forge cite le corbusier",145,[4480238,-64659,6,114,-49,4]], // Le Monteil (Cité Le Corbusier) ↔ La Forge (Cité Le Corbusier)
    ["le monteil cite le corbusier","sainte marie",169,[4480238,-64657,6,112,72,-6]], // Le Monteil (Cité Le Corbusier) ↔ Sainte-Marie
    ["le poujeau","jaubert",310,[4480889,-62893,0,12,-34,84,-83,170,-31,-64]], // Le Poujeau ↔ Jaubert
    ["le poujeau","pessac centre",437,[4480889,-62893,-2,-31,-14,-12,-49,32,-67,-204,-79,36,-58,6]], // Le Poujeau ↔ Pessac Centre
    ["le printemps","vassivey",362,[4495145,-60620,-29,1,-11,-12,1,-7,147,-247,-6,-14,2,-46]], // Le Printemps ↔ Vassivey
    ["le vigean centre commercial","le grand caillou",426,[4488305,-63148,15,-32,-43,-40,35,-106,-7,-162,5,-54,-8,-24,-3,-67]], // Le Vigean (Centre Commercial) ↔ Le Grand Caillou
    ["leon blum#1","4 pavillons vers buttiniere",136,[4486519,-51352,30,14,5,-24,19,-20,-15,-63]], // Léon Blum ↔ 4 Pavillons (vers Buttinière)
    ["leonard de vinci","coeur bersol",265,[4478276,-65294,43,41,-1,33,-30,29,-86,126]], // Léonard de Vinci ↔ Coeur Bersol
    ["les brunelles","malartic",161,[4477024,-60077,72,30,13,92]], // Les Brunelles ↔ Malartic
    ["les brunelles","malartic cote eau bourde",151,[4477024,-60077,72,30,12,79]], // Les Brunelles ↔ Malartic (côté Eau Bourde)
    ["les charrettes","seigliere",500,[4482272,-54609,96,137,43,-6,47,-57,59,-91,59,-145]], // Les Charrettes ↔ Seiglière
    ["les compagnons","parc municipal",405,[4482844,-52347,87,-164,58,-159,29,-53,35,38]], // Les Compagnons ↔ Parc Municipal
    ["les coteaux","clemenceau#2",505,[4491116,-51718,-27,30,122,113,-8,53,5,105,-13,64,40,34,-16,54,-20,-14]], // Les Coteaux ↔ Clemenceau
    ["les erables","avenue jean jaures",523,[4481288,-62299,-145,-163,-135,60,-94,64,23,45]], // Les Erables ↔ Avenue Jean Jaurès
    ["les erables","les echoppes",567,[4481288,-62299,-24,-26,-217,96,49,211,0,19,-9,14,-38,-79]], // Les Erables ↔ Les Echoppes
    ["les meridiennes","college ausone",449,[4487242,-59959,46,-24,-15,154,-41,119,-86,173]], // Les Méridiennes ↔ Collège Ausone
    ["les meridiennes","lafont",353,[4487242,-59959,-110,69,-74,65,-33,-100,-30,15]], // Les Méridiennes ↔ Lafont
    ["les meridiennes","lanet",321,[4487242,-59959,-110,69,-74,65,73,52]], // Les Méridiennes ↔ Lanet
    ["les meridiennes","maumey",368,[4487252,-59964,161,-77,36,-7,24,9,75,86]], // Les Méridiennes ↔ Maumey
    ["les pins av magudas","les pins arret de descente",243,[4485728,-65917,-3,18,11,-94,-14,3,-111,78]], // Les Pins (av Magudas) ↔ Les Pins (arrêt de descente)
    ["les pins#1","les pins av magudas",194,[4485651,-65939,71,-51,14,-3,-11,94,3,-18]], // Les Pins ↔ Les Pins (av Magudas)
    ["les pres de jourdanne","brisson",516,[4494466,-53431,33,-89,68,-130,54,-131,5,-38,8,-11,-113,-96]], // Les Prés de Jourdanne ↔ Brisson
    ["lestonnat","place ozanam",451,[4485197,-61818,-93,4,-69,-7,-11,62,-11,32,-43,59,-29,28,15,106]], // Lestonnat ↔ Place Ozanam
    ["lewis brown","faure balguerie",426,[4486323,-56108,-35,64,134,195,-102,122]], // Lewis-Brown ↔ Faure - Balguerie
    ["liberte#2","centre de secours",390,[4490563,-50829,21,19,11,21,2,64,14,37,-25,75,-54,226]], // Liberté ↔ Centre de Secours
    ["liberte#2","emile zola",535,[4490563,-50829,-49,-35,-72,-10,-44,131,42,63,-84,217,12,9]], // Liberté ↔ Emile Zola
    ["liberte#2","lamartine#1",564,[4490564,-50828,-50,-36,-65,-7,-151,-74,-2,-15,19,-73,15,-107,41,-99]], // Liberté ↔ Lamartine
    ["liberte#2","place meignan",474,[4490563,-50829,-49,-35,-35,-8,-53,3,-43,-16,-22,-20,-64,-29,-21,6,-44,156]], // Liberté ↔ Place Meignan
    ["lieges","satie#1",263,[4484676,-62961,15,44,-96,69,-72,1,-19,-11]], // Lièges ↔ Satie
    ["lignac","bernatet",226,[4493390,-50914,38,4,31,-229]], // Lignac ↔ Bernatet
    ["livran","caserne boudet",508,[4482974,-58992,75,135,-132,123,21,68,-119,47]], // Livran ↔ Caserne Boudet
    ["logey","chemin long",496,[4483693,-66758,-63,-8,-42,9,-47,21,-5,-198,-106,-53,-11,49]], // Logey ↔ Chemin Long
    ["los angeles","cap de bos cote centre commercial",342,[4479257,-67707,-13,-366,10,-26,-1,-19,12,2]], // Los Angeles ↔ Cap de Bos (côté Centre Commercial)
    ["louis blanc","chanzy",524,[4486440,-59471,-20,2,-8,204,44,19,125,11,-16,167,14,7]], // Louis Blanc ↔ Chanzy
    ["louis blanc","ermitage",494,[4486440,-59471,82,-16,54,-20,26,-19,-20,-221,-8,-1,-3,-41,34,-52,9,-24,-3,-13]], // Louis Blanc ↔ Ermitage
    ["louis mie","alphonse dupeux",568,[4483201,-58256,-60,-131,-130,-103,-54,-112,-19,-64,102,-39]], // Louis Mie ↔ Alphonse Dupeux
    ["louis mie","amedee larrieu",381,[4483201,-58256,5,14,-98,99,-126,24,-50,-93]], // Louis Mie ↔ Amédée Larrieu
    ["louis mie","bourse du travail",346,[4483201,-58256,67,174,-52,225]], // Louis Mie ↔ Bourse du Travail
    ["louis mie","costedoat",499,[4483201,-58256,67,174,-67,291,-86,-24]], // Louis Mie ↔ Costedoat
    ["louis mie","hopital saint andre",447,[4483201,-58256,63,159,21,119,20,-5,-43,184,27,-5]], // Louis Mie ↔ Hôpital Saint-André
    ["louis mie","republique#1",477,[4483201,-58256,63,159,21,119,177,-60,5,41]], // Louis Mie ↔ République
    ["luze","catros",487,[4485539,-57782,-35,34,-11,-8,-183,-246,86,-138]], // Luze ↔ Catros
    ["luze","saint maur",475,[4485539,-57782,-35,34,-70,-87,-12,39,-186,-113,-44,53]], // Luze ↔ Saint-Maur
    ["lyautey","bougnard",389,[4479322,-63175,-83,-72,4,-15,-4,-102,6,-18,43,-64,50,-53,9,-1,-2,27]], // Lyautey ↔ Bougnard
    ["lycee camille jullian","chevalier",428,[4484360,-58920,-90,-50,-53,-399]], // Lycée Camille Jullian ↔ Chevalier
    ["lycee camille jullian","lachassaigne",138,[4484360,-58920,-90,-50,-5,-38]], // Lycée Camille Jullian ↔ Lachassaigne
    ["lycee camille jullian","piscine judaique",326,[4484360,-58920,-101,-56,-182,-47]], // Lycée Camille Jullian ↔ Piscine Judaïque
    ["lycee kastler","creps",311,[4480103,-59685,-27,23,-26,-3,-13,10,-12,-8,-94,-152,-13,1,-24,-38]], // Lycée Kastler ↔ CREPS
    ["lycee vaclav havel","lycee vaclav havel tram c",119,[4478744,-56734,23,76,-48,6]], // Lycée Vaclav Havel ↔ Lycée Václav Havel (Tram C)
    ["lycee victor louis","lycee kastler",436,[4480291,-59334,-101,-41,-117,-195,-2,-37,20,-33,-10,-24,22,-21]], // Lycée Victor Louis ↔ Lycée Kastler
    ["lycees de merignac","quatre chemins",234,[4483427,-64775,-114,-32,-94,-1]], // Lycées de Mérignac ↔ Quatre Chemins
    ["madran#1","charles peguy",260,[4480503,-65730,2,81,170,-68]], // Madran ↔ Charles Péguy
    ["madran#1","descartes",127,[4480503,-65730,2,81,55,-19]], // Madran ↔ Descartes
    ["mairie de begles","quatre castera",471,[4480799,-54236,-107,-21,-17,107,0,56,-67,8,-32,140,23,12]], // Mairie de Bègles ↔ Quatre Castéra
    ["mairie de bruges","avenue de l europe",403,[4488070,-61110,16,-74,-87,-39,-36,-27,-141,-148]], // Mairie de Bruges ↔ Avenue de l'Europe
    ["mairie de cauderan","cauderan centre",480,[4485293,-61458,-68,-17,-4,188,182,104,14,11,-9,19]], // Mairie de Caudéran ↔ Caudéran Centre
    ["mairie de cauderan","college saint andre",371,[4485293,-61458,231,59,34,-130]], // Mairie de Caudéran ↔ Collège Saint-André
    ["mairie de cenon","cenon gare guesde",488,[4485601,-53222,-16,2,48,-121,-104,-175,14,-16,-22,-37,16,-52,66,-20]], // Mairie de Cenon ↔ Cenon Gare (Guesde)
    ["mairie de cenon","cenon gare parc demi lune",572,[4485601,-53222,119,-14,-44,-72,7,-7,-52,-90,63,-6,107,-26,34,-37,8,-27]], // Mairie de Cenon ↔ Cenon Gare (Parc Demi-Lune)
    ["mairie de cenon","cenon gare tram a",335,[4485601,-53222,119,-14,-44,-72,7,-7,-52,-90,23,-2]], // Mairie de Cenon ↔ Cenon Gare (Tram A)
    ["mairie de cenon","jean jaures#0",174,[4485601,-53222,156,-21]], // Mairie de Cenon ↔ Jean Jaurès
    ["mairie de floirac","parc municipal",121,[4483090,-52737,-53,3,-19,11,28,30]], // Mairie de Floirac ↔ Parc Municipal
    ["mairie de lormont","magendie",479,[4488025,-52372,-49,-59,62,-166,8,-37,110,43,31,121]], // Mairie de Lormont ↔ Magendie
    ["mairie de saint aubin","croix vieille",343,[4491276,-72400,-3,-56,-18,-57,23,-109,0,-35,-21,-160]], // Mairie de Saint-Aubin ↔ Croix Vieille
    ["mairie de talence","berteaux",448,[4480878,-58737,4,-41,15,-6,10,13,28,-70,64,1,1,-29,22,5,1,-28,15,1,1,-27,13,1,-7,160]], // Mairie de Talence ↔ Berteaux
    ["mairie de talence","talence centre forum",457,[4480878,-58737,4,-41,15,-6,10,13,28,-70,64,1,1,-29,22,5,1,-28,15,1,1,-27,13,1,1,-103,9,-67]], // Mairie de Talence ↔ Talence Centre-Forum
    ["maison calixte camelle","belvedere",550,[4483671,-55587,-82,136,-68,129,13,6,86,99,-56,61,-23,20,-5,-5,-9,7,13,13]], // Maison Calixte Camelle ↔ Belvédère
    ["maison calixte camelle","stalingrad sem",295,[4483743,-55684,124,-190,-14,-21,-2,-24,36,-30]], // Maison Calixte Camelle ↔ Stalingrad (Sem)
    ["malbec","kyrie",460,[4482345,-56626,-125,-236,10,-47,95,-163,19,8]], // Malbec ↔ Kyrié
    ["malbec","lafontaine",321,[4482394,-56597,54,-23,114,-97,96,-28]], // Malbec ↔ Lafontaine
    ["mallet","lycee vaclav havel",227,[4478525,-56633,32,-3,5,51,40,181]], // Mallet ↔ Lycée Vaclav Havel
    ["manaud","bordeaux plage",283,[4487627,-58152,10,200,76,-1,6,-11,10,1,7,-19]], // Manaud ↔ Bordeaux Plage
    ["manaud","centre de voile",387,[4487624,-58196,3,48,111,-12,9,-16,53,65,87,-112]], // Manaud ↔ Centre de Voile
    ["mandron","boulevard pierre 1er",145,[4485969,-58907,-46,-33,8,-10,67,7]], // Mandron ↔ Boulevard Pierre 1er
    ["mandron","clinique tivoli",332,[4485969,-58907,-46,-33,-179,238]], // Mandron ↔ Clinique Tivoli
    ["mandron","poincare",575,[4486021,-58879,-32,-25,2,-24,25,-2,6,-10,92,-30,-45,-298,116,-29]], // Mandron ↔ Poincaré
    ["manege","gambetta meriadeck terminus",308,[4483914,-58764,35,72,1,63,-42,9,13,149,20,-4]], // Manège ↔ Gambetta Mériadeck (Terminus)
    ["manege","meriadeck",357,[4483914,-58764,35,72,1,63,-145,28,8,93]], // Manège ↔ Mériadeck
    ["manege","meriadeck lateulade",252,[4483914,-58764,35,72,1,63,-118,23]], // Manège ↔ Mériadeck Lateulade
    ["manege","patinoire",569,[4483914,-58764,-36,-106,-12,-3,-79,13,-24,12,18,127,-142,26,-10,-10,-7,-29,-25,-45]], // Manège ↔ Patinoire
    ["manege","prefecture",414,[4483914,-58764,-36,-106,-91,10,-24,12,18,127,-80,14]], // Manège ↔ Préfecture
    ["manufacture","brulatour",294,[4481247,-55731,-5,-34,24,6,113,162,26,-66]], // Manufacture ↔ Brulatour
    ["marechal foch#2","jean jaures#0",390,[4485519,-53379,3,161,44,2,191,-27]], // Maréchal Foch ↔ Jean Jaurès
    ["marechal foch#2","jean jaures#1",380,[4485519,-53379,2,-146,-153,-256]], // Maréchal Foch ↔ Jean Jaurès
    ["marechal gallieni#0","lannes college manon cormier",403,[4489763,-50887,47,26,97,26,80,46,-14,53,24,26,8,28,17,11,-4,21]], // Maréchal Gallieni ↔ Lannes (Collège Manon Cormier)
    ["marechal joffre#1","cenon gare",496,[4485339,-53194,43,10,99,-37,85,5,154,-20,-37,-64]], // Maréchal Joffre ↔ Cenon Gare
    ["marechal joffre#1","marechal foch#2",334,[4485339,-53194,43,10,55,-23,2,-102,80,-5,0,-65]], // Maréchal Joffre ↔ Maréchal Foch
    ["marechal joffre#1","nouaux",285,[4485339,-53194,43,10,88,-35,52,1,1,97]], // Maréchal Joffre ↔ Nouaux
    ["marionneau","capdeville",544,[4484115,-58745,6,75,45,-8,57,6,8,102,17,-28,77,-50,4,27,29,-6,82,-37,-9,-14]], // Marionneau ↔ Capdeville
    ["marionneau","gambetta meriadeck terminus",377,[4484115,-58745,6,75,-110,48,-12,18,-9,2,9,118,-58,9]], // Marionneau ↔ Gambetta Mériadeck (Terminus)
    ["marionneau","lycee camille jullian",463,[4484115,-58745,-1,-11,35,-7,8,-13,-11,-134,6,-12,49,-25,-3,-43,61,14,101,56]], // Marionneau ↔ Lycée Camille Jullian
    ["marionneau","meriadeck",504,[4484115,-58745,6,75,-117,54,-14,-15,-8,10,-32,-8,-145,28,8,93]], // Marionneau ↔ Mériadeck
    ["marionneau","meriadeck lateulade",400,[4484115,-58745,6,75,-117,54,-14,-15,-8,10,-32,-8,-118,23]], // Marionneau ↔ Mériadeck Lateulade
    ["marionneau","saint bruno hotel de region",474,[4484115,-58745,-6,-75,-36,5,-108,131,-33,-59,-42,-121,-19,-8,-25,1]], // Marionneau ↔ Saint-Bruno - Hôtel de Région
    ["marronniers#0","beaudesert",236,[4484466,-68157,-18,-38,13,-52,2,-19,-5,-2,40,-159]], // Marronniers ↔ Beaudésert
    ["marronniers#1","ampere grand parc",405,[4486164,-58991,-11,4,-2,247,-8,18,81,199]], // Marronniers ↔ Ampère-Grand Parc
    ["marronniers#1","castillon",358,[4486164,-58991,-50,21,-45,-298,-52,16]], // Marronniers ↔ Castillon
    ["marronniers#1","mandron",262,[4486164,-58991,-142,51,-6,10,-25,2,-2,24,32,25]], // Marronniers ↔ Mandron
    ["marronniers#1","poincare",360,[4486175,-58995,70,-21,1,-12,-3,-157,-15,-123,-43,11]], // Marronniers ↔ Poincaré
    ["martin","merignac barbusse",284,[4485629,-63924,-6,-347,10,2]], // Martin ↔ Mérignac Barbusse
    ["martyrs de la resistance","saint paulin",321,[4480769,-55954,1,37,-22,3,0,11,-33,11,-33,-75,-37,19,-8,-5,-3,11,-73,33]], // Martyrs de la Résistance ↔ Saint-Paulin
    ["marx dormoy","ballion",510,[4483936,-63608,0,-24,293,63,31,-105,-4,-86]], // Marx Dormoy ↔ Ballion
    ["maurian#1","gare de blanquefort av du 11 novembre",350,[4491906,-62803,-32,-15,-15,5,-13,16,-12,1,-19,-20,-24,-4,-175,90]], // Maurian ↔ Gare de Blanquefort (av du 11 Novembre)
    ["meca terres de borde","meca paludate",109,[4482865,-55444,33,4,-30,76]], // MECA (Terres de Borde) ↔ MECA (Paludate)
    ["meca","meca terres de borde",106,[4482869,-55366,29,-74,-33,-4]], // MECA ↔ MECA (Terres de Borde)
    ["mediatheque cote chateau margaut","berteaux",587,[4480704,-58921,13,29,11,-2,6,10,138,78,8,-13,13,1,11,-28,95,6,1,-29,22,5,1,-28,15,1,1,-27,13,1,-7,115]], // Médiathèque (côté Château Margaut) ↔ Berteaux
    ["mediatheque","berteaux",579,[4480708,-58911,9,19,11,-2,6,10,138,78,8,-13,13,1,11,-28,95,6,1,-29,22,5,1,-28,15,1,1,-27,13,1,-7,115]], // Médiathèque ↔ Berteaux
    ["mendes france#2","durcy",238,[4479886,-54188,99,-121,-37,-103]], // Mendès France ↔ Durcy
    ["mendes france#2","eglise de begles av jeanne d arc",336,[4479886,-54188,143,-172,100,-75]], // Mendès France ↔ Eglise de Bègles (av Jeanne d'Arc)
    ["mendes france#2","le dorat 2",447,[4479886,-54188,99,-121,-51,-144,-40,-212]], // Mendès France ↔ Le Dorat 2
    ["merignac barbusse","barbusse",44,[4485633,-64269,-10,-2,2,43]], // Mérignac Barbusse ↔ Barbusse
    ["merignac centre","merignac centre mediatheque",144,[4484145,-64693,36,9,2,-75,-5,-55]], // Mérignac Centre ↔ Mérignac Centre (Médiathèque)
    ["mesanges","les 3 tours",512,[4478423,-60830,-33,171,239,138,17,52,21,-13,-8,13]], // Mésanges ↔ Les 3 Tours
    ["meunier","gare de bassens",463,[4489999,-52035,37,1,39,-143,15,-98,41,-181,-62,-25]], // Meunier ↔ Gare de Bassens
    ["mitterrand","eglise de floirac",465,[4483407,-52030,7,26,15,-1,6,23,50,65,14,-9,11,-18,7,-48,105,-140,0,-29,-62,-17]], // Mitterrand ↔ Eglise de Floirac
    ["montesquieu#0","alcide lancon",474,[4490820,-63897,96,43,57,-252,67,9,41,17,10,-34]], // Montesquieu ↔ Alcide Lançon
    ["montesquieu#0","lycee saint michel",301,[4490820,-63897,126,59,124,85]], // Montesquieu ↔ Lycée Saint-Michel
    ["montesquieu#1","emaillerie",262,[4484628,-63324,9,-81,2,-101,-103,-27]], // Montesquieu ↔ Emaillerie
    ["montesquieu#1","satie#1",420,[4484624,-63285,-6,61,3,57,-25,3,-11,20,-38,97,2,15,-8,7,-29,172,-20,-12]], // Montesquieu ↔ Satie
    ["montfort","malartic",511,[4476919,-59569,53,-39,42,9,-14,-101,7,-38,19,-29,64,-30,40,4,-21,-162]], // Montfort ↔ Malartic
    ["montfort","malartic cote eau bourde",521,[4476919,-59569,53,-39,42,9,-14,-101,7,-38,19,-29,64,-30,40,4,-22,-175]], // Montfort ↔ Malartic (côté Eau Bourde)
    ["montherlant che de leysotte","verlaine",514,[4479477,-58076,36,9,13,-68,55,-8,13,-23,-51,-40,-193,-201]], // Montherlant (che de Leysotte) ↔ Verlaine
    ["montherlant rue racine","montherlant che de leysotte",288,[4479685,-58131,-91,-35,-13,23,-55,8,-13,68,-36,-9]], // Montherlant (rue Racine) ↔ Montherlant (che de Leysotte)
    ["montherlant","l oree du bois",391,[4479650,-58146,7,3,-54,149,45,39,-2,15,6,8,-30,154,-1,54]], // Montherlant ↔ L'Orée du Bois
    ["moulin a vent","gasteboy",484,[4488545,-63899,-9,-44,0,-163,90,-40,84,-27,52,-132]], // Moulin à Vent ↔ Gasteboy
    ["moulin a vent","pompe au breteil",207,[4488545,-63899,-9,-44,0,-163,37,-16]], // Moulin à Vent ↔ Pompe au Breteil
    ["moulin rouge","cite administrative",354,[4483994,-60283,16,205,67,31,66,46,10,-36]], // Moulin Rouge ↔ Cité Administrative
    ["moussard","centre des impots",403,[4485696,-65705,8,-62,-15,3,-55,38,-122,24,-84,27,-4,44]], // Moussard ↔ Centre des Impôts
    ["moussard","les pins arret de descente",330,[4485696,-65705,8,-62,-82,44,8,-201,-19,12]], // Moussard ↔ Les Pins (arrêt de descente)
    ["moussard","les pins#1",333,[4485696,-65705,8,-62,-82,44,8,-201,21,-15]], // Moussard ↔ Les Pins
    ["moussard","vercors",213,[4485696,-65705,8,-62,-15,3,-55,38,-69,16]], // Moussard ↔ Vercors
    ["mozart#1","prof bernard",435,[4476869,-62027,41,-30,6,286,19,110,57,31]], // Mozart ↔ Prof. Bernard
    ["murat","deveaux rue deveaux",345,[4484745,-62639,-10,342,66,12]], // Murat ↔ Deveaux (rue Deveaux)
    ["murat","residences du domaine",470,[4484745,-62639,-1,56,16,32,29,95,59,131,19,21,78,42,25,-83]], // Murat ↔ Résidences du Domaine
    ["musee d aquitaine","hopital saint andre",458,[4483497,-57421,10,-76,-4,-24,-121,-74,-94,-97,6,-23,3,-90,-8,1]], // Musée d'Aquitaine ↔ Hôpital Saint-André
    ["nancel penard","pessac centre",333,[4480851,-63261,-137,74,-19,2,-2,14,-84,39,-7,-49]], // Nancel Pénard ↔ Pessac Centre
    ["nougueys","mairie de floirac",219,[4482935,-52851,83,128,19,-11,53,-3]], // Nougueys ↔ Mairie de Floirac
    ["nougueys","mascaret",319,[4482929,-52860,-47,-67,-15,18,-15,-16,-15,-1,-41,19,-23,-49,-46,50,-13,-27]], // Nougueys ↔ Mascaret
    ["nouzarede","martyrs de la resistance",283,[4480934,-56231,-69,50,-68,76,-12,27,-2,34,-11,7,-3,42]], // Nouzarède ↔ Martyrs de la Résistance
    ["nungesser et coli","dorgeles#1",428,[4484151,-65590,-18,194,7,26,164,12,60,-5]], // Nungesser et Coli ↔ Dorgelès
    ["nungesser et coli","rene coty",211,[4484145,-65592,-20,209,-9,11,-27,2]], // Nungesser et Coli ↔ René Coty
    ["pacaris","benedigues",345,[4479714,-58019,40,-62,17,-13,10,-29,91,-137,10,-4,32,-71]], // Pacaris ↔ Bénédigues
    ["pacaris","montherlant",211,[4479714,-58019,48,-70,-13,-15,-99,-42]], // Pacaris ↔ Montherlant
    ["pacaris","montherlant rue racine",170,[4479714,-58019,48,-70,-13,-15,-64,-27]], // Pacaris ↔ Montherlant (rue Racine)
    ["palais de justice","albret",426,[4483626,-58197,-3,-33,-13,-15,-199,41,-48,-87,-56,35]], // Palais de Justice ↔ Albret
    ["palais de justice","gambetta meriadeck",336,[4483711,-58121,130,-41,-9,-133,73,-14]], // Palais de Justice ↔ Gambetta Mériadeck
    ["palais de justice","gambetta meriadeck terminus",518,[4483711,-58121,196,-66,-17,-108,47,-10,-16,-166,20,-4]], // Palais de Justice ↔ Gambetta Mériadeck (Terminus)
    ["palais de justice","meriadeck",454,[4483626,-58197,-5,-60,6,-3,192,-37,13,2,-19,-213]], // Palais de Justice ↔ Mériadeck
    ["palais de justice","meriadeck lateulade",556,[4483626,-58197,-5,-60,198,-40,-28,-302,41,-7]], // Palais de Justice ↔ Mériadeck Lateulade
    ["palais gallien","fondaudege museum",270,[4484810,-58334,48,60,-128,178]], // Palais Gallien ↔ Fondaudège Muséum
    ["pape clement place sellier","pont de l orient",409,[4480517,-65339,35,426,-62,17]], // Pape Clément (Place Sellier) ↔ Pont de l'Orient
    ["parc bordelais boulevards","barriere du medoc av d eysines",192,[4485205,-59472,109,83,15,-64]], // Parc Bordelais (Boulevards) ↔ Barrière du Médoc (av d'Eysines)
    ["parc bordelais boulevards","barriere du medoc rue johnston",345,[4485205,-59472,182,136,-49,80,-12,37]], // Parc Bordelais (Boulevards) ↔ Barrière du Médoc (rue Johnston)
    ["parc bordelais boulevards","parc bordelais#0",401,[4485205,-59472,109,83,77,-315]], // Parc Bordelais (Boulevards) ↔ Parc Bordelais
    ["parc de mussonville","lenine",299,[4479388,-55980,142,103,1,15,31,20,36,67]], // Parc de Mussonville ↔ Lénine
    ["parc industriel","coeur bersol",246,[4478032,-64867,100,-113,10,-28,20,-1,35,-48]], // Parc Industriel ↔ Coeur Bersol
    ["parc industriel","langevin#0",331,[4478032,-64867,106,-124,7,11,14,-7,5,6,83,133]], // Parc Industriel ↔ Langevin
    ["patinoire","meriadeck",431,[4483597,-58779,25,45,7,29,10,10,142,-26,10,122,14,-2,8,93]], // Patinoire ↔ Mériadeck
    ["patinoire","meriadeck lateulade",387,[4483597,-58779,25,45,7,29,10,10,142,-26,10,122,41,-7]], // Patinoire ↔ Mériadeck Lateulade
    ["paul doumer","saint maur",475,[4485187,-57383,-31,-20,13,-37,-72,-342,63,-36,32,-38]], // Paul Doumer ↔ Saint-Maur
    ["peixotto cote mairie","berteaux",493,[4480834,-59135,178,10,30,4,11,17,8,24,-8,60,-8,218]], // Peixotto (côté Mairie) ↔ Berteaux
    ["peixotto cote mairie","noailles",463,[4480834,-59135,208,14,16,-35,-29,-193,0,-51]], // Peixotto (côté Mairie) ↔ Noailles
    ["peixotto cote mairie","peixotto",211,[4480834,-59135,-64,-4,-75,-24,-18,6,-9,-15,-15,-7]], // Peixotto (côté Mairie) ↔ Peixotto
    ["peixotto cote mairie","peixotto tram b",309,[4480834,-59135,-64,-4,-84,-22,1,-14,-11,-11,-2,-38,35,-38,-16,-36]], // Peixotto (côté Mairie) ↔ Peixotto (Tram B)
    ["peixotto cote mairie","talence centre forum",272,[4480834,-59135,208,14,15,-42]], // Peixotto (côté Mairie) ↔ Talence Centre-Forum
    ["peixotto cote universite","berteaux",500,[4480833,-59148,90,5,4,13,115,9,11,17,8,24,-8,60,-8,218]], // Peixotto (côté Université) ↔ Berteaux
    ["peixotto cote universite","noailles",456,[4480833,-59148,213,15,6,-6,6,-17,-29,-193,0,-51]], // Peixotto (côté Université) ↔ Noailles
    ["peixotto cote universite","talence centre forum",266,[4480833,-59148,213,15,7,-9,4,-21]], // Peixotto (côté Université) ↔ Talence Centre-Forum
    ["peixotto tram b","mediatheque",356,[4480693,-59298,16,36,-35,38,2,38,12,20,-7,9,-14,117,6,48,35,81]], // Peixotto (Tram B) ↔ Médiathèque
    ["peixotto tram b","mediatheque cote chateau margaut",347,[4480693,-59298,16,36,-35,38,2,38,12,20,-7,9,-14,117,6,48,31,71]], // Peixotto (Tram B) ↔ Médiathèque (côté Château Margaut)
    ["peixotto tram b","peixotto cote universite",296,[4480693,-59298,16,36,-35,38,2,38,11,14,81,22,65,2]], // Peixotto (Tram B) ↔ Peixotto (côté Université)
    ["peixotto","mediatheque",245,[4480653,-59179,28,22,-14,103,1,38,5,24,35,81]], // Peixotto ↔ Médiathèque
    ["peixotto","mediatheque cote chateau margaut",236,[4480653,-59179,28,22,-14,103,1,38,5,24,31,71]], // Peixotto ↔ Médiathèque (côté Château Margaut)
    ["peixotto","peixotto cote universite",216,[4480653,-59179,15,7,2,-11,8,-3,9,14,71,20,75,4]], // Peixotto ↔ Peixotto (côté Université)
    ["pelleport","rue de begles",554,[4482084,-56581,34,-1,11,35,-64,37,-48,39,-143,157,-107,-104]], // Pelleport ↔ Rue de Bègles
    ["peres","avenue d eysines",397,[4485985,-60850,31,-119,46,-276,-8,-17,-50,-10]], // Pérès ↔ Avenue d'Eysines
    ["pericot","za picot",166,[4490374,-74489,61,-21,17,-29,23,-11,17,-40]], // Péricot ↔ ZA Picot
    ["perrin#0","coeur bersol",270,[4478020,-65120,32,-32,92,142,18,1,35,-48]], // Perrin ↔ Coeur Bersol
    ["perrin#0","langevin#0",375,[4478020,-65120,32,-32,92,142,14,5,1,18,88,139]], // Perrin ↔ Langevin
    ["perrin#1","pichey",240,[4484142,-66930,1,142,2,19,11,23,0,20,-63,22]], // Perrin ↔ Pichey
    ["pessac centre trendel","pessac centre tram b",201,[4480591,-63288,-2,-51,-57,28,-75,53]], // Pessac Centre (Trendel) ↔ Pessac Centre (Tram B)
    ["pessac centre","pessac centre tram b",229,[4480602,-63181,9,62,-101,36,-26,-71]], // Pessac Centre ↔ Pessac Centre (Tram B)
    ["pessac centre","pessac centre trendel",86,[4480602,-63181,-11,-107]], // Pessac Centre ↔ Pessac Centre (Trendel)
    ["pessac centre","rosa bonheur",141,[4480620,-63066,29,124,31,-22]], // Pessac Centre ↔ Rosa Bonheur
    ["peyronnet","gare saint jean rue saint vincent de paul",422,[4482751,-56120,66,43,-49,213,-44,34,-75,83]], // Peyronnet ↔ Gare Saint-Jean (rue Saint-Vincent de Paul)
    ["peyronnet","gare saint jean sous la halle",384,[4482751,-56120,4,3,-38,73,-127,232,13,90]], // Peyronnet ↔ Gare Saint-Jean (sous la Halle)
    ["peyronnet","lycee gustave eiffel",283,[4482751,-56120,66,43,29,-125,6,-6,-4,-8,23,-98]], // Peyronnet ↔ Lycée Gustave Eiffel
    ["pin galant","bedat",504,[4484445,-65154,-53,87,-24,55,46,21,40,-3,147,54,20,7,10,16,33,-51]], // Pin Galant ↔ Bedat
    ["pin galant","merignac centre mediatheque",489,[4484445,-65154,-59,99,-85,230,-132,-35,7,40]], // Pin Galant ↔ Mérignac Centre (Médiathèque)
    ["pins francs","hopital suburbain",583,[4486642,-62318,7,-9,156,202,49,34,-159,245,4,16]], // Pins-Francs ↔ Hôpital Suburbain
    ["piscine de thouars","charles de gaulle",419,[4479059,-59126,25,-10,6,174,-14,153,14,27,47,59,10,37]], // Piscine de Thouars ↔ Charles de Gaulle
    ["piscine grand parc","catros",542,[4485599,-57838,-19,18,-16,-367,-111,-49,-57,96]], // Piscine Grand Parc ↔ Catros
    ["piscine grand parc","trinite",397,[4485766,-57998,109,-105,12,18,26,-23,98,206]], // Piscine Grand Parc ↔ Trinité
    ["place du mayne","hustin",271,[4487329,-68250,27,-67,18,-196,45,21]], // Place du Mayne ↔ Hustin
    ["place du mayne","mairie du haillan",512,[4487329,-68250,-81,184,-46,172,34,23,-26,78,14,44,7,15,26,-20]], // Place du Mayne ↔ Mairie du Haillan
    ["place lopes","rue de lacanau",533,[4484590,-61304,-6,-25,36,4,42,-13,27,-28,26,21,24,-4,31,-129,27,-46,41,-148,-6,-9,-28,-11]], // Place Lopès ↔ Rue de Lacanau
    ["place meignan","centre de secours",421,[4490232,-50593,32,55,156,120,61,67,23,14,20,-21,8,-29]], // Place Meignan ↔ Centre de Secours
    ["place meignan","college manon cormier",287,[4490232,-50772,48,-177,-116,-55]], // Place Meignan ↔ Collège Manon Cormier
    ["place ravezies cote parc relais","cracovie tram c et e",363,[4486716,-57596,325,-36]], // Place Ravezies (côté Parc Relais) ↔ Cracovie (Tram C et E)
    ["place ravezies","cracovie tram c et e",285,[4486804,-57579,64,-7,-1,-27,174,-19]], // Place Ravezies ↔ Cracovie (Tram C et E)
    ["place ravezies","place ravezies cote parc relais",215,[4486701,-57568,-75,13,-1,-36,91,-5]], // Place Ravezies ↔ Place Ravezies (côté Parc Relais)
    ["place ravezies","sousa mendes",375,[4486645,-57438,50,111,-167,103,-3,23,-14,5,-9,40]], // Place Ravezies ↔ Sousa Mendès
    ["plaisance#1","kennedy vers buttiniere",515,[4486440,-50650,40,28,125,24,44,-5,122,-56,9,23,8,-12,-42,-110]], // Plaisance ↔ Kennedy (vers Buttinière)
    ["plein ciel","leon blum#0",505,[4484984,-64411,125,-58,-5,16,151,16,2,222]], // Plein Ciel ↔ Léon Blum
    ["polyclinique bordeaux nord","boutaut",482,[4486499,-57806,66,185,21,-15,21,1,16,12,17,27,164,-15,-2,-46]], // Polyclinique Bordeaux Nord ↔ Boutaut
    ["polyclinique bordeaux nord","galerie tatry",470,[4486499,-57806,66,185,-24,33,-3,28,-7,13,4,26,-144,173]], // Polyclinique Bordeaux Nord ↔ Galerie Tatry
    ["polyclinique bordeaux nord","place ravezies cote parc relais",348,[4486499,-57806,74,202,28,-11,32,28,83,-9]], // Polyclinique Bordeaux Nord ↔ Place Ravezies (côté Parc Relais)
    ["pont de l orient","le monteil cite le corbusier",468,[4480476,-64884,-51,20,-16,-9,-23,-33,-140,1,-10,138,2,110]], // Pont de l'Orient ↔ Le Monteil (Cité Le Corbusier)
    ["pont de l orient","lycee pape clement",352,[4480573,-64837,-3,-12,48,-18,-7,-49,74,-18,145,-4]], // Pont de l'Orient ↔ Lycée Pape Clément
    ["pont du guit","ateliers",463,[4482381,-55845,7,25,1,13,-5,3,-153,-152,-5,7,-11,-9,-78,115,-57,-31]], // Pont du Guit ↔ Ateliers
    ["pont du guit","bauducheu",231,[4482381,-55845,7,25,1,13,-5,3,-142,-141]], // Pont du Guit ↔ Bauducheu
    ["pont du guit","gare saint jean rue saint vincent de paul",345,[4482381,-55845,8,38,10,3,3,13,110,61,101,8,36,-25]], // Pont du Guit ↔ Gare Saint-Jean (rue Saint-Vincent de Paul)
    ["pont du guit","gare saint jean sous la halle",288,[4482381,-55845,8,38,10,3,3,13,87,52,50,15,64,2]], // Pont du Guit ↔ Gare Saint-Jean (sous la Halle)
    ["pont du guit","terres de borde",496,[4482381,-55845,8,38,-8,12,3,43,-51,223,-21,18,-120,2,-7,12,-8,70]], // Pont du Guit ↔ Terres de Borde
    ["pont simone veil rive gauche","jardin de l ars",414,[4482041,-54208,39,76,10,-7,-7,-14,8,-7,15,6,132,-48,19,-18,67,-100]], // Pont Simone Veil (Rive Gauche) ↔ Jardin de l'Ars
    ["prefecture","gambetta meriadeck",523,[4483701,-58707,80,-14,38,424,86,-12]], // Préfecture ↔ Gambetta Mériadeck
    ["prefecture","gambetta meriadeck terminus",458,[4483701,-58707,80,-14,10,122,117,-21,13,149,20,-4]], // Préfecture ↔ Gambetta Mériadeck (Terminus)
    ["prefecture","hotel de police",367,[4483701,-58707,-62,12,-12,19,-7,-6,-79,54,-17,9,-12,-8,-7,8,-43,-141]], // Préfecture ↔ Hôtel de Police
    ["prefecture","meriadeck",276,[4483701,-58707,80,-14,10,122,14,-2,8,93]], // Préfecture ↔ Mériadeck
    ["prefecture","meriadeck lateulade",232,[4483701,-58707,80,-14,10,122,41,-7]], // Préfecture ↔ Mériadeck Lateulade
    ["professeur vincent","sourdis",417,[4488582,-52110,0,87,-18,89,-15,-16,4,-66,-9,-34,-41,-64,-47,-24,-42,14]], // Professeur Vincent ↔ Sourdis
    ["proust","eglise de saint medard",322,[4489747,-71919,-31,83,-16,25,-13,7,-83,23,-53,2,-3,-68]], // Proust ↔ Eglise de Saint-Médard
    ["proust","gare routiere av du gal de gaulle",326,[4489792,-72013,5,-99,-34,-157,-8,-2,-73,74]], // Proust ↔ Gare Routière (av du Gal de Gaulle)
    ["provinces","blancherie",363,[4484988,-49519,-47,-147,-3,-49,-27,-31,-36,-104,-20,-77]], // Provinces ↔ Blancherie
    ["puyo","hastignan bourg",448,[4489827,-74649,-60,-22,-12,19,8,72,0,138,-54,230]], // Puyo ↔ Hastignan Bourg
    ["quai de brazza","lajaunie",235,[4485575,-55002,43,88,68,117,-5,7,14,22]], // Quai de Brazza ↔ Lajaunie
    ["quarante journaux cote ginko","lavignolle",398,[4488326,-57058,-18,90,5,6,-16,61,-43,96,47,83,17,69,2,43]], // Quarante Journaux (côté Ginko) ↔ Lavignolle
    ["quarante journaux cote parc entreprises","lavignolle",379,[4488328,-57036,-36,152,-38,79,47,83,17,69,2,43]], // Quarante Journaux (côté Parc Entreprises) ↔ Lavignolle
    ["radio","stade cap de bos",426,[4478531,-68264,61,117,39,22,71,-53,31,-36,12,2,53,-37,42,-12]], // Radio ↔ Stade Cap de Bos
    ["rebedech","mairie de floirac",495,[4483292,-52316,-22,-72,-17,-30,-111,-111,-50,-110,89,-137]], // Rébédech ↔ Mairie de Floirac
    ["rene coty pasteur","halte ter coty",254,[4492762,-49184,49,-83,78,-182]], // René Coty (Pasteur) ↔ Halte TER Coty
    ["republique#1","albret",318,[4483467,-57997,-5,-41,-210,72,-8,-10,8,-38]], // République ↔ Albret
    ["republique#1","palais de justice",190,[4483508,-58016,-3,-33,121,-45,-6,-28]], // République ↔ Palais de Justice
    ["residence le chateau","college niki de saint phalle",358,[4477974,-57283,-28,164,1,21,8,27,13,0,99,161]], // Résidence Le Château ↔ Collège Niki de Saint Phalle
    ["residence meignan","emile zola",460,[4490334,-50928,29,14,-3,16,28,99,2,39,50,80,-84,217,12,9]], // Résidence Meignan ↔ Emile Zola
    ["residence meignan","place meignan",192,[4490323,-50933,-25,-12,-18,9,-48,164]], // Résidence Meignan ↔ Place Meignan
    ["residences du domaine","deveaux rue pasteur",360,[4484965,-62330,-20,68,-78,-42,-40,16,-54,2,-38,-11,1,-76]], // Résidences du Domaine ↔ Deveaux (rue Pasteur)
    ["rigaillou","college chambery",74,[4475766,-58271,7,-61,-19,-16]], // Rigaillou ↔ Collège Chambéry
    ["rigaillou","piscine chambery",440,[4475766,-58271,7,-61,-66,-54,-16,-2,-112,-104,-25,-8,-10,-28,-30,-32,3,-7,-28,-23]], // Rigaillou ↔ Piscine Chambéry
    ["rigal","cracovie tram c et e",546,[4486790,-57963,14,357,237,-26]], // Rigal ↔ Cracovie (Tram C et E)
    ["rives d arcins rue denis papin","rives d arcins",55,[4479130,-53172,6,69]], // Rives d'Arcins (rue Denis Papin) ↔ Rives d'Arcins
    ["riviere","mandron",300,[4485714,-58892,171,-63,18,0,66,48]], // Rivière ↔ Mandron
    ["riviere","parc riviere",422,[4485714,-58892,-46,15,51,209,-115,185]], // Rivière ↔ Parc Rivière
    ["riviere","tivoli",240,[4485714,-58892,48,-20,-28,-168,38,27]], // Rivière ↔ Tivoli
    ["rochefort","la prairie#1",469,[4477616,-61124,227,137,21,-47,56,-85,27,-63]], // Rochefort ↔ La Prairie
    ["rond point","village 2",461,[4480547,-61559,25,106,-284,134,15,44]], // Rond-Point ↔ Village 2
    ["ronsard","la forge cite le corbusier",357,[4480263,-64182,-4,-213,-15,-150,-62,5]], // Ronsard ↔ La Forge (Cité Le Corbusier)
    ["ronsard","sainte marie",372,[4480263,-64182,-4,-213,-15,-150,74,-3]], // Ronsard ↔ Sainte-Marie
    ["rubens","calmette#0",305,[4485234,-51415,29,-222,-12,-45,-8,-3,-3,-10,-59,-26]], // Rubens ↔ Calmette
    ["rubens","goya",521,[4485220,-51349,-28,228,80,21,-10,119,91,29,-8,56]], // Rubens ↔ Goya
    ["rubens","jean zay",305,[4485234,-51415,-4,30,106,27,-2,11,50,16,5,11,11,3,14,-92]], // Rubens ↔ Jean Zay
    ["rue d aviau","paul doumer",380,[4485024,-57715,-8,24,114,70,39,181,-13,37,31,20]], // Rue d'Aviau ↔ Paul Doumer
    ["rue d aviau","saint maur",238,[4485024,-57715,17,-56,18,12,101,-59,32,-38]], // Rue d'Aviau ↔ Saint-Maur
    ["rue de l amitie","college jean jaures",291,[4486313,-51080,-28,-153,6,-26,-5,-28,20,-119,-21,-9]], // Rue de l'Amitié ↔ Collège Jean Jaurès
    ["rue de la reole","beautiran",200,[4482181,-56933,-14,-28,60,-151,-31,-13]], // Rue de la Réole ↔ Beautiran
    ["rue de macau","bigeau",408,[4495425,-60675,43,-8,27,-160,5,-70,-5,-33,-6,-28,-24,-46,67,-31]], // Rue de Macau ↔ Bigeau
    ["rue des ecus","college ausone",342,[4487033,-59797,-25,22,30,52,29,24,57,20,20,40,37,33,-35,69]], // Rue des Ecus ↔ Collège Ausone
    ["rue des ecus","lafont",217,[4487003,-59772,55,-53,-33,-100,-47,24]], // Rue des Ecus ↔ Lafont
    ["rue des ecus","lanet",126,[4487033,-59797,25,-28,72,51]], // Rue des Ecus ↔ Lanet
    ["rue du reduit","ducasse",372,[4488344,-59757,-44,80,-12,48,2,34,20,72,53,118,-5,18,-31,21]], // Rue du Réduit ↔ Ducasse
    ["sadi carnot","louis blanc",434,[4486415,-59042,-27,5,-13,-408,8,-7,3,-14,54,-5]], // Sadi Carnot ↔ Louis Blanc
    ["sadi carnot","mandron",477,[4486355,-59030,-150,25,-183,65,-6,10,-25,2,-2,24,32,25]], // Sadi Carnot ↔ Mandron
    ["sadi carnot","poincare",388,[4486355,-59030,-110,14,-1,-144,-16,-148,-28,7]], // Sadi Carnot ↔ Poincaré
    ["saint aubin villepreux","plaine des sports",296,[4491285,-73800,5,-31,-6,-8,2,-15,-114,-182,-1,-17,-9,0,-18,-31]], // Saint-Aubin Villepreux ↔ Plaine des Sports
    ["saint bruno hotel de region","bibliotheque#1",505,[4483748,-59007,-35,28,-130,71,-48,23,-88,24,51,175]], // Saint-Bruno - Hôtel de Région ↔ Bibliothèque
    ["saint bruno hotel de region","hotel de police",454,[4483748,-59007,-35,28,-130,71,-48,23,-88,24,6,20,-14,7,23,74]], // Saint-Bruno - Hôtel de Région ↔ Hôtel de Police
    ["saint bruno hotel de region","meriadeck",360,[4483846,-58871,-73,18,20,100,20,245]], // Saint-Bruno - Hôtel de Région ↔ Mériadeck
    ["saint bruno hotel de region","piscine judaique",303,[4483853,-58990,22,69,172,-107,30,5]], // Saint-Bruno - Hôtel de Région ↔ Piscine Judaïque
    ["saint exupery#1","jacques brel#1",479,[4486403,-66082,-2,-21,80,-353,-2,-9,-124,-99]], // Saint-Exupéry ↔ Jacques Brel
    ["saint hubert","los angeles",408,[4479178,-67229,42,34,37,-47,3,-20,-12,-355]], // Saint-Hubert ↔ Los Angeles
    ["saint nicolas","capucins",466,[4482749,-57243,10,0,-10,224,56,6,-5,134,95,38]], // Saint-Nicolas ↔ Capucins
    ["saint nicolas","lafontaine",282,[4482666,-57249,-8,-1,-8,310,-25,-10]], // Saint-Nicolas ↔ Lafontaine
    ["saint paulin","dotezac",459,[4480561,-55909,73,-33,3,-11,8,5,37,-19,30,63,7,38,53,-1,3,203]], // Saint-Paulin ↔ Dotézac
    ["saint seurin","capdeville",376,[4484202,-58467,29,-103,17,-28,77,-50,4,27,29,-6,82,-37,-9,-14]], // Saint-Seurin ↔ Capdeville
    ["saint seurin","gambetta meriadeck terminus",411,[4484140,-58424,6,76,-141,24,7,-20,-13,-140,-58,9]], // Saint-Seurin ↔ Gambetta Mériadeck (Terminus)
    ["saint seurin","meriadeck",542,[4484140,-58424,-7,-87,-143,-120,-8,10,-32,-8,-145,28,8,93]], // Saint-Seurin ↔ Mériadeck
    ["saint seurin","meriadeck lateulade",438,[4484140,-58424,-7,-87,-140,-119,-11,9,-32,-8,-118,23]], // Saint-Seurin ↔ Mériadeck Lateulade
    ["sainte marie","stade nautique",208,[4480318,-64548,-74,3,15,155]], // Sainte-Marie ↔ Stade Nautique
    ["salengro","dotezac",332,[4480699,-55984,-17,17,30,63,7,38,53,-1,3,203]], // Salengro ↔ Dotézac
    ["salengro","martyrs de la resistance",87,[4480731,-56018,34,-25,7,6,-3,42]], // Salengro ↔ Martyrs de la Résistance
    ["salengro","place de la raze",438,[4480731,-56018,36,-46,-65,-145,-97,-191,-13,-76]], // Salengro ↔ Place de la Raze
    ["sarget","enseirb",544,[4480857,-60868,9,51,4,135,17,85,-77,22,-19,-25,-28,2,-54,-47,-70,-91]], // Sarget ↔ Enseirb
    ["sarget","village 1",476,[4480857,-60868,9,51,4,135,17,97,-44,22,-32,2,-11,6,-8,17,10,78,-2,84]], // Sarget ↔ Village 1
    ["schweitzer","jules verne",559,[4477394,-53224,-5,66,44,6,25,37,61,3,8,-73,135,24,8,124,-15,35]], // Schweitzer ↔ Jules Verne
    ["seguineau","cours d ornano",449,[4483501,-60988,-82,-44,5,-24,-7,-15,-77,-44,-18,-18,-65,-130,17,-91]], // Seguineau ↔ Cours d'Ornano
    ["seguineau","eglise saint augustin",324,[4483501,-60988,-204,-98,-24,-29,-17,-4,-11,33]], // Seguineau ↔ Eglise Saint-Augustin
    ["sembat#1","belvedere",370,[4483340,-54978,16,-33,-6,-6,13,-25,-1,-9,57,-115,16,-53,105,98]], // Sembat ↔ Belvédère
    ["serpent","bougnard",355,[4479181,-63296,58,49,4,-15,-4,-102,6,-18,43,-64,50,-53,9,-1,-2,27]], // Serpent ↔ Bougnard
    ["simone veil rive gauche","cite sncf",368,[4482050,-54219,-161,-304,-4,7,-33,-62]], // Simone-Veil (Rive Gauche) ↔ Cité SNCF
    ["simone veil rive gauche","pont simone veil rive gauche",128,[4482050,-54219,-30,-59,-9,9,30,61]], // Simone-Veil (Rive Gauche) ↔ Pont Simone Veil (Rive Gauche)
    ["somme","fenelon",397,[4490645,-51713,72,-6,39,18,7,-6,159,167,15,-16,7,-21]], // Somme ↔ Fénelon
    ["somme","montsouris",124,[4490645,-51713,72,-6,3,53]], // Somme ↔ Montsouris
    ["sourdis","brutails",588,[4488414,-52124,-21,15,-22,-2,-36,-46,-39,-67,-8,-38,8,-10,17,-98,-15,-65,22,-9,7,13,44,17,30,27,23,-7,15,4,-6,45,18,22]], // Sourdis ↔ Brutails
    ["stalingrad rue de la benauge","stalingrad tram a",288,[4483949,-55885,-20,-69,54,-65,13,13,21,-25,-9,-18,11,-15,39,63]], // Stalingrad (rue de la Benauge) ↔ Stalingrad (Tram A)
    ["stalingrad sem","stalingrad rue de la benauge",208,[4483887,-55949,-36,30,2,24,14,21,34,-37,21,-8,20,9,7,25]], // Stalingrad (Sem) ↔ Stalingrad (rue de la Benauge)
    ["stalingrad","stalingrad sem",206,[4483948,-55888,-6,-22,-20,-9,-21,8,-34,37,-14,-21,-2,-24,36,-30]], // Stalingrad ↔ Stalingrad (Sem)
    ["stalingrad","stalingrad tram a",34,[4484038,-56033,20,32]], // Stalingrad ↔ Stalingrad (Tram A)
    ["strelitzias","bosquets",527,[4485638,-65161,4,-36,-100,8,-13,11,-59,8,-7,-13,-1,-21,4,-21,13,-13,-2,-46,-17,-2,-2,-45,-54,5,-5,107]], // Strélitzias ↔ Bosquets
    ["talence centre forum cote esplanade","berteaux",329,[4481136,-59106,-70,-10,-4,8,-9,88,-8,218]], // Talence Centre-Forum (côté Esplanade) ↔ Berteaux
    ["talence centre forum cote esplanade","noailles",309,[4481136,-59106,-70,-10,-37,-233,0,-51]], // Talence Centre-Forum (côté Esplanade) ↔ Noailles
    ["talence centre forum cote esplanade","talence centre forum",102,[4481136,-59106,-70,-10,-4,29]], // Talence Centre-Forum (côté Esplanade) ↔ Talence Centre-Forum
    ["tassigny#0","cauderan centre",286,[4485482,-61410,42,11,2,8,-118,238]], // Tassigny ↔ Caudéran Centre
    ["tassigny#0","college saint andre",160,[4485573,-61385,-39,-16,24,-128]], // Tassigny ↔ Collège Saint-André
    ["terrefort#1","la generale",351,[4476545,-56208,-181,176,7,-132]], // Terrefort ↔ La Générale
    ["terrefort#2","gare de bruges rue louis fleurenceau",531,[4488802,-61301,10,109,-44,-24,-9,2,-6,27,-14,9,-104,-46,-28,16,-42,99,-19,115]], // Terrefort ↔ Gare de Bruges (rue Louis Fleurenceau)
    ["terres de borde","ateliers",512,[4482177,-55427,8,-70,-23,-9,-69,-3,-18,-18,0,-20,53,-279,9,-17,-55,-30]], // Terres de Borde ↔ Ateliers
    ["terres de borde","gare saint jean hall 3",308,[4482177,-55427,13,-79,16,33,12,3,177,3]], // Terres de Borde ↔ Gare Saint-Jean (Hall 3)
    ["terres neuves tram c","capelle#0",355,[4481550,-55160,165,310,43,-16]], // Terres Neuves (Tram C) ↔ Capelle
    ["terres neuves","capelle#0",304,[4481574,-55096,134,249,50,-19]], // Terres Neuves ↔ Capelle
    ["terres neuves","tandonnet",460,[4481574,-55096,197,370,-68,71]], // Terres Neuves ↔ Tandonnet
    ["terres neuves","terres neuves tram c",66,[4481574,-55096,-17,-30,8,-7,-15,-27]], // Terres Neuves ↔ Terres Neuves (Tram C)
    ["tillet","beautiran",295,[4482157,-57245,-104,4,-22,23,16,33,102,41]], // Tillet ↔ Beautiran
    ["tillet","caserne nansouty",501,[4482157,-57245,-104,4,-22,23,69,133,-104,57,33,119]], // Tillet ↔ Caserne Nansouty
    ["tillet","kyrie",373,[4482183,-57246,185,-12,-35,189,11,5]], // Tillet ↔ Kyrié
    ["tillet","rue de la reole",425,[4482157,-57245,-104,4,-22,23,150,285]], // Tillet ↔ Rue de la Réole
    ["tilleuls","germaine tillion",353,[4486419,-65562,-33,-100,-25,-36,-19,-6,-43,248]], // Tilleuls ↔ Germaine Tillion
    ["tivoli","boulevard pierre 1er",231,[4485772,-59053,151,113,-28,35]], // Tivoli ↔ Boulevard Pierre 1er
    ["tivoli","clinique tivoli",397,[4485772,-59053,-38,-27,28,168,-9,3,48,129,-57,78]], // Tivoli ↔ Clinique Tivoli
    ["tour de gassies","baudon",302,[4488119,-62869,82,-123,11,6,96,3,8,9,18,1,0,22]], // Tour de Gassies ↔ Baudon
    ["tour de gassies","centre tour de gassies",435,[4488119,-62869,13,-21,123,137,43,74,67,62,12,32,-34,30]], // Tour de Gassies ↔ Centre Tour de Gassies
    ["tour de gassies","les templiers",68,[4488119,-62869,13,-21,33,35]], // Tour de Gassies ↔ Les Templiers
    ["tout y faut","cimetiere intercommunal#1",363,[4486487,-48973,70,-61,10,-28,21,3,17,-7,13,23,55,28,19,-7,38,10,5,-20,12,-3,4,-22]], // Tout y Faut ↔ Cimetière Intercommunal
    ["toutaud","bourdieu",367,[4489395,-51671,58,-24,35,-1,0,8,81,27,16,18,11,-3,-15,159]], // Toutaud ↔ Bourdieu
    ["toutaud","calmette#1",415,[4489376,-51648,47,-23,2,31,-9,114,5,79,-4,91,-98,-4]], // Toutaud ↔ Calmette
    ["toutaud","capdeboscq",296,[4489376,-51648,-65,30,-29,4,-3,27,-81,175]], // Toutaud ↔ Capdeboscq
    ["tregey","la tresne",461,[4483897,-54626,15,-2,4,-32,82,-106,14,-2,-27,-68,116,-36,-14,-103]], // Trégey ↔ La Tresne
    ["trianon","saint saens",453,[4485209,-63800,-48,280,197,70]], // Trianon ↔ Saint-Saëns
    ["truffaut","bosquets",451,[4485618,-64825,2,-125,-21,0,-57,-47,-166,6,19,-84]], // Truffaut ↔ Bosquets
    ["truffaut","jean blanc",499,[4485618,-64767,-4,379,-60,-9,-114,-41]], // Truffaut ↔ Jean Blanc
    ["turenne#1","saint seurin",491,[4484528,-58547,6,7,-5,25,-12,24,-68,16,-55,-20,-76,-7,-55,19,-69,65,-10,3,18,-52]], // Turenne ↔ Saint-Seurin
    ["urssaf","bordeaux plage",257,[4487569,-57947,144,-6,9,18,-10,96]], // URSSAF ↔ Bordeaux Plage
    ["urssaf","centre de formation du lac",497,[4487569,-57947,144,-6,9,18,-10,92,-1,79,10,43,-1,20,58,140]], // URSSAF ↔ Centre de Formation du Lac
    ["vassivey","rue de macau",415,[4495249,-60945,-2,46,6,14,-16,33,41,206,147,-29]], // Vassivey ↔ Rue de Macau
    ["vercors","les pins av magudas",285,[4485565,-65710,69,-16,55,-38,15,-3,24,-150]], // Vercors ↔ Les Pins (av Magudas)
    ["verdun#0","ferme de bauge",489,[4477116,-58219,24,75,8,3,178,-194,68,79,12,2,-8,-63]], // Verdun ↔ Ferme de Baugé
    ["verdun#1","avenue d eysines",95,[4486059,-61218,3,-27,-8,-17,-50,-10]], // Verdun ↔ Avenue d'Eysines
    ["vergne bricaud","richaud",237,[4489094,-56115,-32,1,-30,-16,-105,-148]], // Vergne-Bricaud ↔ Richaud
    ["victoire","hopital saint andre",411,[4483118,-57412,83,-379,88,-13]], // Victoire ↔ Hôpital Saint-André
    ["village 1","arts metiers",429,[4480786,-60360,-12,185,-7,31,-16,29,-30,24,-70,36,-18,18,-23,-11,-10,6,-6,14,-20,-12]], // Village 1 ↔ Arts & Métiers
    ["village 1","inria",401,[4480786,-60360,0,36,7,12,2,28,-8,122,-14,46,-21,33,0,22,11,21,113,13]], // Village 1 ↔ INRIA
    ["village 2","doyen brus",550,[4480310,-61249,-29,-68,-158,74,-37,38,-15,39,-5,33,15,169,11,8,3,11,23,-15]], // Village 2 ↔ Doyen Brus
    ["village 5","le b e c",479,[4479142,-61418,255,-135,3,-16,-55,-91,-28,-76]], // Village 5 ↔ Le B.E.C
    ["village cap de bos","stade cap de bos",362,[4478655,-68012,-28,-65,0,-29,103,-82,14,1,4,-16,32,-23,33,-18,34,-7]], // Village Cap de Bos ↔ Stade Cap de Bos
    ["village de cerillan","glaena",386,[4489472,-75712,16,110,-11,114,8,36,-4,45,13,43,37,64,-3,6,21,24]], // Village de Cerillan ↔ Glaena
    ["villenave centre pont de la maye","lycee vaclav havel",401,[4478368,-56617,189,-19,5,51,40,181]], // Villenave Centre (Pont de la Maye) ↔ Lycée Vaclav Havel
    ["villepreux","saint aubin cimetiere",443,[4491317,-73806,-13,-20,-17,7,-4,41,-2,437,0,23,6,1]], // Villepreux ↔ Saint-Aubin Cimetière
    ["villepreux","saint aubin villepreux",57,[4491317,-73806,-13,-20,-17,7,-2,19]], // Villepreux ↔ Saint-Aubin Villepreux
    ["virginia","deveaux rue pasteur",488,[4485024,-62563,-17,68,-65,50,-75,141,-67,19,-65,-12,1,-76]], // Virginia ↔ Deveaux (rue Pasteur)
    ["virginia","murat",461,[4485024,-62563,9,-45,-286,-141,-2,110]], // Virginia ↔ Murat
    ["xaintrailles","barriere de pessac",457,[4482761,-59185,43,168,-240,143,14,25]], // Xaintrailles ↔ Barrière de Pessac
    ["za haut vigneau","prince de galles",562,[4477163,-63114,-35,55,-37,-43,10,-44,-79,-19,-146,81,-61,-159]], // ZA Haut-Vigneau ↔ Prince de Galles
  ],
  // Paires écartées, marche de plus de 600 m : [station A, station B, mètres] (non utilisées,
  // gardées pour ne pas les redemander à l'IGN à la prochaine génération).
  tooLong: [
    ["polyclinique bordeaux nord","rigal",724], // Polyclinique Bordeaux Nord ↔ Rigal
    ["rue de la paix#1","terrefort#1",615], // Rue de la Paix ↔ Terrefort
    ["olympiades","pin galant",663], // Olympiades ↔ Pin Galant
    ["olympiades","mairie de merignac",637], // Olympiades ↔ Mairie de Mérignac
    ["pradas","merignac soleil porte 4",623], // Pradas ↔ Mérignac Soleil (Porte 4)
    ["college emile zola","jean jaures rue de la morandiere",695], // Collège Emile Zola ↔ Jean Jaurès (rue de la Morandière)
    ["le poteau","vendangeurs",1633], // Le Poteau ↔ Vendangeurs
    ["vieille cure","marechal joffre#1",604], // Vieille Cure ↔ Maréchal Joffre
    ["vieille cure","mallarme",703], // Vieille Cure ↔ Mallarmé
    ["verdot","parc du peyrou",1318], // Verdot ↔ Parc du Peyrou
    ["la lande#1","za artigues",772], // La Lande ↔ ZA Artigues
    ["ducourneau","centre administratif",628], // Ducourneau ↔ Centre Administratif
    ["pape clement place sellier","marechal foch#0",880], // Pape Clément (Place Sellier) ↔ Maréchal Foch
    ["liberation#0","capeyron",626], // Libération ↔ Capeyron
    ["meyraud","macedo",636], // Meyraud ↔ Macédo
    ["vincent","galin terminus",694], // Vincent ↔ Galin Terminus
    ["hauts de guitres","les compagnons",1189], // Hauts de Guitres ↔ Les Compagnons
    ["allende#1","place des 2 villes vers buttiniere",974], // Allende ↔ Place des 2 Villes (vers Buttinière)
    ["allende#1","place des 2 villes vers rocade",1153], // Allende ↔ Place des 2 Villes (vers Rocade)
    ["sarget","clinique mutualiste",755], // Sarget ↔ Clinique Mutualiste
    ["colibris#1","saint aubin cimetiere",957], // Colibris ↔ Saint-Aubin Cimetière
    ["parc d espagne","les bois de l alouette",690], // Parc d'Espagne ↔ Les Bois de l'Alouette
    ["maison de convalescence","professeur vincent",1187], // Maison de Convalescence ↔ Professeur Vincent
    ["maison de convalescence","sourdis",1165], // Maison de Convalescence ↔ Sourdis
    ["maison de convalescence","brutails",1126], // Maison de Convalescence ↔ Brutails
    ["maison de convalescence","carriet",975], // Maison de Convalescence ↔ Carriet
    ["maison de convalescence","magendie",769], // Maison de Convalescence ↔ Magendie
    ["rebedech","eglise de floirac",690], // Rébédech ↔ Eglise de Floirac
    ["la moune","vendangeurs",1918], // La Moune ↔ Vendangeurs
    ["pont du guit","gare saint jean hall 3",673], // Pont du Guit ↔ Gare Saint-Jean (Hall 3)
    ["castillon","mandron",617], // Castillon ↔ Mandron
    ["capeyron","truffaut",672], // Capeyron ↔ Truffaut
    ["marechal joffre#1","beausite",778], // Maréchal Joffre ↔ Beausite
    ["marechal joffre#1","guyon#1",1006], // Maréchal Joffre ↔ Guyon
    ["marechal joffre#1","cenon gare tram a",633], // Maréchal Joffre ↔ Cenon Gare (Tram A)
    ["pierre curie#0","taris",665], // Pierre Curie ↔ Taris
    ["le b e c","village 6 iut cote resto u",606], // Le B.E.C ↔ Village 6 IUT (côté Resto U)
    ["professeur vincent","carriet",622], // Professeur Vincent ↔ Carriet
    ["victor hugo#1","guyon#1",1257], // Victor Hugo ↔ Guyon
    ["delattre","gare de bruges tram e",3037], // Delattre ↔ Gare de Bruges (tram E)
    ["les echoppes","cimetiere",621], // Les Echoppes ↔ Cimetière
    ["centre commercial 4 pavillons","place des 2 villes vers buttiniere",984], // Centre Commercial (4 Pavillons) ↔ Place des 2 Villes (vers Buttinière)
    ["centre commercial 4 pavillons","place des 2 villes vers rocade",1176], // Centre Commercial (4 Pavillons) ↔ Place des 2 Villes (vers Rocade)
    ["boulevard roosevelt","nansouty",613], // Boulevard Roosevelt ↔ Nansouty
    ["langevin#1","tassigny#1",669], // Langevin ↔ Tassigny
    ["place de l europe","ampere grand parc",671], // Place de l'Europe ↔ Ampère-Grand Parc
    ["lino ventura","villeneuve",809], // Lino Ventura ↔ Villeneuve
    ["college andree chedid","jacques brel#1",673], // Collège Andrée Chédid ↔ Jacques Brel
    ["enseirb","candau",730], // Enseirb ↔ Candau
    ["goujon","parc de feydit",812], // Goujon ↔ Parc de Feydit
    ["lafontaine","lycee gustave eiffel",621], // Lafontaine ↔ Lycée Gustave Eiffel
    ["duplantier","stade suzon",647], // Duplantier ↔ Stade Suzon
    ["mairie de lormont","carriet",685], // Mairie de Lormont ↔ Carriet
    ["russel","les compagnons",931], // Russel ↔ Les Compagnons
    ["la vigne","parc du peyrou",1091], // La Vigne ↔ Parc du Peyrou
    ["fragonard","caillou",627], // Fragonard ↔ Caillou
    ["peixotto tram b","noailles",747], // Peixotto (Tram B) ↔ Noailles
    ["cassin","becquerel",611], // Cassin ↔ Becquerel
    ["parc sourreil","verlaine",835], // Parc Sourreil ↔ Verlaine
    ["parc sourreil","charles de gaulle",923], // Parc Sourreil ↔ Charles de Gaulle
    ["centre de voile","arc en ciel",660], // Centre de Voile ↔ Arc-en-Ciel
    ["gare saint jean arret de descente","gare saint jean hall 3",914], // Gare Saint-Jean (arrêt de Descente) ↔ Gare Saint-Jean (Hall 3)
    ["gare saint jean","gare saint jean hall 3",670], // Gare Saint-Jean ↔ Gare Saint-Jean (Hall 3)
    ["gare saint jean arret de montee","gare saint jean hall 3",912], // Gare Saint-Jean (arrêt de Montée) ↔ Gare Saint-Jean (Hall 3)
    ["gare saint jean sous la halle","gare saint jean hall 3",860], // Gare Saint-Jean (sous la Halle) ↔ Gare Saint-Jean (Hall 3)
    ["gare saint jean rue saint vincent de paul","gare saint jean hall 3",916], // Gare Saint-Jean (rue Saint-Vincent de Paul) ↔ Gare Saint-Jean (Hall 3)
    ["moulin a vent","le grand caillou",622], // Moulin à Vent ↔ Le Grand Caillou
    ["le plateau","gasteboy",659], // Le Plateau ↔ Gasteboy
    ["biblanque","dessolies",693], // Biblanque ↔ Dessolies
  ],
};
