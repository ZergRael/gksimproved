GKSimproved
===========


Améliore et facilite la navigation sur certaines parties de gks.gs

Voir topic associé.

### TODO.done
- Badges : Suppression du tracking sur le badge IRC, la stat associée a disparu :(
- Endless scrolling : Ajout sur la recherche forum
- Endless scrolling : Ajout sur l'historique des uploads utilisateur
- Episode watcher : Réécriture complète du panneau de configuration pour satisfaire les petites résolutions
- Global : Améliorations diverses pour le support des CSS perso
- Global : Migration sur jQuery 2.0
- Global : Ajout d'un package Firefox pour Android
- Global : Utilisation du stockage interne aux extension Chrome/Firefox - Adieu localStorage
- Global : Ajout d'un import/export des options
- Torrent : Ajout de l'étoile bookmark dans le header de la fiche torrent
- Torrent : Ajout de l'étoile bookmark dans les suggestions des fiches torrent
- Torrent list : Correction de la colonne d'age pour prendre en compte les timezone
- Torrent list : Refonte du système de filtres - Devrait être plus rapide et compréhensible
- Torrent list : Amélioration de la preview pour séléctionner l'image la plus intéressante de la fiche torrent
- Torrent list : Ajout d'une colonne de bookmarks
- Torrent list : Refonte du filtre par chaîne de caractères
- Snatched : Refonte du système de filtres


### Changelog
**0.4.3**
- Bookmarks : Correction de la mise en valeur après le tri
- Global : Correction du bouton de l'episode watcher
- Global : Retrait de la confirmation lors du vidage de l'episode watcher
- Torrent list : Correction du z-index sur la preview
- Torrent list : Correction de la preview bloquée en cas de clic sur le [+]
- Wiki : Barre de BBCode avec raccourcis claviers à l'edit

**0.4.2**
- Global : Correction de la transparence des fenêtres avec les différents CSS
- Torrent list : Correction d'une erreur de DOM sur la preview avec Chromium

**0.4.1**
- Global : Correction du z-index sur le watcher d'épisodes afin de fonctionner avec les différents CSS
- Torrent list : Correction de la preview pour s'afficher entièrement dans la page

**0.4.0**
- Bookmarks : Mise en valeur du dernier torrent téléchargé
- Bookmarks : Tri des torrents par clic d'entête de colonne
- Endless scrolling : Bug fixes en tout genre
- Endless scrolling : Ajout sur /reseed.php
- Global : Affichage du buffer par mouseover sur l'upload/download de l'entête
- Global : Ajout du buffer réel avec les stats réelles
- Global : Tentative de correction du récupérateur de stats réelles et du badge snatched
- Global : Ajout d'un système de vérification des derniers épisodes des séries suivies
- Logs : Lien sur les id de summary
- Logs : Lien de recherche sur les titres de requests
- Logs : Correction des liens sur les lignes ajoutées par autorefresh
- Torrent list : Ajout d'une preview de l'image principale de la fiche torrent par mouseover sur le [+]

**0.3.6**
- Account : Preview du custom menu et de la signature
- Global : Correction de l'espace manquant dans les stats réelles
- Logs : Texte en bas de page mis à jour en fonction du filtrage
- Torrent list : Ajout d'une option pour la prise en compte de la casse sur le filtre par exclusion de chaîne de caractères
- Torrent list : Un clic sur l'étoile des bookmarks supprime le bookmark en question

**0.3.5**
- Bookmarks : Rafraichissement de la liste interne à chaque ajout de bookmark - L'étoile devrait apparaître directement
- Global : Possibilité de transformer les loupes en boutons de recherche dans les champs de l'entête (Torrents/Requests/Summary/etc)
- Logs : Possibilité de filtrer sur plusieurs critères simultannés
- Logs : Ajout des filtres Request fill / Summary edit / Summary new
- Peers : Arrondi sur la valeur d'upload total de l'entête du tableau
- Torrent list : Auto-refresh sur /browse/
- Torrent list : Résultats Discogs lorsque la recherche est effectuée en catégorie FLAC
- Torrent list : Correction de l'étoile des bookmarks sur Firefox
- Torrent list : Choix de la couleur de l'auto-refresh
- Torrent list : Filtrage par exclusion de chaîne de caractères

**0.3.4**
- Passage en licence MIT, plus permissive
- Badges : Correction de la valeur du badge snatched - Calcul du nombre de torrents complétés plutôt que la valeur donnée par le site
- Logs : Filtres upload/delete/edit/request
- Logs : Liens sur les id torrents des lignes upload et edit
- Peers : Rappatriement de toutes les pages
- Peers : Filtrage des torrents actifs
- Peers : Vitesse de seed total en entête de tableau lorsque toutes les pages sont chargées
- Torrent finder : Les boutons sont optionnels
- Torrent list : Auto refresh des derniers torrents (1 min)
- Torrent list : Colonne autoget corrigée sur /sphinx/
- Torrent list : Ajout d'une icone sur les torrents bookmarkés
- Torrent list : Correction des suggestions IMDB & affichage du chargement
- Uploads : Tri par clic sur les entêtes de colonnes (expérimental)

**0.3.3**
- Global : Evenements de début et fin de process
- Mouseover comments : Fermeture de la fenêtre au clic en dehors de celle-ci
- Torrent finder : Retour aux 2 boutons plutôt qu'une fenêtre
- Torrent list : Ajout d'une colonne d'autoget

**0.3.2**
- Aura : Amélioration des calculs pour supporter les pages de 500+ torrents. (1k+ maintenant)
- Aura : Colonne de rentabilité par torrent (A/Go) - ravomavain
- Badges : Correction de l'affichage de la progression sur /m/badges/
- Badges : Correction de la détection des valeurs en cas d'utilisateur invité
- Badges : Ajout du dernier badge forum
- Badges : Afficher les tooltips de tous les badges - ravomavain
- Badges : Afficher les badges manquants et tooltips sur les pages d'autres utilisateurs - ravomavain
- Bookmark : Suppression par catégorie - ravomavain
- Bookmark : Ajout des 15 premiers bookmarks à l'autoget & suppression automatique - ravomavain
- Endless scrolling : Dans la pagination, la page actuelle est cliquable
- Global : Ajout des données de download et ratio réel avec l'upload réel
- Mouseover comments : Correction de l'affichage sur les pages endless scrollées
- Options : Ajout d'un onglet "Tout" et sauvegarde du dernier onglet consulté
- Options : Correction des onglets sur les petites résolutions
- Torrent finder : Changement des 2 boutons en une fenêtre plus explicative
- Torrent list : Correction des tris par colonnes avec la colonne d'age
- Torrent list : Corrections sur la fenêtre de commentaires au mouseover
- Torrent list : Ajout du filtre Scene
- Torrent list : Corrections sur la section PSP
- Torrent list : Correction des filtres et colonne age sur les résultats IMDB - ravomavain
- Torrent list : Ajout des 40 premiers torrents aux bookmarks - ravomavain
- Summary : Ajout des options : colonne d'age et commentaires au mouseover
- Twits : Annonce lorsqu'un twit est raté lors de la rédaction d'un message
- Uploads : Ajout des options : colonne d'age et commentaires au mouseover

**0.3.1**
- Torrent list : Correction d'un bug empêchant de retrouver un torrent ancien

**0.3.0**
- Aura : Ajout d'un module d'aura permettant quelques calculs
- ES : Correction de l'adaptation d'url sur viewforum.php
- Badges : Correction du parseur en cas de lignes supplémentaires sur le profil
- Badges : Correction de l'image du 4ème d'IRC
- Badges : Correction de la valeur du badge Snatched (snatched - uploads)
- Raccourcis BBCode : Correction lors de l'édit d'un post
- Torrent list : Tri par clic sur les titres de colonnes
- Torrent list : Le marqueur de torrent affiche le torrent trouvé en bas de page
- Torrent list : Le marqueur de torrent est aussi actif sur la page d'accueil
- Torrent list : Les suggestions ajoutées automatiquement sont clairement annoncées comme telles
- Torrent list : Ajout des commentaires au survol du nombre de commentaires
- Endless scrolling : Ajout d'un bouton de pause
- Endless scrolling : Réécriture de la barre de pagination (urls des pages) en fonction de l'ES
- Endless scrolling : Support de /dupecheck/
- Endless scrolling : Support de /m/peers/
- Global : Ajout de l'Upload réel dans l'entête - Imprécis ?
- Snatched : Filtrage par suspicion de Hit&Run
- Forums : Correction du scrolling lors de l'utilisation d'un lien direct vers un post
- Panneau d'options : Affichage complet puis section par section au mouseover de l'entête
- Panneau d'options : Thèmes pour les images (Endless scrolling & Back to top)
- Réorganisation interne des fichiers
- Ajout de la possibilité de sauvegarder des données en dehors des options

**0.2.5**
- Options : Correction de l'attache de la fenêtre d'options au menu gauche pour les CSS atypiques
- Options : Correction de la couleur de la fenêtre d'options + adaptation en fonction du CSS (mwerf)
- Endless scrolling : Pause lorsqu'une textarea est sélectionnée - Forums
- Endless scrolling : Adaptation de l'url en fonction du scrolling
- Snatched : Cacher les torrents en seed (MacGeek)
- Snatched : Cacher les torrents non completés
- Options : Amélioration de la construction de la fenêtre
- Badges : Amélioration du détecteur pour les valeurs de 1k+
- Global : Amélioration du détecteur de karma
- Main : Debug et commentaires
- Endless scrolling : Commentaires
- Twits : Amélioration de l'autocomplétion suite un endless scrolling
- Pins : Option de tri par prix
- Endless scrolling : Options spécifiques par page
- Twits : Auto-complétion bien plus robuste, basée sur la position du curseur plutôt que des regex hasardeuses
- Twits : Ajout automatique d'un espace si une des complétions convient, la détection des twits de GKS nécessite cet espace pour fonctionner
- Endless scrolling : Ajout sur /m/uploads/
- Torrent list : Ajout d'une colonne d'age optionnelle
- Torrent list : Correction des résultats des suggestions IMDB
- Torrent list : Possibilité d'ajouter automatiquement les torrents associés à la meilleure traduction d'IMDB lorsque peu ou pas de résultats
- Options : Structuration des options pour éviter d'activer une option sans son parent
- Forums : Le cacheur de signature est devenu optionnel
- Torrent list : Ajout d'un marqueur de torrent (manuel) permettant de retrouver le dernier torrent vu

**0.2.4**
- Global : Ajout de labels sur les inputs - Permet de clic sur le texte plutôt que la checkbox
- Snatched : Multiple bug fixes - javascript:false
- Snatched : Evite l'endless scrolling lorsque la page est complétement chargée 
- Snatched : Evite la récupération complète après endless scrolling / récupération complète
- Pins : Ajout d'un filtre sur les pins déjà achetés
- Endless scrolling : Ajout d'un module spécifique, plus facile à gérer
- Filtres : Optimisations, principalement sur le FL (30ms pour filtrer 1000 torrents) - Le reste des ralentissements est du au navigateur
- Request : Module supprimé pour l'instant vu qu'il n'avait que l'endless scrolling qui a été déplacé dans le module adapté
- Liste de torrents : Correction de l'endless scrolling
- Options : Ajout de liens vers le topic adapté
- Endless scrolling : Ajouté sur /m/images/
- Endless scrolling : Tooltip dans les options indiquant les pages affectées
- Torrent : Ajout d'une fenêtre de modification du MP auto en cas de commentaires désactivés

**0.2.3**
- Module badges actif aussi sur votre page publique de badges
- Meilleur formatage des indicateurs sous les badges
- Correction de l'endless scrolling sur la dernière page
- Autorise les modifications sur la positions des frames GKSi
- Cacheur de signatures sur les forums
- Pause sur l'endless scrolling lorsqu'on scrolle jusqu'en bas de la page
- Endless scrolling & auto-refresh sur la page des logs
- Correction de la colorisation des twits à l'endless scrolling sur les forums

**0.2.1**
- Extension Firefox
- Montre toutes les images de badges
- Affiche la progression sous les badges
- Evite le chargement des pages inutiles avec l'endless scrolling

**0.2.0**
- BugFix: Support mac pour la validation formulaire
- Endless scrolling sur la page de requêtes
- Suggestions de recherche basées sur IMDB.fr et IMDB.com -- Utilise un système de cache perso
- Panneau d'options complet
- Fluidification des changement dans les options

**0.1.6**
- BugFix: Force le raccourci BBCode pour mac avec la touche cmd
- BugFix: Cache les boutons de twits sur la page torrent quand les commentaires sont désactivés
- Ajout du raccourci BBCode Ctrl+Q = [quote]
- Ajout d'un système d'envoi de MP préformaté lorsque l'uploader d'un torrent n'autorise pas les commentaires. Le lien se situe en bas de page torrent.

**0.1.5**
- Cacher les pins trop chers
- BugFix: Endless scrolling sur la page d'accueil charge correctement les pages suivantes
- Endless scrolling sur les listes de topics et topics
- Quickpost sur les pages torrent pour poster directement des commentaires
- Raccourcis BBCode sur les zones de texte qui acceptent le BBCode (Ctrl + B/U/I)

**0.1.4**
- Gestion des modules
- Implémentation d'un loader
- Gestion twits sur les comments de blog posts & comments de torrents
- Gestion du ctrl+enter pour valider les formulaires
- Réécriture du moteur d'autocomplétion des twits

**0.1.3**
- BugFix: Meilleure détection des pseudos
- BugFix: Coloration de twits après prévisu puis édition améliorée

**0.1.2**
- BugFix: Coloration de twits en fin de message
- BugFix: Coloration de twits après prévisu puis édition

**0.1.1**
- BugFix: Coloration de multiples twits sur un seul message
- Optimisations - CPU sur filtrage
- Moar comments
- Gestion des headers de pages torrents en endless scrolling
- Bouton pour remonter en haut de page sur l'endless scrolling
- Auto-complétion twits à l'édition des posts
- Coloration des twits après édition d'un post
- Migration Github
