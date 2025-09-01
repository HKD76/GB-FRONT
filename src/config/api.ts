// Configuration de l'API
export const API_CONFIG = {
  // URL de développement (localhost)
  DEV_URL:
    "https://gb-project-gwqvpmplz-mariks-projects-0145fa3a.vercel.app/api",

  // URL de production (API Vercel en ligne)
  PROD_URL:
    "https://gb-project-gwqvpmplz-mariks-projects-0145fa3a.vercel.app/api",

  // URL actuelle basée sur l'environnement
  get BASE_URL() {
    return __DEV__ ? this.DEV_URL : this.PROD_URL;
  },

  // Headers par défaut
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },

  // Timeout des requêtes (en millisecondes)
  TIMEOUT: 30000, // Augmenté pour les requêtes enrichies
};

// Configuration pour le simulateur iOS
export const SIMULATOR_CONFIG = {
  // Si vous utilisez le simulateur iOS, vous devrez peut-être utiliser l'IP de votre machine
  // Remplacez par votre IP locale si nécessaire
  LOCAL_IP: "192.168.1.14", // À remplacer par votre IP locale

  get SIMULATOR_URL() {
    return `http://${this.LOCAL_IP}:3000/api`;
  },
};
