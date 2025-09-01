import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BASE_COLORS, UI_COLORS } from "../config/colors";
import { SkillModal } from "./SkillModal";
import { ELEMENT_COLORS } from "../config/colors";

interface BasicSkill {
  name?: string;
  text?: string;
  description?: string;
  // Support pour le format de l'API
  "s1 name"?: string;
  "s1 desc"?: string;
  "s2 name"?: string;
  "s2 desc"?: string;
  "s3 name"?: string;
  "s3 desc"?: string;
  [key: string]: any;
}

interface BasicSkillDisplayProps {
  skill: BasicSkill;
  skillIndex: number;
  weaponLevel?: number;
  customWidth?: number;
}

/**
 * Affichage basique des compétences
 * Affiche les informations de base d'une compétence
 */
export const BasicSkillDisplay: React.FC<BasicSkillDisplayProps> = ({
  skill,
  skillIndex,
  weaponLevel,
  customWidth,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const cleanHtmlText = (text: string) => {
    if (!text) return "";
    return (
      text
        // Nettoyer les entités HTML
        .replace(/&#039;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        // Supprimer les balises HTML
        .replace(/<[^>]*>/g, "")
        // Supprimer les liens wiki [[texte|texte]] ou [[texte]]
        .replace(/\[\[([^|\]]*?)(?:\|[^|\]]*?)?\]\]/g, "$1")
        // Supprimer les balises span avec tooltip
        .replace(/<span[^>]*class="[^"]*tooltip[^"]*"[^>]*>.*?<\/span>/g, "")
        // Nettoyer les espaces multiples
        .replace(/\s+/g, " ")
        .trim()
    );
  };

  const getSkillBackgroundColor = (skillName: string) => {
    if (!skillName) return ELEMENT_COLORS.default;

    const name = skillName.toLowerCase();

    // Skills Omega (aura de summon) - Couleurs plus vives
    if (name.includes("mistfall's")) return ELEMENT_COLORS.dark;
    if (name.includes("ironflame's")) return ELEMENT_COLORS.fire;
    if (name.includes("oceansoul's")) return ELEMENT_COLORS.water;
    if (name.includes("knightcode's")) return ELEMENT_COLORS.light;
    if (name.includes("stormwyrm's")) return ELEMENT_COLORS.wind;
    if (name.includes("lifetree's")) return ELEMENT_COLORS.earth;

    // Skills normaux - Couleurs plus douces
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

    // Default color
    return ELEMENT_COLORS.default;
  };

  const handleSkillPress = () => {
    setModalVisible(true);
  };

  // Support pour le format de l'API avec "s1 name" et "s1 desc"
  const skillNameKey = `s${skillIndex} name`;
  const skillDescKey = `s${skillIndex} desc`;

  const skillName =
    skill.name || skill.text || skill[skillNameKey] || `Skill ${skillIndex}`;
  const skillText =
    skill.text || skill.description || skill[skillDescKey] || skillName;
  const backgroundColor = getSkillBackgroundColor(cleanHtmlText(skillName));

  return (
    <>
      <TouchableOpacity
        style={[
          styles.skillButton,
          {
            backgroundColor,
            width: customWidth || undefined,
          },
        ]}
        onPress={handleSkillPress}
      >
        <Text style={styles.skillButtonText}>S{skillIndex}</Text>
      </TouchableOpacity>

      <SkillModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        skillName={cleanHtmlText(skillName)}
        skillDescription={cleanHtmlText(skillText)}
        weaponLevel={weaponLevel}
      />
    </>
  );
};

const styles = StyleSheet.create({
  skillButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 40,
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
    color: UI_COLORS.textWhite,
    fontSize: 12,
    fontWeight: "bold",
  },
});
