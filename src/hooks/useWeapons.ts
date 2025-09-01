import { useState, useEffect } from "react";
import { apiService } from "../services/api";

interface WeaponFilters {
  elements: string[];
  rarities: string[];
}

interface UseWeaponsReturn {
  weapons: any[];
  loading: boolean;
  error: string | null;
  loadWeapons: (filters: WeaponFilters, limit?: number) => Promise<void>;
  loadWeaponDetails: (weaponId: string) => Promise<any>;
  currentLimit: number;
  hasMore: boolean;
}

/**
 * Hook personnalisé pour la gestion des armes
 * Gère le chargement, le filtrage et les détails des armes
 */
export const useWeapons = (): UseWeaponsReturn => {
  const [weapons, setWeapons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(100);
  const [hasMore, setHasMore] = useState(true);

  const loadWeapons = async (filters: WeaponFilters, limit?: number) => {
    try {
      setLoading(true);
      setError(null);

      const weaponsLimit = limit || currentLimit;

      const params = new URLSearchParams();

      // Toujours inclure element et rarity (obligatoires pour l'API)
      if (filters.elements.length > 0) {
        params.append("element", filters.elements.join(","));
      } else {
        // Valeur par défaut si aucun élément n'est sélectionné
        params.append("element", "fire,water,earth,wind,light,dark");
      }

      if (filters.rarities.length > 0) {
        params.append("rarity", filters.rarities.join(","));
      } else {
        // Valeur par défaut si aucune rareté n'est sélectionnée
        params.append("rarity", "R,SR,SSR");
      }

      params.append("limit", weaponsLimit.toString());

      const response = await apiService.getWeaponsEnriched(params.toString());

      if (response && response.weapons) {
        const weaponsWithImages = response.weapons.filter(
          (weapon: any) =>
            weapon.img_full &&
            weapon.img_full.trim() !== "" &&
            weapon.img_full !== null
        );

        setWeapons(weaponsWithImages);
        setCurrentLimit(weaponsLimit);
        setHasMore(response.weapons.length === weaponsLimit);
      } else {
        setWeapons([]);
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des armes:", err);
      setError(err.message || "Erreur lors du chargement des armes");
    } finally {
      setLoading(false);
    }
  };

  const loadWeaponDetails = async (weaponId: string) => {
    try {
      const response = await apiService.getWeaponEnriched(weaponId, true);
      return response.weapon || response;
    } catch (err: any) {
      console.error("Erreur lors du chargement des détails:", err);
      throw err;
    }
  };

  return {
    weapons,
    loading,
    error,
    loadWeapons,
    loadWeaponDetails,
    currentLimit,
    hasMore,
  };
};
