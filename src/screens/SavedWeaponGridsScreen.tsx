import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { apiService } from "../services/api";
import {
  BASE_COLORS,
  UI_COLORS,
  ELEMENT_COLORS,
  RARITY_COLORS,
} from "../config/colors";
import {
  SavedWeaponGrid,
  WeaponGridsResponse,
  WeaponGridFilters,
} from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../utils/logger";

type SavedWeaponGridsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "SavedWeaponGrids"
>;

export const SavedWeaponGridsScreen: React.FC = () => {
  const navigation = useNavigation<SavedWeaponGridsScreenNavigationProp>();

  const [weaponGrids, setWeaponGrids] = useState<SavedWeaponGrid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrid, setSelectedGrid] = useState<SavedWeaponGrid | null>(
    null
  );
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  useEffect(() => {
    loadWeaponGrids();
  }, []);

  const loadWeaponGrids = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Charger les grilles publiques de la communauté
      const filters: WeaponGridFilters = {
        isPublic: true,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      const response = await apiService.getWeaponGrids(filters);

      logger.info(
        `Loaded ${response.weaponGrids?.length || 0} community grids`
      );

      // Calculer les métadonnées si elles sont manquantes
      const processedGrids = response.weaponGrids.map((grid) => {
        if (!grid.metadata || !grid.metadata.totalAtk) {
          logger.debug("Calculating metadata for grid:", grid.name);

          // Compter les armes et summons
          const weaponCount = Object.keys(grid.weapons || {}).length;
          const summonCount = Object.keys(grid.summons || {}).length;

          // Calculer les stats totales (approximation simple)
          let totalAtk = 0;
          let totalHp = 0;
          const elements = new Set<string>();

          // Calculer les stats des armes
          Object.values(grid.weapons || {}).forEach((weapon: any) => {
            if (weapon && weapon.weaponData) {
              const level = weapon.selectedLevel || 1;

              // Essayer différents chemins pour trouver les stats
              let baseAtk = 0;
              let baseHp = 0;

              if (weapon.weaponData.atk) {
                baseAtk = weapon.weaponData.atk;
              } else if (weapon.weaponData.attack) {
                baseAtk = weapon.weaponData.attack;
              } else if (
                weapon.weaponData.stats &&
                weapon.weaponData.stats.atk
              ) {
                baseAtk = weapon.weaponData.stats.atk;
              }

              if (weapon.weaponData.hp) {
                baseHp = weapon.weaponData.hp;
              } else if (weapon.weaponData.health) {
                baseHp = weapon.weaponData.health;
              } else if (
                weapon.weaponData.stats &&
                weapon.weaponData.stats.hp
              ) {
                baseHp = weapon.weaponData.stats.hp;
              }

              // Approximation simple des stats par niveau
              totalAtk += baseAtk * (1 + (level - 1) * 0.1);
              totalHp += baseHp * (1 + (level - 1) * 0.1);

              if (weapon.weaponData.element) {
                elements.add(weapon.weaponData.element);
              }
            }
          });

          // Calculer les stats des summons
          Object.values(grid.summons || {}).forEach((summon: any) => {
            if (summon && summon.summonData) {
              const level = summon.selectedLevel || 1;

              // Essayer différents chemins pour trouver les stats
              let baseAtk = 0;
              let baseHp = 0;

              if (summon.summonData.atk) {
                baseAtk = summon.summonData.atk;
              } else if (summon.summonData.attack) {
                baseAtk = summon.summonData.attack;
              } else if (
                summon.summonData.stats &&
                summon.summonData.stats.atk
              ) {
                baseAtk = summon.summonData.stats.atk;
              }

              if (summon.summonData.hp) {
                baseHp = summon.summonData.hp;
              } else if (summon.summonData.health) {
                baseHp = summon.summonData.health;
              } else if (
                summon.summonData.stats &&
                summon.summonData.stats.hp
              ) {
                baseHp = summon.summonData.stats.hp;
              }

              // Approximation simple des stats par niveau
              totalAtk += baseAtk * (1 + (level - 1) * 0.1);
              totalHp += baseHp * (1 + (level - 1) * 0.1);

              if (summon.summonData.element) {
                elements.add(summon.summonData.element);
              }
            }
          });

          return {
            ...grid,
            metadata: {
              totalAtk: Math.round(totalAtk),
              totalHp: Math.round(totalHp),
              weaponCount,
              summonCount,
              elements: Array.from(elements),
              rarities: [],
            },
          };
        }
        return grid;
      });

      setWeaponGrids(processedGrids);
    } catch (err: any) {
      console.error("Error loading grids:", err);
      setError(err.message || "Error loading grids");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadWeaponGrids(true);
  };

  const handleSearch = () => {
    loadWeaponGrids();
  };

  const handleGridPress = (grid: SavedWeaponGrid) => {
    setSelectedGrid(grid);
    setDetailsModalVisible(true);
  };

  const handleLoadGrid = async (grid: SavedWeaponGrid) => {
    try {
      // Convertir seulement les niveaux des summons de l'API vers le format de l'app (1,2,3,4,5 -> 1,100,150,200,250)
      // Les armes gardent leurs niveaux originaux (1,100,150,200,250)
      const convertSummonLevel = (level?: number) => {
        if (!level) return 1;
        const levelMap: { [key: number]: number } = {
          1: 1,
          2: 100,
          3: 150,
          4: 200,
          5: 250,
        };
        return levelMap[level] || 1;
      };

      // Traiter les armes - utiliser les données de base directement
      const processedWeapons: { [key: number]: any } = {};
      Object.keys(grid.weapons).forEach((key) => {
        const weapon = grid.weapons[parseInt(key)];
        if (weapon && weapon.weaponData) {
          // Utiliser directement les données de base de l'arme
          processedWeapons[parseInt(key)] = {
            ...weapon.weaponData,
            // Les armes gardent leurs niveaux originaux
            selectedLevel: weapon.selectedLevel || 1,
          };
        }
      });

      // Traiter les summons avec conversion des niveaux
      const processedSummons: { [key: number]: any } = {};
      Object.keys(grid.summons).forEach((key) => {
        const summon = grid.summons[parseInt(key)];
        if (summon && summon.summonData) {
          // Utiliser directement les données de base de la summon
          processedSummons[parseInt(key)] = {
            ...summon.summonData,
            selectedLevel: convertSummonLevel(summon.selectedLevel),
          };
        }
      });

      // Sauvegarder les armes et summons de la grille dans AsyncStorage
      await AsyncStorage.setItem(
        "selectedWeapons",
        JSON.stringify(processedWeapons)
      );
      await AsyncStorage.setItem(
        "selectedSummons",
        JSON.stringify(processedSummons)
      );

      Alert.alert(
        "Grid Loaded",
        `Grid "${grid.name}" has been loaded successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              setDetailsModalVisible(false);
              navigation.navigate("WeaponGrid");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error loading grid:", error);
      Alert.alert("Error", "Unable to load the grid. Please try again.");
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={UI_COLORS.primary} />
            <Text style={styles.loadingText}>Loading grids...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Community Weapon Grids</Text>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search grids..."
            placeholderTextColor={UI_COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadWeaponGrids()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : weaponGrids.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No grids found</Text>
              <Text style={styles.emptyText}>No grids match your search.</Text>
            </View>
          ) : (
            <View style={styles.gridsContainer}>
              {weaponGrids.map((grid, index) => (
                <TouchableOpacity
                  key={grid._id || `grid-${index}`}
                  style={styles.gridCard}
                  onPress={() => handleGridPress(grid)}
                >
                  <View style={styles.gridHeader}>
                    <View style={styles.gridInfo}>
                      <Text style={styles.gridName}>{grid.name}</Text>
                      {grid.description && (
                        <Text style={styles.gridDescription} numberOfLines={2}>
                          {grid.description}
                        </Text>
                      )}
                      <Text style={styles.gridDate}>
                        Created on {formatDate(grid.createdAt)}
                      </Text>
                    </View>
                    {/* Statistiques ATK/HP masquées
                    <View style={styles.gridStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ATK</Text>
                        <Text style={styles.statValue}>
                          {(grid.metadata?.totalAtk || 0).toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>HP</Text>
                        <Text style={styles.statValue}>
                          {(grid.metadata?.totalHp || 0).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    */}
                  </View>

                  <View style={styles.gridDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Weapons:</Text>
                      <Text style={styles.detailValue}>
                        {grid.metadata?.weaponCount || 0}/10
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Summons:</Text>
                      <Text style={styles.detailValue}>
                        {grid.metadata?.summonCount || 0}/6
                      </Text>
                    </View>
                    {grid.metadata?.elements &&
                      grid.metadata.elements.length > 0 && (
                        <View style={styles.elementsContainer}>
                          <Text style={styles.detailLabel}>Elements:</Text>
                          <View style={styles.elementsList}>
                            {grid.metadata.elements
                              .slice(0, 3)
                              .map((element, index) => (
                                <View
                                  key={index}
                                  style={[
                                    styles.elementBadge,
                                    {
                                      backgroundColor: getElementColor(element),
                                    },
                                  ]}
                                >
                                  <Text style={styles.elementBadgeText}>
                                    {element.toUpperCase()}
                                  </Text>
                                </View>
                              ))}
                            {grid.metadata.elements.length > 3 && (
                              <Text
                                key="more-elements"
                                style={styles.moreElementsText}
                              >
                                +{grid.metadata.elements.length - 3}
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Modal de détails */}
        <Modal
          visible={detailsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDetailsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Grid Details</Text>
                <TouchableOpacity
                  onPress={() => setDetailsModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedGrid && (
                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalGridInfo}>
                    <Text style={styles.modalGridName}>
                      {selectedGrid.name}
                    </Text>
                    {selectedGrid.description && (
                      <Text style={styles.modalGridDescription}>
                        {selectedGrid.description}
                      </Text>
                    )}
                    <Text style={styles.modalGridDate}>
                      Created on {formatDate(selectedGrid.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.modalStats}>
                    <Text style={styles.modalSectionTitle}>Statistics</Text>
                    <View style={styles.modalStatsGrid}>
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatLabel}>ATK Total</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedGrid.metadata.totalAtk.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatLabel}>HP Total</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedGrid.metadata.totalHp.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatLabel}>Armes</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedGrid.metadata.weaponCount}/10
                        </Text>
                      </View>
                      <View style={styles.modalStatCard}>
                        <Text style={styles.modalStatLabel}>Summons</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedGrid.metadata.summonCount}/6
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedGrid.metadata.elements.length > 0 && (
                    <View style={styles.modalElements}>
                      <Text style={styles.modalSectionTitle}>Elements</Text>
                      <View style={styles.modalElementsList}>
                        {selectedGrid.metadata.elements.map(
                          (element, index) => (
                            <View
                              key={index}
                              style={[
                                styles.modalElementBadge,
                                { backgroundColor: getElementColor(element) },
                              ]}
                            >
                              <Text style={styles.modalElementBadgeText}>
                                {element.toUpperCase()}
                              </Text>
                            </View>
                          )
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonLoad]}
                      onPress={() => handleLoadGrid(selectedGrid)}
                    >
                      <Text style={styles.modalButtonLoadText}>
                        📥 Load Grid
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonCalculator]}
                      onPress={() => {
                        navigation.navigate("GridCalculator", {
                          weaponGridStats: {
                            totalAtk: selectedGrid.metadata.totalAtk,
                            totalHp: selectedGrid.metadata.totalHp,
                          },
                        });
                      }}
                    >
                      <Text style={styles.modalButtonCalculatorText}>
                        🧮 Calculator
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: UI_COLORS.textSecondary,
  },
  header: {
    backgroundColor: "transparent",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: UI_COLORS.textWhite,
    textShadowColor: UI_COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  searchContainer: {
    flexDirection: "row",
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: BASE_COLORS.white,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: UI_COLORS.text,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    backgroundColor: UI_COLORS.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "transparent",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "transparent",
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
  gridsContainer: {
    gap: 12,
    backgroundColor: "transparent",
  },
  gridCard: {
    backgroundColor: BASE_COLORS.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  gridInfo: {
    flex: 1,
  },
  gridName: {
    fontSize: 20,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 6,
    textShadowColor: UI_COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gridDescription: {
    fontSize: 14,
    color: UI_COLORS.textSecondary,
    marginBottom: 4,
  },
  gridDate: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
  },
  gridStats: {
    alignItems: "flex-end",
  },
  statItem: {
    alignItems: "center",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 18,
    color: UI_COLORS.text,
    fontWeight: "bold",
    textShadowColor: UI_COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gridDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: UI_COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: UI_COLORS.text,
    fontWeight: "600",
  },
  elementsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  elementsList: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  elementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  elementBadgeText: {
    color: UI_COLORS.textWhite,
    fontSize: 11,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  moreElementsText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
  },

  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: BASE_COLORS.surface,
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
  modalCloseButton: {
    padding: 4,
  },
  modalCloseButtonText: {
    fontSize: 20,
    color: UI_COLORS.textSecondary,
  },
  modalBody: {
    padding: 16,
  },
  modalGridInfo: {
    marginBottom: 20,
  },
  modalGridName: {
    fontSize: 24,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 12,
    textShadowColor: UI_COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalGridDescription: {
    fontSize: 16,
    color: UI_COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  modalGridDate: {
    fontSize: 14,
    color: UI_COLORS.textSecondary,
  },
  modalStats: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 12,
  },
  modalStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modalStatCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: BASE_COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalStatLabel: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 18,
    color: UI_COLORS.text,
    fontWeight: "bold",
  },
  modalElements: {
    marginBottom: 20,
  },
  modalElementsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalElementBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  modalElementBadgeText: {
    color: UI_COLORS.textWhite,
    fontSize: 12,
    fontWeight: "bold",
  },

  modalActions: {
    gap: 12,
  },
  modalButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonLoad: {
    backgroundColor: UI_COLORS.primary,
  },
  modalButtonLoadText: {
    color: UI_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },

  modalButtonCalculator: {
    backgroundColor: UI_COLORS.secondary,
  },
  modalButtonCalculatorText: {
    color: UI_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "bold",
  },
});
