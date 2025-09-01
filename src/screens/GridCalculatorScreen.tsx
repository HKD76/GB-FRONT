import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_COLORS, UI_COLORS } from "../config/colors";

type Character = {
  id: number;
  name: string;
  hp: string;
  atk: string;
  attackType: "none" | "double" | "triple";
};

type GridCalculatorScreenProps = {
  navigation: StackNavigationProp<any>;
  route: {
    params?: {
      weaponGridStats?: {
        totalAtk: number;
        totalHp: number;
      };
      weapons?: any[];
      summons?: any[];
      characters?: {
        [key: number]: {
          name: string;
          baseAtk: string;
          baseHp: string;
          attackType: "none" | "double" | "triple";
        };
      };
      statsByType?: any;
    };
  };
};

/**
 * Écran de calculatrice de grille
 * Calcule les dégâts et statistiques des personnages avec les boosts d'armes
 */
const GridCalculatorScreen: React.FC<GridCalculatorScreenProps> = ({
  navigation,
  route,
}) => {
  const [characters, setCharacters] = useState<Character[]>([
    { id: 1, name: "Character 1", hp: "", atk: "", attackType: "none" },
    { id: 2, name: "Character 2", hp: "", atk: "", attackType: "none" },
    { id: 3, name: "Character 3", hp: "", atk: "", attackType: "none" },
    { id: 4, name: "Character 4", hp: "", atk: "", attackType: "none" },
  ]);
  const [weapons, setWeapons] = useState<any[]>([]);
  const [summons, setSummons] = useState<any[]>([]);
  const [statsByType, setStatsByType] = useState<any>(null);
  const [weaponGridStats, setWeaponGridStats] = useState({
    totalAtk: 0,
    totalHp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{
    [key: number]: {
      totalAtk: number;
      damage: number;
      boostedAtk: number;
      boostedHp: number;
    };
  }>({});

  useEffect(() => {
    if (route.params?.weaponGridStats) {
      setWeaponGridStats(route.params.weaponGridStats);

      if (route.params.weapons) {
        setWeapons(route.params.weapons);
      }
      if (route.params.summons) {
        setSummons(route.params.summons);
      }
      if (route.params.statsByType) {
        setStatsByType(route.params.statsByType);
      }

      if (route.params.characters) {
        const characterArray = Object.entries(route.params.characters).map(
          ([id, char]) => ({
            id: parseInt(id),
            name: char.name,
            hp: char.baseHp,
            atk: char.baseAtk,
            attackType: char.attackType,
          })
        );
        setCharacters(characterArray);
      }

      setLoading(false);
    } else {
      loadWeaponGridStats();
    }
  }, [route.params]);

  const loadWeaponGridStats = async () => {
    try {
      setLoading(true);
      const selectedWeapons = await AsyncStorage.getItem("selectedWeapons");
      const selectedSummons = await AsyncStorage.getItem("selectedSummons");

      let totalAtk = 0;
      let totalHp = 0;

      if (selectedWeapons) {
        const weapons = JSON.parse(selectedWeapons);

        if (Array.isArray(weapons)) {
          weapons.forEach((weapon: any) => {
            if (weapon && weapon.stats) {
              totalAtk += weapon.stats.atk || 0;
              totalHp += weapon.stats.hp || 0;
            }
          });
        } else if (weapons && typeof weapons === "object") {
          Object.values(weapons).forEach((weapon: any) => {
            if (weapon && weapon.stats) {
              totalAtk += weapon.stats.atk || 0;
              totalHp += weapon.stats.hp || 0;
            }
          });
        }
      }

      if (selectedSummons) {
        const summons = JSON.parse(selectedSummons);

        if (Array.isArray(summons)) {
          summons.forEach((summon: any) => {
            if (summon && summon.stats) {
              totalAtk += summon.stats.atk || 0;
              totalHp += summon.stats.hp || 0;
            }
          });
        } else if (summons && typeof summons === "object") {
          Object.values(summons).forEach((summon: any) => {
            if (summon && summon.stats) {
              totalAtk += summon.stats.atk || 0;
              totalHp += summon.stats.hp || 0;
            }
          });
        }
      }

      setWeaponGridStats({ totalAtk, totalHp });
    } catch (error) {
      console.error("Error loading weapon grid stats:", error);
      Alert.alert("Error", "Failed to load weapon grid data");
    } finally {
      setLoading(false);
    }
  };

  const updateCharacter = (
    id: number,
    field: keyof Character,
    value: string | "none" | "double" | "triple"
  ) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === id ? { ...char, [field]: value } : char))
    );
  };

  const calculateDamage = () => {
    const newResults: {
      [key: number]: {
        totalAtk: number;
        damage: number;
        boostedAtk: number;
        boostedHp: number;
      };
    } = {};

    characters.forEach((character) => {
      const characterBaseAtk = parseInt(character.atk) || 0;
      const characterBaseHp = parseInt(character.hp) || 0;

      let characterBoostedAtk = characterBaseAtk;
      let characterBoostedHp = characterBaseHp;

      if (statsByType) {
        let totalAtkBoost = 0;
        let totalHpBoost = 0;

        Object.values(statsByType.optimus).forEach((stats: any) => {
          totalAtkBoost += stats.atk || 0;
          totalHpBoost += stats.hp || 0;
        });
        Object.values(statsByType.omega).forEach((stats: any) => {
          totalAtkBoost += stats.atk || 0;
          totalHpBoost += stats.hp || 0;
        });
        Object.values(statsByType.conditional).forEach((stats: any) => {
          totalAtkBoost += stats.atk || 0;
          totalHpBoost += stats.hp || 0;
        });

        characterBoostedAtk = characterBaseAtk * (1 + totalAtkBoost / 100);
        characterBoostedHp = characterBaseHp * (1 + totalHpBoost / 100);
      }

      const totalAtk = characterBoostedAtk + weaponGridStats.totalAtk;

      let multiplier = 1;
      switch (character.attackType) {
        case "double":
          multiplier = 2;
          break;
        case "triple":
          multiplier = 3;
          break;
        default:
          multiplier = 1;
      }

      const damage = totalAtk * multiplier;

      newResults[character.id] = {
        totalAtk: Math.round(totalAtk),
        damage: Math.round(damage),
        boostedAtk: Math.round(characterBoostedAtk),
        boostedHp: Math.round(characterBoostedHp),
      };
    });

    setResults(newResults);
  };

  const resetCharacters = () => {
    setCharacters([
      { id: 1, name: "Character 1", hp: "", atk: "", attackType: "none" },
      { id: 2, name: "Character 2", hp: "", atk: "", attackType: "none" },
      { id: 3, name: "Character 3", hp: "", atk: "", attackType: "none" },
      { id: 4, name: "Character 4", hp: "", atk: "", attackType: "none" },
    ]);
    setResults({});
  };

  const refreshGridStats = () => {
    loadWeaponGridStats();
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
            <Text style={styles.loadingText}>Loading weapon grid data...</Text>
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
          <Text style={styles.title}>Grid Calculator</Text>
        </View>

        <View style={styles.mainContainer}>
          <ImageBackground
            source={require("../assets/images/bgsummons.png")}
            style={styles.contentBackground}
            resizeMode="cover"
          >
            <View style={styles.darkOverlay}>
              <ScrollView style={styles.scrollView}>
                {/* Weapon Grid Stats */}
                <View style={styles.gridStatsCard}>
                  <View style={styles.gridStatsHeader}>
                    <Text style={styles.sectionTitle}>Weapon Grid Stats</Text>
                    <TouchableOpacity
                      style={styles.refreshButton}
                      onPress={refreshGridStats}
                    >
                      <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Total ATK</Text>
                      <Text style={styles.statValue}>
                        {weaponGridStats.totalAtk.toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Total HP</Text>
                      <Text style={styles.statValue}>
                        {weaponGridStats.totalHp.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  {/* Grid Details */}
                  {(weapons.length > 0 || summons.length > 0) && (
                    <View style={styles.gridDetails}>
                      <Text style={styles.gridDetailsTitle}>
                        Grid Composition
                      </Text>
                      {weapons.length > 0 && (
                        <Text style={styles.gridDetailsText}>
                          Weapons: {weapons.length} selected
                        </Text>
                      )}
                      {summons.length > 0 && (
                        <Text style={styles.gridDetailsText}>
                          Summons: {summons.length} selected
                        </Text>
                      )}
                      {statsByType && (
                        <View style={styles.boostDetails}>
                          <Text style={styles.boostDetailsTitle}>
                            Active Boosts
                          </Text>
                          {Object.values(statsByType.optimus).some(
                            (stats: any) => stats.atk > 0 || stats.hp > 0
                          ) && (
                            <Text style={styles.boostDetailsText}>
                              • Optimus boosts active
                            </Text>
                          )}
                          {Object.values(statsByType.omega).some(
                            (stats: any) => stats.atk > 0 || stats.hp > 0
                          ) && (
                            <Text style={styles.boostDetailsText}>
                              • Omega boosts active
                            </Text>
                          )}
                          {Object.values(statsByType.conditional).some(
                            (stats: any) => stats.atk > 0 || stats.hp > 0
                          ) && (
                            <Text style={styles.boostDetailsText}>
                              • Conditional boosts active
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Characters */}
                <View style={styles.charactersSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Characters</Text>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={resetCharacters}
                    >
                      <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                  </View>

                  {characters.map((character) => (
                    <View key={character.id} style={styles.characterCard}>
                      <View style={styles.characterHeader}>
                        <Text style={styles.characterName}>
                          {character.name}
                        </Text>
                        {results[character.id] && (
                          <View style={styles.resultBadge}>
                            <Text style={styles.resultText}>
                              {results[character.id].damage.toLocaleString()}{" "}
                              DMG
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.characterInputs}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>ATK</Text>
                          <TextInput
                            style={styles.input}
                            value={character.atk}
                            onChangeText={(value) =>
                              updateCharacter(character.id, "atk", value)
                            }
                            placeholder="Enter ATK"
                            placeholderTextColor={UI_COLORS.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>HP</Text>
                          <TextInput
                            style={styles.input}
                            value={character.hp}
                            onChangeText={(value) =>
                              updateCharacter(character.id, "hp", value)
                            }
                            placeholder="Enter HP"
                            placeholderTextColor={UI_COLORS.textSecondary}
                            keyboardType="numeric"
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Attack Type</Text>
                          <View style={styles.attackTypeButtons}>
                            <TouchableOpacity
                              style={[
                                styles.attackTypeButton,
                                character.attackType === "none" &&
                                  styles.attackTypeButtonActive,
                              ]}
                              onPress={() =>
                                updateCharacter(
                                  character.id,
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
                                  character.id,
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
                                  character.id,
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

                      {results[character.id] && (
                        <View style={styles.calculationDetails}>
                          <Text style={styles.calculationText}>
                            Base ATK: {parseInt(character.atk) || 0} → Boosted
                            ATK:{" "}
                            {results[character.id].boostedAtk.toLocaleString()}
                          </Text>
                          <Text style={styles.calculationText}>
                            Base HP: {parseInt(character.hp) || 0} → Boosted HP:{" "}
                            {results[character.id].boostedHp.toLocaleString()}
                          </Text>
                          <Text style={styles.calculationText}>
                            Total ATK:{" "}
                            {results[character.id].boostedAtk.toLocaleString()}{" "}
                            + Grid ATK:{" "}
                            {weaponGridStats.totalAtk.toLocaleString()} ={" "}
                            {results[character.id].totalAtk.toLocaleString()}
                          </Text>
                          <Text style={styles.calculationText}>
                            Total Damage:{" "}
                            {results[character.id].totalAtk.toLocaleString()} ×{" "}
                            {character.attackType === "double"
                              ? "2"
                              : character.attackType === "triple"
                              ? "3"
                              : "1"}{" "}
                            = {results[character.id].damage.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {/* Calculate Button */}
                <TouchableOpacity
                  style={styles.calculateButton}
                  onPress={calculateDamage}
                >
                  <Text style={styles.calculateButtonText}>
                    Calculate Damage
                  </Text>
                </TouchableOpacity>

                {/* Total Results */}
                {Object.keys(results).length > 0 && (
                  <View style={styles.totalResultsCard}>
                    <Text style={styles.sectionTitle}>Total Team Damage</Text>
                    <Text style={styles.totalDamage}>
                      {Object.values(results)
                        .reduce((sum, result) => sum + result.damage, 0)
                        .toLocaleString()}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </ImageBackground>
        </View>
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
    shadowColor: "#000000",
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
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mainContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: BASE_COLORS.surface,
  },
  contentBackground: {
    flex: 1,
    borderRadius: 16,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 20,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gridStatsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  gridStatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  refreshButton: {
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: UI_COLORS.textWhite,
    fontSize: 12,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  charactersSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: UI_COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: UI_COLORS.textWhite,
    fontSize: 14,
    fontWeight: "bold",
  },
  characterCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  characterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  characterName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  resultBadge: {
    backgroundColor: UI_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultText: {
    color: UI_COLORS.textWhite,
    fontSize: 14,
    fontWeight: "bold",
  },
  characterInputs: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#303030",
  },
  attackTypeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  attackTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  attackTypeButtonActive: {
    backgroundColor: BASE_COLORS.blue,
    borderColor: BASE_COLORS.blue,
  },
  attackTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  attackTypeButtonTextActive: {
    color: "#FFFFFF",
  },
  calculationDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  calculationText: {
    fontSize: 12,
    color: "#CCCCCC",
    marginBottom: 4,
  },
  calculateButton: {
    backgroundColor: BASE_COLORS.blue,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  calculateButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalResultsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  totalDamage: {
    fontSize: 32,
    fontWeight: "bold",
    color: BASE_COLORS.blue,
  },
  gridDetails: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gridDetailsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  gridDetailsText: {
    fontSize: 12,
    color: "#CCCCCC",
    marginBottom: 4,
  },
  boostDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  boostDetailsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  boostDetailsText: {
    fontSize: 11,
    color: "#CCCCCC",
    marginBottom: 2,
  },
});

export default GridCalculatorScreen;
