interface WeaponStats {
  atk: number;
  hp: number;
  crit: number;
  skillDamage: number;
  chargeAttack: number;
  [key: string]: number;
}

interface WeaponStatsByType {
  optimus: {
    dark: WeaponStats;
    fire: WeaponStats;
    water: WeaponStats;
    light: WeaponStats;
    wind: WeaponStats;
    earth: WeaponStats;
  };
  omega: {
    dark: WeaponStats;
    fire: WeaponStats;
    water: WeaponStats;
    light: WeaponStats;
    wind: WeaponStats;
    earth: WeaponStats;
  };
  conditional: {
    dark: WeaponStats;
    fire: WeaponStats;
    water: WeaponStats;
    light: WeaponStats;
    wind: WeaponStats;
    earth: WeaponStats;
  };
}

import { logger } from "./logger";

interface SkillStats {
  type: string;
  value: number;
  target: string;
  skillType: "optimus" | "omega";
  element: string;
  condition?: string;
  isConditional?: boolean;
}

export class WeaponStatsCalculator {
  private static parseSkillText(
    text: string,
    skillName: string = ""
  ): SkillStats[] {
    const stats: SkillStats[] = [];

    if (!text) return stats;

    const cleanText = text.toLowerCase();
    const cleanSkillName = skillName.toLowerCase();

    // Déterminer le type de skill et l'élément
    const skillInfo = this.getSkillTypeAndElement(cleanSkillName);

    // Patterns pour détecter les bonus de stats
    const patterns = [
      // ATK patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*atk/i,
        type: "atk",
        multiplier: 1,
      },
      { regex: /atk\s*(\d+(?:\.\d+)?)%?/i, type: "atk", multiplier: 1 },
      {
        regex: /big\s+boost\s+to\s+(?:.*?)\s+atk/i,
        type: "atk",
        multiplier: 15,
      }, // Big boost = ~15%
      {
        regex: /medium\s+boost\s+to\s+(?:.*?)\s+atk/i,
        type: "atk",
        multiplier: 8,
      }, // Medium boost = ~8%
      {
        regex: /small\s+boost\s+to\s+(?:.*?)\s+atk/i,
        type: "atk",
        multiplier: 3,
      }, // Small boost = ~3%

      // HP patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*hp/i,
        type: "hp",
        multiplier: 1,
      },
      { regex: /hp\s*(\d+(?:\.\d+)?)%?/i, type: "hp", multiplier: 1 },
      {
        regex: /big\s+boost\s+to\s+(?:.*?)\s+max\s+hp/i,
        type: "hp",
        multiplier: 15,
      },
      {
        regex: /big\s+boost\s+to\s+(?:.*?)\s+hp/i,
        type: "hp",
        multiplier: 15,
      },
      {
        regex: /medium\s+boost\s+to\s+(?:.*?)\s+max\s+hp/i,
        type: "hp",
        multiplier: 8,
      },
      {
        regex: /medium\s+boost\s+to\s+(?:.*?)\s+hp/i,
        type: "hp",
        multiplier: 8,
      },
      {
        regex: /small\s+boost\s+to\s+(?:.*?)\s+max\s+hp/i,
        type: "hp",
        multiplier: 3,
      },
      {
        regex: /small\s+boost\s+to\s+(?:.*?)\s+hp/i,
        type: "hp",
        multiplier: 3,
      },

      // Critical patterns - Amélioré pour détecter "critical hit rate"
      {
        regex:
          /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 1,
      },
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*crit/i,
        type: "crit",
        multiplier: 1,
      },
      { regex: /critical\s*(\d+(?:\.\d+)?)%?/i, type: "crit", multiplier: 1 },
      {
        regex: /big\s+boost\s+to\s+(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 15,
      },
      {
        regex: /medium\s+boost\s+to\s+(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 8,
      },
      {
        regex: /small\s+boost\s+to\s+(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 3,
      },

      // Skill Damage patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*skill\s*dmg/i,
        type: "skillDamage",
        multiplier: 1,
      },
      {
        regex: /skill\s*dmg\s*(\d+(?:\.\d+)?)%?/i,
        type: "skillDamage",
        multiplier: 1,
      },
      {
        regex: /boost\s+to\s+skill\s+dm/i,
        type: "skillDamage",
        multiplier: 10,
      },

      // Charge Attack patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*charge\s*attack/i,
        type: "chargeAttack",
        multiplier: 1,
      },
      { regex: /ca\s*(\d+(?:\.\d+)?)%?/i, type: "chargeAttack", multiplier: 1 },
      {
        regex: /boost\s+to\s+charge\s+attack\s+dm/i,
        type: "chargeAttack",
        multiplier: 10,
      },
    ];

    // Détecter les conditions HP
    const hpConditionPatterns = [
      /based\s+on\s+how\s+low\s+hp\s+is/i,
      /when\s+hp\s+is\s+low/i,
      /at\s+low\s+hp/i,
      /hp\s+scaling/i,
      /scales\s+with\s+hp/i,
    ];

    const hasHpCondition = hpConditionPatterns.some((pattern) =>
      cleanText.match(pattern)
    );

    patterns.forEach((pattern) => {
      const match = cleanText.match(pattern.regex);
      if (match) {
        let value;
        if (pattern.multiplier > 1) {
          // Pour les patterns comme "big boost", "medium boost", etc.
          value = pattern.multiplier;
        } else {
          // Pour les patterns avec des valeurs numériques
          value = parseFloat(match[1]) * pattern.multiplier;
        }
      }
    });

    return stats;
  }

  private static getSkillTypeAndElement(skillName: string): {
    skillType: "optimus" | "omega";
    element: string;
  } {
    // Nettoyer le nom du skill des entités HTML
    const cleanSkillName = skillName
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .toLowerCase();

    // Skills Omega (aura de summon)
    const omegaSkills = {
      dark: ["mistfall's"],
      fire: ["ironflame's"],
      water: ["oceansoul's"],
      light: ["knightcode's"],
      wind: ["stormwyrm's"],
      earth: ["lifetree's"],
    };

    // Skills optimus
    const optimusSkills = {
      dark: ["dark's", "hatred's", "oblivion's"],
      fire: ["fire's", "hellfire's", "inferno's"],
      water: ["water's", "tsunami's", "hoarfrost's"],
      light: ["light's", "thunder's", "zion's"],
      wind: ["wind's", "whirlwind's", "ventosus's"],
      earth: ["earth's", "mountain's", "terra's"],
    };

    // Vérifier les skills Omega
    for (const [element, skills] of Object.entries(omegaSkills)) {
      for (const skill of skills) {
        if (cleanSkillName.includes(skill.toLowerCase())) {
          return { skillType: "omega", element };
        }
      }
    }

    // Vérifier les skills optimus
    for (const [element, skills] of Object.entries(optimusSkills)) {
      for (const skill of skills) {
        if (cleanSkillName.includes(skill.toLowerCase())) {
          return { skillType: "optimus", element };
        }
      }
    }

    // Si aucun élément reconnu, essayer d'extraire le type de skill
    // Patterns pour extraire le type de skill après " 's "
    const skillTypePattern = /'s\s+([a-z]+(?:\s+[a-z]+)*)/i;
    const match = cleanSkillName.match(skillTypePattern);

    if (match) {
      const skillType = match[1].toLowerCase();

      // Déterminer le type de skill basé sur le nom du type
      if (
        skillType.includes("might") ||
        skillType.includes("verity") ||
        skillType.includes("celere")
      ) {
        return { skillType: "optimus", element: "unknown" };
      } else if (
        skillType.includes("enmity") ||
        skillType.includes("stamina")
      ) {
        return { skillType: "optimus", element: "unknown" };
      }
    }

    // Vérifier si c'est un skill Omega avec un type spécifique
    // Pour les skills comme "Ironflame's Might III", "Stormwyrm's Verity II", etc.
    const omegaTypePattern =
      /(ironflame|oceansoul|mistfall|knightcode|stormwyrm|lifetree)'s\s+(might|verity|celere)/i;
    const omegaMatch = cleanSkillName.match(omegaTypePattern);

    if (omegaMatch) {
      const summonName = omegaMatch[1].toLowerCase();
      const skillType = omegaMatch[2].toLowerCase();

      // Mapper le nom du summon à l'élément
      const summonToElement: { [key: string]: string } = {
        ironflame: "fire",
        oceansoul: "water",
        mistfall: "dark",
        knightcode: "light",
        stormwyrm: "wind",
        lifetree: "earth",
      };

      const element = summonToElement[summonName];
      if (element) {
        return { skillType: "omega", element };
      }
    }

    // Par défaut
    return { skillType: "optimus", element: "unknown" };
  }

  private static parseSummonAura(
    auraText: string,
    summonElement: string
  ): SkillStats[] {
    const stats: SkillStats[] = [];

    if (!auraText) return stats;

    // Nettoyer le texte de l'aura
    const cleanAuraText = auraText
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/<[^>]*>/g, "")
      .replace(/\[\[([^|\]]*?)(?:\|[^|\]]*?)?\]\]/g, "$1")
      .replace(/<span[^>]*class="[^"]*tooltip[^"]*"[^>]*>.*?<\/span>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    // Déterminer le type de skill (Optimus ou Omega) basé sur l'élément de la summon
    // Les summons ont généralement des auras Optimus, sauf les summons spéciales
    let skillType: "optimus" | "omega" = "optimus";

    // Vérifier si c'est une summon spéciale (Omega)
    const omegaSummonPatterns = [
      /ironflame/i,
      /oceansoul/i,
      /mistfall/i,
      /knightcode/i,
      /stormwyrm/i,
      /lifetree/i,
    ];

    if (omegaSummonPatterns.some((pattern) => pattern.test(cleanAuraText))) {
      skillType = "omega";
    }

    // Vérifier si c'est une aura de boost aux weapon skills (comme "170% boost to Ironflame's weapon skills")
    const weaponSkillBoostPattern =
      /(\d+(?:\.\d+)?)%?\s*boost\s+to\s+(?:.*?)'s\s+weapon\s+skills/i;
    const weaponSkillMatch = cleanAuraText.match(weaponSkillBoostPattern);

    if (weaponSkillMatch) {
      const boostValue = parseFloat(weaponSkillMatch[1]);

      // Pour les auras de boost aux weapon skills, on applique le boost comme multiplicateur
      // Cela simule l'effet du boost sur les skills d'armes de cet élément

      // Créer un objet spécial pour indiquer que c'est un multiplicateur
      stats.push({
        type: "weaponSkillMultiplier",
        value: boostValue,
        target: "allies",
        skillType,
        element: summonElement,
        isConditional: false,
      });

      return stats;
    }

    // Patterns pour détecter les bonus de stats dans les auras
    const patterns = [
      // ATK patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*atk/i,
        type: "atk",
        multiplier: 1,
      },
      { regex: /atk\s*(\d+(?:\.\d+)?)%?/i, type: "atk", multiplier: 1 },
      {
        regex: /big\s+boost\s+to\s+(?:.*?)\s+atk/i,
        type: "atk",
        multiplier: 15,
      },
      {
        regex: /medium\s+boost\s+to\s+(?:.*?)\s+atk/i,
        type: "atk",
        multiplier: 8,
      },
      {
        regex: /small\s+boost\s+to\s+(?:.*?)\s+atk/i,
        type: "atk",
        multiplier: 3,
      },

      // HP patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*hp/i,
        type: "hp",
        multiplier: 1,
      },
      { regex: /hp\s*(\d+(?:\.\d+)?)%?/i, type: "hp", multiplier: 1 },
      {
        regex: /big\s+boost\s+to\s+(?:.*?)\s+hp/i,
        type: "hp",
        multiplier: 15,
      },
      {
        regex: /medium\s+boost\s+to\s+(?:.*?)\s+hp/i,
        type: "hp",
        multiplier: 8,
      },
      {
        regex: /small\s+boost\s+to\s+(?:.*?)\s+hp/i,
        type: "hp",
        multiplier: 3,
      },

      // Critical patterns
      {
        regex:
          /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 1,
      },
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*(?:.*?)\s*crit/i,
        type: "crit",
        multiplier: 1,
      },
      { regex: /critical\s*(\d+(?:\.\d+)?)%?/i, type: "crit", multiplier: 1 },
      {
        regex: /big\s+boost\s+to\s+(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 15,
      },
      {
        regex: /medium\s+boost\s+to\s+(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 8,
      },
      {
        regex: /small\s+boost\s+to\s+(?:.*?)\s*critical\s+hit\s+rate/i,
        type: "crit",
        multiplier: 3,
      },

      // Skill Damage patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*skill\s*dmg/i,
        type: "skillDamage",
        multiplier: 1,
      },
      {
        regex: /skill\s*dmg\s*(\d+(?:\.\d+)?)%?/i,
        type: "skillDamage",
        multiplier: 1,
      },
      {
        regex: /boost\s+to\s+skill\s+dm/i,
        type: "skillDamage",
        multiplier: 10,
      },

      // Charge Attack patterns
      {
        regex: /(\d+(?:\.\d+)?)%?\s*(?:boost|up)\s*to\s*charge\s*attack/i,
        type: "chargeAttack",
        multiplier: 1,
      },
      { regex: /ca\s*(\d+(?:\.\d+)?)%?/i, type: "chargeAttack", multiplier: 1 },
      {
        regex: /boost\s+to\s+charge\s+attack\s+dm/i,
        type: "chargeAttack",
        multiplier: 10,
      },
    ];

    patterns.forEach((pattern) => {
      const match = cleanAuraText.match(pattern.regex);
      if (match) {
        let value;
        if (pattern.multiplier > 1) {
          // Pour les patterns comme "big boost", "medium boost", etc.
          value = pattern.multiplier;
        } else {
          // Pour les patterns avec des valeurs numériques
          value = parseFloat(match[1]) * pattern.multiplier;
        }

        stats.push({
          type: pattern.type,
          value,
          target: "allies",
          skillType,
          element: summonElement,
          isConditional: false,
        });
      }
    });

    return stats;
  }

  private static extractSkillData(
    skill: any,
    weaponLevel?: number,
    weaponElement?: string
  ): SkillStats[] {
    const stats: SkillStats[] = [];

    if (!skill) return stats;

    // Fonction pour nettoyer le texte HTML
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

    // Essayer différents formats de skills
    const skillText =
      skill.originalText ||
      skill.text ||
      skill.description ||
      skill["s1 desc"] ||
      skill["s2 desc"] ||
      skill["s3 desc"] ||
      "";

    // Si on a des valeurs calculées enrichies, les utiliser en priorité
    if (skill.calculatedValues) {
      // Déterminer le type de skill et l'élément depuis le nom du skill
      const skillName = skill.originalName || skill.name || "";
      const skillInfo = this.getSkillTypeAndElement(skillName);

      // Déterminer quel tableau utiliser selon le type de skill
      let targetTableau = "Normal"; // Par défaut (Optimus)

      if (skillInfo.skillType === "omega") {
        targetTableau = "Omega";
      } else if (skillInfo.element === "unknown") {
        targetTableau = "EX";
      } else {
        targetTableau = "Normal";
      }

      // Parcourir les types de skills (Normal, Omega, EX)
      Object.entries(skill.calculatedValues).forEach(
        ([skillType, data]: [string, any]) => {
          // Traiter seulement le tableau correspondant au type de skill
          // Gérer les clés combinées comme "Normal & Omega"
          const shouldProcess =
            skillType === targetTableau ||
            skillType.includes(targetTableau) ||
            (targetTableau === "Normal" && skillType.includes("Normal")) ||
            (targetTableau === "Omega" && skillType.includes("Omega")) ||
            (targetTableau === "EX" && skillType === "EX");

          if (!shouldProcess) {
            return;
          }

          // Nouvelle structure : data.stats est un tableau
          if (data.stats && Array.isArray(data.stats)) {
            data.stats.forEach((stat: any) => {
              if (stat.values && stat.stat) {
                // Mapper le niveau de l'arme au niveau de skill dans le tableau
                const getSkillLevelFromWeaponLevel = (weaponLevel?: number) => {
                  if (!weaponLevel) return stat.skillLevel || 1;

                  const levelMapping: { [key: number]: number } = {
                    1: 1,
                    100: 10,
                    150: 15,
                    200: 20,
                    250: 25,
                  };

                  const mappedLevel =
                    levelMapping[weaponLevel] || stat.skillLevel || 1;

                  // Vérifier si le niveau mappé existe dans les valeurs disponibles
                  const availableLevels = Object.keys(stat.values)
                    .map(Number)
                    .sort((a, b) => a - b);
                  const maxAvailableLevel = Math.max(...availableLevels);

                  // Si le niveau mappé n'existe pas, utiliser le niveau maximum disponible
                  if (mappedLevel > maxAvailableLevel) {
                    return maxAvailableLevel;
                  }

                  return mappedLevel;
                };

                const skillLevelToUse =
                  getSkillLevelFromWeaponLevel(weaponLevel);
                const value = parseFloat(stat.values[skillLevelToUse]) || 0;

                if (value > 0) {
                  // Utiliser l'élément de l'arme si l'élément du skill est "unknown"
                  const elementToUse =
                    skillInfo.element === "unknown"
                      ? weaponElement || "unknown"
                      : skillInfo.element;

                  // Mapper le type de stat
                  let statType = stat.stat.toLowerCase();
                  if (statType === "critical") statType = "crit";
                  if (statType === "skill dmg cap") statType = "skillDamage";
                  if (statType === "c.a. dmg") statType = "chargeAttack";

                  // Détecter les conditions HP dans le texte du skill
                  const skillText = skill.originalText || skill.text || "";
                  const hpConditionPatterns = [
                    /based\s+on\s+how\s+low\s+hp\s+is/i,
                    /when\s+hp\s+is\s+low/i,
                    /at\s+low\s+hp/i,
                    /hp\s+scaling/i,
                    /scales\s+with\s+hp/i,
                  ];
                  const hasHpCondition = hpConditionPatterns.some((pattern) =>
                    skillText.toLowerCase().match(pattern)
                  );

                  stats.push({
                    type: statType,
                    value,
                    target: "calculated",
                    skillType: skillInfo.skillType,
                    element: elementToUse,
                    isConditional: hasHpCondition,
                    condition: hasHpCondition ? "HP Scaling" : undefined,
                  });
                }
              }
            });
          }
          // Ancienne structure : data.values directement (pour compatibilité)
          else if (data.values && data.stat) {
            // Mapper le niveau de l'arme au niveau de skill dans le tableau
            const getSkillLevelFromWeaponLevel = (weaponLevel?: number) => {
              if (!weaponLevel) return data.skillLevel || 1;

              const levelMapping: { [key: number]: number } = {
                1: 1,
                100: 10,
                150: 15,
                200: 20,
                250: 25,
              };

              const mappedLevel =
                levelMapping[weaponLevel] || data.skillLevel || 1;

              // Vérifier si le niveau mappé existe dans les valeurs disponibles
              const availableLevels = Object.keys(data.values)
                .map(Number)
                .sort((a, b) => a - b);
              const maxAvailableLevel = Math.max(...availableLevels);

              // Si le niveau mappé n'existe pas, utiliser le niveau maximum disponible
              if (mappedLevel > maxAvailableLevel) {
                return maxAvailableLevel;
              }

              return mappedLevel;
            };

            const skillLevelToUse = getSkillLevelFromWeaponLevel(weaponLevel);
            const value = parseFloat(data.values[skillLevelToUse]) || 0;

            if (value > 0) {
              // Utiliser l'élément de l'arme si l'élément du skill est "unknown"
              const elementToUse =
                skillInfo.element === "unknown"
                  ? weaponElement || "unknown"
                  : skillInfo.element;

              // Mapper le type de stat
              let statType = data.stat.toLowerCase();
              if (statType === "critical") statType = "crit";
              if (statType === "skill dmg cap") statType = "skillDamage";
              if (statType === "c.a. dmg") statType = "chargeAttack";

              // Détecter les conditions HP dans le texte du skill
              const skillText = skill.originalText || skill.text || "";
              const hpConditionPatterns = [
                /based\s+on\s+how\s+low\s+hp\s+is/i,
                /when\s+hp\s+is\s+low/i,
                /at\s+low\s+hp/i,
                /hp\s+scaling/i,
                /scales\s+with\s+hp/i,
              ];
              const hasHpCondition = hpConditionPatterns.some((pattern) =>
                skillText.toLowerCase().match(pattern)
              );

              stats.push({
                type: statType,
                value,
                target: "calculated",
                skillType: skillInfo.skillType,
                element: elementToUse,
                isConditional: hasHpCondition,
                condition: hasHpCondition ? "HP Scaling" : undefined,
              });
            }
          }
        }
      );
    }

    // Si on n'a pas de valeurs calculées enrichies, utiliser l'ancien parsing
    if (!skill.calculatedValues && skillText) {
      const cleanedText = cleanHtmlText(skillText);
      const skillName =
        skill.name ||
        skill["s1 name"] ||
        skill["s2 name"] ||
        skill["s3 name"] ||
        "";
      stats.push(...this.parseSkillText(cleanedText, skillName));
    }

    return stats;
  }

  public static calculateTotalStats(
    weapons: any[],
    summons: any[] = [],
    summonIndices?: { [key: number]: any }
  ): {
    statsByType: WeaponStatsByType;
    totalStats: { atk: number; hp: number };
  } {
    // Initialiser les stats par type et élément
    const createEmptyStats = (): WeaponStats => ({
      atk: 0,
      hp: 0,
      crit: 0,
      skillDamage: 0,
      chargeAttack: 0,
    });

    const optimusStats = {
      dark: createEmptyStats(),
      fire: createEmptyStats(),
      water: createEmptyStats(),
      light: createEmptyStats(),
      wind: createEmptyStats(),
      earth: createEmptyStats(),
    };

    const omegaStats = {
      dark: createEmptyStats(),
      fire: createEmptyStats(),
      water: createEmptyStats(),
      light: createEmptyStats(),
      wind: createEmptyStats(),
      earth: createEmptyStats(),
    };

    const conditionalStats = {
      dark: createEmptyStats(),
      fire: createEmptyStats(),
      water: createEmptyStats(),
      light: createEmptyStats(),
      wind: createEmptyStats(),
      earth: createEmptyStats(),
    };

    logger.info("=== Processing Weapons ===");
    weapons.forEach((weapon, index) => {
      if (!weapon) {
        logger.debug(`Weapon ${index + 1}: NULL (skipped)`);
        return;
      }

      const weaponName = weapon.name || weapon.title || "Unknown";
      const element = weapon.element;
      const level = weapon.selectedLevel;
      const skillsCount = [
        weapon.s1_enriched || weapon.s1_details || weapon["s1 name"],
        weapon.s2_enriched || weapon.s2_details || weapon["s2 name"],
        weapon.s3_enriched || weapon.s3_details || weapon["s3 name"],
      ].filter(Boolean).length;

      logger.weaponStats(weaponName, element, level, skillsCount);

      // Extraire les skills de l'arme
      const skills = [];

      // Priorité aux skills enrichis
      if (weapon.s1_enriched) {
        skills.push(weapon.s1_enriched);
      } else if (weapon.s1_details) {
        skills.push(weapon.s1_details);
      } else if (weapon["s1 name"] && weapon["s1 desc"]) {
        skills.push({ name: weapon["s1 name"], text: weapon["s1 desc"] });
      }

      if (weapon.s2_enriched) {
        skills.push(weapon.s2_enriched);
      } else if (weapon.s2_details) {
        skills.push(weapon.s2_details);
      } else if (weapon["s2 name"] && weapon["s2 desc"]) {
        skills.push({ name: weapon["s2 name"], text: weapon["s2 desc"] });
      }

      if (weapon.s3_enriched) {
        skills.push(weapon.s3_enriched);
      } else if (weapon.s3_details) {
        skills.push(weapon.s3_details);
      } else if (weapon["s3 name"] && weapon["s3 desc"]) {
        skills.push({ name: weapon["s3 name"], text: weapon["s3 desc"] });
      }

      // Analyser chaque skill
      skills.forEach((skill, skillIndex) => {
        const skillName =
          skill.name || skill.originalName || skill["s1 name"] || "Unknown";
        const weaponLevel = weapon.selectedLevel;
        const weaponElement = weapon.element;

        const skillStats = this.extractSkillData(
          skill,
          weaponLevel,
          weaponElement
        );
        skillStats.forEach((stat) => {
          // Déterminer quelle collection utiliser
          let targetStats;
          if (stat.isConditional) {
            targetStats = conditionalStats;
          } else if (stat.skillType === "optimus") {
            targetStats = optimusStats;
          } else if (stat.skillType === "omega") {
            targetStats = omegaStats;
          } else {
            return; // Skip si pas de type valide
          }

          // Utiliser l'élément de l'arme si l'élément du skill est "unknown"
          const elementToUse =
            stat.element === "unknown" ? weapon.element : stat.element;

          if (
            targetStats[elementToUse as keyof typeof targetStats] &&
            targetStats[
              elementToUse as keyof typeof targetStats
            ].hasOwnProperty(stat.type)
          ) {
            const oldValue = (
              targetStats[elementToUse as keyof typeof targetStats] as any
            )[stat.type];
            (targetStats[elementToUse as keyof typeof targetStats] as any)[
              stat.type
            ] += stat.value;
            const newValue = (
              targetStats[elementToUse as keyof typeof targetStats] as any
            )[stat.type];
            const typeLabel = stat.isConditional
              ? "Conditional"
              : stat.skillType;
          }
        });
      });
    });

    // Traitement des auras des summons (seulement Main et Ally)
    logger.info("=== Processing Summons ===");

    // Traiter seulement les summons Main (index 1) et Ally (index 6)
    const mainSummon = summonIndices?.[1];
    const allySummon = summonIndices?.[6];

    const summonsToProcess = [
      { summon: mainSummon, type: "Main", index: 1 },
      { summon: allySummon, type: "Ally", index: 6 },
    ];

    // Collecter tous les multiplicateurs d'auras par élément et type
    const auraMultipliers: {
      [key: string]: { total: number; sources: string[] };
    } = {};

    summonsToProcess.forEach(({ summon, type, index }) => {
      if (!summon) {
        logger.debug(`${type} Summon (index ${index}): NULL (skipped)`);
        return;
      }

      // Obtenir l'aura du niveau sélectionné ou utiliser le niveau par défaut
      const selectedLevel = summon.selectedLevel || 150; // Niveau par défaut si aucun sélectionné

      // Mapper le niveau à l'index de l'aura
      const levelMapping: { [key: number]: number } = {
        1: 1,
        100: 2,
        150: 3,
        200: 4,
        250: 5,
      };

      const auraIndex = levelMapping[selectedLevel];
      if (!auraIndex) {
        return;
      }

      // Récupérer l'aura du niveau sélectionné
      let auraText = summon[`aura${auraIndex}`];

      // Pour le niveau 250, vérifier les auras spéciales
      if (selectedLevel === 250 && summon.selectedSpecialAura) {
        auraText = summon[summon.selectedSpecialAura] || auraText;
      }

      if (!auraText) {
        return;
      }

      // Parser l'aura pour extraire les bonus
      const auraStats = this.parseSummonAura(auraText, summon.element);

      // Collecter les multiplicateurs d'auras
      auraStats.forEach((stat) => {
        if (stat.type === "weaponSkillMultiplier") {
          const key = `${stat.skillType}_${stat.element}`;
          if (!auraMultipliers[key]) {
            auraMultipliers[key] = { total: 0, sources: [] };
          }
          auraMultipliers[key].total += stat.value;
          auraMultipliers[key].sources.push(`${type} Summon: ${stat.value}%`);
        } else {
          // Traiter les stats normales immédiatement
          const targetStats =
            stat.skillType === "omega" ? omegaStats : optimusStats;

          if (
            targetStats[stat.element as keyof typeof targetStats] &&
            targetStats[
              stat.element as keyof typeof targetStats
            ].hasOwnProperty(stat.type)
          ) {
            const oldValue = (
              targetStats[stat.element as keyof typeof targetStats] as any
            )[stat.type];
            (targetStats[stat.element as keyof typeof targetStats] as any)[
              stat.type
            ] += stat.value;
            const newValue = (
              targetStats[stat.element as keyof typeof targetStats] as any
            )[stat.type];
          }
        }
      });
    });

    // Appliquer tous les multiplicateurs d'auras accumulés
    Object.entries(auraMultipliers).forEach(([key, multiplierData]) => {
      const [skillType, element] = key.split("_");
      const targetStats = skillType === "omega" ? omegaStats : optimusStats;

      // Appliquer le multiplicateur total à toutes les stats existantes de cet élément
      const elementStats = targetStats[element as keyof typeof targetStats];
      if (elementStats) {
        Object.keys(elementStats).forEach((statKey) => {
          const currentValue = (elementStats as any)[statKey];
          if (currentValue > 0) {
            // Calcul: valeur_base × (1 + somme_des_boosts_en_décimal)
            // Exemple: 79.5% × (1 + 1.7 + 1.2) = 79.5% × 3.9 = 310.05%
            const multiplier = 1 + multiplierData.total / 100;
            const newValue = currentValue * multiplier;
            (elementStats as any)[statKey] = newValue;
          }
        });
      }
    });

    // Calculer les totaux ATK et HP de toutes les armes et summons (sans multiplicateurs)
    let totalAtk = 0;
    let totalHp = 0;

    // Ajouter les stats des armes
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

    // Ajouter les stats des summons (Main et Ally seulement)
    const mainSummonForStats = summonIndices?.[1];
    const allySummonForStats = summonIndices?.[6];

    [mainSummonForStats, allySummonForStats].forEach((summon) => {
      if (summon && summon.selectedLevel) {
        const levelIndex =
          [1, 100, 150, 200, 250].indexOf(summon.selectedLevel) + 1;
        const summonAtk = summon[`atk${levelIndex}`] || 0;
        const summonHp = summon[`hp${levelIndex}`] || 0;
        totalAtk += summonAtk;
        totalHp += summonHp;
      }
    });

    logger.totalStats(totalAtk, totalHp);

    logger.debug("Final Stats Summary:", {
      optimus: optimusStats,
      omega: omegaStats,
      conditional: conditionalStats,
    });

    return {
      statsByType: {
        optimus: optimusStats,
        omega: omegaStats,
        conditional: conditionalStats,
      },
      totalStats: {
        atk: totalAtk,
        hp: totalHp,
      },
    };
  }

  public static formatStats(
    stats: WeaponStats
  ): { label: string; value: string; color: string }[] {
    const formattedStats = [];

    // Ordre d'affichage : ATK, HP, Crit, Skill DMG, CA DMG
    if (stats.atk > 0) {
      formattedStats.push({
        label: "ATK",
        value: `+${stats.atk.toFixed(1)}%`,
        color: "#ff6b35", // STAT_COLORS.atk
      });
    }

    if (stats.hp > 0) {
      formattedStats.push({
        label: "HP",
        value: `+${stats.hp.toFixed(1)}%`,
        color: "#66bb6a", // STAT_COLORS.hp
      });
    }

    if (stats.crit > 0) {
      formattedStats.push({
        label: "Critical",
        value: `+${stats.crit.toFixed(1)}%`,
        color: "#ffaa00",
      });
    }

    if (stats.skillDamage > 0) {
      formattedStats.push({
        label: "Skill DMG",
        value: `+${stats.skillDamage.toFixed(1)}%`,
        color: "#aa44ff",
      });
    }

    if (stats.chargeAttack > 0) {
      formattedStats.push({
        label: "CA DMG",
        value: `+${stats.chargeAttack.toFixed(1)}%`,
        color: "#ff8844",
      });
    }

    return formattedStats;
  }
}
