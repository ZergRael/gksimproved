GKSimproved
===========

Améliore et facilite la navigation sur certaines parties de gks.gs

Voir topic associé.

### TODO.list
- Moar comments
- Optimisations
- Adapter le numéro de page en fonction de l'avancée dans l'endless scrolling
- Endless scrolling sur /my/torrents
- Endless scrolling sur /m/comments/onuploads
- Scrapping IMDB
- Marqueur dernier torrent vu
- Pause ES au focus textarea

### TODO.done
- Correction de l'attache de la fenêtre d'options au menu gauche pour les CSS atypiques
- Correction de la couleur de la fenêtre d'options + adaptation en fonction du CSS (mwerf)

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
