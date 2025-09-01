import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BASE_COLORS } from "../config/colors";

interface SummonLevelSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectLevel: (level: number, specialAura?: string) => void;
  summon: any;
}

/**
 * Sélecteur de niveau pour les summons
 * Permet de choisir le niveau et les auras spéciales
 */
export const SummonLevelSelector: React.FC<SummonLevelSelectorProps> = ({
  visible,
  onClose,
  onSelectLevel,
  summon,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedSpecialAura, setSelectedSpecialAura] = useState<string | null>(
    null
  );

  const levels = [1, 100, 150, 200, 250];

  const getLevelStats = (level: number) => {
    if (!summon) return { atk: 0, hp: 0, aura: "" };

    const levelIndex = levels.indexOf(level) + 1;
    const atk = summon[`atk${levelIndex}`] || 0;
    const hp = summon[`hp${levelIndex}`] || 0;
    let aura = summon[`aura${levelIndex}`] || "";

    // Pour le niveau 250, utiliser l'aura spéciale sélectionnée
    if (level === 250 && selectedSpecialAura) {
      aura = summon[selectedSpecialAura] || "";
    }

    const cleanedAura = aura ? cleanAuraText(aura as string) : "";

    return { atk, hp, aura: cleanedAura };
  };

  const shouldShowLevel250 = () => {
    if (!summon) return false;

    // Vérifier s'il y a des stats au niveau 250 OU des auras spéciales
    const hasStats250 =
      (summon.atk5 && summon.atk5 > 0) || (summon.hp5 && summon.hp5 > 0);
    const hasAuraT1 = summon.aura_t1 && summon.aura_t1.trim() !== "";
    const hasAuraT2 = summon.aura_t2 && summon.aura_t2.trim() !== "";
    const hasAuraT3 = summon.aura_t3 && summon.aura_t3.trim() !== "";
    const hasAuraT4 = summon.aura_t4 && summon.aura_t4.trim() !== "";
    const hasAuraT5 = summon.aura_t5 && summon.aura_t5.trim() !== "";

    // Afficher le niveau 250 s'il y a des stats OU des auras spéciales
    return (
      hasStats250 ||
      !!(hasAuraT1 || hasAuraT2 || hasAuraT3 || hasAuraT4 || hasAuraT5)
    );
  };

  const cleanAuraText = (text: string) => {
    if (!text) return "";

    return text
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/\[\[([^|]+)\|([^\]]+)\]\]/g, "$2")
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      .replace(/'''/g, "")
      .replace(/''/g, "")
      .replace(/\n\s*\n/g, "\n")
      .trim();
  };

  const getSpecialAuras = () => {
    if (!summon) return [];

    const specialAuras = [];

    // Utiliser les clés avec underscores comme dans les données de l'API
    const auraT1 = summon.aura_t1;
    const auraT2 = summon.aura_t2;
    const auraT3 = summon.aura_t3;
    const auraT4 = summon.aura_t4;
    const auraT5 = summon.aura_t5;
    const aura5 = summon.aura5;

    // Ajouter l'aura normale du niveau 250 si elle existe
    if (aura5 && aura5.trim() !== "") {
      specialAuras.push({
        key: "aura5",
        label: "Aura 250",
        value: cleanAuraText(aura5),
      });
    }

    // Ajouter les auras spéciales si elles existent
    if (auraT1 && auraT1.trim() !== "") {
      specialAuras.push({
        key: "aura_t1",
        label: "Aura T1 (Lvl 210)",
        value: cleanAuraText(auraT1),
      });
    }
    if (auraT2 && auraT2.trim() !== "") {
      specialAuras.push({
        key: "aura_t2",
        label: "Aura T2 (Lvl 220)",
        value: cleanAuraText(auraT2),
      });
    }
    if (auraT3 && auraT3.trim() !== "") {
      specialAuras.push({
        key: "aura_t3",
        label: "Aura T3 (Lvl 230)",
        value: cleanAuraText(auraT3),
      });
    }
    if (auraT4 && auraT4.trim() !== "") {
      specialAuras.push({
        key: "aura_t4",
        label: "Aura T4 (Lvl 240)",
        value: cleanAuraText(auraT4),
      });
    }
    if (auraT5 && auraT5.trim() !== "") {
      specialAuras.push({
        key: "aura_t5",
        label: "Aura T5 (Lvl 250)",
        value: cleanAuraText(auraT5),
      });
    }

    return specialAuras;
  };

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
    setSelectedSpecialAura(null);
  };

  const handleSpecialAuraSelect = (auraKey: string) => {
    setSelectedSpecialAura(auraKey);
  };

  const handleConfirm = () => {
    if (selectedLevel !== null) {
      onSelectLevel(selectedLevel, selectedSpecialAura || undefined);
      onClose();
      setSelectedLevel(null);
      setSelectedSpecialAura(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedLevel(null);
    setSelectedSpecialAura(null);
  };

  if (!summon) {
    return null;
  }

  const specialAuras = getSpecialAuras();

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
            <Text style={styles.modalTitle}>Choisir le niveau</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.summonName}>{summon?.name || "Summon"}</Text>

            <View style={styles.levelsContainer}>
              {levels.map((level) => {
                const stats = getLevelStats(level);
                const hasStats = stats.atk > 0 || stats.hp > 0;

                if (level === 250 && !shouldShowLevel250()) return null;
                if (!hasStats) return null;

                const isLevel250 = level === 250;
                const hasSpecialAuras = isLevel250 && specialAuras.length > 0;

                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelItem,
                      selectedLevel === level && styles.selectedLevelItem,
                    ]}
                    onPress={() => handleLevelSelect(level)}
                  >
                    <Text style={styles.levelTitle}>Niveau {level}</Text>
                    <View style={styles.statsRow}>
                      {stats.atk > 0 && (
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>ATK</Text>
                          <Text style={styles.statValue}>{stats.atk}</Text>
                        </View>
                      )}
                      {stats.hp > 0 && (
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>HP</Text>
                          <Text style={styles.statValue}>{stats.hp}</Text>
                        </View>
                      )}
                    </View>

                    {/* Choix d'aura spéciale pour le niveau 250 */}
                    {isLevel250 && specialAuras.length > 0 ? (
                      <View style={styles.specialAuraContainer}>
                        <Text style={styles.auraLabel}>Choisir une Aura:</Text>
                        <View style={styles.specialAuraOptions}>
                          {specialAuras.map((aura) => (
                            <TouchableOpacity
                              key={aura.key}
                              style={[
                                styles.specialAuraOption,
                                selectedSpecialAura === aura.key &&
                                  styles.selectedSpecialAuraOption,
                              ]}
                              onPress={() => handleSpecialAuraSelect(aura.key)}
                            >
                              <Text style={styles.specialAuraLabel}>
                                {aura.label}
                              </Text>
                              <Text style={styles.specialAuraText}>
                                {aura.value}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                        {selectedSpecialAura ? (
                          <View style={styles.selectedAuraContainer}>
                            <Text style={styles.selectedAuraLabel}>
                              Aura sélectionnée:
                            </Text>
                            <Text style={styles.selectedAuraText}>
                              {cleanAuraText(summon[selectedSpecialAura])}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.noAuraSelectedContainer}>
                            <Text style={styles.noAuraSelectedText}>
                              Veuillez sélectionner une aura ci-dessus
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      stats.aura && (
                        <View style={styles.auraContainer}>
                          <Text style={styles.auraLabel}>Aura:</Text>
                          <Text style={styles.auraText}>{stats.aura}</Text>
                        </View>
                      )
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.confirmButton,
                (selectedLevel === null ||
                  (selectedLevel === 250 &&
                    specialAuras.length > 0 &&
                    selectedSpecialAura === null)) &&
                  styles.disabledButton,
              ]}
              disabled={
                selectedLevel === null ||
                (selectedLevel === 250 &&
                  specialAuras.length > 0 &&
                  selectedSpecialAura === null)
              }
            >
              <Text style={styles.confirmButtonText}>Confirmer</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#6b6b6b",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
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
  summonName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
  },
  levelsContainer: {
    gap: 12,
  },
  levelItem: {
    backgroundColor: "#3a3a3a",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  selectedLevelItem: {
    borderColor: BASE_COLORS.blue,
    backgroundColor: "#1a3a5a",
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    color: "#cccccc",
    fontSize: 12,
    fontWeight: "500",
  },
  statValue: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  auraContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#6b6b6b",
  },
  auraLabel: {
    color: "#cccccc",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  auraText: {
    color: "#ffffff",
    fontSize: 11,
    fontStyle: "italic",
  },
  specialAuraContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#6b6b6b",
  },
  specialAuraOptions: {
    gap: 8,
  },
  specialAuraOption: {
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  selectedSpecialAuraOption: {
    borderColor: BASE_COLORS.blue,
    backgroundColor: "#1a3a5a",
  },
  specialAuraLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
  },
  specialAuraText: {
    color: "#cccccc",
    fontSize: 10,
    fontStyle: "italic",
  },
  selectedAuraContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BASE_COLORS.blue,
    backgroundColor: "#1a3a5a",
    borderRadius: 6,
    padding: 8,
  },
  selectedAuraLabel: {
    color: BASE_COLORS.blue,
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  selectedAuraText: {
    color: "#ffffff",
    fontSize: 11,
    fontStyle: "italic",
  },
  noAuraSelectedContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ff6b6b",
    backgroundColor: "#3a1a1a",
    borderRadius: 6,
    padding: 8,
  },
  noAuraSelectedText: {
    color: "#ff6b6b",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#6b6b6b",
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3a3a3a",
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  cancelButtonText: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: BASE_COLORS.blue,
    borderWidth: 1,
    borderColor: "#0056b3",
  },
  disabledButton: {
    backgroundColor: "#3a3a3a",
    borderColor: "#6b6b6b",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
