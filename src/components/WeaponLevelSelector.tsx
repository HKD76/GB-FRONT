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

interface WeaponLevelSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectLevel: (level: number) => void;
  weapon: any;
}

/**
 * Sélecteur de niveau pour les armes
 * Permet de choisir le niveau de l'arme
 */
export const WeaponLevelSelector: React.FC<WeaponLevelSelectorProps> = ({
  visible,
  onClose,
  onSelectLevel,
  weapon,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const levels = [1, 100, 150, 200, 250];

  const getLevelStats = (level: number) => {
    if (!weapon) return { atk: 0, hp: 0 };

    const levelIndex = levels.indexOf(level) + 1;
    const atk = weapon[`atk${levelIndex}`] || 0;
    const hp = weapon[`hp${levelIndex}`] || 0;

    return { atk, hp };
  };

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level);
  };

  const handleConfirm = () => {
    if (selectedLevel !== null) {
      onSelectLevel(selectedLevel);
      onClose();
      setSelectedLevel(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedLevel(null);
  };

  if (!weapon) {
    return null;
  }

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
            <Text style={styles.weaponName}>
              {weapon?.name || weapon?.title || "Arme"}
            </Text>

            <View style={styles.levelsContainer}>
              {levels.map((level) => {
                const stats = getLevelStats(level);
                const hasStats = stats.atk > 0 || stats.hp > 0;

                if (!hasStats) return null;

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
                selectedLevel === null && styles.disabledButton,
              ]}
              disabled={selectedLevel === null}
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
  weaponName: {
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
