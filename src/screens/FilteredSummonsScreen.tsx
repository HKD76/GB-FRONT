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
import { SummonLevelSelector } from "../components/SummonLevelSelector";
import { SummonFilters } from "../components/WeaponFilterModal";

type FilteredSummonsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "FilteredSummons"
>;
type FilteredSummonsScreenRouteProp = RouteProp<
  AppStackParamList,
  "FilteredSummons"
>;

export const FilteredSummonsScreen: React.FC = () => {
  const navigation = useNavigation<FilteredSummonsScreenNavigationProp>();
  const route = useRoute<FilteredSummonsScreenRouteProp>();
  const { filters, summonIndex } = route.params;

  const [summons, setSummons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(100);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSummonDetails, setSelectedSummonDetails] = useState<any>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [levelSelectorVisible, setLevelSelectorVisible] = useState(false);
  const [selectedSummonForLevel, setSelectedSummonForLevel] =
    useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFilteredSummons();
  }, [filters]);

  const loadFilteredSummons = async (limit?: number) => {
    try {
      setLoading(true);
      setError(null);

      const summonsLimit = limit || currentLimit;

      // Construire les paramètres de requête
      const params = new URLSearchParams();

      if (filters.elements.length > 0) {
        params.append("element", filters.elements.join(","));
      }

      if (filters.rarities.length > 0) {
        params.append("rarity", filters.rarities.join(","));
      }

      if (filters.specialAuras && filters.specialAuras.length > 0) {
        params.append("specialAuras", filters.specialAuras.join(","));
      }

      // Limiter le nombre de summons pour l'affichage
      params.append("limit", summonsLimit.toString());

      // Appel à l'API avec les filtres
      const response = await apiService.getSummonsWithFilters(
        params.toString()
      );

      if (response && response.summons) {
        // Afficher toutes les summons, même celles sans images
        setSummons(response.summons);
        setCurrentLimit(summonsLimit);
        setHasMore(response.summons.length === summonsLimit);
      } else {
        setSummons([]);
        setHasMore(false);
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des summons filtrées:", err);
      setError(err.message || "Erreur lors du chargement des summons");
    } finally {
      setLoading(false);
    }
  };

  const handleSummonSelect = async (summon: any) => {
    // Vérifier si la summon a des stats par niveau
    const hasLevelStats =
      summon.atk1 ||
      summon.atk2 ||
      summon.atk3 ||
      summon.atk4 ||
      summon.atk5 ||
      summon.hp1 ||
      summon.hp2 ||
      summon.hp3 ||
      summon.hp4 ||
      summon.hp5;

    if (hasLevelStats) {
      // Ouvrir le sélecteur de niveau
      setSelectedSummonForLevel(summon);
      setLevelSelectorVisible(true);
    } else {
      // Sélectionner directement la summon sans niveau
      await confirmSummonSelection(summon, null);
    }
  };

  const handleLevelSelect = async (level: number, specialAura?: string) => {
    if (selectedSummonForLevel) {
      // Ajouter le niveau sélectionné à la summon
      const summonWithLevel = {
        ...selectedSummonForLevel,
        selectedLevel: level,
        selectedSpecialAura: specialAura,
      };
      await confirmSummonSelection(summonWithLevel, level, specialAura);
    }
  };

  const confirmSummonSelection = async (
    summon: any,
    level: number | null,
    specialAura?: string
  ) => {
    const levelText = level ? ` (Niveau ${level})` : "";
    const auraText = specialAura ? ` avec ${specialAura}` : "";

    // Ajouter le niveau sélectionné et l'aura spéciale
    if (level) {
      summon.selectedLevel = level;
    }
    if (specialAura) {
      summon.selectedSpecialAura = specialAura;
    }

    Alert.alert(
      "Summon sélectionnée",
      `Vous avez sélectionné: ${summon.name}${levelText}${auraText}\n\nEmplacement: ${summonIndex}`,
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Confirmer",
          onPress: () => {
            // Passer la summon sélectionnée en retour via les paramètres de route
            navigation.navigate("WeaponGrid", {
              selectedSummon: summon,
              summonIndex: summonIndex,
            });
          },
        },
      ]
    );
  };

  const handleSummonDetails = async (summon: any) => {
    setSelectedSummonDetails(summon);
    setDetailsModalVisible(true);
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

  // Fonction pour vérifier si une summon a une image valide
  const hasValidImage = (summon: any) => {
    // Vérifier si la summon a une image (img_full non null et non vide)
    return (
      summon.img_full &&
      summon.img_full.trim() !== "" &&
      summon.img_full !== null
    );
  };

  // Fonctions wrapper pour les boutons de chargement
  const handleLoadMore = () => {
    loadFilteredSummons(currentLimit + 50);
  };

  const handleLoadLess = () => {
    loadFilteredSummons(currentLimit - 50);
  };

  // Filtrer les summons par recherche
  const filteredSummons = summons.filter((summon) => {
    if (!searchQuery.trim()) return true;
    const summonName = summon.name?.toLowerCase() || "";
    return summonName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={UI_COLORS.primary} />
          <Text style={styles.loadingText}>Loading filtered summons...</Text>
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
            onPress={() => loadFilteredSummons()}
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
        <Text style={styles.title}>Filtered Summons</Text>
        <Text style={styles.subtitle}>Slot #{summonIndex}</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom de summon..."
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
        {filteredSummons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? "Aucune summon trouvée"
                : "Aucune summon trouvée"}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? "Aucune summon ne correspond à votre recherche."
                : "Aucune summon ne correspond aux critères sélectionnés."}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredSummons.length} summon
                {filteredSummons.length > 1 ? "s" : ""} trouvée
                {filteredSummons.length > 1 ? "s" : ""}
                {searchQuery.trim() && ` (sur ${summons.length})`}
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

            {filteredSummons.map((summon, index) => (
              <TouchableOpacity
                key={summon._id || index}
                style={styles.summonCard}
                onPress={() => handleSummonSelect(summon)}
              >
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleSummonDetails(summon)}
                >
                  <Text style={styles.detailsButtonText}>📋 Détails</Text>
                </TouchableOpacity>
                <View style={styles.summonHeader}>
                  <View style={styles.summonImageContainer}>
                    {summon.img_full ? (
                      <Image
                        source={{ uri: summon.img_full }}
                        style={styles.summonImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <Text style={styles.noImageText}>🖼️</Text>
                        <Text style={styles.noImageLabel}>Pas d'image</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.summonInfo}>
                    <Text style={styles.summonName}>
                      {summon.name || "Sans nom"}
                    </Text>
                    <View style={styles.summonBadges}>
                      {summon.element && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: getElementColor(summon.element),
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {summon.element.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {summon.rarity && (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: getRarityColor(summon.rarity) },
                          ]}
                        >
                          <Text style={styles.badgeText}>{summon.rarity}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.summonStats}>
                  <View style={styles.statRow}>
                    {summon.atk1 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ATK</Text>
                        <Text style={styles.statValue}>{summon.atk1}</Text>
                      </View>
                    )}
                    {summon.hp1 && (
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>HP</Text>
                        <Text style={styles.statValue}>{summon.hp1}</Text>
                      </View>
                    )}
                  </View>

                  {summon.atk2 && (
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>ATK Max</Text>
                        <Text style={styles.statValue}>{summon.atk2}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {summon.call_name && (
                  <View style={styles.callContainer}>
                    <Text style={styles.callTitle}>Call:</Text>
                    <Text style={styles.callText}>{summon.call_name}</Text>
                  </View>
                )}

                {summon.aura1 && (
                  <View style={styles.auraContainer}>
                    <Text style={styles.auraTitle}>Aura:</Text>
                    <Text style={styles.auraText}>{summon.aura1}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Modal de détails de summon */}
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de la Summon</Text>
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
            ) : selectedSummonDetails ? (
              <ScrollView style={styles.modalScrollView}>
                <View style={styles.modalSummonHeader}>
                  <Image
                    source={{ uri: selectedSummonDetails.img_full }}
                    style={styles.modalSummonImage}
                    resizeMode="contain"
                  />
                  <View style={styles.modalSummonInfo}>
                    <Text style={styles.modalSummonName}>
                      {selectedSummonDetails.name}
                    </Text>
                    <View style={styles.modalSummonBadges}>
                      {selectedSummonDetails.element && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: getElementColor(
                                selectedSummonDetails.element
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {selectedSummonDetails.element.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {selectedSummonDetails.rarity && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: getRarityColor(
                                selectedSummonDetails.rarity
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {selectedSummonDetails.rarity}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.modalSummonStats}>
                  <Text style={styles.modalSectionTitle}>Statistiques</Text>
                  <View style={styles.modalStatRow}>
                    {selectedSummonDetails.atk1 && (
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>ATK</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedSummonDetails.atk1}
                        </Text>
                      </View>
                    )}
                    {selectedSummonDetails.hp1 && (
                      <View style={styles.modalStatItem}>
                        <Text style={styles.modalStatLabel}>HP</Text>
                        <Text style={styles.modalStatValue}>
                          {selectedSummonDetails.hp1}
                        </Text>
                      </View>
                    )}
                  </View>
                  {(selectedSummonDetails.atk2 ||
                    selectedSummonDetails.hp2) && (
                    <View style={styles.modalStatRow}>
                      {selectedSummonDetails.atk2 && (
                        <View style={styles.modalStatItem}>
                          <Text style={styles.modalStatLabel}>ATK Max</Text>
                          <Text style={styles.modalStatValue}>
                            {selectedSummonDetails.atk2}
                          </Text>
                        </View>
                      )}
                      {selectedSummonDetails.hp2 && (
                        <View style={styles.modalStatItem}>
                          <Text style={styles.modalStatLabel}>HP Max</Text>
                          <Text style={styles.modalStatValue}>
                            {selectedSummonDetails.hp2}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {selectedSummonDetails.call_name && (
                  <View style={styles.modalCallContainer}>
                    <Text style={styles.modalSectionTitle}>Call</Text>
                    <Text style={styles.modalCallName}>
                      {selectedSummonDetails.call_name}
                    </Text>
                    {selectedSummonDetails.call1 && (
                      <Text style={styles.modalCallText}>
                        {selectedSummonDetails.call1}
                      </Text>
                    )}
                  </View>
                )}

                {selectedSummonDetails.aura1 && (
                  <View style={styles.modalAuraContainer}>
                    <Text style={styles.modalSectionTitle}>Aura</Text>
                    <Text style={styles.modalAuraText}>
                      {selectedSummonDetails.aura1}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalSelectButton}
                  onPress={() => {
                    handleSummonSelect(selectedSummonDetails);
                    setDetailsModalVisible(false);
                  }}
                >
                  <Text style={styles.modalSelectButtonText}>
                    Sélectionner cette summon
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Sélecteur de niveau */}
      {selectedSummonForLevel && (
        <SummonLevelSelector
          visible={levelSelectorVisible}
          onClose={() => {
            setLevelSelectorVisible(false);
            setSelectedSummonForLevel(null);
          }}
          onSelectLevel={handleLevelSelect}
          summon={selectedSummonForLevel}
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
    color: UI_COLORS.text,
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
  summonCard: {
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
  summonHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  summonImageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  summonImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  summonInfo: {
    flex: 1,
  },
  summonName: {
    fontSize: 18,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  summonBadges: {
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
  summonStats: {
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
  callContainer: {
    marginBottom: 8,
  },
  callTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  callText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
  },
  auraContainer: {
    marginBottom: 8,
  },
  auraTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  auraText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
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
  modalSummonHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalSummonImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  modalSummonInfo: {
    flex: 1,
  },
  modalSummonName: {
    fontSize: 20,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  modalSummonBadges: {
    flexDirection: "row",
    gap: 8,
  },
  modalSummonStats: {
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
  modalCallContainer: {
    marginBottom: 16,
  },
  modalCallName: {
    fontSize: 14,
    fontWeight: "bold",
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  modalCallText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
  },
  modalAuraContainer: {
    marginBottom: 16,
  },
  modalAuraText: {
    fontSize: 12,
    color: UI_COLORS.textSecondary,
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
  noImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: UI_COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: UI_COLORS.border,
    borderStyle: "dashed",
  },
  noImageText: {
    fontSize: 24,
    marginBottom: 4,
  },
  noImageLabel: {
    fontSize: 10,
    color: UI_COLORS.textSecondary,
    textAlign: "center",
  },
});
