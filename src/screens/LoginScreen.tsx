import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaWrapper } from "../components/SafeAreaWrapper";
import { authService } from "../services/authService";
import { LoginRequest } from "../types";

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess: () => void;
}

/**
 * Écran de connexion
 * Permet à l'utilisateur de se connecter à son compte
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigation,
  onLoginSuccess,
}) => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await authService.login(formData);
      onLoginSuccess();
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.formCard}>
          <View style={styles.titleSection}>
            <Text style={styles.formTitle}>Connexion</Text>
          </View>

          <View style={styles.formContent}>
            <View style={styles.inputSection}>
              <Text style={styles.label}>Username :</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleInputChange("username", value)}
                placeholder="Enter your username here"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Password :</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Enter your password here"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.connectButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.connectButtonText}>CONNECT</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>No account ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>Sign-up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  formCard: {
    backgroundColor: "#F5FAF8",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#F5FAF8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
  },
  titleSection: {
    backgroundColor: "#F5FAF8",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#303030",
  },
  formContent: {
    padding: 10,
    gap: 10,
    backgroundColor: "rgba(73, 85, 86, 0.13)",
  },
  inputSection: {
    backgroundColor: "#F5FAF8",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#303030",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: "rgba(73, 85, 86, 0.13)",
    color: "#303030",
  },
  connectButton: {
    backgroundColor: "#64B5F6",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#F5FAF8",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  linkText: {
    fontSize: 22,
    color: "#64B5F6",
    fontWeight: "600",
    textDecorationLine: "underline",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    textAlign: "center",
  },
});
