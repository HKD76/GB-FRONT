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
import { RegisterRequest } from "../types";

interface RegisterScreenProps {
  navigation: any;
  onRegisterSuccess: () => void;
}

/**
 * Écran d'inscription
 * Permet à l'utilisateur de créer un nouveau compte
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
  onRegisterSuccess,
}) => {
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.username.trim()) {
      Alert.alert("Erreur", "Le nom d'utilisateur est requis");
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert("Erreur", "L'email est requis");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide");
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert("Erreur", "Le mot de passe est requis");
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 6 caractères"
      );
      return false;
    }

    if (formData.password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      onRegisterSuccess();
    } catch (error: any) {
      Alert.alert(
        "Erreur d'inscription",
        error.message || "Une erreur est survenue"
      );
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
            <Text style={styles.formTitle}>Inscription</Text>
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
              <Text style={styles.label}>Email :</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="Enter your email here"
                placeholderTextColor="#999"
                keyboardType="email-address"
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

            <View style={styles.inputSection}>
              <Text style={styles.label}>Confirm Password :</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password here"
                placeholderTextColor="#999"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.connectButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.connectButtonText}>REGISTER</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Sign-in</Text>
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
});
