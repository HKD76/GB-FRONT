import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { BASE_COLORS, UI_COLORS } from "../config/colors";
import { STAT_COLORS } from "../config/colors";

interface TotalStatsDisplayProps {
  weapons: any[];
  summons: { [key: number]: any };
}

/**
 * Affichage des statistiques totales
 * Calcule et affiche les totaux ATK/HP des armes et summons
 */
export const TotalStatsDisplay: React.FC<TotalStatsDisplayProps> = ({
  weapons,
  summons,
}) => {
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

  if (totalAtk === 0 && totalHp === 0) {
    return null;
  }

  return (
    <ImageBackground
      source={require("../assets/images/bgweapon.png")}
      style={styles.backgroundImage}
      imageStyle={styles.backgroundImageStyle}
    >
      <View style={styles.container}>
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
      </View>
    </ImageBackground>
  );
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
});
