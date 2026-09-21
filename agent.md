# Agent Guide & Spécifications du Projet - Révision Concours Jardinier

Ce document sert de référence unique et de guide d'exécution pour le développement de l'application de révision des plantes pour le concours de jardinier.

---

## 1. Contexte & Objectifs

- **Utilisatrice cible** : Candidate révisant pour un concours de jardinier (utilisateur unique).
- **Durée d'utilisation intensive** : ~30 jours.
- **Périphériques cibles prioritaires** : **iPhone** et **iPad** (mobile & tablette en priorité absolue).
- **Objectif pédagogique** : Mémorisation et reconnaissance visuelle et taxonomique rapide de la sélection de plantes du concours (~191 espèces).
- **Déploiement** : Hébergement statique sur **GitHub Pages** (accessible facilement sans serveur, ajoutable à l'écran d'accueil iOS comme une PWA).

---

## 2. Données & Ressources du Projet

### Fichiers de données
1. **`plantes_concours_jardinier.csv`** : Fichier source initial contenant la liste officielle des plantes.
   - **Règle absolue : NE JAMAIS MODIFIER CE FICHIER SOURCE.**
   - Colonnes : `Nom_commun`, `Categorie`, `Famille`, `Genre`, `Espece`, `Cultivar`, `Lien_general`, `Lien_detail`, `Anecdote`, `note`.
2. **`data.json`** : Version JSON dérivée du CSV pour exploitation directe et réactive par le frontend.
   - Doit contenir pour chaque plante :
     - Identifiants botaniques (`Nom_commun`, `Famille`, `Genre`, `Espece`, `Cultivar`, `Categorie`)
     - Contenus pédagogiques (`Anecdote`, liens Wikipédia/Commons)
     - Liste des chemins d'images associées (vue complète et détails).
3. **`images/`** : Photothèque locale téléchargée depuis Wikimedia Commons.
   - **Important : Les images ne sont pas toutes présentes et sont en nombre inconnu par plante.** Certaines plantes disposent de 0, 1, 2 photos ou plus (vues d'ensemble et/ou détails), d'autres n'ont pas encore d'images.
   - Nommage standardisé : `{genre}_{espece}_{complet|detail}_{index}.jpg`
   - Exemples : `acer_campestre_complet_1.jpg`, `acer_campestre_detail_1.jpg`.
   - **Conséquences pour l'application** :
     - Le catalogue et les fiches doivent gérer proprement l'absence d'image (placeholder graphique végétal / fallback).
     - Les modes Quiz nécessitant des images doivent s'appuyer uniquement sur les plantes possédant au moins une image valide (ou adapter le pool de questions dynamiquement).

### Scripts utilitaires
- `scripts/telecharger_images.py` : Téléchargement des photos depuis Wikimedia avec rate-limiting.
- `scripts/build_json.py` : Conversion du CSV vers JSON en associant les photos présentes dans le dossier d'images.
- `scripts/build_json.ts` : Conversion du CSV vers JSON en TypeScript, indexant dynamiquement toutes les photos disponibles pour chaque plante.

---

## 3. Fonctionnalités Requises (Cahier des Charges Frontend)

### A. Catalogue & Exploration
- **Double affichage** :
  - **Vue Grille** : Cartes visuelles avec photo principale, nom commun, binôme latin (*Genre espèce*), famille et catégorie.
  - **Vue Liste** : Vue compacte et dense idéale pour parcourir rapidement les 191 plantes sur mobile.
- **Filtres et Recherche instantanée** :
  - Barre de recherche tolérante (nom commun, latin, famille, catégorie).
  - Filtres rapides par catégorie (arbres d'ornement, arbustes, vivaces, etc.) et par famille botanique.
- **Fiche détaillée (Modal ou écran dédié)** :
  - Galerie photo (zoom/carrousel des vues d'ensemble et de détails : fleurs, feuilles, écorce).
  - Fiche d'identité complète : Nom commun, Nom scientifique (*Genre espèce*), Famille, Cultivar, Catégorie.
  - Anecdote mnémotechnique mise en valeur.
  - Liens externes de révision (Wikipédia, Wikimedia Commons).

### B. Mode Quiz 1 : Reconnaissance Taxonomique (Photo ➡️ Nom)
- **Principe** : L'application affiche une photo (vue générale ou détail au hasard).
- **Défi** : L'utilisatrice doit identifier la plante correspondante parmi la liste complète :
  - **Nom commun**
  - **Famille**
  - **Genre + Espèce** (nom botanique latin)
- **Mécanique de réponse** :
  - Mode QCM intelligent (avec distracteurs pertinents de la même famille ou catégorie) ou saisie semi-assistée (recherche rapide / autocomplétion ergonomique tactile).
- **Feedback & Pédagogie** :
  - Validation immédiate (vert/rouge) avec affichage de la réponse complète.
  - Répétition des erreurs (les plantes manquées reviennent plus fréquemment).
  - Compteur de score et série en cours.

### C. Mode Quiz 2 : Reconnaissance Visuelle (Nom ➡️ Photo)
- **Principe** : L'application affiche l'identité complète d'une plante (Nom commun + Famille + Genre + Espèce).
- **Défi** : L'utilisatrice doit sélectionner la bonne photo parmi une grille de photos (la bonne photo + 3 ou 5 distracteurs).
- **Feedback immédiat** : Indication visuelle directe et affichage de la fiche en cas d'hésitation.

---

## 4. Recommandations Techniques & Architecture

### Frontend : Svelte 5 + Vite
- **Pourquoi Svelte + Vite ?**
  - Ultra-léger, aucune surcharge runtime, performances optimales sur mobile (iPhone/iPad).
  - Réactivité naturelle parfaite pour gérer les états de quiz, scores et filtres instantanés.
  - Génération d'un bundle statique pur (`dist/`) idéal pour GitHub Pages, sans nécessiter de serveur backend.
  - Transitions et animations tactiles fluides nativement intégrées.

### Ergonomie Mobile (iPhone & iPad First)
- **Support PWA / Écran d'accueil** :
  - `manifest.webmanifest` et balises Apple (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`).
  - Gestion des Safe Areas iOS (`viewport-fit=cover`, padding encoches).
  - Cibles tactiles larges (minimum 44x44px) pour une utilisation confortable au doigt sur iPhone et iPad.
  - Pas de hover obligatoire, gestes de balayage ou boutons clairs.

### Gestion du Poids des Images (Point d'Attention Majeur)
- Le dossier `images/` brut issu de Wikimedia pèse ~1.8 Go avec des images pouvant aller jusqu'à 71 Mo.
- Pour une utilisation mobile fluide et pour respecter les quotas GitHub / GitHub Pages (< 1 Go recommandé) :
  - Prévoir un script d'optimisation / compression (redimensionnement max 1200px, WebP ou JPEG qualité 80).
  - Réduction estimée : de 1.8 Go à ~35-50 Mo au total, temps de chargement divisé par 40.

### Déploiement : GitHub Pages
- Pipeline CI/CD GitHub Actions automatisé (`.github/workflows/deploy.yml`).
- Build Vite statique déployé automatiquement à chaque push sur `main`.

---

## 5. Feuille de Route d'Implémentation

1. ✅ **Phase 1 : Cadrage & Socle Git**
   - Rédaction de `agent.md`.
   - Initialisation du dépôt Git propre (sans le front brouillon).
   - Configuration du `.gitignore`.

2. 🔄 **Phase 2 : Données & Optimisation des Images**
   - Ajustement du script `build_json.py` pour indexer précisément les images disponibles.
   - Optimisation / redimensionnement des images pour le web et mobile.
   - Validation du fichier `data.json` final.

3. 🚀 **Phase 3 : Refonte du Frontend (Svelte + Vite)**
   - Initialisation du projet Vite + Svelte.
   - Design moderne inspiré de la botanique (palette naturelle, typographie soignée).
   - Vues Catalogue (Grille & Liste) + Fiche modale détaillée avec galerie.

4. 🎯 **Phase 4 : Modules de Quiz**
   - Implémentation du Quiz 1 (Photo ➡️ Nom complet).
   - Implémentation du Quiz 2 (Nom complet ➡️ Grille de photos).
   - Système de progression, suivi des erreurs et statistiques de révision.

5. 🌐 **Phase 5 : Déploiement GitHub Pages & Finitions PWA**
   - Configuration du workflow GitHub Actions.
   - Métadonnées PWA & icônes pour écran d'accueil iOS.
   - Tests de réactivité et d'ergonomie sur iPhone & iPad.

