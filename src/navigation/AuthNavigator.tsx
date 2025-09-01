import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onLoginSuccess: () => void;
  onRegisterSuccess: () => void;
}

/**
 * Navigateur d'authentification
 * Gère la navigation entre les écrans de connexion et d'inscription
 */
export const AuthNavigator: React.FC<AuthNavigatorProps> = ({
  onLoginSuccess,
  onRegisterSuccess,
}) => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => (
          <RegisterScreen {...props} onRegisterSuccess={onRegisterSuccess} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
