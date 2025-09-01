import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AppStackParamList } from "../navigation/AppNavigator";
import { apiService } from "../services/api";
import { BASE_COLORS } from "../config/colors";

interface Skill {
  _id: number;
  name: string;
  description: string;
  notes: string[];
  tables: any[];
  created_at: string;
  updated_at: string;
}

type WeaponsDataScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "WeaponsData"
>;

/**
 * Écran des données des compétences
 * Affiche et permet la recherche dans les statistiques des compétences
 */
export const WeaponsDataScreen: React.FC = () => {
  const navigation = useNavigation<WeaponsDataScreenNavigationProp>();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getSkillsStats();

      if (response && Array.isArray(response)) {
        setSkills(response);
      } else if (
        response &&
        response.skills_stats &&
        Array.isArray(response.skills_stats)
      ) {
        setSkills(response.skills_stats);
      } else if (
        response &&
        response.skills &&
        Array.isArray(response.skills)
      ) {
        setSkills(response.skills);
      } else {
        setError("Format de réponse inattendu");
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des skills:", err);
      setError(err.message || "Erreur lors du chargement des skills");
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter((skill) => {
    if (!searchQuery.trim()) return true;

    const skillName = (skill.name || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    return skillName.includes(query);
  });

  if (loading) {
    return (
      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#64B5F6" />
            <Text style={styles.loadingText}>Loading skills...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Erreur</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </SafeAreaView>
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
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Skills Stats</Text>
            <Text style={styles.subtitle}>
              {filteredSkills.length} skills disponibles
              {searchQuery.trim() && (
                <Text style={styles.searchInfo}>
                  {" "}
                  (sur {skills.length} total)
                </Text>
              )}
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un skill par nom..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery("")}
              >
                <Text style={styles.clearSearchButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {filteredSkills.map((skill) => (
            <View key={skill._id} style={styles.skillCard}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
              </View>

              <View style={styles.skillContent}>
                <Text style={styles.skillDescription}>{skill.description}</Text>

                {skill.notes && skill.notes.length > 0 && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesTitle}>Notes:</Text>
                    {skill.notes.map((note, index) => (
                      <Text key={index} style={styles.noteText}>
                        • {note}
                      </Text>
                    ))}
                  </View>
                )}

                {skill.tables && skill.tables.length > 0 && (
                  <View style={styles.tablesContainer}>
                    <Text style={styles.tablesTitle}>Tables:</Text>
                    {skill.tables.map((table, tableIndex) => (
                      <View key={tableIndex} style={styles.tableCard}>
                        {table.title && (
                          <Text style={styles.tableTitle}>{table.title}</Text>
                        )}
                        {table.headers && (
                          <View style={styles.tableHeaders}>
                            {table.headers.map(
                              (header: string, headerIndex: number) => (
                                <Text
                                  key={headerIndex}
                                  style={styles.tableHeader}
                                >
                                  {header}
                                </Text>
                              )
                            )}
                          </View>
                        )}
                        {table.rows &&
                          table.rows.map((row: any, rowIndex: number) => (
                            <View key={rowIndex} style={styles.tableRow}>
                              {Object.entries(row).map(
                                ([key, value], cellIndex) => (
                                  <Text
                                    key={cellIndex}
                                    style={styles.tableCell}
                                  >
                                    {String(value)}
                                  </Text>
                                )
                              )}
                            </View>
                          ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF5722",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  errorText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 8,
    marginLeft: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: BASE_COLORS.blue,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5FAF8",
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(73, 85, 86, 0.2)",
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: "#303030",
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 8,
    marginLeft: 8,
  },
  clearSearchButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchInfo: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  skillCard: {
    backgroundColor: "#F5FAF8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#F5FAF8",
    marginHorizontal: 20,
  },
  skillHeader: {
    backgroundColor: "#F5FAF8",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(73, 85, 86, 0.2)",
    marginBottom: 0,
  },
  skillName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#303030",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  skillContent: {
    backgroundColor: "rgba(73, 85, 86, 0.13)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
  },
  skillType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  skillTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  skillDescription: {
    fontSize: 16,
    color: "#495556",
    marginBottom: 16,
    lineHeight: 22,
    fontStyle: "italic",
  },
  statsContainer: {
    backgroundColor: "rgba(73, 85, 86, 0.13)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#303030",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#303030",
  },
  effectsContainer: {
    marginTop: 8,
  },
  effectsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#303030",
    marginBottom: 8,
  },
  effectsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  effectTag: {
    backgroundColor: "#64B5F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  effectText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  notesContainer: {
    marginBottom: 16,
    backgroundColor: "rgba(73, 85, 86, 0.08)",
    borderRadius: 8,
    padding: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#303030",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noteText: {
    fontSize: 14,
    color: "#495556",
    marginBottom: 6,
    lineHeight: 18,
    paddingLeft: 8,
  },
  tablesContainer: {
    marginTop: 8,
  },
  tablesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#303030",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tableCard: {
    backgroundColor: "rgba(73, 85, 86, 0.13)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(73, 85, 86, 0.2)",
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#303030",
    marginBottom: 8,
    textAlign: "center",
    backgroundColor: "rgba(64, 181, 246, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(64, 181, 246, 0.3)",
  },
  tableHeaders: {
    flexDirection: "row",
    marginBottom: 8,
    backgroundColor: "rgba(64, 181, 246, 0.15)",
    borderRadius: 6,
    paddingVertical: 8,
  },
  tableHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#303030",
    flex: 1,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(73, 85, 86, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginBottom: 2,
    borderRadius: 4,
  },
  tableCell: {
    fontSize: 12,
    color: "#303030",
    flex: 1,
    textAlign: "center",
    fontWeight: "500",
  },
});
