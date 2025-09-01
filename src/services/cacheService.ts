import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class CacheService {
  private static instance: CacheService;
  private rateLimitCooldown: number = 0; // Timestamp jusqu'où on évite les requêtes

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Vérifier si on est en mode rate limit cooldown
  isInRateLimitCooldown(): boolean {
    return Date.now() < this.rateLimitCooldown;
  }

  // Définir un cooldown après une erreur de rate limiting
  setRateLimitCooldown(durationMs: number = 30000): void {
    this.rateLimitCooldown = Date.now() + durationMs;
    console.log(`Rate limit cooldown activé pour ${durationMs}ms`);
  }

  // Réinitialiser le cooldown (utile après une connexion réussie)
  resetRateLimitCooldown(): void {
    this.rateLimitCooldown = 0;
    console.log("Rate limit cooldown réinitialisé");
  }

  // Réinitialiser complètement le cache (utile au démarrage de l'app)
  resetAll(): void {
    this.rateLimitCooldown = 0;
    this.clear();
    console.log("Cache complètement réinitialisé");
  }

  // Obtenir des données du cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const item: CacheItem<T> = JSON.parse(cached);
      
      // Vérifier si le cache a expiré
      if (Date.now() > item.timestamp + item.ttl) {
        await this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error("Erreur lors de la lecture du cache:", error);
      return null;
    }
  }

  // Sauvegarder des données dans le cache
  async set<T>(key: string, data: T, ttlMs: number = 300000): Promise<void> {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs,
      };
      
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du cache:", error);
    }
  }

  // Supprimer un élément du cache
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error("Erreur lors de la suppression du cache:", error);
    }
  }

  // Vider tout le cache
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error("Erreur lors du vidage du cache:", error);
    }
  }
}

export const cacheService = CacheService.getInstance();
