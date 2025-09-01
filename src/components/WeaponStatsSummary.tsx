import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { WeaponStatsCalculator } from "../utils/weaponStatsCalculator";

interface WeaponStatsSummaryProps {
  weapons: any[];
  summons?: any[];
  summonIndices?: { [key: number]: any };
  characters?: {
    [key: number]: {
      name: string;
      baseAtk: string;
      baseHp: string;
      attackType: "none" | "double" | "triple";
    };
  };
}

/**
 * Résumé des statistiques des armes
 * Affiche les stats totales par type et élément
 */
export const WeaponStatsSummary: React.FC<WeaponStatsSummaryProps> = ({
  weapons,
  summons = [],
  summonIndices = {},
  characters = {},
}) => {
  const statsByType = WeaponStatsCalculator.calculateTotalStats(
    weapons,
    summons,
    summonIndices
  ).statsByType;

  // Formater les stats par élément pour chaque type
  const optimusStatsByElement = {
    dark: WeaponStatsCalculator.formatStats(statsByType.optimus.dark),
    fire: WeaponStatsCalculator.formatStats(statsByType.optimus.fire),
    water: WeaponStatsCalculator.formatStats(statsByType.optimus.water),
    light: WeaponStatsCalculator.formatStats(statsByType.optimus.light),
    wind: WeaponStatsCalculator.formatStats(statsByType.optimus.wind),
    earth: WeaponStatsCalculator.formatStats(statsByType.optimus.earth),
  };

  const omegaStatsByElement = {
    dark: WeaponStatsCalculator.formatStats(statsByType.omega.dark),
    fire: WeaponStatsCalculator.formatStats(statsByType.omega.fire),
    water: WeaponStatsCalculator.formatStats(statsByType.omega.water),
    light: WeaponStatsCalculator.formatStats(statsByType.omega.light),
    wind: WeaponStatsCalculator.formatStats(statsByType.omega.wind),
    earth: WeaponStatsCalculator.formatStats(statsByType.omega.earth),
  };

  const conditionalStatsByElement = {
    dark: WeaponStatsCalculator.formatStats(statsByType.conditional.dark),
    fire: WeaponStatsCalculator.formatStats(statsByType.conditional.fire),
    water: WeaponStatsCalculator.formatStats(statsByType.conditional.water),
    light: WeaponStatsCalculator.formatStats(statsByType.conditional.light),
    wind: WeaponStatsCalculator.formatStats(statsByType.conditional.wind),
    earth: WeaponStatsCalculator.formatStats(statsByType.conditional.earth),
  };

  const selectedWeaponsCount = weapons.filter(
    (weapon) => weapon !== null
  ).length;

  if (selectedWeaponsCount === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Statistics Summary</Text>
        </View>
        <ImageBackground
          source={require("../assets/images/bgsummons.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.darkOverlay}>
            <Text style={styles.emptyText}>No weapon selected</Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Statistics Summary</Text>
        <Text style={styles.subtitle}>
          {selectedWeaponsCount} weapon{selectedWeaponsCount > 1 ? "s" : ""}{" "}
          selected
        </Text>
      </View>
      <ImageBackground
        source={require("../assets/images/bgsummons.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.darkOverlay}>
          {Object.values(optimusStatsByElement).some(
            (stats) => stats.length > 0
          ) ||
          Object.values(omegaStatsByElement).some(
            (stats) => stats.length > 0
          ) ||
          Object.values(conditionalStatsByElement).some(
            (stats) => stats.length > 0
          ) ? (
            <View style={styles.statsContainer}>
              {/* Stats Optimus par élément */}
              {Object.values(optimusStatsByElement).some(
                (stats) => stats.length > 0
              ) && (
                <View style={styles.statsSection}>
                  <Text style={styles.sectionTitle}>Optimus</Text>
                  {Object.entries(optimusStatsByElement).map(
                    ([element, stats]) =>
                      stats.length > 0 ? (
                        <View
                          key={`optimus-${element}`}
                          style={styles.elementSection}
                        >
                          <Text style={styles.elementTitle}>
                            {element.toUpperCase()}
                          </Text>
                          <View style={styles.statsRow}>
                            {stats.map((stat, index) => (
                              <View
                                key={`optimus-${element}-${index}`}
                                style={styles.statItem}
                              >
                                <View
                                  style={[
                                    styles.statBadge,
                                    { backgroundColor: stat.color },
                                  ]}
                                >
                                  <Text style={styles.statLabel}>
                                    {stat.label}
                                  </Text>
                                </View>
                                <Text style={styles.statValue}>
                                  {stat.value}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null
                  )}
                </View>
              )}

              {/* Stats Omega par élément */}
              {Object.values(omegaStatsByElement).some(
                (stats) => stats.length > 0
              ) && (
                <View style={styles.statsSection}>
                  <Text style={styles.sectionTitle}>Omega</Text>
                  {Object.entries(omegaStatsByElement).map(([element, stats]) =>
                    stats.length > 0 ? (
                      <View
                        key={`omega-${element}`}
                        style={styles.elementSection}
                      >
                        <Text style={styles.elementTitle}>
                          {element.toUpperCase()}
                        </Text>
                        <View style={styles.statsRow}>
                          {stats.map((stat, index) => (
                            <View
                              key={`omega-${element}-${index}`}
                              style={styles.statItem}
                            >
                              <View
                                style={[
                                  styles.statBadge,
                                  { backgroundColor: stat.color },
                                ]}
                              >
                                <Text style={styles.statLabel}>
                                  {stat.label}
                                </Text>
                              </View>
                              <Text style={styles.statValue}>{stat.value}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null
                  )}
                </View>
              )}

              {/* Stats Conditionnelles par élément */}
              {Object.values(conditionalStatsByElement).some(
                (stats) => stats.length > 0
              ) && (
                <View style={styles.statsSection}>
                  <Text style={styles.sectionTitle}>
                    Conditional (HP Scaling)
                  </Text>
                  {Object.entries(conditionalStatsByElement).map(
                    ([element, stats]) =>
                      stats.length > 0 ? (
                        <View
                          key={`conditional-${element}`}
                          style={styles.elementSection}
                        >
                          <Text style={styles.elementTitle}>
                            {element.toUpperCase()}
                          </Text>
                          <View style={styles.statsRow}>
                            {stats.map((stat, index) => (
                              <View
                                key={`conditional-${element}-${index}`}
                                style={styles.statItem}
                              >
                                <View
                                  style={[
                                    styles.statBadge,
                                    { backgroundColor: stat.color },
                                  ]}
                                >
                                  <Text style={styles.statLabel}>
                                    {stat.label}
                                  </Text>
                                </View>
                                <Text style={styles.statValue}>
                                  {stat.value}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      ) : null
                  )}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noStatsText}>No stat bonus detected</Text>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5FAF8",
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#F5FAF8",
  },
  titleSection: {
    backgroundColor: "#F5FAF8",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(73, 85, 86, 0.2)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#303030",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 4,
  },
  backgroundImage: {
    flex: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
  },
  content: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
  },
  statsContainer: {
    gap: 16,
  },
  statsSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  elementSection: {
    marginBottom: 12,
  },
  elementTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#CCCCCC",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5FAF8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  statBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
  },
  statLabel: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#303030",
  },
  emptyText: {
    fontSize: 14,
    color: "#CCCCCC",
    fontStyle: "italic",
    textAlign: "center",
  },
  noStatsText: {
    fontSize: 14,
    color: "#CCCCCC",
    fontStyle: "italic",
    textAlign: "center",
  },
});
