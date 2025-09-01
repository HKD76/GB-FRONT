// Utilitaire pour générer automatiquement le mapping des images d'armes
// Ce fichier peut être régénéré automatiquement avec un script

export const weaponImages: { [key: string]: any } = {
  // Ce mapping est généré automatiquement
  // Pour ajouter de nouvelles images, ajoutez-les ici ou régénérez le mapping
  // Exemple de mapping (à remplacer par vos vraies images) :
  // 'weapon_001': require('../assets/weapon_imgs/weapon_001.png'),
  // 'weapon_002': require('../assets/weapon_imgs/weapon_002.png'),
  // etc...
};

// Fonction pour obtenir l'image d'une arme
export const getWeaponImage = (weaponId: string) => {
  // Essayer d'abord le mapping statique
  if (weaponImages[weaponId]) {
    return weaponImages[weaponId];
  }

  // Sinon, essayer de charger dynamiquement
  try {
    return require(`../assets/weapon_imgs/${weaponId}.png`);
  } catch (error) {
    // Si l'image n'existe pas, utiliser l'image par défaut
    return require("../assets/images/empty_weapon.jpg");
  }
};

// Script pour générer automatiquement le mapping (à exécuter manuellement)
export const generateWeaponImageMapping = () => {
  console.log(
    "// Mapping généré automatiquement - à copier dans weaponImageMapper.ts"
  );
  console.log("export const weaponImages: { [key: string]: any } = {");

  // Ici vous pouvez ajouter la logique pour scanner le dossier weapon_imgs
  // et générer automatiquement les require() pour chaque image

  console.log("};");
};
