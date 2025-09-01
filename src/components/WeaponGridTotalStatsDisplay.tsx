import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { BASE_COLORS, UI_COLORS } from "../config/colors";
import { STAT_COLORS } from "../config/colors";
import { WeaponStatsCalculator } from "../utils/weaponStatsCalculator";

interface WeaponGridTotalStatsDisplayProps {
  weapons: any[];
  summons: { [key: number]: any };
}

/**
 * Affichage des statistiques totales de la grille d'armes
 * Calcule et affiche les totaux ATK/HP et pourcentages par élément
 */
export const WeaponGridTotalStatsDisplay: React.FC<
  WeaponGridTotalStatsDisplayProps
> = ({ weapons, summons }) => {
  let totalAtk = 0;
  let totalHp = 0;

  weapons.forEach((weapon) => {
    if (weapon && weapon.selectedLevel) {
      const levelIndex =
        [1, 100, 150, 200, 250].indexOf(weapon.selectedLevel) + 1;
      const weaponAtk = weapon[`atk${levelIndex}`] || 0;
      const weaponHp = weapon[`hp${levelIndex}`] || 0;
      totalAtk += weaponAtk;
      totalHp += weaponHp;
    }
  });

  const mainSummon = summons[1];
  const allySummon = summons[6];

  [mainSummon, allySummon].forEach((summon) => {
    if (summon && summon.selectedLevel) {
      const levelIndex =
        [1, 100, 150, 200, 250].indexOf(summon.selectedLevel) + 1;
      const summonAtk = summon[`atk${levelIndex}`] || 0;
      const summonHp = summon[`hp${levelIndex}`] || 0;
      totalAtk += summonAtk;
      totalHp += summonHp;
    }
  });

  const calculatedStats = WeaponStatsCalculator.calculateTotalStats(
    weapons,
    Object.values(summons),
    summons
  );

  const getTotalPercentages = () => {
    const percentages: { [key: string]: { atk: number; hp: number } } = {};

    const elements = ["dark", "fire", "water", "light", "wind", "earth"];

    elements.forEach((element) => {
      let totalAtkPercent = 0;
      let totalHpPercent = 0;

      if (
        calculatedStats.statsByType.optimus[
          element as keyof typeof calculatedStats.statsByType.optimus
        ]
      ) {
        totalAtkPercent +=
          calculatedStats.statsByType.optimus[
            element as keyof typeof calculatedStats.statsByType.optimus
          ].atk;
        totalHpPercent +=
          calculatedStats.statsByType.optimus[
            element as keyof typeof calculatedStats.statsByType.optimus
          ].hp;
      }

      if (
        calculatedStats.statsByType.omega[
          element as keyof typeof calculatedStats.statsByType.omega
        ]
      ) {
        totalAtkPercent +=
          calculatedStats.statsByType.omega[
            element as keyof typeof calculatedStats.statsByType.omega
          ].atk;
        totalHpPercent +=
          calculatedStats.statsByType.omega[
            element as keyof typeof calculatedStats.statsByType.omega
          ].hp;
      }

      if (
        calculatedStats.statsByType.conditional[
          element as keyof typeof calculatedStats.statsByType.conditional
        ]
      ) {
        totalAtkPercent +=
          calculatedStats.statsByType.conditional[
            element as keyof typeof calculatedStats.statsByType.conditional
          ].atk;
        totalHpPercent +=
          calculatedStats.statsByType.conditional[
            element as keyof typeof calculatedStats.statsByType.conditional
          ].hp;
      }

      if (totalAtkPercent > 0 || totalHpPercent > 0) {
        percentages[element] = {
          atk: totalAtkPercent,
          hp: totalHpPercent,
        };
      }
    });

    return percentages;
  };

  const totalPercentages = getTotalPercentages();

  if (
    totalAtk === 0 &&
    totalHp === 0 &&
    Object.keys(totalPercentages).length === 0
  ) {
    return null;
  }

  return (
    <ImageBackground
      source={require("../assets/images/bgweapon.png")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <View style={styles.container}>
        {/* Section des totaux ATK/HP */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TOTAL ATK :</Text>
            <Text style={[styles.statValue, { color: STAT_COLORS.atk }]}>
              {totalAtk.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TOTAL HP :</Text>
            <Text style={[styles.statValue, { color: STAT_COLORS.hp }]}>
              {totalHp.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Section des pourcentages par élément */}
        {Object.keys(totalPercentages).length > 0 && (
          <View style={styles.percentagesSection}>
            <Text style={styles.percentagesTitle}>BONUS PAR ÉLÉMENT :</Text>
            <View style={styles.percentagesGrid}>
              {Object.entries(totalPercentages).map(([element, stats]) => (
                <View key={element} style={styles.elementStats}>
                  <Text
                    style={[
                      styles.elementLabel,
                      { color: getElementColor(element) },
                    ]}
                  >
                    {element.toUpperCase()}
                  </Text>
                  <View style={styles.elementValues}>
                    {stats.atk > 0 && (
                      <View style={styles.elementStatItem}>
                        <Text style={styles.elementStatLabel}>BONUS ATK :</Text>
                        <Text
                          style={[
                            styles.elementStatValue,
                            { color: STAT_COLORS.atk },
                          ]}
                        >
                          {Math.round(
                            totalAtk * (stats.atk / 100)
                          ).toLocaleString()}
                        </Text>
                      </View>
                    )}
                    {stats.hp > 0 && (
                      <View style={styles.elementStatItem}>
                        <Text style={styles.elementStatLabel}>BONUS HP :</Text>
                        <Text
                          style={[
                            styles.elementStatValue,
                            { color: STAT_COLORS.hp },
                          ]}
                        >
                          {Math.round(
                            totalHp * (stats.hp / 100)
                          ).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

// Fonction helper pour obtenir la couleur de l'élément
const getElementColor = (element: string): string => {
  const elementColors: { [key: string]: string } = {
    fire: "#ff6b35",
    water: "#4fc3f7",
    earth: "#8bc34a",
    wind: "#4caf50",
    light: "#ffeb3b",
    dark: "#9c27b0",
  };
  return elementColors[element] || "#ffffff";
};

const styles = StyleSheet.create({
  backgroundImage: {},
  backgroundImageStyle: {
    borderRadius: 12,
  },
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
    borderStyle: "solid",
  },
  statsRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  statItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  percentagesSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    paddingTop: 10,
  },
  percentagesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  percentagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 8,
  },
  elementStats: {
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#ffffff",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 6,
    minWidth: 80,
  },
  elementLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  elementValues: {
    alignItems: "center",
  },
  elementStatItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  elementStatLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  elementStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
