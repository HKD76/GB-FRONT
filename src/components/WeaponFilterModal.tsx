import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import {
  BASE_COLORS,
  ELEMENT_COLORS,
  RARITY_COLORS,
  getElementColor,
  getRarityColor,
} from "../config/colors";

export interface WeaponFilters {
  elements: string[];
  rarities: string[];
}

interface WeaponFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: WeaponFilters) => void;
}

/**
 * Modal de filtrage des armes
 * Permet de sélectionner les éléments et raretés
 */
export const WeaponFilterModal: React.FC<WeaponFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);

  const elements = ["fire", "water", "wind", "earth", "light", "dark"];
  const rarities = ["N", "R", "SR", "SSR"];

  const toggleElement = (element: string) => {
    setSelectedElements((prev) => (prev.includes(element) ? [] : [element]));
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities((prev) => (prev.includes(rarity) ? [] : [rarity]));
  };

  const handleApply = () => {
    if (selectedElements.length === 0 && selectedRarities.length === 0) {
      Alert.alert(
        "Filtres requis",
        "Veuillez sélectionner au moins un élément ou une rareté."
      );
      return;
    }

    onApplyFilters({
      elements: selectedElements,
      rarities: selectedRarities,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedElements([]);
    setSelectedRarities([]);
  };

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
            <Text style={styles.modalTitle}>Filtres d'Armes</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Section Éléments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Éléments</Text>
              <View style={styles.optionsContainer}>
                {elements.map((element) => (
                  <TouchableOpacity
                    key={element}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedElements.includes(element)
                          ? getElementColor(element)
                          : "#3a3a3a",
                        borderColor: selectedElements.includes(element)
                          ? getElementColor(element)
                          : "#6b6b6b",
                      },
                    ]}
                    onPress={() => toggleElement(element)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selectedElements.includes(element)
                            ? "#ffffff"
                            : "#cccccc",
                        },
                      ]}
                    >
                      {element.charAt(0).toUpperCase() + element.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section Raretés */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Raretés</Text>
              <View style={styles.optionsContainer}>
                {rarities.map((rarity) => (
                  <TouchableOpacity
                    key={rarity}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedRarities.includes(rarity)
                          ? getRarityColor(rarity)
                          : "#3a3a3a",
                        borderColor: selectedRarities.includes(rarity)
                          ? getRarityColor(rarity)
                          : "#6b6b6b",
                      },
                    ]}
                    onPress={() => toggleRarity(rarity)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selectedRarities.includes(rarity)
                            ? "#ffffff"
                            : "#cccccc",
                        },
                      ]}
                    >
                      {rarity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Boutons d'action */}
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export interface SummonFilters {
  elements: string[];
  rarities: string[];
  specialAuras: string[];
}

interface SummonFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: SummonFilters) => void;
}

/**
 * Modal de filtrage des summons
 * Permet de sélectionner les éléments et raretés
 */
export const SummonFilterModal: React.FC<SummonFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
}) => {
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);

  const elements = ["fire", "water", "wind", "earth", "light", "dark"];
  const rarities = ["N", "R", "SR", "SSR"];

  const toggleElement = (element: string) => {
    setSelectedElements((prev) => (prev.includes(element) ? [] : [element]));
  };

  const toggleRarity = (rarity: string) => {
    setSelectedRarities((prev) => (prev.includes(rarity) ? [] : [rarity]));
  };

  const handleApply = () => {
    if (selectedElements.length === 0 && selectedRarities.length === 0) {
      Alert.alert(
        "Filtres requis",
        "Veuillez sélectionner au moins un élément ou une rareté."
      );
      return;
    }

    onApplyFilters({
      elements: selectedElements,
      rarities: selectedRarities,
      specialAuras: [],
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedElements([]);
    setSelectedRarities([]);
  };

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
            <Text style={styles.modalTitle}>Filtres de Summons</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Section Éléments */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Éléments</Text>
              <View style={styles.optionsContainer}>
                {elements.map((element) => (
                  <TouchableOpacity
                    key={element}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedElements.includes(element)
                          ? getElementColor(element)
                          : "#3a3a3a",
                        borderColor: selectedElements.includes(element)
                          ? getElementColor(element)
                          : "#6b6b6b",
                      },
                    ]}
                    onPress={() => toggleElement(element)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selectedElements.includes(element)
                            ? "#ffffff"
                            : "#cccccc",
                        },
                      ]}
                    >
                      {element.charAt(0).toUpperCase() + element.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Section Raretés */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Raretés</Text>
              <View style={styles.optionsContainer}>
                {rarities.map((rarity) => (
                  <TouchableOpacity
                    key={rarity}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedRarities.includes(rarity)
                          ? getRarityColor(rarity)
                          : "#3a3a3a",
                        borderColor: selectedRarities.includes(rarity)
                          ? getRarityColor(rarity)
                          : "#6b6b6b",
                      },
                    ]}
                    onPress={() => toggleRarity(rarity)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selectedRarities.includes(rarity)
                            ? "#ffffff"
                            : "#cccccc",
                        },
                      ]}
                    >
                      {rarity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Boutons d'action */}
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
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
    fontSize: 20,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
    borderWidth: 1,
  },
  optionText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  summarySection: {
    backgroundColor: "#3a3a3a",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    color: "#cccccc",
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#6b6b6b",
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#3a3a3a",
    borderWidth: 1,
    borderColor: "#6b6b6b",
  },
  resetButtonText: {
    color: "#cccccc",
    fontSize: 16,
    fontWeight: "bold",
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: BASE_COLORS.blue,
    borderWidth: 1,
    borderColor: "#0056b3",
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
