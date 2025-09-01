import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BASE_COLORS, UI_COLORS } from "../config/colors";
import { SkillModal } from "./SkillModal";
import { ELEMENT_COLORS } from "../config/colors";

interface EnrichedSkill {
  originalName: string;
  originalText: string;
  parsed?: {
    element: string;
    skillType: string;
  };
  skillStats?: {
    name: string;
    description: string;
    notes: string[];
  };
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
  error?: string;
}

interface EnrichedSkillDisplayProps {
  skill: EnrichedSkill;
  skillIndex: number;
  weaponLevel?: number;
  customWidth?: number;
}

/**
 * Affichage enrichi des compétences
 * Affiche les informations détaillées et calculées d'une compétence
 */
export const EnrichedSkillDisplay: React.FC<EnrichedSkillDisplayProps> = ({
  skill,
  skillIndex,
  weaponLevel,
  customWidth,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const cleanHtmlText = (text: string) => {
    return text
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/<[^>]*>/g, "")
      .replace(/\[\[([^|\]]*?)(?:\|[^|\]]*?)?\]\]/g, "$1")
      .replace(/<span[^>]*class="[^"]*tooltip[^"]*"[^>]*>.*?<\/span>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const getSkillBackgroundColor = (skillName: string) => {
    const name = skillName.toLowerCase();

    if (name.includes("mistfall's")) return ELEMENT_COLORS.dark;
    if (name.includes("ironflame's")) return ELEMENT_COLORS.fire;
    if (name.includes("oceansoul's")) return ELEMENT_COLORS.water;
    if (name.includes("knightcode's")) return ELEMENT_COLORS.light;
    if (name.includes("stormwyrm's")) return ELEMENT_COLORS.wind;
    if (name.includes("lifetree's")) return ELEMENT_COLORS.earth;

    if (
      name.includes("fire's") ||
      name.includes("hellfire's") ||
      name.includes("inferno's")
    ) {
      return ELEMENT_COLORS.fire;
    }

    if (
      name.includes("dark's") ||
      name.includes("hatred's") ||
      name.includes("oblivion's")
    ) {
      return ELEMENT_COLORS.dark;
    }

    if (
      name.includes("earth's") ||
      name.includes("mountain's") ||
      name.includes("terra's")
    ) {
      return ELEMENT_COLORS.earth;
    }

    if (
      name.includes("water's") ||
      name.includes("tsunami's") ||
      name.includes("hoarfrost's")
    ) {
      return ELEMENT_COLORS.water;
    }

    if (
      name.includes("wind's") ||
      name.includes("whirlwind's") ||
      name.includes("ventosus's")
    ) {
      return ELEMENT_COLORS.wind;
    }

    if (
      name.includes("light's") ||
      name.includes("thunder's") ||
      name.includes("zion's")
    ) {
      return ELEMENT_COLORS.light;
    }

    return ELEMENT_COLORS.default;
  };

  const handleSkillPress = () => {
    setModalVisible(true);
  };

  const skillDetails = skill.error
    ? undefined
    : {
        element: skill.parsed?.element,
        skillType: skill.parsed?.skillType,
        modifier: skill.modifier,
        calculatedValues: skill.calculatedValues,
        skillLevel: skill.skillLevel,
      };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.skillButton,
          {
            backgroundColor: skill.error
              ? BASE_COLORS.gray
              : getSkillBackgroundColor(cleanHtmlText(skill.originalName)),
            width: customWidth || "45%",
          },
        ]}
        onPress={handleSkillPress}
      >
        <Text style={styles.skillButtonText}>S{skillIndex}</Text>
      </TouchableOpacity>

      <SkillModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        skillName={cleanHtmlText(skill.originalName)}
        skillDescription={cleanHtmlText(skill.originalText)}
        weaponLevel={weaponLevel}
        skillDetails={skillDetails}
      />
    </>
  );
};

const styles = StyleSheet.create({
  skillButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  skillButtonText: {
    color: "#FFFFFF", // Texte blanc pour une meilleure visibilité
    fontSize: 14,
    fontWeight: "bold",
  },
});
