import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { authService } from "../services/authService";
import { BASE_COLORS } from "../config/colors";

import { AuthNavigator } from "../navigation/AuthNavigator";
import { AppNavigator } from "../navigation/AppNavigator";

/**
 * Conteneur principal de l'application
 * Gère l'authentification et la navigation
 */
export const AppContainer: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const isAuth = await authService.initialize();
      setIsAuthenticated(isAuth);
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de l'authentification:",
        error
      );
      setIsAuthenticated(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BASE_COLORS.blue} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? (
          <AppNavigator onLogout={handleLogout} />
        ) : (
          <AuthNavigator
            onLoginSuccess={handleLoginSuccess}
            onRegisterSuccess={handleLoginSuccess}
          />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
