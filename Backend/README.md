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

## 📋 Table des matières
- [Contexte du projet](#contexte-du-projet)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture technique](#architecture-technique)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Diagrammes UML](#diagrammes-uml)
- [Contraintes pédagogiques](#contraintes-pédagogiques)
- [Auteur](#auteur)

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