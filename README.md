# GB React Native App

Application React Native avec Expo pour la gestion des armes et compétences, connectée à une API Node.js avec MongoDB Atlas.

## 🚀 Installation

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Simulateur iOS (pour Mac) ou Android Studio

### Installation des dépendances

```bash
npm install
```

## 📱 Configuration

### 1. Configuration de l'API

Modifiez le fichier `src/config/api.ts` pour configurer les URLs de votre API :

```typescript
export const API_CONFIG = {
  DEV_URL: "https://gb-project.vercel.app", // URL locale
  PROD_URL: "https://gb-project.vercel.app", // URL de production
  // ...
};
```

### 2. Configuration pour le simulateur iOS

Si vous utilisez le simulateur iOS, vous devrez peut-être utiliser l'IP de votre machine au lieu de localhost :

```typescript
export const SIMULATOR_CONFIG = {
  LOCAL_IP: "192.168.1.100", // Remplacez par votre IP locale
  // ...
};
```

Pour trouver votre IP locale :

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## 🏃‍♂️ Lancement de l'application

### Développement

```bash
npm start
```

### Simulateur iOS

```bash
npm run ios
```

### Simulateur Android

```bash
npm run android
```

### Web

```bash
npm run web
```

## 🔐 Authentification

L'application utilise JWT pour l'authentification avec les fonctionnalités suivantes :

- **Inscription** : Création d'un nouveau compte
- **Connexion** : Authentification avec nom d'utilisateur et mot de passe
- **Persistance** : Le token JWT est sauvegardé localement
- **Vérification automatique** : Le token est vérifié au démarrage de l'app

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
├── config/             # Configuration (API, etc.)
├── navigation/          # Navigation React Navigation
├── screens/            # Écrans de l'application
├── services/           # Services (API, authentification)
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🔧 Fonctionnalités

- ✅ Authentification JWT
- ✅ Navigation entre écrans
- ✅ Gestion d'état d'authentification
- ✅ Stockage local sécurisé
- ✅ Interface utilisateur moderne
- ✅ Gestion des erreurs
- ✅ Validation des formulaires

## 🛠️ Technologies utilisées

- **React Native** avec Expo
- **TypeScript**
- **React Navigation** pour la navigation
- **Axios** pour les requêtes HTTP
- **AsyncStorage** pour le stockage local
- **JWT** pour l'authentification

## 📱 Compatibilité

- ✅ iOS (Simulateur et appareils physiques)
- ✅ Android (Émulateur et appareils physiques)
- ✅ Web (Expo Web)

## 🔗 API Backend

L'application se connecte à une API Node.js avec :

- **MongoDB Atlas** pour la base de données
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **CORS** configuré pour React Native

### Endpoints utilisés

- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/verify-token` - Vérification du token
- `GET /api/users/profile` - Profil utilisateur

## 🚨 Dépannage

### Problème de connexion à l'API

1. Vérifiez que votre serveur backend est en cours d'exécution
2. Vérifiez l'URL dans `src/config/api.ts`
3. Pour le simulateur iOS, utilisez votre IP locale au lieu de localhost

### Problème de navigation

1. Vérifiez que toutes les dépendances sont installées
2. Redémarrez l'application avec `npm start`

### Problème d'authentification

1. Vérifiez que votre API backend est accessible
2. Vérifiez les logs de l'application pour les erreurs
3. Assurez-vous que CORS est configuré côté serveur

## 📄 Licence

Ce projet est sous licence MIT.
