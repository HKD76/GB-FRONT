// Configuration des couleurs pour l'application
// Toutes les couleurs utilisées dans l'application sont centralisées ici

// ===== COULEURS DE BASE =====
export const BASE_COLORS = {
  // Couleurs primaires
  white: "#FFFFFF",
  black: "#000000",

  // Gris
  gray: "#666666",
  grayLight: "#cccccc",
  grayDark: "#303030",
  grayMedium: "#6b6b6b",
  grayVeryDark: "#2a2a2a",
  grayExtraDark: "#1a1a1a",
  grayCard: "#3a3a3a",
  grayBorder: "#4a4a4a",

  // Couleurs d'accent
  blue: "#64B5F6",
  blueDark: "#1A72ED",
  blueLight: "#4fc3f7",
  bluePrimary: "#007AFF",
  bluePrimaryDark: "#0056b3",

  // Couleurs de fond
  background: "#F5FAF8",
  surface: "#F5FAF8",
  card: "#ffffff",

  // Couleurs spéciales
  orange: "#ff6b35",
  orangeDark: "#FF5722",
  red: "#ff4444",
  redError: "#ff3b30",
  green: "#44ff44",
  greenSuccess: "#34c759",
  greenLight: "#66bb6a",
  yellow: "#f5d222",
  yellowLight: "#E8C02E",
  purple: "#8b00ff",
  purpleDark: "#7F2EE8",
  brown: "#8b4513",
  brownLight: "#785638",
  brownDark: "#785A3D",
  brownCard: "#ede0d3",
} as const;

// ===== COULEURS D'ÉLÉMENTS =====
export const ELEMENT_COLORS = {
  fire: "#EB3137",
  water: "#1A72ED",
  earth: "#785638",
  wind: "#41C46D",
  light: "#E8C02E",
  dark: "#7F2EE8",
  default: "#666666",
} as const;

// ===== COULEURS DE RARETÉS =====
export const RARITY_COLORS = {
  N: "#9E9E9E",
  R: "#705753",
  SR: "#95c2c9",
  SSR: "#D4B759",
  default: "#666666",
} as const;

// ===== COULEURS DE STATS =====
export const STAT_COLORS = {
  atk: "#ff6b35",
  hp: "#66bb6a",
  critical: "#ffaa44",
  skillDamage: "#44aaff",
  chargeAttack: "#aa44ff",
  doubleAttack: "#ff44aa",
  tripleAttack: "#44ffaa",
  def: "#aaaa44",
  elementalAtk: "#ff8844",
} as const;

// ===== COULEURS D'INTERFACE =====
export const UI_COLORS = {
  // Arrière-plans
  background: BASE_COLORS.background,
  surface: BASE_COLORS.surface,
  card: BASE_COLORS.card,
  elevated: "#404040",

  // Texte
  text: BASE_COLORS.grayDark,
  textSecondary: BASE_COLORS.gray,
  textMuted: "#999999",
  textInverse: BASE_COLORS.black,
  textWhite: BASE_COLORS.white,

  // Accents et actions
  primary: BASE_COLORS.bluePrimary,
  primaryDark: BASE_COLORS.bluePrimaryDark,
  secondary: "#5856d6",
  success: BASE_COLORS.greenSuccess,
  warning: "#ff9500",
  error: BASE_COLORS.redError,

  // Bordures et séparateurs
  border: "rgba(73, 85, 86, 0.2)",
  borderLight: "rgba(73, 85, 86, 0.13)",
  borderMedium: "rgba(73, 85, 86, 0.3)",
  borderStrong: "rgba(73, 85, 86, 0.4)",
  separator: "#333333",

  // Ombres
  shadow: BASE_COLORS.black,

  // États
  disabled: BASE_COLORS.gray,
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.2)",
  overlayDark: "rgba(0, 0, 0, 0.7)",
  overlayVeryDark: "rgba(0, 0, 0, 0.6)",

  // Couleurs spéciales pour les boutons et interactions
  buttonPrimary: BASE_COLORS.blue,
  buttonSecondary: BASE_COLORS.bluePrimary,
  buttonSuccess: BASE_COLORS.greenSuccess,
  buttonError: BASE_COLORS.redError,

  // Couleurs de fond spéciales
  backgroundOverlay: "rgba(73, 85, 86, 0.13)",
  backgroundOverlayLight: "rgba(73, 85, 86, 0.08)",
  backgroundBlue: "rgba(64, 181, 246, 0.1)",
  backgroundBlueLight: "rgba(64, 181, 246, 0.15)",
  backgroundWhite: "rgba(255, 255, 255, 0.5)",
  backgroundWhiteLight: "rgba(255, 255, 255, 0.1)",

  // Couleurs de bordure spéciales
  borderBlue: "rgba(64, 181, 246, 0.3)",
  borderWhite: "rgba(255, 255, 255, 0.3)",

  // Couleurs d'ombre de texte
  textShadow: "rgba(0, 0, 0, 0.5)",
  textShadowLight: "rgba(0, 0, 0, 0.1)",
} as const;

// ===== COULEURS SPÉCIALES POUR LES COMPÉTENCES =====
export const SKILL_COLORS = {
  // Couleurs d'éléments pour les compétences
  fireSkill: "#ff4444",
  waterSkill: "#4444ff",
  windSkill: "#44ff44",
  earthSkill: "#8b4513",
  lightSkill: "#f5d222",
  darkSkill: "#444444",

  // Couleurs de types de compétences
  attack: "#ff4444",
  support: "#44ff44",
  heal: "#44ffff",
  buff: "#f5d222",
  debuff: "#ff44ff",

  // Couleurs de stats dans les descriptions
  atkDesc: "#ff6666",
  hpDesc: "#66ff66",
  criticalDesc: "#ffaa44",
  skillDamageDesc: "#44aaff",
  chargeAttackDesc: "#aa44ff",
  doubleAttackDesc: "#ff44aa",
  tripleAttackDesc: "#44ffaa",
  defDesc: "#aaaa44",
  elementalAtkDesc: "#ff8844",
} as const;

// ===== COULEURS SPÉCIALES POUR LES WEAPONS =====
export const WEAPON_COLORS = {
  // Couleurs d'éléments pour les armes
  fireWeapon: "#ff6b35",
  waterWeapon: "#4fc3f7",
  earthWeapon: "#8bc34a",
  windWeapon: "#4caf50",
  lightWeapon: "#ffeb3b",
  darkWeapon: "#9c27b0",

  // Couleurs de raretés pour les armes
  NWeapon: "#9e9e9e",
  RWeapon: "#4caf50",
  SRWeapon: "#2196f3",
  SSRWeapon: "#ff9800",
} as const;

// ===== COULEURS SPÉCIALES POUR LES SUMMONS =====
export const SUMMON_COLORS = {
  // Couleurs d'éléments pour les summons
  fireSummon: "#ff4444",
  waterSummon: "#4444ff",
  windSummon: "#44ff44",
  earthSummon: "#8b4513",
  lightSummon: "#f5d222",
  darkSummon: "#444444",
} as const;

// ===== FONCTIONS UTILITAIRES =====

// Fonction pour obtenir la couleur d'un élément
export const getElementColor = (element: string): string => {
  return (
    ELEMENT_COLORS[element?.toLowerCase() as keyof typeof ELEMENT_COLORS] ||
    ELEMENT_COLORS.default
  );
};

// Fonction pour obtenir la couleur d'une rareté
export const getRarityColor = (rarity: string): string => {
  return (
    RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.default
  );
};

// Fonction pour obtenir la couleur d'une stat
export const getStatColor = (stat: string): string => {
  const statKey = stat?.toLowerCase() as keyof typeof STAT_COLORS;
  return STAT_COLORS[statKey] || BASE_COLORS.gray;
};

// Fonction pour obtenir la couleur d'un type de compétence
export const getSkillTypeColor = (skillType: string): string => {
  const typeKey = skillType?.toLowerCase() as keyof typeof SKILL_COLORS;
  return SKILL_COLORS[typeKey] || BASE_COLORS.bluePrimary;
};

// Fonction pour obtenir la couleur d'un élément pour les compétences
export const getSkillElementColor = (element: string): string => {
  const elementKey =
    `${element?.toLowerCase()}Skill` as keyof typeof SKILL_COLORS;
  return SKILL_COLORS[elementKey] || BASE_COLORS.bluePrimary;
};

// Fonction pour obtenir la couleur d'un élément pour les armes
export const getWeaponElementColor = (element: string): string => {
  const elementKey =
    `${element?.toLowerCase()}Weapon` as keyof typeof WEAPON_COLORS;
  return WEAPON_COLORS[elementKey] || BASE_COLORS.white;
};

// Fonction pour obtenir la couleur d'une rareté pour les armes
export const getWeaponRarityColor = (rarity: string): string => {
  const rarityKey = `${rarity}Weapon` as keyof typeof WEAPON_COLORS;
  return WEAPON_COLORS[rarityKey] || BASE_COLORS.gray;
};

// Fonction pour obtenir la couleur d'un élément pour les summons
export const getSummonElementColor = (element: string): string => {
  const elementKey =
    `${element?.toLowerCase()}Summon` as keyof typeof SUMMON_COLORS;
  return SUMMON_COLORS[elementKey] || BASE_COLORS.gray;
};

// Fonction pour obtenir une couleur avec opacité
export const withOpacity = (color: string, opacity: number): string => {
  // Si la couleur est déjà en rgba, on la convertit
  if (color.startsWith("rgba")) {
    return color.replace(/[\d.]+\)$/, `${opacity})`);
  }

  // Si c'est une couleur hex, on la convertit en rgba
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  return color;
};

// Fonction pour obtenir une couleur plus claire
export const lighten = (color: string, amount: number = 0.1): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const newR = Math.min(255, r + (255 - r) * amount);
    const newG = Math.min(255, g + (255 - g) * amount);
    const newB = Math.min(255, b + (255 - b) * amount);

    return `#${Math.round(newR).toString(16).padStart(2, "0")}${Math.round(newG)
      .toString(16)
      .padStart(2, "0")}${Math.round(newB).toString(16).padStart(2, "0")}`;
  }

  return color;
};

// Fonction pour obtenir une couleur plus sombre
export const darken = (color: string, amount: number = 0.1): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const newR = Math.max(0, r - r * amount);
    const newG = Math.max(0, g - g * amount);
    const newB = Math.max(0, b - b * amount);

    return `#${Math.round(newR).toString(16).padStart(2, "0")}${Math.round(newG)
      .toString(16)
      .padStart(2, "0")}${Math.round(newB).toString(16).padStart(2, "0")}`;
  }

  return color;
};

// Export de toutes les couleurs pour faciliter l'import
export const COLORS = {
  ...BASE_COLORS,
  ...ELEMENT_COLORS,
  ...RARITY_COLORS,
  ...STAT_COLORS,
  ...UI_COLORS,
  ...SKILL_COLORS,
  ...WEAPON_COLORS,
  ...SUMMON_COLORS,
} as const;
