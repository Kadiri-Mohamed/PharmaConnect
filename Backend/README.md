<p align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="300" alt="Laravel Logo">
</p>

<h1 align="center">💊 PharmaConnect - Plateforme de Gestion et de Connexion Pharmacies-Clients</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/Laravel-10.x-red.svg" alt="Laravel 10.x">
  <img src="https://img.shields.io/badge/PHP-8.1+-purple.svg" alt="PHP 8.1+">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT">
</p>

## � Sécurité

### Configuration CORS
- **Fichier**: `config/cors.php`
- **Origines autorisées**: `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:3000`, `http://127.0.0.1:5173`
- **Méthodes**: Toutes (`*`)
- **Headers**: Tous (`*`)
- **Credentials**: Supportés

### Limitation de débit (Rate Limiting)
- **Middleware**: `RateLimitMiddleware`
- **Endpoints publics**: 100 requêtes/minute
- **Authentification**: 5 requêtes/minute (login/signup), 10/minute (refresh)
- **API authentifiée**: 60 requêtes/minute par utilisateur
- **Headers de réponse**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

### Authentification JWT
- **Durée du token d'accès**: 60 minutes (configurable via `JWT_TTL`)
- **Durée du token de rafraîchissement**: 7 jours (configurable via `JWT_REFRESH_TTL`)
- **Algorithme**: HS256
- **Refresh token endpoint**: `POST /api/refresh`

### Contrôle d'accès et propriété des données
- **Middleware**: `OwnershipMiddleware`
- **Panier**: Utilisateurs ne peuvent accéder qu'à leur propre panier
- **Commandes**: Clients voient leurs commandes, pharmaciens voient les commandes de leur pharmacie
- **Pharmacies**: Pharmaciens ne peuvent gérer que leur propre pharmacie
- **Demandes de médicaments rares**: Utilisateurs voient leurs demandes, pharmaciens voient toutes les demandes

### Endpoints sécurisés
```php
// Authentification avec rate limiting
Route::post('signUp', [AuthController::class, 'signUp'])->middleware('rate.limit:auth,5,1');
Route::post('signIn', [AuthController::class, 'signIn'])->middleware('rate.limit:auth,5,1');
Route::post('refresh', [AuthController::class, 'refresh'])->middleware('rate.limit:auth,10,1');

// Endpoints avec contrôle de propriété
Route::prefix('cart')->middleware('ownership:cart')->group(function () {
    // Cart operations...
});

Route::prefix('orders')->group(function () {
    Route::get('/{orderId}', [OrderController::class, 'show'])->middleware('ownership:order');
    // ...
});
```

## 📊 API Endpoints

### 🔓 Endpoints Publics (pas d'authentification)
```http
GET    /api/public/pharmacies              # Liste des pharmacies
GET    /api/public/pharmacies/on-duty       # Pharmacies de garde
GET    /api/public/pharmacies/{id}          # Détails d'une pharmacie
GET    /api/public/medicines                # Catalogue médicaments
GET    /api/public/medicines/search         # Recherche médicaments
GET    /api/public/medicines/{id}/availability # Disponibilité
POST   /api/rare-medicine-requests          # Demande médicament rare
```

### 🔐 Endpoints Authentifiés
```http
POST   /api/signUp                         # Inscription
POST   /api/signIn                         # Connexion
POST   /api/refresh                        # Rafraîchir token
GET    /api/me                             # Profil utilisateur

# Panier (avec contrôle propriété)
GET    /api/cart                           # Voir panier
POST   /api/cart/add                       # Ajouter au panier
PUT    /api/cart/items/{id}                # Modifier quantité
DELETE /api/cart/items/{id}                # Supprimer item
DELETE /api/cart                           # Vider panier

# Commandes (avec contrôle propriété)
POST   /api/orders                         # Créer commande
GET    /api/orders                         # Liste commandes utilisateur
GET    /api/orders/{id}                    # Détails commande
POST   /api/orders/{id}/cancel             # Annuler commande

# Pharmacien uniquement
PUT    /api/orders/{id}/status             # Changer statut commande
GET    /api/orders/pharmacy                # Commandes de la pharmacie
GET    /api/orders/pharmacy/statistics     # Statistiques
GET    /api/medicines                      # Gestion médicaments
POST   /api/medicines                      # Ajouter médicament
PUT    /api/medicines/{id}                 # Modifier médicament
DELETE /api/medicines/{id}                 # Supprimer médicament
```

## 🎯 Contexte du projet

**PharmaConnect** est une plateforme web conçue pour résoudre la double problématique des pharmacies indépendantes et des patients :

- **Pour les pharmacies** : Moderniser la gestion d'inventaire et augmenter la visibilité auprès des clients
- **Pour les patients** : Localiser rapidement des médicaments et trouver une pharmacie de garde en urgence

Ce projet est développé dans le cadre d'un projet fil-rouge de fin d'études, avec des contraintes pédagogiques spécifiques (authentification "maison", architecture propre, design pattern).

## ⚡ Fonctionnalités principales

### 👤 Visiteur (non authentifié)
- 🔍 Rechercher une pharmacie par localisation
- 📋 Consulter le catalogue public des médicaments
- 🏥 Voir les pharmacies de garde
- 💊 Vérifier la disponibilité d'un médicament
- 📝 Faire une demande de médicament rare

### 👥 Client (authentifié)
- 🛒 Gérer son panier (ajout/suppression)
- 📦 Passer des commandes (retrait/livraison)
- 📜 Consulter l'historique des commandes
- 📎 Télécharger des ordonnances
- 📍 Suivre l'état des commandes

### 👨‍⚕️ Pharmacien
- 📊 Gérer l'inventaire complet (CRUD)
- ⚙️ Administrer le profil de la pharmacie
- ✅ Traiter les commandes clients
- 🚨 Basculer le statut "de garde"
- 📈 Accéder au tableau de bord statistiques
- 💬 Répondre aux demandes de médicaments rares