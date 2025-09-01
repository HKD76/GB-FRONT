import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { apiService } from "../services/api";
import {
  BASE_COLORS,
  UI_COLORS,
  ELEMENT_COLORS,
  RARITY_COLORS,
} from "../config/colors";
import { EnrichedSkillDisplay } from "../components/EnrichedSkillDisplay";
import { BasicSkillDisplay } from "../components/BasicSkillDisplay";
import { WeaponLevelSelector } from "../components/WeaponLevelSelector";

type FilteredWeaponsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "FilteredWeapons"
>;
type FilteredWeaponsScreenRouteProp = RouteProp<
  AppStackParamList,
  "FilteredWeapons"
>;

export const FilteredWeaponsScreen: React.FC = () => {
  const navigation = useNavigation<FilteredWeaponsScreenNavigationProp>();
  const route = useRoute<FilteredWeaponsScreenRouteProp>();
  const { filters, weaponIndex } = route.params;

  const [weapons, setWeapons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(100);
  const [hasMore, setHasMore] = useState(true);
  const [selectedWeaponDetails, setSelectedWeaponDetails] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [levelSelectorVisible, setLevelSelectorVisible] = useState(false);
  const [selectedWeaponForLevel, setSelectedWeaponForLevel] =
    useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFilteredWeapons();
  }, [filters]);

  const loadFilteredWeapons = async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);

      const weaponsLimit = limit || currentLimit;

      // Construire les paramètres de requête
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

      // Limiter le nombre d'armes pour l'affichage
      params.append("limit", weaponsLimit.toString());

      console.log("Paramètres de filtrage:", params.toString());

      // Appel à l'API rapide avec les filtres (plus de timeout !)
      const response = await apiService.getWeaponsEnriched(params.toString());

      if (response && response.weapons) {
        // Filtrer les armes qui ont une image valide
        const weaponsWithImages = response.weapons.filter(hasValidImage);

        // Calculer atkmax individuel pour chaque arme
        const calculateIndividualAtkMax = (weapon: any) => {
          let maxAtk = 0;

          // Vérifier toutes les valeurs ATK possibles (atk1 à atk5) pour cette arme spécifique
          for (let i = 1; i <= 5; i++) {
            const atkValue = weapon[`atk${i}`];
            if (atkValue && atkValue > maxAtk) {
              maxAtk = atkValue;
            }
          }

          return maxAtk;
        };

        // Ajouter atkmax individuel à chaque arme pour l'affichage
        const weaponsWithIndividualAtkMax = weaponsWithImages.map((weapon) => ({
          ...weapon,
          atkmax: calculateIndividualAtkMax(weapon),
        }));

        setWeapons(weaponsWithIndividualAtkMax);
        setCurrentLimit(weaponsLimit);
        setHasMore(response.weapons.length === weaponsLimit);
        console.log(
          `${response.weapons.length} armes trouvées, ${weaponsWithImages.length} avec images`
        );
      } else {
        setWeapons([]);
        setHasMore(false);
        console.log("Aucune arme trouvée avec ces filtres");
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des armes filtrées:", err);
      setError(err.message || "Erreur lors du chargement des armes");
    } finally {
      setLoading(false);
    }
  };

  const handleWeaponSelect = async (weapon: any) => {
    // Vérifier si l'arme a des stats par niveau
    const hasLevelStats =
      weapon.atk1 ||
      weapon.atk2 ||
      weapon.atk3 ||
      weapon.atk4 ||
      weapon.atk5 ||
      weapon.hp1 ||
      weapon.hp2 ||
      weapon.hp3 ||
      weapon.hp4 ||
      weapon.hp5;

    if (hasLevelStats) {
      // Ouvrir le sélecteur de niveau
      setSelectedWeaponForLevel(weapon);
      setLevelSelectorVisible(true);
    } else {
      // Sélectionner directement l'arme sans niveau
      await confirmWeaponSelection(weapon, null);
    }
  };

  const handleLevelSelect = async (level: number) => {
    if (selectedWeaponForLevel) {
      // Ajouter le niveau sélectionné à l'arme
      const weaponWithLevel = {
        ...selectedWeaponForLevel,
        selectedLevel: level,
      };
      await confirmWeaponSelection(weaponWithLevel, level);
    }
  };

  const confirmWeaponSelection = async (weapon: any, level: number | null) => {
    const levelText = level ? ` (Niveau ${level})` : "";

    // Vérifier si l'arme a déjà des données enrichies
    const hasEnrichedData =
      weapon.s1_enriched || weapon.s2_enriched || weapon.s3_enriched;

    if (!hasEnrichedData) {
      console.log("Récupération des données enrichies pour:", weapon.name);
      try {
        // Essayer différents formats d'ID (priorité à l'ID numérique)
        const weaponId = weapon.id || weapon._id || weapon.weapon_id;
        console.log("Tentative avec l'ID:", weaponId);

        if (!weaponId) {
          console.error("Aucun ID trouvé pour l'arme");
          Alert.alert(
            "Erreur",
            "Impossible de récupérer les données enrichies de l'arme.",
            [{ text: "OK" }]
          );
          return;
        }

        const enrichedWeapon = await apiService.getWeaponEnriched(
          weaponId,
          true
        );
        const finalWeapon = enrichedWeapon.weapon || enrichedWeapon;

        console.log("=== DONNÉES ENRICHIES RÉCUPÉRÉES ===");
        console.log(
          "Réponse complète de l'API:",
          JSON.stringify(enrichedWeapon, null, 2)
        );
        console.log("Arme finale:", JSON.stringify(finalWeapon, null, 2));

        // Ajouter le niveau sélectionné
        if (level) {
          finalWeapon.selectedLevel = level;
        }

        console.log("Données enrichies récupérées:", !!finalWeapon.s1_enriched);

        Alert.alert(
          "Arme sélectionnée",
          `Vous avez sélectionné: ${
            finalWeapon.title || finalWeapon.name
          }${levelText}\n\nEmplacement: ${weaponIndex}`,
          [
            {
              text: "Annuler",
              style: "cancel",
            },
            {
              text: "Confirmer",
              onPress: () => {
                console.log(
                  `Confirmation: arme ${
                    finalWeapon.title || finalWeapon.name
                  }${levelText} pour emplacement ${weaponIndex}`
                );
                // Passer l'arme enrichie en retour via les paramètres de route
                navigation.navigate("WeaponGrid", {
                  selectedWeapon: finalWeapon,
                  weaponIndex: weaponIndex,
                });
              },
            },
          ]
        );
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données enrichies:",
          error
        );
        Alert.alert(
          "Erreur de chargement",
          "Impossible de charger les données enrichies. L'arme sera ajoutée avec les données de base.",
          [
            {
              text: "Annuler",
              style: "cancel",
            },
            {
              text: "Continuer",
              onPress: () => {
                // Ajouter le niveau sélectionné à l'arme originale
                if (level) {
                  weapon.selectedLevel = level;
                }
                navigation.navigate("WeaponGrid", {
                  selectedWeapon: weapon,
                  weaponIndex: weaponIndex,
                });
              },
            },
          ]
        );
      }
    } else {
      // L'arme a déjà des données enrichies
      if (level) {
        weapon.selectedLevel = level;
      }

      Alert.alert(
        "Arme sélectionnée",
        `Vous avez sélectionné: ${
          weapon.title || weapon.name
        }${levelText}\n\nEmplacement: ${weaponIndex}`,
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Confirmer",
            onPress: () => {
              console.log(
                `Confirmation: arme ${
                  weapon.title || weapon.name
                }${levelText} pour emplacement ${weaponIndex}`
              );
              // Passer l'arme sélectionnée en retour via les paramètres de route
              navigation.navigate("WeaponGrid", {
                selectedWeapon: weapon,
                weaponIndex: weaponIndex,
              });
            },
          },
        ]
      );
    }
  };

  const handleWeaponDetails = async (weapon: any) => {
    setSelectedWeaponDetails(weapon);
    setDetailsModalVisible(true);

    // Debug: afficher l'ID de l'arme
    console.log("ID de l'arme:", weapon._id);
    console.log("Structure de l'arme:", JSON.stringify(weapon, null, 2));

    // Vérifier si l'arme a déjà des skills (enrichis ou de base)
    const hasSkills =
      weapon.s1_details ||
      weapon.s2_details ||
      weapon.s3_details ||
      weapon.s1_enriched ||
      weapon.s2_enriched ||
      weapon.s3_enriched ||
      weapon.s1 ||
      weapon.s2 ||
      weapon.s3 ||
      weapon["s1 name"] ||
      weapon["s2 name"] ||
      weapon["s3 name"];

    if (!hasSkills) {
      setLoadingDetails(true);
      try {
        // Essayer différents formats d'ID (priorité à l'ID numérique)
        const weaponId = weapon.id || weapon._id || weapon.weapon_id;
        console.log("Tentative avec l'ID:", weaponId);

        if (!weaponId) {
          console.error("Aucun ID trouvé pour l'arme");
          setLoadingDetails(false);
          return;
        }

        const enrichedWeapon = await apiService.getWeaponEnriched(
          weaponId,
          true
        );
        setSelectedWeaponDetails(enrichedWeapon.weapon || enrichedWeapon);
      } catch (error) {
        console.error("Erreur lors du chargement des détails:", error);
        // En cas d'erreur, garder l'arme originale et afficher un message
        Alert.alert(
          "Erreur de chargement",
          "Impossible de charger les détails enrichis. Affichage des données de base.",
          [{ text: "OK" }]
        );
        setSelectedWeaponDetails(weapon);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const getElementColor = (element: string) => {
    const colors: { [key: string]: string } = {
      fire: ELEMENT_COLORS.fire,
      water: ELEMENT_COLORS.water,
      wind: ELEMENT_COLORS.wind,
      earth: ELEMENT_COLORS.earth,
      light: ELEMENT_COLORS.light,
      dark: ELEMENT_COLORS.dark,
    };
    return colors[element?.toLowerCase()] || ELEMENT_COLORS.default;
  };

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      N: RARITY_COLORS.N,
      R: RARITY_COLORS.R,
      SR: RARITY_COLORS.SR,
      SSR: RARITY_COLORS.SSR,
    };
    return colors[rarity] || RARITY_COLORS.default;
  };

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
    return UI_COLORS.primary;
  };

  // Fonction pour vérifier si une arme a une image valide
  const hasValidImage = (weapon: any) => {
    // Vérifier si l'arme a une image (img_full non null et non vide)
    return (
      weapon.img_full &&
      weapon.img_full.trim() !== "" &&
      weapon.img_full !== null
    );
  };

  // Fonctions wrapper pour les boutons de chargement
  const handleLoadMore = () => {
    loadFilteredWeapons(currentLimit + 50);
  };

  const handleLoadLess = () => {
    loadFilteredWeapons(currentLimit - 50);
  };

  // Fonction pour filtrer les armes selon la recherche
  const filteredWeapons = weapons.filter((weapon) => {
    if (!searchQuery.trim()) return true;

    const weaponName = (weapon.title || weapon.name || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return weaponName.includes(query);
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={UI_COLORS.primary} />
          <Text style={styles.loadingText}>Loading filtered weapons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadFilteredWeapons()}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Filtered Weapons</Text>
        <Text style={styles.subtitle}>Slot #{weaponIndex}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom d'arme..."
          placeholderTextColor={UI_COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery("")}
          >
            <Text style={styles.clearSearchButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {weapons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Aucune arme trouvée</Text>
            <Text style={styles.emptyText}>
              Aucune arme ne correspond aux critères sélectionnés.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredWeapons.length} arme
                {filteredWeapons.length > 1 ? "s" : ""} avec image trouvée
                {filteredWeapons.length > 1 ? "s" : ""}
                {searchQuery.trim() && (
                  <Text style={styles.searchInfo}>
                    {" "}
                    (sur {weapons.length} total)
                  </Text>
                )}
              </Text>
              <View style={styles.loadMoreButtons}>
                {currentLimit > 50 && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={handleLoadLess}
                  >
                    <Text style={styles.loadMoreButtonText}>-50</Text>
                  </TouchableOpacity>
                )}
                {hasMore && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={handleLoadMore}
                  >
                    <Text style={styles.loadMoreButtonText}>+50</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {filteredWeapons.map((weapon, index) => (
              <TouchableOpacity
                key={weapon._id || index}
                style={styles.weaponCard}
                onPress={() => handleWeaponSelect(weapon)}
              >
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleWeaponDetails(weapon)}
                >
                  <Text style={styles.detailsButtonText}>📋 Détails</Text>
                </TouchableOpacity>
                <View style={styles.weaponHeader}>
                  <View style={styles.weaponImageContainer}>
                    <Image
                      source={{ uri: weapon.img_full }}
                      style={styles.weaponImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.weaponInfo}>
                    <Text style={styles.weaponName}>
                      {weapon.title || weapon.name || "Sans nom"}
                    </Text>
                    <View style={styles.weaponBadges}>
                      {weapon.element && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: getElementColor(weapon.element),
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {weapon.element.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {weapon.rarity && (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: getRarityColor(weapon.rarity) },
                          ]}
                        >
                          <Text style={styles.badgeText}>{weapon.rarity}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.weaponStats}>
                  <View style={styles.statRow}>
                    {weapon.atk1 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ATK</Text>
                        <Text style={styles.statValue}>{weapon.atk1}</Text>
                      </View>
                    )}
                    {weapon.hp1 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>HP</Text>
                        <Text style={styles.statValue}>{weapon.hp1}</Text>
                      </View>
                    )}
                  </View>

                  {weapon.atkmax && (
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ATK Max</Text>
                        <Text style={styles.statValue}>{weapon.atkmax}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {(weapon.s1_enriched ||
                  weapon.s2_enriched ||
                  weapon.s3_enriched) && (
                  <View style={styles.skillsContainer}>
                    <Text style={styles.skillsTitle}>Compétences:</Text>
                    <View style={styles.skillsGrid}>
                      {weapon.s1_enriched && (
                        <EnrichedSkillDisplay
                          skill={weapon.s1_enriched}
                          skillIndex={1}
                        />
                      )}
                      {weapon.s2_enriched && (
                        <EnrichedSkillDisplay
                          skill={weapon.s2_enriched}
                          skillIndex={2}
                        />
                      )}
                      {weapon.s3_enriched && (
                        <EnrichedSkillDisplay
                          skill={weapon.s3_enriched}
                          skillIndex={3}
                        />
                      )}
                    </View>
                  </View>
                )}

                {weapon.type && (
                  <Text style={styles.typeText}>Type: {weapon.type}</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Modal de détails d'arme */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de l'Arme</Text>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color={UI_COLORS.primary} />
                <Text style={styles.modalLoadingText}>Loading details...</Text>
              </View>
            ) : selectedWeaponDetails ? (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalWeaponHeader}>
                  <Image
                    source={{ uri: selectedWeaponDetails.img_full }}
                    style={styles.modalWeaponImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalWeaponInfo}>
                    <Text style={styles.modalWeaponName}>
                      {selectedWeaponDetails.title ||
                        selectedWeaponDetails.name}
                    </Text>
                    <View style={styles.modalWeaponBadges}>
                      {selectedWeaponDetails.element && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: getElementColor(
                                selectedWeaponDetails.element
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {selectedWeaponDetails.element.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {selectedWeaponDetails.rarity && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: getRarityColor(
                                selectedWeaponDetails.rarity
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {selectedWeaponDetails.rarity}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.modalWeaponStats}>
                  <Text style={styles.modalSectionTitle}>Statistiques</Text>
                  <View style={styles.modalStatRow}>
                    {selectedWeaponDetails.atk1 && (
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>ATK</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedWeaponDetails.atk1}
                        </Text>
                      </View>
                    )}
                    {selectedWeaponDetails.hp1 && (
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>HP</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedWeaponDetails.hp1}
                        </Text>
                      </View>
                    )}
                  </View>
                  {(selectedWeaponDetails.atk2 ||
                    selectedWeaponDetails.hp2) && (
                    <View style={styles.modalStatRow}>
                      {selectedWeaponDetails.atk2 && (
                        <View style={styles.modalStatItem}>
                          <Text style={styles.modalStatLabel}>ATK Max</Text>
                          <Text style={styles.modalStatValue}>
                            {selectedWeaponDetails.atk2}
                          </Text>
                        </View>
                      )}
                      {selectedWeaponDetails.hp2 && (
                        <View style={styles.modalStatItem}>
                          <Text style={styles.modalStatLabel}>HP Max</Text>
                          <Text style={styles.modalStatValue}>
                            {selectedWeaponDetails.hp2}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {(selectedWeaponDetails.s1_enriched ||
                  selectedWeaponDetails.s2_enriched ||
                  selectedWeaponDetails.s3_enriched ||
                  selectedWeaponDetails.s1_details ||
                  selectedWeaponDetails.s2_details ||
                  selectedWeaponDetails.s3_details ||
                  selectedWeaponDetails.s1 ||
                  selectedWeaponDetails.s2 ||
                  selectedWeaponDetails.s3 ||
                  selectedWeaponDetails["s1 name"] ||
                  selectedWeaponDetails["s2 name"] ||
                  selectedWeaponDetails["s3 name"]) && (
                  <View style={styles.modalSkillsContainer}>
                    <Text style={styles.modalSectionTitle}>Compétences</Text>
                    <View style={styles.modalSkillsGrid}>
                      {(selectedWeaponDetails.s1_enriched ||
                        selectedWeaponDetails.s1_details ||
                        selectedWeaponDetails.s1 ||
                        selectedWeaponDetails["s1 name"]) &&
                        (selectedWeaponDetails.s1_enriched ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeaponDetails.s1_enriched}
                            skillIndex={1}
                          />
                        ) : (
                          <BasicSkillDisplay
                            skill={
                              selectedWeaponDetails.s1_details ||
                              selectedWeaponDetails.s1 || {
                                "s1 name": selectedWeaponDetails["s1 name"],
                                "s1 desc": selectedWeaponDetails["s1 desc"],
                              } || { name: "Skill 1" }
                            }
                            skillIndex={1}
                          />
                        ))}
                      {(selectedWeaponDetails.s2_enriched ||
                        selectedWeaponDetails.s2_details ||
                        selectedWeaponDetails.s2 ||
                        selectedWeaponDetails["s2 name"]) &&
                        (selectedWeaponDetails.s2_enriched ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeaponDetails.s2_enriched}
                            skillIndex={2}
                          />
                        ) : (
                          <BasicSkillDisplay
                            skill={
                              selectedWeaponDetails.s2_details ||
                              selectedWeaponDetails.s2 || {
                                "s2 name": selectedWeaponDetails["s2 name"],
                                "s2 desc": selectedWeaponDetails["s2 desc"],
                              } || { name: "Skill 2" }
                            }
                            skillIndex={2}
                          />
                        ))}
                      {(selectedWeaponDetails.s3_enriched ||
                        selectedWeaponDetails.s3_details ||
                        selectedWeaponDetails.s3 ||
                        selectedWeaponDetails["s3 name"]) &&
                        (selectedWeaponDetails.s3_enriched ? (
                          <EnrichedSkillDisplay
                            skill={selectedWeaponDetails.s3_enriched}
                            skillIndex={3}
                          />
                        ) : (
                          <BasicSkillDisplay
                            skill={
                              selectedWeaponDetails.s3_details ||
                              selectedWeaponDetails.s3 || {
                                "s3 name": selectedWeaponDetails["s3 name"],
                                "s3 desc": selectedWeaponDetails["s3 desc"],
                              } || { name: "Skill 3" }
                            }
                            skillIndex={3}
                          />
                        ))}
                    </View>
                  </View>
                )}

                {selectedWeaponDetails.type && (
                  <View style={styles.modalTypeContainer}>
                    <Text style={styles.modalSectionTitle}>Type</Text>
                    <Text style={styles.modalTypeText}>
                      {selectedWeaponDetails.type}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalSelectButton}
                  onPress={() => {
                    handleWeaponSelect(selectedWeaponDetails);
                    setDetailsModalVisible(false);
                  }}
                >
                  <Text style={styles.modalSelectButtonText}>
                    Sélectionner cette arme
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Sélecteur de niveau */}
      {selectedWeaponForLevel && (
        <WeaponLevelSelector
          visible={levelSelectorVisible}
          onClose={() => {
            setLevelSelectorVisible(false);
            setSelectedWeaponForLevel(null);
          }}
          onSelectLevel={handleLevelSelect}
          weapon={selectedWeaponForLevel}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: UI_COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: UI_COLORS.error,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: UI_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: BASE_COLORS.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.border,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: UI_COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    marginTop: 4,
  },
  filtersSummary: {
    backgroundColor: BASE_COLORS.white,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: UI_COLORS.primary,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  filtersText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    marginBottom: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    marginTop: 8,
    backgroundColor: BASE_COLORS.white,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: UI_COLORS.text,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 8,
    marginLeft: 8,
  },
  clearSearchButtonText: {
    color: UI_COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    flex: 1,
  },
  searchInfo: {
    fontSize: 14,
    color: UI_COLORS.textSecondary,
    fontStyle: "italic",
  },
  loadMoreButtons: {
    flexDirection: "row",
    gap: 8,
  },
  loadMoreButton: {
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  loadMoreButtonText: {
    color: UI_COLORS.textWhite,
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    textAlign: "center",
  },
  weaponCard: {
    backgroundColor: BASE_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weaponHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  weaponImageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  weaponImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  weaponInfo: {
    flex: 1,
  },
  weaponName: {
    fontSize: 18,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  weaponBadges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: BASE_COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  weaponStats: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: UI_COLORS.surface,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    marginRight: 8,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    color: UI_COLORS.text,
    fontWeight: "bold",
  },
  skillsContainer: {
    marginBottom: 8,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  skillsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  skillButton: {
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  skillButtonText: {
    color: BASE_COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  typeText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    fontStyle: "italic",
  },
  detailsButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  detailsButtonText: {
    color: UI_COLORS.textWhite,
    fontSize: 10,
    fontWeight: "bold",
  },
  // Styles pour la modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: UI_COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: UI_COLORS.textSecondary,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: UI_COLORS.textSecondary,
  },
  modalScrollView: {
    padding: 16,
  },
  modalWeaponHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalWeaponImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  modalWeaponInfo: {
    flex: 1,
  },
  modalWeaponName: {
    fontSize: 20,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  modalWeaponBadges: {
    flexDirection: "row",
    gap: 8,
  },
  modalWeaponStats: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  modalStatRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  modalStatItem: {
    flex: 1,
    backgroundColor: BASE_COLORS.white,
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: UI_COLORS.border,
  },
  modalStatLabel: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    fontWeight: "bold",
    marginBottom: 2,
  },
  modalStatValue: {
    fontSize: 16,
    color: UI_COLORS.text,
    fontWeight: "bold",
  },
  modalSkillsContainer: {
    marginBottom: 16,
  },
  modalSkillsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  modalTypeContainer: {
    marginBottom: 16,
  },
  modalTypeText: {
    fontSize: 14,
    color: UI_COLORS.textSecondary,
    fontStyle: "italic",
  },
  modalSelectButton: {
    backgroundColor: UI_COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  modalSelectButtonText: {
    color: UI_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
});
