import axios, { AxiosInstance, AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenVerificationResponse,
  User,
  ApiError,
  Weapon,
  WeaponSkill,
  WeaponsResponse,
  WeaponSkillsResponse,
  WeaponFilters,
  SkillFilters,
  WeaponStats,
  SkillStats,
  Summon,
  SummonsResponse,
  SummonFilters,
  SavedWeaponGrid,
  WeaponGridResponse,
  WeaponGridsResponse,
  CreateWeaponGridRequest,
  UpdateWeaponGridRequest,
  WeaponGridFilters,
  WeaponGridStats,
} from "../types";
import { API_CONFIG } from "../config/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.DEFAULT_HEADERS,
      timeout: API_CONFIG.TIMEOUT,
    });

    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("user");
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentification
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        "/users/register",
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Pour la connexion, ignorer le cooldown de rate limiting
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        "/users/login",
        data
      );

      return response.data;
    } catch (error: any) {
      // Pour les erreurs de connexion, ne pas activer le cooldown automatiquement
      if (error.response?.status === 429) {
        // Créer une erreur personnalisée pour la connexion
        const customError = new Error(
          "Trop de tentatives de connexion. Veuillez patienter quelques secondes."
        );
        (customError as any).error = "RATE_LIMIT";
        throw customError;
      }
      throw this.handleError(error);
    }
  }

  async verifyToken(): Promise<TokenVerificationResponse> {
    try {
      const response: AxiosResponse<TokenVerificationResponse> =
        await this.api.get("/users/verify-token");
      return response.data;
    } catch (error: any) {
      // Pour la vérification du token, ne pas activer le cooldown automatiquement
      if (error.response?.status === 429) {
        const customError = new Error(
          "Trop de requêtes. Veuillez patienter quelques secondes."
        );
        (customError as any).error = "RATE_LIMIT";
        throw customError;
      }
      throw this.handleError(error);
    }
  }

  async getProfile(): Promise<{ user: User }> {
    try {
      const response: AxiosResponse<{ user: User }> = await this.api.get(
        "/users/profile"
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Armes
  async getWeapons(
    filters?: WeaponFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<WeaponsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.rarity) params.append("rarity", filters.rarity);
      if (filters?.element) params.append("element", filters.element);
      if (filters?.minAtk) params.append("minAtk", filters.minAtk.toString());
      if (filters?.maxAtk) params.append("maxAtk", filters.maxAtk.toString());
      if (filters?.search) params.append("search", filters.search);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<WeaponsResponse> = await this.api.get(
        `/weapons?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeaponById(id: string): Promise<Weapon> {
    try {
      const response: AxiosResponse<Weapon> = await this.api.get(
        `/weapons/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeaponsWithFilters(filters: string): Promise<WeaponsResponse> {
    try {
      const response: AxiosResponse<WeaponsResponse> = await this.api.get(
        `/weapons/filter?${filters}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Méthode pour récupérer les armes enrichies avec filtres (version rapide par défaut)
  async getWeaponsEnriched(filters: string): Promise<WeaponsResponse> {
    try {
      const response: AxiosResponse<WeaponsResponse> = await this.api.get(
        `/weapons-enriched/filter/fast?${filters}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Méthode pour récupérer les armes avec enrichissement complet (plus lent)
  async getWeaponsEnrichedFull(filters: string): Promise<WeaponsResponse> {
    try {
      const response: AxiosResponse<WeaponsResponse> = await this.api.get(
        `/weapons-enriched/filter?${filters}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Méthode pour rechercher des armes enrichies (version rapide par défaut)
  async searchWeaponsEnriched(
    query: string,
    limit: number = 10,
    enrich: boolean = false
  ): Promise<WeaponsResponse> {
    try {
      const response: AxiosResponse<WeaponsResponse> = await this.api.get(
        `/weapons-enriched/search?q=${encodeURIComponent(
          query
        )}&limit=${limit}&enrich=${enrich}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Méthode pour récupérer une arme enrichie spécifique
  // Méthode pour récupérer une arme enrichie par ID (avec enrichissement par défaut)
  async getWeaponEnriched(id: string, enrich: boolean = true): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.get(
        `/weapons-enriched/${id}?enrich=${enrich}`
      );
      return response.data;
    } catch (error: any) {
      console.log("Erreur avec l'API enrichie, fallback vers l'ancienne route");
      // Fallback vers l'ancienne route
      const fallbackResponse: AxiosResponse<any> = await this.api.get(
        `/weapons/${id}`
      );
      return fallbackResponse.data;
    }
  }

  // Méthode pour récupérer une arme rapide (sans enrichissement)
  async getWeaponFast(id: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.get(
        `/weapons-enriched/${id}?enrich=false`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Compétences d'armes
  async getWeaponSkills(
    filters?: SkillFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<WeaponSkillsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append("type", filters.type);
      if (filters?.weapon_id) params.append("weapon_id", filters.weapon_id);
      if (filters?.search) params.append("search", filters.search);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<WeaponSkillsResponse> = await this.api.get(
        `/weapon_skills?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeaponSkillById(id: string): Promise<WeaponSkill> {
    try {
      const response: AxiosResponse<WeaponSkill> = await this.api.get(
        `/weapon_skills/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Compétences d'une arme spécifique
  async getWeaponSkillsByWeapon(
    weaponId: string
  ): Promise<WeaponSkillsResponse> {
    try {
      const response: AxiosResponse<WeaponSkillsResponse> = await this.api.get(
        `/weapon_skills/by-weapon/${weaponId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Statistiques
  async getWeaponStats(): Promise<WeaponStats> {
    try {
      const response: AxiosResponse<WeaponStats> = await this.api.get(
        `/weapons/stats`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSkillStats(): Promise<SkillStats> {
    try {
      const response: AxiosResponse<SkillStats> = await this.api.get(
        `/skills/stats/overview`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSkillsStats(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.get(`/skills-stats`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Summons
  async getSummons(
    filters?: SummonFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<SummonsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.element) params.append("element", filters.element);
      if (filters?.rarity) params.append("rarity", filters.rarity);
      if (filters?.search) params.append("search", filters.search);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<SummonsResponse> = await this.api.get(
        `/summons?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSummonById(id: string): Promise<Summon> {
    try {
      const response: AxiosResponse<Summon> = await this.api.get(
        `/summons/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSummonsWithFilters(filters: string): Promise<SummonsResponse> {
    try {
      const response: AxiosResponse<SummonsResponse> = await this.api.get(
        `/summons/filter?${filters}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Weapon Grids
  async getWeaponGrids(
    filters?: WeaponGridFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<WeaponGridsResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.element) params.append("element", filters.element);
      if (filters?.rarity) params.append("rarity", filters.rarity);
      if (filters?.isPublic !== undefined)
        params.append("isPublic", filters.isPublic.toString());
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<WeaponGridsResponse> = await this.api.get(
        `/weapon-grids?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeaponGridById(id: string): Promise<WeaponGridResponse> {
    try {
      const response: AxiosResponse<WeaponGridResponse> = await this.api.get(
        `/weapon-grids/${id}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getUserWeaponGrids(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<WeaponGridsResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<WeaponGridsResponse> = await this.api.get(
        `/weapon-grids/user/${userId}?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async searchWeaponGrids(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<WeaponGridsResponse> {
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<WeaponGridsResponse> = await this.api.get(
        `/weapon-grids/search?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getPopularWeaponGrids(
    page: number = 1,
    limit: number = 10
  ): Promise<WeaponGridsResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<WeaponGridsResponse> = await this.api.get(
        `/weapon-grids/popular?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getRecentWeaponGrids(
    page: number = 1,
    limit: number = 10
  ): Promise<WeaponGridsResponse> {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response: AxiosResponse<WeaponGridsResponse> = await this.api.get(
        `/weapon-grids/recent?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getWeaponGridStats(): Promise<WeaponGridStats> {
    try {
      const response: AxiosResponse<WeaponGridStats> = await this.api.get(
        `/weapon-grids/stats`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async createWeaponGrid(
    data: CreateWeaponGridRequest
  ): Promise<WeaponGridResponse> {
    try {
      const response: AxiosResponse<WeaponGridResponse> = await this.api.post(
        `/weapon-grids`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateWeaponGrid(
    id: string,
    data: UpdateWeaponGridRequest
  ): Promise<WeaponGridResponse> {
    try {
      const response: AxiosResponse<WeaponGridResponse> = await this.api.put(
        `/weapon-grids/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async deleteWeaponGrid(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> =
        await this.api.delete(`/weapon-grids/${id}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Fonctionnalités sociales
  async likeWeaponGrid(
    id: string
  ): Promise<{ message: string; likes: number }> {
    try {
      const response: AxiosResponse<{ message: string; likes: number }> =
        await this.api.post(`/weapon-grids/${id}/like`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async downloadWeaponGrid(
    id: string
  ): Promise<{ message: string; downloads: number }> {
    try {
      const response: AxiosResponse<{ message: string; downloads: number }> =
        await this.api.post(`/weapon-grids/${id}/download`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async recalculateWeaponGridStats(id: string): Promise<WeaponGridResponse> {
    try {
      const response: AxiosResponse<WeaponGridResponse> = await this.api.post(
        `/weapon-grids/${id}/recalculate`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Gestion des erreurs
  private handleError(error: any): ApiError {
    console.log("API Error Details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      },
    });

    // Erreur de réseau
    if (
      error.code === "NETWORK_ERROR" ||
      error.message?.includes("Network Error")
    ) {
      return {
        message:
          "Erreur de connexion réseau. Vérifiez votre connexion internet.",
        error: "NETWORK_ERROR",
      };
    }

    // Timeout
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return {
        message: "La requête a pris trop de temps. Vérifiez votre connexion.",
        error: "TIMEOUT",
      };
    }

    // Erreurs HTTP spécifiques
    if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          return {
            message: error.response.data?.message || "Données invalides",
            error: error.response.data?.error || "BAD_REQUEST",
          };
        case 401:
          return {
            message: "Nom d'utilisateur ou mot de passe incorrect",
            error: "UNAUTHORIZED",
          };
        case 403:
          return {
            message: "Accès refusé",
            error: "FORBIDDEN",
          };
        case 404:
          return {
            message: "Service non trouvé",
            error: "NOT_FOUND",
          };
        case 429:
          return {
            message: "Trop de requêtes. Veuillez patienter quelques secondes.",
            error: "RATE_LIMIT",
          };
        case 500:
          return {
            message: "Erreur serveur interne",
            error: "INTERNAL_SERVER_ERROR",
          };
        case 502:
        case 503:
        case 504:
          return {
            message: "Service temporairement indisponible",
            error: "SERVICE_UNAVAILABLE",
          };
        default:
          return {
            message:
              error.response.data?.message || `Erreur ${error.response.status}`,
            error: error.response.data?.error || "HTTP_ERROR",
          };
      }
    }

    // Erreur générique
    return {
      message: error.message || "Erreur de connexion au serveur",
      error: "UNKNOWN_ERROR",
    };
  }
}

export const apiService = new ApiService();
