import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { authService } from "../services/authService";
import { User } from "../types";
import { AppStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_COLORS, UI_COLORS } from "../config/colors";

type HomeScreenNavigationProp = StackNavigationProp<AppStackParamList, "Home">;

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [weaponGridPressed, setWeaponGridPressed] = useState(false);
  const [skillsStatsPressed, setSkillsStatsPressed] = useState(false);
  const [parametersPressed, setParametersPressed] = useState(false);
  const [savedGridsPressed, setSavedGridsPressed] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
        return;
      }

      // Rafraîchir les données depuis l'API seulement si nécessaire
      const refreshedUser = await authService.refreshUserData();
      setUser(refreshedUser);
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des données utilisateur:",
        error
      );

      // Si c'est une erreur de rate limiting, utiliser les données en cache
      if (error.error === "RATE_LIMIT") {
        console.log("Rate limiting détecté - utiliser les données en cache");
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          onLogout();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BASE_COLORS.blue} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* User Banner */}
          <View style={styles.userBannerContainer}>
            <View style={styles.userBanner}>
              <View style={styles.userBannerLeftSection}>
                <ImageBackground
                  source={require("../assets/images/img1.png")}
                  style={styles.userBannerBackground}
                  resizeMode="cover"
                >
                  <View style={styles.buttonOverlay} />
                </ImageBackground>
              </View>
              <View style={styles.userBannerRightSection}>
                <Text style={styles.welcomeText}>
                  Welcome, {user?.username || "User"} !
                </Text>
              </View>
            </View>
            <View style={styles.userBannerImage} pointerEvents="none">
              <Image
                source={require("../assets/images/userimg.png")}
                style={styles.userImageInner}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Last Weapons Added Section */}
          <View style={styles.weaponsCard}>
            <View style={styles.weaponsTitleSection}>
              <Text style={styles.weaponsTitle}>Last Weapons Added</Text>
              <Text style={styles.weaponsSubTitle}>2025-08-15</Text>
            </View>
            <View style={styles.weaponsContent}>
              <View style={styles.weaponList}>
                <View style={styles.weaponItem}>
                  <View style={styles.weaponIcon}>
                    <Image
                      source={require("../assets/images/weapon1.png")}
                      style={styles.weaponImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.weaponInfo}>
                    <Text style={styles.weaponName}>Exo Evileness</Text>
                    <Text style={styles.weaponSource}>
                      Obtain via :{" "}
                      <Text style={styles.weaponSourceHighlight}>
                        Exo Diablo Crucible
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.weaponItem}>
                  <View style={styles.weaponIcon}>
                    <Image
                      source={require("../assets/images/weapon2.png")}
                      style={styles.weaponImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.weaponInfo}>
                    <Text style={styles.weaponName}>Shati Hariq</Text>
                    <Text style={styles.weaponSource}>
                      Obtain via :{" "}
                      <Text style={styles.weaponSourceHighlight}>
                        Summer Premium Draw
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.weaponItem}>
                  <View style={styles.weaponIcon}>
                    <Image
                      source={require("../assets/images/weapon3.png")}
                      style={styles.weaponImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.weaponInfo}>
                    <Text style={styles.weaponName}>Moon Shotel</Text>
                    <Text style={styles.weaponSource}>
                      Obtain via :{" "}
                      <Text style={styles.weaponSourceHighlight}>
                        Summer Premium Draw
                      </Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.weaponItem}>
                  <View style={styles.weaponIcon}>
                    <Image
                      source={require("../assets/images/weapon4.png")}
                      style={styles.weaponImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.weaponInfo}>
                    <Text style={styles.weaponName}>
                      Second Float of the Herd
                    </Text>
                    <Text style={styles.weaponSource}>
                      Obtain via :{" "}
                      <Text style={styles.weaponSourceHighlight}>
                        Summer Premium Draw
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationSection}>
            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.navButton,
                    { transform: [{ scale: weaponGridPressed ? 1.05 : 1 }] },
                  ]}
                  onPress={() => {
                    setWeaponGridPressed(true);
                    setTimeout(() => {
                      setWeaponGridPressed(false);
                      navigation.navigate("WeaponGrid");
                    }, 150);
                  }}
                >
                  <View style={styles.buttonTopSection}>
                    <ImageBackground
                      source={require("../assets/images/img1.png")}
                      style={styles.buttonBackground}
                      resizeMode="cover"
                    >
                      <View style={styles.buttonOverlay} />
                    </ImageBackground>
                  </View>
                  <View style={styles.buttonBottomSection}>
                    <Text style={styles.buttonText}>Weapon Grid</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.buttonImage} pointerEvents="none">
                  <Image
                    source={require("../assets/images/sword_lbox.png")}
                    style={[
                      styles.buttonImageInner,
                      {
                        transform: [
                          { rotate: "350deg" },
                          { scale: weaponGridPressed ? 1.05 : 1 },
                        ],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.navButton,
                    { transform: [{ scale: skillsStatsPressed ? 1.05 : 1 }] },
                  ]}
                  onPress={() => {
                    setSkillsStatsPressed(true);
                    setTimeout(() => {
                      setSkillsStatsPressed(false);
                      navigation.navigate("WeaponsData");
                    }, 150);
                  }}
                >
                  <View style={styles.buttonTopSection}>
                    <ImageBackground
                      source={require("../assets/images/img2.png")}
                      style={styles.buttonBackground}
                      resizeMode="cover"
                    >
                      <View style={styles.buttonOverlay} />
                    </ImageBackground>
                  </View>
                  <View style={styles.buttonBottomSection}>
                    <Text style={styles.buttonText}>Skills Stats</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.buttonImage} pointerEvents="none">
                  <Image
                    source={require("../assets/images/merits_rbox.png")}
                    style={[
                      styles.buttonImageInner,
                      {
                        transform: [
                          { rotate: "15deg" },
                          { scale: skillsStatsPressed ? 1.05 : 1 },
                        ],
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles.wideNavButton,
                  { transform: [{ scale: savedGridsPressed ? 1.05 : 1 }] },
                ]}
                onPress={() => {
                  setSavedGridsPressed(true);
                  setTimeout(() => {
                    setSavedGridsPressed(false);
                    navigation.navigate("SavedWeaponGrids");
                  }, 150);
                }}
              >
                <View style={styles.wideButtonLeftSection}>
                  <ImageBackground
                    source={require("../assets/images/img2.png")}
                    style={styles.wideButtonBackground}
                    resizeMode="cover"
                  >
                    <View style={styles.buttonOverlay} />
                  </ImageBackground>
                </View>
                <View style={styles.wideButtonRightSection}>
                  <Text style={styles.buttonText}>Community Grids</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.wideButtonImage} pointerEvents="none">
                <Image
                  source={require("../assets/images/weapon5.png")}
                  style={[
                    styles.buttonImageInner2,
                    {
                      transform: [
                        { rotate: "350deg" },
                        { scale: savedGridsPressed ? 1.05 : 1 },
                      ],
                    },
                  ]}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Settings Button */}
          <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.wideNavButton,
                { transform: [{ scale: parametersPressed ? 1.05 : 1 }] },
              ]}
              onPress={() => {
                setParametersPressed(true);
                setTimeout(() => {
                  setParametersPressed(false);
                  navigation.navigate("Settings");
                }, 150);
              }}
            >
              <View style={styles.wideButtonLeftSection}>
                <ImageBackground
                  source={require("../assets/images/img3.png")}
                  style={styles.wideButtonBackground}
                  resizeMode="cover"
                >
                  <View style={styles.buttonOverlay} />
                </ImageBackground>
              </View>
              <View style={styles.wideButtonRightSection}>
                <Text style={styles.buttonText}>Settings</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.wideButtonImage} pointerEvents="none">
              <Image
                source={require("../assets/images/parameters_dbox.png")}
                style={[
                  styles.buttonImageInner2,
                  {
                    transform: [
                      { rotate: "0deg" },
                      { scale: parametersPressed ? 1.05 : 1 },
                    ],
                  },
                ]}
                resizeMode="contain"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: BASE_COLORS.white,
    fontWeight: "600",
    textShadowColor: UI_COLORS.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userBannerContainer: {
    position: "relative",
    marginTop: 20,
    marginBottom: 20,
  },
  userBanner: {
    backgroundColor: BASE_COLORS.background,
    borderRadius: 12,
    width: "100%",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: BASE_COLORS.background,
    overflow: "hidden",
  },
  userBannerLeftSection: {
    flex: 1,
    position: "relative",
  },
  userBannerRightSection: {
    flex: 1.5,
    backgroundColor: BASE_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    shadowColor: BASE_COLORS.background,
    shadowOffset: {
      width: -10,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 10,
  },
  userBannerBackground: {
    opacity: 0.7,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  userBannerImage: {
    width: 80,
    height: 80,
    position: "absolute",
    bottom: 50,
    left: 10,
    zIndex: 10,
  },
  userImageInner: {
    width: 140,
    height: 140,
  },
  characterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: UI_COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  characterEmoji: {
    fontSize: 24,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: UI_COLORS.text,
    flex: 1,
  },
  weaponsCard: {
    backgroundColor: BASE_COLORS.background,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: BASE_COLORS.background,
  },
  weaponsTitleSection: {
    backgroundColor: BASE_COLORS.background,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.border,
  },
  weaponsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: UI_COLORS.text,
    textAlign: "center",
  },
  weaponsSubTitle: {
    fontSize: 18,
    color: UI_COLORS.textSecondary,
    textAlign: "center",
  },
  weaponsContent: {
    backgroundColor: UI_COLORS.borderLight,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 28,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: UI_COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  weaponList: {
    gap: 12,
  },
  weaponItem: {
    backgroundColor: BASE_COLORS.background,
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  highlightedItem: {
    borderWidth: 2,
    borderColor: BASE_COLORS.blue,
    borderStyle: "dashed",
  },
  weaponIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: UI_COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  weaponEmoji: {
    fontSize: 20,
  },
  weaponImage: {
    width: 80,
    height: 80,
  },
  weaponInfo: {
    flex: 1,
  },
  weaponName: {
    fontSize: 16,
    fontWeight: "600",
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  weaponSource: {
    fontSize: 14,
    color: UI_COLORS.textSecondary,
  },
  weaponSourceHighlight: {
    color: BASE_COLORS.blue,
    fontWeight: "600",
  },
  navigationSection: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    alignItems: "center",
  },
  buttonContainer: {
    position: "relative",
  },
  navButton: {
    backgroundColor: BASE_COLORS.background,
    borderRadius: 12,
    width: 170,
    height: 150,
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: BASE_COLORS.background,
    overflow: "hidden",
  },
  buttonTopSection: {
    flex: 3,
    position: "relative",
  },
  buttonBottomSection: {
    flex: 1,
    backgroundColor: BASE_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    shadowColor: BASE_COLORS.background,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 10,
  },
  buttonBackground: {
    opacity: 0.7,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: UI_COLORS.borderLight,
  },
  wideNavButton: {
    backgroundColor: BASE_COLORS.background,
    borderRadius: 12,
    width: "100%",
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: UI_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: BASE_COLORS.background,
    overflow: "hidden",
  },
  wideButtonLeftSection: {
    flex: 1,
    position: "relative",
  },
  wideButtonRightSection: {
    flex: 1.5,
    backgroundColor: BASE_COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 38,
    shadowColor: BASE_COLORS.background,
    shadowOffset: {
      width: -10,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 10,
  },
  wideButtonBackground: {
    opacity: 0.7,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wideButtonImage: {
    width: 80,
    height: 80,
    position: "absolute",
    top: 0,
    left: 20,
    zIndex: 10,
  },
  buttonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: UI_COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonImage: {
    width: 120,
    height: 120,
    position: "absolute",
    top: -20,
    right: 30,
    zIndex: 10,
  },
  buttonImageInner: {
    width: 120,
    height: 120,
  },
  buttonImageInner2: {
    width: 100,
    height: 100,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: UI_COLORS.text,
    textAlign: "center",
  },
});
