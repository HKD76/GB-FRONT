import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "./api";
import { User, LoginRequest, RegisterRequest } from "../types";

class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated: boolean = false;

  // Initialiser l'état d'authentification au démarrage
  async initialize(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        // Vérifier si le token est toujours valide avec un délai pour éviter le rate limiting
        try {
          // Petit délai pour éviter les requêtes trop rapides au démarrage
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const verification = await apiService.verifyToken();
          if (verification.valid) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            return true;
          } else {
            // Token invalide, nettoyer le stockage
            await this.logout();
          }
        } catch (verifyError: any) {
          // Si la vérification échoue à cause du rate limiting, garder l'utilisateur connecté
          if (verifyError.error === "RATE_LIMIT") {
            console.log(
              "Rate limiting lors de la vérification du token - garder l'utilisateur connecté"
            );
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            return true;
          }
          // Pour les autres erreurs, déconnecter
          await this.logout();
        }
      }
      return false;
    } catch (error: any) {
      console.error(
        "Erreur lors de l'initialisation de l'authentification:",
        error
      );

      // Si c'est une erreur de rate limiting, ne pas déconnecter l'utilisateur
      if (error.error === "RATE_LIMIT") {
        console.log(
          "Rate limiting détecté lors de l'initialisation - garder l'utilisateur connecté"
        );
        // Garder l'utilisateur connecté mais marquer comme non initialisé
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          this.currentUser = JSON.parse(userData);
          this.isAuthenticated = true;
          return true;
        }
      }

      await this.logout();
      return false;
    }
  }

  // Inscription
  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await apiService.register(data);
      await this.setAuthData(response.token, response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  }

  // Connexion
  async login(data: LoginRequest): Promise<User> {
    try {
      const response = await apiService.login(data);
      await this.setAuthData(response.token, response.user);

      return response.user;
    } catch (error) {
      throw error;
    }
  }

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
      this.currentUser = null;
      this.isAuthenticated = false;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  }

  // Définir les données d'authentification
  private async setAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      this.currentUser = user;
      this.isAuthenticated = true;
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des données d'authentification:",
        error
      );
      throw error;
    }
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Vérifier si l'utilisateur est authentifié
  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  // Rafraîchir les données utilisateur
  async refreshUserData(): Promise<User | null> {
    try {
      const response = await apiService.getProfile();
      this.currentUser = response.user;
      await AsyncStorage.setItem("user", JSON.stringify(response.user));
      return response.user;
    } catch (error) {
      console.error(
        "Erreur lors du rafraîchissement des données utilisateur:",
        error
      );
      return null;
    }
  }
}

export const authService = new AuthService();
