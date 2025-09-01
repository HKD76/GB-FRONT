import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { BASE_COLORS } from "../config/colors";

interface SkillModalProps {
  visible: boolean;
  onClose: () => void;
  skillName: string;
  skillDescription: string;
  weaponLevel?: number;
  skillDetails?: {
    element?: string;
    skillType?: string;
    modifier?: string;
    calculatedValues?: {
      [key: string]: {
        modifier: string;
        stat: string;
        values: {
          [key: string]: string;
        };
        skillLevel: number;
      };
    };
    skillLevel?: number;
  };
}

/**
 * Modal d'affichage des détails d'une compétence
 * Affiche les informations détaillées et les valeurs calculées
 */
export const SkillModal: React.FC<SkillModalProps> = ({
  visible,
  onClose,
  skillName,
  skillDescription,
  weaponLevel,
  skillDetails,
}) => {
  const getElementColor = (element: string) => {
    const colors: { [key: string]: string } = {
      fire: "#ff4444",
      water: "#4444ff",
      wind: "#44ff44",
      earth: "#8b4513",
      light: "#f5d222",
      dark: "#8b00ff",
    };
    return colors[element?.toLowerCase()] || BASE_COLORS.blue;
  };

  const getSkillTypeColor = (skillType: string) => {
    const colors: { [key: string]: string } = {
      attack: "#ff4444",
      support: "#44ff44",
      heal: "#44ffff",
      buff: "#f5d222",
      debuff: "#ff44ff",
    };
    return colors[skillType?.toLowerCase()] || BASE_COLORS.blue;
  };

  const renderColoredText = (text: string) => {
    const elementColors: { [key: string]: string } = {
      fire: "#ff4444",
      water: "#4444ff",
      wind: "#44ff44",
      earth: "#8b4513",
      light: "#f5d222",
      dark: "#8b00ff",
    };

    const statColors: { [key: string]: string } = {
      atk: "#ff6666",
      hp: "#66ff66",
      critical: "#ffaa44",
      "critical hit rate": "#ffaa44",
      "skill damage": "#44aaff",
      "charge attack": "#aa44ff",
      "double attack": "#ff44aa",
      "triple attack": "#44ffaa",
      def: "#aaaa44",
      "elemental atk": "#ff8844",
    };

    const allWords = { ...elementColors, ...statColors };
    const words = Object.keys(allWords);
    const parts = [];
    let lastIndex = 0;

    const regex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          text: text.slice(lastIndex, match.index),
          color: "#cccccc",
        });
      }

      const word = match[1].toLowerCase();
      const color = allWords[word] || "#cccccc";
      parts.push({
        text: match[1],
        color: color,
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        text: text.slice(lastIndex),
        color: "#cccccc",
      });
    }

    return parts;
  };

  const detectStatsInDescription = (description: string) => {
    const statMappings: Array<{ key: string; stat: string }> = [
      { key: "critical hit rate", stat: "Critical" },
      { key: "critical hit", stat: "Critical" },
      { key: "skill damage", stat: "Skill DMG Cap" },
      { key: "skill dmg", stat: "Skill DMG Cap" },
      { key: "charge attack", stat: "C.A. DMG" },
      { key: "double attack", stat: "DA Rate" },
      { key: "triple attack", stat: "TA Rate" },
      { key: "elemental atk", stat: "Elemental ATK" },
      { key: "elemental attack", stat: "Elemental ATK" },
      { key: "atk", stat: "ATK" },
      { key: "hp", stat: "HP" },
      { key: "critical", stat: "Critical" },
      { key: "def", stat: "DEF" },
      { key: "defense", stat: "DEF" },
    ];

    const detectedStats: string[] = [];
    const cleanDesc = description.toLowerCase();
    const usedPositions: number[] = [];

    statMappings.forEach(({ key, stat }) => {
      const index = cleanDesc.indexOf(key);
      if (index !== -1) {
        // Vérifier que cette position n'est pas déjà utilisée
        const isOverlapping = usedPositions.some(
          (pos) => Math.abs(pos - index) < key.length
        );

        if (!isOverlapping) {
          detectedStats.push(stat);
          usedPositions.push(index);
        }
      }
    });

    // Supprimer les doublons
    return [...new Set(detectedStats)];
  };

  // Détecter les stats dans la description
  const detectedStats = detectStatsInDescription(skillDescription);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {skillName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Description principale */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  {renderColoredText(skillDescription).map((part, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.descriptionText,
                        {
                          color: part.color,
                          fontWeight:
                            part.color !== "#cccccc" ? "bold" : "normal",
                        },
                      ]}
                    >
                      {part.text}
                    </Text>
                  ))}
                </Text>
              </View>
            </View>

            {/* Stats détectées dans la description */}
            {detectedStats.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stats détectées</Text>
                <View style={styles.statsContainer}>
                  {detectedStats.map((stat, index) => (
                    <View key={index} style={styles.statBadge}>
                      <Text style={styles.statBadgeText}>{stat}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Informations détaillées */}
            {skillDetails && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations</Text>

                {/* Élément et Type */}
                <View style={styles.infoRow}>
                  {skillDetails.element && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Élément</Text>
                      <View
                        style={[
                          styles.elementBadge,
                          {
                            backgroundColor: getElementColor(
                              skillDetails.element
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {skillDetails.element.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  )}

                  {skillDetails.skillType && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Type</Text>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: getSkillTypeColor(
                              skillDetails.skillType
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {skillDetails.skillType.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Modificateur */}
                {skillDetails.modifier && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Modificateur</Text>
                    <Text style={styles.modifierText}>
                      {skillDetails.modifier}
                    </Text>
                  </View>
                )}

                {/* Niveau de compétence */}
                {skillDetails.skillLevel && (
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Niveau</Text>
                    <Text style={styles.levelText}>
                      SL {skillDetails.skillLevel}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Valeurs calculées */}
            {skillDetails?.calculatedValues && (
              <View style={styles.section}>
                {(() => {
                  // Mapper le niveau de l'arme au niveau de skill dans le tableau
                  const getSkillLevelFromWeaponLevel = (
                    weaponLevel?: number
                  ) => {
                    if (!weaponLevel) return skillDetails.skillLevel || 1;

                    const levelMapping: { [key: number]: number } = {
                      1: 1,
                      100: 10,
                      150: 15,
                      200: 20,
                      250: 25,
                    };

                    return (
                      levelMapping[weaponLevel] || skillDetails.skillLevel || 1
                    );
                  };

                  const skillLevelToUse =
                    getSkillLevelFromWeaponLevel(weaponLevel);

                  return (
                    <>
                      <Text style={styles.sectionTitle}>
                        Valeurs calculées (SL {skillLevelToUse})
                        {weaponLevel && (
                          <Text style={styles.weaponLevelText}>
                            {" "}
                            - Niveau arme {weaponLevel}
                          </Text>
                        )}
                      </Text>
                      <View style={styles.valuesContainer}>
                        {Object.entries(skillDetails.calculatedValues).map(
                          ([type, data]: [string, any]) => {
                            // Nouvelle structure : data.stats est un tableau
                            if (data.stats && Array.isArray(data.stats)) {
                              return data.stats.map(
                                (stat: any, statIndex: number) => {
                                  const value =
                                    stat.values?.[skillLevelToUse] || "N/A";
                                  const statName = stat.stat || type;
                                  return (
                                    <View
                                      key={`${type}-${statIndex}`}
                                      style={styles.valueItem}
                                    >
                                      <View style={styles.valueHeader}>
                                        <Text style={styles.valueType}>
                                          {statName}
                                        </Text>
                                        {stat.modifier && (
                                          <View style={styles.modifierBadge}>
                                            <Text
                                              style={styles.modifierBadgeText}
                                            >
                                              {stat.modifier}
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                      <Text style={styles.valueText}>
                                        {value}
                                      </Text>
                                    </View>
                                  );
                                }
                              );
                            }

                            // Ancienne structure : data.values directement
                            const value =
                              data.values?.[skillLevelToUse] || "N/A";
                            const statName = data.stat || type;
                            return (
                              <View key={type} style={styles.valueItem}>
                                <View style={styles.valueHeader}>
                                  <Text style={styles.valueType}>
                                    {statName}
                                  </Text>
                                  {data.modifier && (
                                    <View style={styles.modifierBadge}>
                                      <Text style={styles.modifierBadgeText}>
                                        {data.modifier}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.valueText}>{value}</Text>
                              </View>
                            );
                          }
                        )}
                      </View>
                    </>
                  );
                })()}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#6b6b6b",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#3a3a3a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#ffffff",
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  descriptionContainer: {
    backgroundColor: "#3a3a3a",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  descriptionText: {
    color: "#cccccc",
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: "#cccccc",
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  elementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  modifierText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  levelText: {
    color: BASE_COLORS.blue,
    fontSize: 14,
    fontWeight: "bold",
  },
  valuesContainer: {
    backgroundColor: "#3a3a3a",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  valueItem: {
    flexDirection: "column",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#4a4a4a",
  },
  valueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  valueType: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  valueText: {
    color: "#cccccc",
    fontSize: 12,
    fontWeight: "500",
  },
  modifierBadge: {
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modifierBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBadge: {
    backgroundColor: "#3a3a3a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  statBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  weaponLevelText: {
    color: "#cccccc",
    fontSize: 12,
    fontWeight: "normal",
  },
});
