import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  Modal,
  ImageBackground,
  TextInput,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import {
  WeaponFilterModal,
  WeaponFilters,
  SummonFilterModal,
  SummonFilters,
} from "../components/WeaponFilterModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getWeaponImage } from "../utils/weaponImageMapper";
import { EnrichedSkillDisplay } from "../components/EnrichedSkillDisplay";
import { BasicSkillDisplay } from "../components/BasicSkillDisplay";
import { WeaponStatsSummary } from "../components/WeaponStatsSummary";
import { WeaponStatsCalculator } from "../utils/weaponStatsCalculator";
import { WeaponGridTotalStatsDisplay } from "../components/WeaponGridTotalStatsDisplay";
import {
  getElementColor,
  getRarityColor,
  ELEMENT_COLORS,
  RARITY_COLORS,
  STAT_COLORS,
  UI_COLORS,
  BASE_COLORS,
} from "../config/colors";
import { apiService } from "../services/api";
import { CreateWeaponGridRequest } from "../types";

type WeaponGridScreenRouteProp = RouteProp<AppStackParamList, "WeaponGrid">;

type WeaponGridScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "WeaponGrid"
>;

interface WeaponGridScreenProps {
  navigation: WeaponGridScreenNavigationProp;
}

export const WeaponGridScreen: React.FC<WeaponGridScreenProps> = ({
  navigation,
}) => {
  const route = useRoute<WeaponGridScreenRouteProp>();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<WeaponFilters | null>(
    null
  );
  const [currentWeaponIndex, setCurrentWeaponIndex] = useState<number | null>(
    null
  );
  const [selectedWeapons, setSelectedWeapons] = useState<{
    [key: number]: any;
  }>({});
  const selectedWeaponsRef = useRef<{ [key: number]: any }>({});

  // États pour les summons
  const [summonFilterModalVisible, setSummonFilterModalVisible] =
    useState(false);
  const [selectedSummonFilters, setSelectedSummonFilters] =
    useState<SummonFilters | null>(null);
  const [currentSummonIndex, setCurrentSummonIndex] = useState<number | null>(
    null
  );
  const [selectedSummons, setSelectedSummons] = useState<{
    [key: number]: any;
  }>({});

  const [characters, setCharacters] = useState<{
    [key: number]: {
      name: string;
      baseAtk: string;
      baseHp: string;
      attackType: "none" | "double" | "triple";
    };
  }>({
    1: { name: "Character 1", baseAtk: "", baseHp: "", attackType: "none" },
    2: { name: "Character 2", baseAtk: "", baseHp: "", attackType: "none" },
    3: { name: "Character 3", baseAtk: "", baseHp: "", attackType: "none" },
    4: { name: "Character 4", baseAtk: "", baseHp: "", attackType: "none" },
  });
  const selectedSummonsRef = useRef<{ [key: number]: any }>({});
  const [auraModalVisible, setAuraModalVisible] = useState(false);
  const [currentAuraText, setCurrentAuraText] = useState("");
  const [showWeaponSkills, setShowWeaponSkills] = useState(false);

  // États pour la sauvegarde de grille
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [gridName, setGridName] = useState("");
  const [gridDescription, setGridDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleWeaponPress = useCallback((weaponIndex: number) => {
    setCurrentWeaponIndex(weaponIndex);
    setFilterModalVisible(true);
  }, []);

  const handleApplyFilters = useCallback(
    (filters: WeaponFilters) => {
      setSelectedFilters(filters);

      // Naviguer vers la page des armes filtrées
      if (currentWeaponIndex !== null) {
        navigation.navigate("FilteredWeapons", {
          filters: filters,
          weaponIndex: currentWeaponIndex,
        });
      }
    },
    [currentWeaponIndex, navigation]
  );

  // Fonctions pour les summons
  const handleSummonPress = useCallback((summonIndex: number) => {
    setCurrentSummonIndex(summonIndex);
    setSummonFilterModalVisible(true);
  }, []);

  const handleApplySummonFilters = useCallback(
    (filters: SummonFilters) => {
      setSelectedSummonFilters(filters);

      // Naviguer vers la page des summons filtrées
      if (currentSummonIndex !== null) {
        navigation.navigate("FilteredSummons", {
          filters: filters,
          summonIndex: currentSummonIndex,
        });
      }
    },
    [currentSummonIndex, navigation]
  );

  // Fonctions pour le modal d'aura
  const handleOpenAuraModal = (auraText: string) => {
    setCurrentAuraText(auraText);
    setAuraModalVisible(true);
  };

  const handleCloseAuraModal = () => {
    setAuraModalVisible(false);
    setCurrentAuraText("");
  };

  const updateCharacter = (
    characterId: number,
    field: "name" | "baseAtk" | "baseHp" | "attackType",
    value: string | "none" | "double" | "triple"
  ) => {
    setCharacters((prev) => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        [field]: value,
      },
    }));
  };

  const calculateCharacterStats = (characterId: number) => {
    const character = characters[characterId];
    if (!character) return { atk: 0, hp: 0 };

    const baseAtk = parseInt(character.baseAtk) || 0;
    const baseHp = parseInt(character.baseHp) || 0;

    // Récupérer les stats calculées par type (Optimus, Omega, etc.)
    const statsByType = WeaponStatsCalculator.calculateTotalStats(
      Object.values(selectedWeapons),
      Object.values(selectedSummons),
      selectedSummons
    ).statsByType;

    // Calculer le total des boosts en pourcentages (comme pour les armes)
    let totalAtkBoost = 0;
    let totalHpBoost = 0;

    // Additionner tous les boosts Optimus, Omega et Conditionnels
    Object.values(statsByType.optimus).forEach((stats) => {
      totalAtkBoost += stats.atk;
      totalHpBoost += stats.hp;
    });
    Object.values(statsByType.omega).forEach((stats) => {
      totalAtkBoost += stats.atk;
      totalHpBoost += stats.hp;
    });
    Object.values(statsByType.conditional).forEach((stats) => {
      totalAtkBoost += stats.atk;
      totalHpBoost += stats.hp;
    });

    // Appliquer les boosts en pourcentages aux valeurs de base (même calcul que les armes)
    const boostedAtk = baseAtk * (1 + totalAtkBoost / 100);
    const boostedHp = baseHp * (1 + totalHpBoost / 100);

    return {
      atk: Math.round(boostedAtk),
      hp: Math.round(boostedHp),
    };
  };

  const toggleWeaponDisplay = () => {
    setShowWeaponSkills(!showWeaponSkills);
  };

  // Fonctions pour la sauvegarde de grille
  const handleSaveGrid = () => {
    setSaveModalVisible(true);
  };

  const handleSaveGridConfirm = async () => {
    if (!gridName.trim()) {
      Alert.alert("Error", "Please give a name to your grid.");
      return;
    }

    setSaving(true);
    try {
      // Convertir seulement les niveaux des summons pour l'API (1,100,150,200,250 -> 1,2,3,4,5)
      // Les armes gardent leurs niveaux originaux (1,100,150,200,250)
      const convertSummonLevel = (level?: number) => {
        if (!level) return 1;
        const levelMap: { [key: number]: number } = {
          1: 1,
          100: 2,
          150: 3,
          200: 4,
          250: 5,
        };
        return levelMap[level] || 1;
      };

      // Préparer les données de la grille
      // Les armes gardent leurs niveaux originaux
      const processedWeapons: { [key: number]: any } = {};

      // Filtrer les clés valides (celles qui ont des armes définies)
      const validWeaponKeys = Object.keys(selectedWeapons).filter(
        (key) =>
          selectedWeapons[parseInt(key)] && selectedWeapons[parseInt(key)].name
      );

      validWeaponKeys.forEach((key) => {
        const weapon = selectedWeapons[parseInt(key)];
        processedWeapons[parseInt(key)] = {
          weaponId:
            weapon._id ||
            weapon.id ||
            weapon.unique_key ||
            `weapon_${Date.now()}_${key}`,
          weaponData: weapon,
          selectedLevel: weapon.selectedLevel || 1,
        };
      });

      // Les summons sont convertis
      const processedSummons: { [key: number]: any } = {};

      // Filtrer les clés valides (celles qui ont des summons définies)
      const validSummonKeys = Object.keys(selectedSummons).filter(
        (key) =>
          selectedSummons[parseInt(key)] && selectedSummons[parseInt(key)].name
      );

      validSummonKeys.forEach((key) => {
        const summon = selectedSummons[parseInt(key)];
        processedSummons[parseInt(key)] = {
          summonId:
            summon._id ||
            summon.id ||
            summon.summonid ||
            `summon_${Date.now()}_${key}`,
          summonData: summon,
          selectedLevel: convertSummonLevel(summon.selectedLevel),
          selectedSpecialAura: summon.selectedSpecialAura,
        };
      });

      // Calculer les stats totales avec la même méthode que WeaponStatsSummary

      const totalStats = WeaponStatsCalculator.calculateTotalStats(
        Object.values(selectedWeapons),
        Object.values(selectedSummons),
        selectedSummons
      ).totalStats;

      const gridData: CreateWeaponGridRequest = {
        name: gridName.trim(),
        description: gridDescription.trim() || undefined,
        isPublic: true,
        weapons: processedWeapons,
        summons: processedSummons,
        metadata: {
          totalAtk: totalStats.atk,
          totalHp: totalStats.hp,
          weaponCount: Object.keys(processedWeapons).length,
          summonCount: Object.keys(processedSummons).length,
          elements: Array.from(
            new Set([
              ...Object.values(processedWeapons)
                .map((w) => w.weaponData?.element)
                .filter(Boolean),
              ...Object.values(processedSummons)
                .map((s) => s.summonData?.element)
                .filter(Boolean),
            ])
          ),
        },
      };

      // Vérifications finales avant envoi
      if (!gridData.name || gridData.name.trim() === "") {
        Alert.alert("Erreur", "Le nom de la grille est requis.");
        return;
      }

      if (
        Object.keys(gridData.weapons).length === 0 &&
        Object.keys(gridData.summons).length === 0
      ) {
        Alert.alert(
          "Erreur",
          "La grille doit contenir au moins une arme ou une summon."
        );
        return;
      }

      // Sauvegarder la grille
      const response = await apiService.createWeaponGrid(gridData);

      Alert.alert("Success", `Grid "${gridName}" saved successfully!`, [
        {
          text: "OK",
          onPress: () => {
            setSaveModalVisible(false);
            setGridName("");
            setGridDescription("");
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error during save:", error);
      Alert.alert(
        "Error",
        error.message || "Unable to save the grid. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGridCancel = () => {
    setSaveModalVisible(false);
    setGridName("");
    setGridDescription("");
  };

  // Écouter les paramètres de retour de la page des armes filtrées
  React.useEffect(() => {
    if (route.params?.selectedWeapon && route.params?.weaponIndex) {
      const { selectedWeapon, weaponIndex } = route.params;

      const addWeaponToStorage = async () => {
        try {
          // Récupérer les armes existantes
          const savedWeapons = await AsyncStorage.getItem("selectedWeapons");
          const currentWeapons = savedWeapons ? JSON.parse(savedWeapons) : {};

          // Ajouter la nouvelle arme
          currentWeapons[weaponIndex] = selectedWeapon;

          // Sauvegarder dans AsyncStorage
          await AsyncStorage.setItem(
            "selectedWeapons",
            JSON.stringify(currentWeapons)
          );

          // Mettre à jour l'état local
          setSelectedWeapons(currentWeapons);
          selectedWeaponsRef.current = currentWeapons;
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de l'arme:", error);
        }
      };

      addWeaponToStorage();

      // Nettoyer les paramètres de route
      navigation.setParams({
        selectedWeapon: undefined,
        weaponIndex: undefined,
      });
    }
  }, [route.params, navigation]);

  // Écouter les paramètres de retour de la page des summons filtrées
  React.useEffect(() => {
    if (route.params?.selectedSummon && route.params?.summonIndex) {
      const { selectedSummon, summonIndex } = route.params;

      const addSummonToStorage = async () => {
        try {
          // Récupérer les summons existantes
          const savedSummons = await AsyncStorage.getItem("selectedSummons");
          const currentSummons = savedSummons ? JSON.parse(savedSummons) : {};

          // Ajouter la nouvelle summon
          currentSummons[summonIndex] = selectedSummon;

          // Sauvegarder dans AsyncStorage
          await AsyncStorage.setItem(
            "selectedSummons",
            JSON.stringify(currentSummons)
          );

          // Mettre à jour l'état local
          setSelectedSummons(currentSummons);
          selectedSummonsRef.current = currentSummons;
        } catch (error) {
          console.error("Erreur lors de la sauvegarde de la summon:", error);
        }
      };

      addSummonToStorage();

      // Nettoyer les paramètres de route
      navigation.setParams({
        selectedSummon: undefined,
        summonIndex: undefined,
      });
    }
  }, [route.params, navigation]);

  // Charger les armes depuis AsyncStorage au démarrage
  React.useEffect(() => {
    const loadSelectedWeapons = async () => {
      try {
        const savedWeapons = await AsyncStorage.getItem("selectedWeapons");
        if (savedWeapons) {
          const weapons = JSON.parse(savedWeapons);
          setSelectedWeapons(weapons);
          selectedWeaponsRef.current = weapons;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des armes:", error);
      }
    };

    loadSelectedWeapons();
  }, []);

  // Charger les summons depuis AsyncStorage au démarrage
  React.useEffect(() => {
    const loadSelectedSummons = async () => {
      try {
        const savedSummons = await AsyncStorage.getItem("selectedSummons");
        if (savedSummons) {
          const summons = JSON.parse(savedSummons);
          setSelectedSummons(summons);
          selectedSummonsRef.current = summons;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des summons:", error);
      }
    };

    loadSelectedSummons();
  }, []);

  // Fonction pour nettoyer les caractères HTML et les balises
  const cleanHtmlText = (text: string) => {
    return (
      text
        // Nettoyer les entités HTML
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        // Supprimer les balises HTML
        .replace(/<[^>]*>/g, "")
        // Supprimer les liens wiki [[texte|texte]] ou [[texte]]
        .replace(/\[\[([^|\]]*?)(?:\|[^|\]]*?)?\]\]/g, "$1")
        // Supprimer les balises span avec tooltip
        .replace(/<span[^>]*class="[^"]*tooltip[^"]*"[^>]*>.*?<\/span>/g, "")
        // Nettoyer les espaces multiples
        .replace(/\s+/g, " ")
        .trim()
    );
  };

  // Fonction pour obtenir la couleur de fond d'une compétence
  const getSkillBackgroundColor = (skillName: string) => {
    const name = skillName.toLowerCase();

    // Fire skills
    if (
      name.includes("fire's") ||
      name.includes("hellfire's") ||
      name.includes("inferno's") ||
      name.includes("ironflame's")
    ) {
      return ELEMENT_COLORS.fire;
    }

    // Dark skills
    if (
      name.includes("dark's") ||
      name.includes("hatred's") ||
      name.includes("oblivion's") ||
      name.includes("mistfall's")
    ) {
      return ELEMENT_COLORS.dark;
    }

    // Earth skills
    if (
      name.includes("earth's") ||
      name.includes("mountain's") ||
      name.includes("terra's") ||
      name.includes("lifetree's")
    ) {
      return ELEMENT_COLORS.earth;
    }

    // Water skills
    if (
      name.includes("water's") ||
      name.includes("tsunami's") ||
      name.includes("hoarfrost's") ||
      name.includes("oceansoul's")
    ) {
      return ELEMENT_COLORS.water;
    }

    // Wind skills
    if (
      name.includes("wind's") ||
      name.includes("whirlwind's") ||
      name.includes("ventosus's") ||
      name.includes("stormwyrm's")
    ) {
      return ELEMENT_COLORS.wind;
    }

    // Light skills
    if (
      name.includes("light's") ||
      name.includes("thunder's") ||
      name.includes("zion's") ||
      name.includes("knightcode's")
    ) {
      return ELEMENT_COLORS.light;
    }

    // Default color
    return ELEMENT_COLORS.default;
  };

  // Fonction pour mapper le niveau de l'arme au niveau de skill
  const getSkillLevelFromWeaponLevel = (weaponLevel?: number) => {
    if (!weaponLevel) return 1;

    const levelMapping: { [key: number]: number } = {
      1: 1,
      100: 10,
      150: 15,
      200: 20,
      250: 25,
    };

    return levelMapping[weaponLevel] || 1;
  };

  // Fonction pour nettoyer le texte des auras
  const cleanAuraText = (text: string) => {
    if (!text) return "";

    return (
      text
        // Remplacer les entités HTML
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        // Supprimer les balises HTML
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        // Nettoyer le formatage wiki
        .replace(/\[\[([^|]+)\|([^\]]+)\]\]/g, "$2")
        .replace(/\[\[([^\]]+)\]\]/g, "$1")
        .replace(/'''/g, "")
        .replace(/''/g, "")
        // Nettoyer les espaces multiples
        .replace(/\n\s*\n/g, "\n")
        .trim()
    );
  };

  const renderWeaponButton = useCallback(
    (index: number) => {
      const selectedWeapon = selectedWeapons[index];

      const handleRemoveWeapon = async (e: any) => {
        e.stopPropagation();
        try {
          const currentWeapons = { ...selectedWeaponsRef.current };
          delete currentWeapons[index];

          // Sauvegarder dans AsyncStorage
          await AsyncStorage.setItem(
            "selectedWeapons",
            JSON.stringify(currentWeapons)
          );

          selectedWeaponsRef.current = currentWeapons;
          setSelectedWeapons(currentWeapons);
        } catch (error) {
          console.error("Erreur lors de la suppression de l'arme:", error);
        }
      };

      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.weaponButton,
            selectedWeapon && styles.selectedWeaponButton,
          ]}
          onPress={() => handleWeaponPress(index)}
        >
          {selectedWeapon ? (
            <View style={styles.selectedWeaponContent}>
              <View style={styles.weaponImageContainer}>
                <Image
                  source={{ uri: selectedWeapon.img_full }}
                  style={styles.weaponImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.weaponBadges}>
                {selectedWeapon.element && (
                  <View
                    style={[
                      styles.elementBadge,
                      {
                        backgroundColor: getElementColor(
                          selectedWeapon.element
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {selectedWeapon.element.toUpperCase()}
                    </Text>
                  </View>
                )}
                {selectedWeapon.rarity && (
                  <View
                    style={[
                      styles.rarityBadge,
                      {
                        backgroundColor: getRarityColor(selectedWeapon.rarity),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {selectedWeapon.rarity}
                    </Text>
                  </View>
                )}
              </View>

              {/* Affichage conditionnel : Stats ou Skills */}
              {!showWeaponSkills
                ? // Stats de l'arme du niveau sélectionné
                  (() => {
                    const selectedLevel = selectedWeapon.selectedLevel;

                    if (!selectedLevel) return null;

                    // Trouver l'index du niveau sélectionné
                    const levels = [1, 100, 150, 200, 250];
                    const levelIndex = levels.indexOf(selectedLevel) + 1;

                    // Récupérer les stats du niveau sélectionné
                    const atk = selectedWeapon[`atk${levelIndex}`];
                    const hp = selectedWeapon[`hp${levelIndex}`];

                    return atk > 0 || hp > 0 ? (
                      <View style={styles.weaponStatsContainer}>
                        {/* Niveau sélectionné */}
                        <View style={styles.selectedLevelContainer}>
                          <Text style={styles.selectedLevelText}>
                            Lvl {selectedLevel}
                          </Text>
                        </View>

                        {/* Stats du niveau sélectionné */}
                        <View style={styles.weaponStatSection}>
                          <View style={styles.weaponStatLevelsContainer}>
                            {hp > 0 && (
                              <View style={styles.weaponStatLevelItem}>
                                <Text style={styles.hpIcon}>HP</Text>
                                <Text style={styles.hpValue}>{hp}</Text>
                              </View>
                            )}
                            {atk > 0 && (
                              <View style={styles.weaponStatLevelItem}>
                                <Text style={styles.atkIcon}>ATK</Text>
                                <Text style={styles.atkValue}>{atk}</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    ) : null;
                  })()
                : // Affichage des compétences enrichies
                  (selectedWeapon.s1_enriched ||
                    selectedWeapon.s2_enriched ||
                    selectedWeapon.s3_enriched ||
                    selectedWeapon.s1_details ||
                    selectedWeapon.s2_details ||
                    selectedWeapon.s3_details ||
                    selectedWeapon.s1 ||
                    selectedWeapon.s2 ||
                    selectedWeapon.s3 ||
                    selectedWeapon["s1 name"] ||
                    selectedWeapon["s2 name"] ||
                    selectedWeapon["s3 name"]) && (
                    <View style={styles.skillsContainer}>
                      {/* Niveau de skill sélectionné */}
                      {selectedWeapon.selectedLevel && (
                        <View style={styles.selectedLevelContainer}>
                          <Text style={styles.selectedLevelText}>
                            Skill Lvl{" "}
                            {getSkillLevelFromWeaponLevel(
                              selectedWeapon.selectedLevel
                            )}
                          </Text>
                        </View>
                      )}
                      <View style={styles.skillsGrid}>
                        {(selectedWeapon.s1_enriched ||
                          selectedWeapon.s1_details ||
                          selectedWeapon.s1 ||
                          selectedWeapon["s1 name"]) &&
                          (selectedWeapon.s1_enriched ? (
                            <EnrichedSkillDisplay
                              skill={selectedWeapon.s1_enriched}
                              skillIndex={1}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ) : selectedWeapon.s1_details ? (
                            <EnrichedSkillDisplay
                              skill={selectedWeapon.s1_details}
                              skillIndex={1}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ) : (
                            <BasicSkillDisplay
                              skill={
                                selectedWeapon.s1_details ||
                                selectedWeapon.s1 || {
                                  "s1 name": selectedWeapon["s1 name"],
                                  "s1 desc": selectedWeapon["s1 desc"],
                                } || { name: "Skill 1" }
                              }
                              skillIndex={1}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ))}
                        {(selectedWeapon.s2_enriched ||
                          selectedWeapon.s2_details ||
                          selectedWeapon.s2 ||
                          selectedWeapon["s2 name"]) &&
                          (selectedWeapon.s2_enriched ? (
                            <EnrichedSkillDisplay
                              skill={selectedWeapon.s2_enriched}
                              skillIndex={2}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ) : selectedWeapon.s2_details ? (
                            <EnrichedSkillDisplay
                              skill={selectedWeapon.s2_details}
                              skillIndex={2}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ) : (
                            <BasicSkillDisplay
                              skill={
                                selectedWeapon.s2_details ||
                                selectedWeapon.s2 || {
                                  "s2 name": selectedWeapon["s2 name"],
                                  "s2 desc": selectedWeapon["s2 desc"],
                                } || { name: "Skill 2" }
                              }
                              skillIndex={2}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ))}
                        {(selectedWeapon.s3_enriched ||
                          selectedWeapon.s3_details ||
                          selectedWeapon.s3 ||
                          selectedWeapon["s3 name"]) &&
                          (selectedWeapon.s3_enriched ? (
                            <EnrichedSkillDisplay
                              skill={selectedWeapon.s3_enriched}
                              skillIndex={3}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ) : selectedWeapon.s3_details ? (
                            <EnrichedSkillDisplay
                              skill={selectedWeapon.s3_details}
                              skillIndex={3}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ) : (
                            <BasicSkillDisplay
                              skill={
                                selectedWeapon.s3_details ||
                                selectedWeapon.s3 || {
                                  "s3 name": selectedWeapon["s3 name"],
                                  "s3 desc": selectedWeapon["s3 desc"],
                                } || { name: "Skill 3" }
                              }
                              skillIndex={3}
                              weaponLevel={selectedWeapon.selectedLevel}
                            />
                          ))}
                      </View>
                    </View>
                  )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveWeapon}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyWeaponContent}>
              <View style={styles.emptyWeaponPlaceholder} />
              <Text style={styles.emptyWeaponText}>Emplacement {index}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedWeapons, handleWeaponPress, showWeaponSkills]
  );

  const renderMainWeaponButton = useCallback(
    (index: number) => {
      const selectedWeapon = selectedWeapons[index];

      const handleRemoveWeapon = async (e: any) => {
        e.stopPropagation();
        try {
          const currentWeapons = { ...selectedWeaponsRef.current };
          delete currentWeapons[index];

          // Sauvegarder dans AsyncStorage
          await AsyncStorage.setItem(
            "selectedWeapons",
            JSON.stringify(currentWeapons)
          );

          selectedWeaponsRef.current = currentWeapons;
          setSelectedWeapons(currentWeapons);
        } catch (error) {
          console.error("Erreur lors de la suppression de l'arme:", error);
        }
      };

      return (
        <TouchableOpacity
          key={`weapon-${index}`}
          style={[
            styles.mainWeaponButton,
            selectedWeapon && styles.selectedMainWeaponButton,
          ]}
          onPress={() => handleWeaponPress(index)}
        >
          {selectedWeapon ? (
            <View style={styles.selectedMainWeaponContent}>
              {/* Boîte de gauche : Image + Élément/Rareté */}
              <View style={styles.mainWeaponLeftBox}>
                {/* Image de l'arme */}
                <View style={styles.mainWeaponImageContainer}>
                  {selectedWeapon.img_full ? (
                    <Image
                      source={{ uri: selectedWeapon.img_full }}
                      style={styles.mainWeaponImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View
                      style={[
                        styles.mainWeaponNameContainer,
                        {
                          backgroundColor: selectedWeapon.element
                            ? getElementColor(selectedWeapon.element)
                            : "#666666",
                        },
                      ]}
                    >
                      <Text style={styles.mainWeaponNameText}>
                        {selectedWeapon.name || "Weapon"}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Élément et rareté en row */}
                <View style={styles.mainWeaponElementRarityContainer}>
                  {selectedWeapon.element && (
                    <View
                      style={[
                        styles.elementBadge,
                        {
                          backgroundColor: getElementColor(
                            selectedWeapon.element
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {selectedWeapon.element.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {selectedWeapon.rarity && (
                    <View
                      style={[
                        styles.rarityBadge,
                        {
                          backgroundColor: getRarityColor(
                            selectedWeapon.rarity
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {selectedWeapon.rarity}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Boîte du milieu : Niveau */}
              <View style={styles.mainWeaponCenterBox}>
                {selectedWeapon.selectedLevel && (
                  <View style={styles.selectedLevelContainer}>
                    <Text style={styles.selectedLevelText}>
                      {!showWeaponSkills
                        ? `Lvl ${selectedWeapon.selectedLevel}`
                        : `Skill Lvl ${getSkillLevelFromWeaponLevel(
                            selectedWeapon.selectedLevel
                          )}`}
                    </Text>
                  </View>
                )}
              </View>

              {/* Boîte de droite : Stats ou Skills */}
              <View style={styles.mainWeaponRightBox}>
                {!showWeaponSkills ? (
                  // Mode PWR - Stats l'une en dessous de l'autre
                  <View style={styles.weaponStatsContainer}>
                    {(() => {
                      const selectedLevel = selectedWeapon.selectedLevel;
                      if (!selectedLevel) return null;

                      const levels = [1, 100, 150, 200, 250];
                      const levelIndex = levels.indexOf(selectedLevel) + 1;
                      const atk = selectedWeapon[`atk${levelIndex}`];
                      const hp = selectedWeapon[`hp${levelIndex}`];

                      return atk > 0 || hp > 0 ? (
                        <View style={styles.weaponStatLevelsContainer}>
                          {hp > 0 && (
                            <View style={styles.weaponStatLevelItem}>
                              <Text style={styles.weaponStatLevelLabel}>
                                HP
                              </Text>
                              <Text
                                style={[
                                  styles.weaponStatLevelValue,
                                  { color: STAT_COLORS.hp },
                                ]}
                              >
                                {hp}
                              </Text>
                            </View>
                          )}
                          {atk > 0 && (
                            <View style={styles.weaponStatLevelItem}>
                              <Text style={styles.weaponStatLevelLabel}>
                                ATK
                              </Text>
                              <Text
                                style={[
                                  styles.weaponStatLevelValue,
                                  { color: STAT_COLORS.atk },
                                ]}
                              >
                                {atk}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : null;
                    })()}
                  </View>
                ) : (
                  // Mode Skills - Skills les uns au-dessus des autres
                  <View style={styles.mainWeaponSkillsColumn}>
                    {(selectedWeapon.s1_enriched ||
                      selectedWeapon.s1_details ||
                      selectedWeapon.s1 ||
                      selectedWeapon["s1 name"]) && (
                      <View style={styles.mainWeaponSkillItem}>
                        {selectedWeapon.s1_enriched ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeapon.s1_enriched}
                            skillIndex={1}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        ) : selectedWeapon.s1_details ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeapon.s1_details}
                            skillIndex={1}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        ) : (
                          <BasicSkillDisplay
                            skill={
                              selectedWeapon.s1_details ||
                              selectedWeapon.s1 || {
                                "s1 name": selectedWeapon["s1 name"],
                                "s1 desc": selectedWeapon["s1 desc"],
                              } || { name: "Skill 1" }
                            }
                            skillIndex={1}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        )}
                      </View>
                    )}
                    {(selectedWeapon.s2_enriched ||
                      selectedWeapon.s2_details ||
                      selectedWeapon.s2 ||
                      selectedWeapon["s2 name"]) && (
                      <View style={styles.mainWeaponSkillItem}>
                        {selectedWeapon.s2_enriched ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeapon.s2_enriched}
                            skillIndex={2}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        ) : selectedWeapon.s2_details ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeapon.s2_details}
                            skillIndex={2}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        ) : (
                          <BasicSkillDisplay
                            skill={
                              selectedWeapon.s2_details ||
                              selectedWeapon.s2 || {
                                "s2 name": selectedWeapon["s2 name"],
                                "s2 desc": selectedWeapon["s2 desc"],
                              } || { name: "Skill 2" }
                            }
                            skillIndex={2}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        )}
                      </View>
                    )}
                    {(selectedWeapon.s3_enriched ||
                      selectedWeapon.s3_details ||
                      selectedWeapon.s3 ||
                      selectedWeapon["s3 name"]) && (
                      <View style={styles.mainWeaponSkillItem}>
                        {selectedWeapon.s3_enriched ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeapon.s3_enriched}
                            skillIndex={3}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        ) : selectedWeapon.s3_details ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeapon.s3_details}
                            skillIndex={3}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        ) : (
                          <BasicSkillDisplay
                            skill={
                              selectedWeapon.s3_details ||
                              selectedWeapon.s3 || {
                                "s3 name": selectedWeapon["s3 name"],
                                "s3 desc": selectedWeapon["s3 desc"],
                              } || { name: "Skill 3" }
                            }
                            skillIndex={3}
                            weaponLevel={selectedWeapon.selectedLevel}
                            customWidth={70}
                          />
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveWeapon}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyMainWeaponContent}>
              <View style={styles.emptyMainWeaponPlaceholder} />
              <Text style={styles.emptyMainWeaponText}>Main Weapon</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedWeapons, handleWeaponPress, showWeaponSkills]
  );

  const renderSummonButton = useCallback(
    (index: number) => {
      const selectedSummon = selectedSummons[index];

      const handleRemoveSummon = async (e: any) => {
        e.stopPropagation();
        try {
          const currentSummons = { ...selectedSummonsRef.current };
          delete currentSummons[index];

          // Sauvegarder dans AsyncStorage
          await AsyncStorage.setItem(
            "selectedSummons",
            JSON.stringify(currentSummons)
          );

          selectedSummonsRef.current = currentSummons;
          setSelectedSummons(currentSummons);
        } catch (error) {
          console.error("Erreur lors de la suppression de la summon:", error);
        }
      };

      return (
        <TouchableOpacity
          key={`summon-${index}`}
          style={[
            index === 1
              ? styles.mainSummonButton
              : index === 6
              ? styles.allySummonButton
              : styles.summonButton,
            selectedSummon && styles.selectedSummonButton,
          ]}
          onPress={() => handleSummonPress(index)}
        >
          {selectedSummon ? (
            <View style={styles.selectedSummonContent}>
              <View style={styles.summonImageContainer}>
                {selectedSummon.img_full ? (
                  <Image
                    source={{ uri: selectedSummon.img_full }}
                    style={styles.summonImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={[
                      styles.summonNameContainer,
                      {
                        backgroundColor: selectedSummon.element
                          ? getElementColor(selectedSummon.element)
                          : "#666666",
                      },
                    ]}
                  >
                    <Text style={styles.summonNameText}>
                      {selectedSummon.name || "Summon"}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.summonBadges}>
                {selectedSummon.element && (
                  <View
                    style={[
                      styles.elementBadge,
                      {
                        backgroundColor: getElementColor(
                          selectedSummon.element
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {selectedSummon.element.toUpperCase()}
                    </Text>
                  </View>
                )}
                {selectedSummon.rarity && (
                  <View
                    style={[
                      styles.rarityBadge,
                      {
                        backgroundColor: getRarityColor(selectedSummon.rarity),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {selectedSummon.rarity}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stats de la summon du niveau sélectionné */}
              {(() => {
                const selectedLevel = selectedSummon.selectedLevel;

                if (!selectedLevel) return null;

                // Trouver l'index du niveau sélectionné
                const levels = [1, 100, 150, 200, 250];
                const levelIndex = levels.indexOf(selectedLevel) + 1;

                // Récupérer les stats du niveau sélectionné
                const atk = selectedSummon[`atk${levelIndex}`];
                const hp = selectedSummon[`hp${levelIndex}`];
                const aura = selectedSummon[`aura${levelIndex}`];

                return atk > 0 || hp > 0 ? (
                  <View style={styles.summonStatsContainer}>
                    {/* Niveau sélectionné */}
                    <View style={styles.selectedLevelContainer}>
                      <Text style={styles.selectedLevelText}>
                        {selectedLevel}
                      </Text>
                    </View>

                    {/* Stats du niveau sélectionné */}
                    <View style={styles.summonStatSection}>
                      <View style={styles.summonStatLevelsContainer}>
                        {atk > 0 && (
                          <View style={styles.summonStatLevelItem}>
                            <Text style={styles.summonStatLevelLabel}>ATK</Text>
                            <Text
                              style={[
                                styles.summonStatLevelValue,
                                { color: STAT_COLORS.atk },
                              ]}
                            >
                              {atk}
                            </Text>
                          </View>
                        )}
                        {hp > 0 && (
                          <View style={styles.summonStatLevelItem}>
                            <Text style={styles.summonStatLevelLabel}>HP</Text>
                            <Text
                              style={[
                                styles.summonStatLevelValue,
                                { color: STAT_COLORS.hp },
                              ]}
                            >
                              {hp}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ) : null;
              })()}

              {/* Affichage de l'aura du niveau sélectionné - seulement pour Main et Ally */}
              {(() => {
                const selectedLevel = selectedSummon.selectedLevel;
                if (!selectedLevel || (index !== 1 && index !== 6)) return null;

                // Afficher un bouton AURA pour Main et Ally au lieu du texte complet
                if (index === 1 || index === 6) {
                  let auraText = "";

                  // Si une aura spéciale est sélectionnée (niveau 250)
                  if (selectedSummon.selectedSpecialAura) {
                    const specialAura =
                      selectedSummon[selectedSummon.selectedSpecialAura];
                    if (specialAura) {
                      auraText = cleanAuraText(specialAura);
                    }
                  } else {
                    // Sinon, utiliser l'aura normale du niveau
                    const levels = [1, 100, 150, 200, 250];
                    const levelIndex = levels.indexOf(selectedLevel) + 1;
                    const aura = selectedSummon[`aura${levelIndex}`];
                    if (aura) {
                      auraText = cleanAuraText(aura);
                    }
                  }

                  return auraText ? (
                    <View style={styles.summonAuraContainer}>
                      <TouchableOpacity
                        style={styles.auraButton}
                        onPress={() => handleOpenAuraModal(auraText)}
                      >
                        <Text style={styles.auraButtonText}>AURA</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null;
                }

                return null;
              })()}

              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveSummon}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptySummonContent}>
              <View style={styles.emptySummonPlaceholder} />
              <Text style={styles.emptySummonText}>Summon {index}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selectedSummons, handleSummonPress]
  );

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Bouton Back */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Home")}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Section des Armes */}
          <View style={styles.weaponsSection}>
            {/* En-tête de la section */}
            <View style={styles.weaponsHeader}>
              <Text style={styles.mainSectionTitle}>Weapon Grid</Text>
            </View>

            {/* Contenu de la section */}
            <ImageBackground
              source={require("../assets/images/bgweapon.png")}
              style={styles.weaponsContent}
              resizeMode="cover"
            >
              <View style={styles.gridContainer}>
                {/* Grille 3x3 pour mobile */}
                <View style={styles.row}>
                  {renderWeaponButton(1)}
                  {renderWeaponButton(2)}
                  {renderWeaponButton(3)}
                </View>

                <View style={styles.row}>
                  {renderWeaponButton(4)}
                  {renderWeaponButton(5)}
                  {renderWeaponButton(6)}
                </View>

                <View style={styles.row}>
                  {renderWeaponButton(7)}
                  {renderWeaponButton(8)}
                  {renderWeaponButton(9)}
                </View>

                <View style={styles.mainWeaponContainer}>
                  <Text style={styles.mainWeaponLabel}>Main Weapon</Text>
                  {renderMainWeaponButton(10)}
                </View>
              </View>

              {/* Bouton de toggle Stats/Skills */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleDisplayButton]}
                  onPress={toggleWeaponDisplay}
                >
                  <Text style={styles.toggleDisplayButtonText}>
                    {showWeaponSkills ? "↻ PWR" : "↻ Skill"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          {/* Section des Summons */}
          <View style={styles.summonsSection}>
            {/* En-tête de la section */}
            <View style={styles.summonsHeader}>
              <Text style={styles.mainSectionTitle}>Summon Grid</Text>
            </View>

            {/* Contenu de la section */}
            <ImageBackground
              source={require("../assets/images/bgsummons.png")}
              style={styles.summonsContent}
              resizeMode="cover"
            >
              {/* Affichage des filtres actifs pour les summons */}
              {selectedSummonFilters && (
                <View style={styles.filtersContainer}>
                  <Text style={styles.filtersTitle}>Filtres actifs:</Text>
                  {selectedSummonFilters.elements.length > 0 && (
                    <Text style={styles.filtersText}>
                      Éléments: {selectedSummonFilters.elements.join(", ")}
                    </Text>
                  )}
                  {selectedSummonFilters.rarities.length > 0 && (
                    <Text style={styles.filtersText}>
                      Raretés: {selectedSummonFilters.rarities.join(", ")}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.summonsGridContainer}>
                {/* Section Main et Ally Summons côte à côte */}
                <View style={styles.mainAllyRow}>
                  {/* Section Main Summon */}
                  <View style={styles.mainSummonSection}>
                    <Text style={styles.subsectionTitle}>Main Summon</Text>
                    <View style={styles.mainSummonContainer}>
                      {renderSummonButton(1)}
                    </View>
                  </View>

                  {/* Section Ally Summon */}
                  <View style={styles.allySummonSection}>
                    <Text style={styles.subsectionTitle}>Ally Summon</Text>
                    <View style={styles.allySummonContainer}>
                      {renderSummonButton(6)}
                    </View>
                  </View>
                </View>

                {/* Section Support Summons en dessous */}
                <View style={styles.supportSummonsSection}>
                  <Text style={styles.subsectionTitle}>Support Summons</Text>
                  <View style={styles.supportSummonsRow}>
                    {renderSummonButton(2)}
                    {renderSummonButton(3)}
                    {renderSummonButton(4)}
                    {renderSummonButton(5)}
                  </View>
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Totaux ATK/HP avec pourcentages */}
          <WeaponGridTotalStatsDisplay
            weapons={Object.values(selectedWeapons)}
            summons={selectedSummons}
          />

          {/* Résumé des statistiques */}
          <WeaponStatsSummary
            weapons={Object.values(selectedWeapons)}
            summons={Object.values(selectedSummons)}
            summonIndices={selectedSummons}
            characters={characters}
          />

          {/* Bouton Save Grid */}
          <View style={styles.saveGridSection}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveGrid}
            >
              <Text style={styles.saveButtonText}>💾 Save Grid</Text>
            </TouchableOpacity>
          </View>

          {/* Section des personnages */}
          <View style={styles.charactersSection}>
            {/* En-tête de la section */}
            <View style={styles.charactersHeader}>
              <Text style={styles.mainSectionTitle}>Characters</Text>
            </View>

            {/* Contenu de la section */}
            <ImageBackground
              source={require("../assets/images/bgsummons.png")}
              style={styles.charactersContent}
              resizeMode="cover"
            >
              <View style={styles.charactersGridContainer}>
                {[1, 2, 3, 4].map((characterId) => {
                  const character = characters[characterId];
                  const boostedStats = calculateCharacterStats(characterId);

                  return (
                    <View key={characterId} style={styles.characterCard}>
                      <View style={styles.characterHeader}>
                        <Text style={styles.characterName}>
                          {character.name}
                        </Text>
                      </View>

                      <View style={styles.characterInputs}>
                        <View style={styles.characterInputGroup}>
                          <Text style={styles.characterInputLabel}>
                            Base ATK
                          </Text>
                          <TextInput
                            style={styles.characterInput}
                            value={character.baseAtk}
                            onChangeText={(value) =>
                              updateCharacter(characterId, "baseAtk", value)
                            }
                            placeholder="Enter base ATK"
                            placeholderTextColor={UI_COLORS.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.characterInputGroup}>
                          <Text style={styles.characterInputLabel}>
                            Base HP
                          </Text>
                          <TextInput
                            style={styles.characterInput}
                            value={character.baseHp}
                            onChangeText={(value) =>
                              updateCharacter(characterId, "baseHp", value)
                            }
                            placeholder="Enter base HP"
                            placeholderTextColor={UI_COLORS.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.characterInputGroup}>
                          <Text style={styles.characterInputLabel}>
                            Attack Type
                          </Text>
                          <View style={styles.attackTypeButtons}>
                            <TouchableOpacity
                              style={[
                                styles.attackTypeButton,
                                character.attackType === "none" &&
                                  styles.attackTypeButtonActive,
                              ]}
                              onPress={() =>
                                updateCharacter(
                                  characterId,
                                  "attackType",
                                  "none"
                                )
                              }
                            >
                              <Text
                                style={[
                                  styles.attackTypeButtonText,
                                  character.attackType === "none" &&
                                    styles.attackTypeButtonTextActive,
                                ]}
                              >
                                Single
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.attackTypeButton,
                                character.attackType === "double" &&
                                  styles.attackTypeButtonActive,
                              ]}
                              onPress={() =>
                                updateCharacter(
                                  characterId,
                                  "attackType",
                                  "double"
                                )
                              }
                            >
                              <Text
                                style={[
                                  styles.attackTypeButtonText,
                                  character.attackType === "double" &&
                                    styles.attackTypeButtonTextActive,
                                ]}
                              >
                                Double
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.attackTypeButton,
                                character.attackType === "triple" &&
                                  styles.attackTypeButtonActive,
                              ]}
                              onPress={() =>
                                updateCharacter(
                                  characterId,
                                  "attackType",
                                  "triple"
                                )
                              }
                            >
                              <Text
                                style={[
                                  styles.attackTypeButtonText,
                                  character.attackType === "triple" &&
                                    styles.attackTypeButtonTextActive,
                                ]}
                              >
                                Triple
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* Stats boostées */}
                      <View style={styles.characterStats}>
                        <View style={styles.characterStatItem}>
                          <Text style={styles.characterStatLabel}>
                            Boosted ATK
                          </Text>
                          <Text style={styles.characterStatValue}>
                            {boostedStats.atk.toLocaleString()}
                          </Text>
                        </View>
                        <View style={styles.characterStatItem}>
                          <Text style={styles.characterStatLabel}>
                            Boosted HP
                          </Text>
                          <Text style={styles.characterStatValue}>
                            {boostedStats.hp.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ImageBackground>
          </View>

          {/* Bouton Grid Calculator */}
          <View style={styles.saveSection}>
            <TouchableOpacity
              style={styles.calculatorButton}
              onPress={() => {
                // Calculer toutes les stats nécessaires
                const calculatedStats =
                  WeaponStatsCalculator.calculateTotalStats(
                    Object.values(selectedWeapons),
                    Object.values(selectedSummons),
                    selectedSummons
                  );

                navigation.navigate("GridCalculator", {
                  weaponGridStats: {
                    totalAtk: calculatedStats.totalStats.atk,
                    totalHp: calculatedStats.totalStats.hp,
                  },
                  weapons: Object.values(selectedWeapons),
                  summons: Object.values(selectedSummons),
                  characters: characters,
                  statsByType: calculatedStats.statsByType,
                });
              }}
            >
              <Text style={styles.calculatorButtonText}>Grid Calculator</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modale de filtre */}
        <WeaponFilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApplyFilters={handleApplyFilters}
        />

        {/* Modale de filtre pour les summons */}
        <SummonFilterModal
          visible={summonFilterModalVisible}
          onClose={() => setSummonFilterModalVisible(false)}
          onApplyFilters={handleApplySummonFilters}
        />

        {/* Modal pour afficher l'aura */}
        <Modal
          visible={auraModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseAuraModal}
        >
          <View style={styles.auraModalOverlay}>
            <View style={styles.auraModalContent}>
              <View style={styles.auraModalHeader}>
                <Text style={styles.auraModalTitle}>Aura Details</Text>
                <TouchableOpacity
                  onPress={handleCloseAuraModal}
                  style={styles.auraModalCloseButton}
                >
                  <Text style={styles.auraModalCloseButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.auraModalBody}>
                <Text style={styles.auraModalText}>{currentAuraText}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Modal de sauvegarde de grille */}
        <Modal
          visible={saveModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleSaveGridCancel}
        >
          <View style={styles.saveModalOverlay}>
            <View style={styles.saveModalContent}>
              <View style={styles.saveModalHeader}>
                <Text style={styles.saveModalTitle}>Save Grid</Text>
                <TouchableOpacity
                  onPress={handleSaveGridCancel}
                  style={styles.saveModalCloseButton}
                >
                  <Text style={styles.saveModalCloseButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.saveModalBody}>
                <View style={styles.saveModalForm}>
                  <View style={styles.saveModalField}>
                    <Text style={styles.saveModalLabel}>Grid name *</Text>
                    <TextInput
                      style={styles.saveModalInput}
                      placeholder="Enter a name for your grid"
                      placeholderTextColor={UI_COLORS.textSecondary}
                      value={gridName}
                      onChangeText={setGridName}
                      maxLength={50}
                    />
                  </View>

                  <View style={styles.saveModalField}>
                    <Text style={styles.saveModalLabel}>
                      Description (optional)
                    </Text>
                    <TextInput
                      style={[styles.saveModalInput, styles.saveModalTextArea]}
                      placeholder="Describe your grid..."
                      placeholderTextColor={UI_COLORS.textSecondary}
                      value={gridDescription}
                      onChangeText={setGridDescription}
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                    />
                  </View>

                  <View style={styles.saveModalActions}>
                    <TouchableOpacity
                      style={[
                        styles.saveModalButton,
                        styles.saveModalButtonCancel,
                      ]}
                      onPress={handleSaveGridCancel}
                      disabled={saving}
                    >
                      <Text style={styles.saveModalButtonCancelText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.saveModalButton,
                        styles.saveModalButtonConfirm,
                      ]}
                      onPress={handleSaveGridConfirm}
                      disabled={saving || !gridName.trim()}
                    >
                      {saving ? (
                        <ActivityIndicator
                          size="small"
                          color={UI_COLORS.textWhite}
                        />
                      ) : (
                        <Text style={styles.saveModalButtonConfirmText}>
                          Save
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 15,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: BASE_COLORS.blue,
    fontSize: 16,
    fontWeight: "600",
  },
  gridContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
  },
  weaponButton: {
    margin: 3,
    borderRadius: 3,
    padding: 5,
    width: (Dimensions.get("window").width - 60) / 3, // 3 colonnes avec marges
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonText: {
    color: "#303030",
    fontSize: 16,
    fontWeight: "bold",
  },
  playIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconText: {
    color: "#3a3a3a",
    fontSize: 12,
    fontWeight: "bold",
  },
  filtersContainer: {
    backgroundColor: "#F5FAF8",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  filtersTitle: {
    color: "#303030",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  filtersText: {
    color: "#666666",
    fontSize: 12,
    marginBottom: 2,
  },
  weaponsSection: {
    borderWidth: 1,
    borderColor: "#F5FAF8",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weaponsHeader: {
    backgroundColor: "#F5FAF8",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(73, 85, 86, 0.2)",
  },
  weaponsContent: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 3,
    paddingBottom: 40,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summonsSection: {
    borderWidth: 1,
    borderColor: "#F5FAF8",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summonsHeader: {
    backgroundColor: "#F5FAF8",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(73, 85, 86, 0.2)",
  },
  summonsContent: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
    overflow: "hidden",
  },
  mainSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#303030",
    textAlign: "center",
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#303030",
    marginBottom: 8,
    textAlign: "center",
  },
  mainAllyRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  selectedWeaponButton: {
    backgroundColor: "#F5FAF8",
    paddingBottom: 2,
  },
  selectedWeaponContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 8,
  },

  weaponBadges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
  },
  elementBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  rarityBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  removeButton: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 4,
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyWeaponContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWeaponPlaceholder: {
    width: "100%",
    height: 60,
    backgroundColor: "#F5FAF8",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(73, 85, 86, 0.4)",
    borderStyle: "dashed",
  },
  emptyWeaponText: {
    color: "#666666",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  weaponImage: {
    width: "100%",
    height: 90,
    marginBottom: 4,
  },
  weaponImageContainer: {
    width: "100%",
    height: 60,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  weaponName: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  skillsContainer: {
    marginTop: 2,
  },
  skillsGrid: {
    flexDirection: "row",
    gap: 4,
    marginVertical: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  skillButton: {
    backgroundColor: "#30302f",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    minWidth: 25,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  skillButtonText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "bold",
  },
  mainWeaponContainer: {
    alignItems: "center",
    marginTop: 5,
  },
  mainWeaponLabel: {
    color: "#303030",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    shadowColor: "#FFFFFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weaponStatsContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    marginTop: 2,
    marginBottom: 2,
  },
  weaponStatItem: {
    alignItems: "center",
    backgroundColor: "#F5FAF8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 35,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weaponStatLabel: {
    color: "#666666",
    fontSize: 8,
    fontWeight: "bold",
  },
  weaponStatValue: {
    color: "#303030",
    fontSize: 10,
    fontWeight: "bold",
  },
  weaponStatSection: {},
  weaponStatTypeLabel: {
    color: "#303030",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  weaponStatLevelsContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  },
  weaponStatLevelItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "rgba(73, 85, 86, 0.3)",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    width: "100%",
    gap: 6,
  },
  weaponStatLevelLabel: {
    color: "#666666",
    fontSize: 8,
    fontWeight: "bold",
  },
  weaponStatLevelValue: {
    color: "#303030",
    fontSize: 10,
    fontWeight: "bold",
  },
  hpIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  hpValue: {
    color: STAT_COLORS.hp,
    fontSize: 14,
    fontWeight: "bold",
  },
  atkIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  atkValue: {
    color: STAT_COLORS.atk,
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedLevelContainer: {
    backgroundColor: "#30302f",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedLevelText: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  selectedLevelItem: {
    borderColor: BASE_COLORS.blue,
    backgroundColor: "#1a3a5a",
  },
  summonButton: {
    margin: 3,
    borderRadius: 3,
    padding: 5,
    width: (Dimensions.get("window").width - 80) / 4, // 4 colonnes pour les ally summons
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedSummonButton: {
    backgroundColor: "#F5FAF8",
  },
  selectedSummonContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: 4,
  },
  summonImage: {
    width: "100%",
    height: 90,
    marginBottom: 4,
  },
  summonNameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    padding: 5,
    minHeight: 60,
  },
  summonNameText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  summonImageContainer: {
    width: "100%",
    height: 60,
    marginBottom: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  summonBadges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
  },
  summonStatsContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    marginTop: 4,
    marginBottom: 4,
  },
  summonStatSection: {
    marginBottom: 2,
  },
  summonStatLevelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 2,
  },
  summonStatLevelItem: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 0.5,
    borderColor: "rgba(73, 85, 86, 0.2)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    minWidth: 45,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summonStatLevelLabel: {
    color: "#666666",
    fontSize: 8,
    fontWeight: "bold",
  },
  summonStatLevelValue: {
    color: "#303030",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptySummonContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptySummonPlaceholder: {
    width: "100%",
    height: 60,
    backgroundColor: "#F5FAF8",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(73, 85, 86, 0.4)",
    borderStyle: "dashed",
  },
  emptySummonText: {
    color: "#303030",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
  summonsContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  summonsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  summonsGridContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  summonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  summonLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
  },
  summonLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    width: (Dimensions.get("window").width - 80) / 6,
  },
  summonAuraContainer: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  summonAuraText: {
    fontSize: 8,
    color: "#cccccc",
    textAlign: "center",
    fontStyle: "italic",
  },
  auraButton: {
    backgroundColor: RARITY_COLORS.R,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  auraButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  mainSummonSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  supportSummonsSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  allySummonSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  mainSummonContainer: {
    alignItems: "center",
  },
  supportSummonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  allySummonContainer: {
    alignItems: "center",
  },
  mainSummonButton: {
    margin: 3,
    borderRadius: 3,
    padding: 5,
    width: (Dimensions.get("window").width - 60) / 2, // Plus grand pour la Main
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  allySummonButton: {
    margin: 3,
    borderRadius: 3,
    padding: 5,
    width: (Dimensions.get("window").width - 60) / 2, // Plus grand pour l'Ally
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Styles pour le modal d'aura
  auraModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  auraModalContent: {
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    padding: 20,
    margin: 20,
    width: "90%",
    maxHeight: "80%",
  },
  auraModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  auraModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  auraModalCloseButton: {
    backgroundColor: ELEMENT_COLORS.fire,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  auraModalCloseButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  auraModalBody: {
    maxHeight: "80%",
  },
  auraModalText: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
  },
  // Styles pour le bouton de toggle Stats/Skills
  toggleDisplayButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 70,
    height: 30,
    borderWidth: 1,
    borderColor: "#ede0d3",
    borderRadius: 25,
    backgroundColor: "#785A3D",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  toggleDisplayButtonText: {
    color: "#ede0d3",
    fontSize: 15,
    fontWeight: "bold",
  },
  toggleContainer: {
    position: "absolute",
    bottom: -5,
    right: -5,
    alignItems: "center",
    zIndex: 1000,
  },
  toggleLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // Styles pour la Main Weapon horizontale
  mainWeaponButton: {
    borderRadius: 3,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMainWeaponButton: {
    backgroundColor: UI_COLORS.surface,
  },
  selectedMainWeaponContent: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    width: "70%",
  },
  mainWeaponImageContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: 90,
    borderRadius: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  mainWeaponImage: {
    width: "100%",
    height: "100%",
  },
  mainWeaponNameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    padding: 5,
    minHeight: 60,
  },
  mainWeaponNameText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  mainWeaponBadgesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainWeaponBadges: {
    flexDirection: "column",
    gap: 4,
    alignItems: "center",
  },
  mainWeaponStatsContainer: {
    width: "30%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  mainWeaponStatsSection: {
    alignItems: "flex-end",
  },
  mainWeaponStatsRow: {
    flexDirection: "column",
    gap: 2,
    alignItems: "flex-end",
  },
  mainWeaponStatItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: UI_COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: "100%",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainWeaponStatLabel: {
    color: UI_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 3,
  },
  mainWeaponHpValue: {
    color: STAT_COLORS.hp,
    fontSize: 13,
    fontWeight: "bold",
  },
  mainWeaponAtkValue: {
    color: STAT_COLORS.atk,
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyMainWeaponContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMainWeaponPlaceholder: {
    width: "100%",
    height: 80,
    backgroundColor: UI_COLORS.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    borderStyle: "dashed",
  },
  emptyMainWeaponText: {
    color: "#303030",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  // Styles pour les skills de la Main Weapon
  mainWeaponSkillsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  mainWeaponSkillItem: {
    display: "flex",
    alignItems: "flex-end",
  },
  // Nouveaux styles pour la Main Weapon
  mainWeaponElementRarityContainer: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    marginBottom: 4,
  },
  mainWeaponLevelContainer: {
    marginLeft: 8,
    marginTop: 4,
  },
  mainWeaponSkillLevelContainer: {
    marginBottom: 4,
    alignItems: "center",
  },
  mainWeaponSkillLevelText: {
    color: UI_COLORS.text,
    fontSize: 10,
    fontWeight: "bold",
  },
  mainWeaponSkillsRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  // Nouveaux styles pour la structure modulaire
  mainWeaponLeftBox: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  mainWeaponCenterBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainWeaponLevelDisplay: {
    alignItems: "center",
    justifyContent: "center",
  },
  mainWeaponLevelText: {
    color: UI_COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  mainWeaponSkillLabel: {
    color: UI_COLORS.text,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  mainWeaponRightBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-end",
    marginRight: 4,
  },
  mainWeaponStatsColumn: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-end",
  },
  skillItem: {
    marginBottom: 2,
  },
  mainWeaponSkillsColumn: {
    flexDirection: "column",
    gap: 4,
    alignItems: "flex-end",
    width: 120,
  },
  // Styles pour la sauvegarde
  saveSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: BASE_COLORS.blue,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: BASE_COLORS.background,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  saveButtonText: {
    color: BASE_COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: UI_COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  calculatorButton: {
    backgroundColor: BASE_COLORS.bluePrimary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1,
    borderWidth: 2,
    borderColor: BASE_COLORS.background,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  calculatorButtonText: {
    color: BASE_COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: UI_COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Styles pour le bouton Save Grid
  saveGridSection: {
    marginTop: 20,
    alignItems: "center",
  },
  // Styles pour les personnages
  charactersSection: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: BASE_COLORS.surface,
    borderRadius: 16,
  },
  charactersHeader: {
    backgroundColor: BASE_COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.border,
  },
  charactersContent: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  charactersGridContainer: {
    padding: 16,
    gap: 16,
  },
  characterCard: {
    backgroundColor: BASE_COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  characterHeader: {
    marginBottom: 12,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "bold",
    color: UI_COLORS.text,
  },
  characterInputs: {
    gap: 12,
  },
  characterInputGroup: {
    gap: 6,
  },
  characterInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: UI_COLORS.text,
  },
  characterInput: {
    backgroundColor: BASE_COLORS.white,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: UI_COLORS.text,
  },
  attackTypeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  attackTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    backgroundColor: BASE_COLORS.white,
    alignItems: "center",
  },
  attackTypeButtonActive: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primary,
  },
  attackTypeButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: UI_COLORS.text,
  },
  attackTypeButtonTextActive: {
    color: UI_COLORS.textWhite,
  },
  characterStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: UI_COLORS.border,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  characterStatItem: {
    alignItems: "center",
  },
  characterStatLabel: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    marginBottom: 4,
  },
  characterStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: UI_COLORS.text,
  },
  // Styles pour le modal de sauvegarde
  saveModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  saveModalContent: {
    backgroundColor: BASE_COLORS.surface,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.border,
  },
  saveModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: UI_COLORS.text,
  },
  saveModalCloseButton: {
    padding: 4,
  },
  saveModalCloseButtonText: {
    fontSize: 20,
    color: UI_COLORS.textSecondary,
  },
  saveModalBody: {
    padding: 16,
  },
  saveModalForm: {
    gap: 16,
  },
  saveModalField: {
    gap: 8,
  },
  saveModalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: UI_COLORS.text,
  },
  saveModalInput: {
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: UI_COLORS.text,
    backgroundColor: BASE_COLORS.white,
  },
  saveModalTextArea: {
    height: 80,
    textAlignVertical: "top",
  },

  saveModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  saveModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveModalButtonCancel: {
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  saveModalButtonConfirm: {
    backgroundColor: UI_COLORS.primary,
  },
  saveModalButtonCancelText: {
    color: UI_COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  saveModalButtonConfirmText: {
    color: UI_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
});
