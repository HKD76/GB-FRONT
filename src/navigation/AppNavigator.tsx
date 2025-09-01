import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HomeScreen } from "../screens/HomeScreen";
import { WeaponGridScreen } from "../screens/WeaponGridScreen";
import { WeaponsDataScreen } from "../screens/WeaponsDataScreen";
import { FilteredWeaponsScreen } from "../screens/FilteredWeaponsScreen";
import { FilteredSummonsScreen } from "../screens/FilteredSummonsScreen";
import { SavedWeaponGridsScreen } from "../screens/SavedWeaponGridsScreen";
import GridCalculatorScreen from "../screens/GridCalculatorScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { WeaponFilters, SummonFilters } from "../components/WeaponFilterModal";

export type AppStackParamList = {
  Home: undefined;
  WeaponGrid:
    | {
        selectedWeapon?: any;
        weaponIndex?: number;
        selectedSummon?: any;
        summonIndex?: number;
      }
    | undefined;
  WeaponsData: undefined;
  FilteredWeapons: { filters: WeaponFilters; weaponIndex: number };
  FilteredSummons: { filters: SummonFilters; summonIndex: number };
  SavedWeaponGrids: undefined;
  GridCalculator:
    | {
        weaponGridStats?: {
          totalAtk: number;
          totalHp: number;
        };
        weapons?: any[];
        summons?: any[];
        characters?: {
          [key: number]: {
            name: string;
            baseAtk: string;
            baseHp: string;
            attackType: "none" | "double" | "triple";
          };
        };
        statsByType?: any;
      }
    | undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

interface AppNavigatorProps {
  onLogout: () => void;
}

/**
 * Navigateur principal de l'application
 * Gère la navigation entre les écrans principaux
 */
export const AppNavigator: React.FC<AppNavigatorProps> = ({ onLogout }) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home">
        {(props) => <HomeScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="WeaponGrid">
        {(props) => <WeaponGridScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="WeaponsData">
        {(props) => <WeaponsDataScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="FilteredWeapons">
        {(props) => <FilteredWeaponsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="FilteredSummons">
        {(props) => <FilteredSummonsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="SavedWeaponGrids">
        {(props) => <SavedWeaponGridsScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="GridCalculator">
        {(props) => <GridCalculatorScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Settings">
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
