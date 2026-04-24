import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { themeApi } from "@/services/api";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

interface Theme {
  id: number;
  name: string;
  bg_color: string;
  highlight_color: string;
  text_color: string;
  is_active: boolean;
}

export default function AdminThemesScreen() {
  const { theme, fetchActiveTheme } = useTheme();
  const { logout } = useAuth();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    try {
      const res = await themeApi.listThemes();
      setThemes(res.data);
    } catch (err: any) {
      Alert.alert("Error", "Failed to load themes. Ensure your backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadThemes();
  };

  const handleSeedDefaults = async () => {
    try {
      await themeApi.seedDefaults();
      Alert.alert("Success", "10 Premium default themes seeded successfully!");
      loadThemes();
    } catch (err: any) {
      Alert.alert("Error", "Failed to seed defaults.");
      console.error(err);
    }
  };

  const handleActivateTheme = async (id: number) => {
    try {
      await themeApi.activateTheme(id);
      if (fetchActiveTheme) await fetchActiveTheme(); // Update the global context immediately
      loadThemes(); // Refresh the list to show the active state
      Alert.alert("Success", "Theme activated successfully!");
    } catch (err: any) {
      Alert.alert("Error", "Failed to activate theme.");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) await logout(); // Use context logout if available
      // Hard fallback to ensure token is cleared and navigation occurs
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      router.replace("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const renderHeader = () => (
    <View className="mb-6 mt-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold" style={{ color: theme?.text_color || '#1F2937' }}>
          Theme Manager
        </Text>
        <TouchableOpacity
          className="px-4 py-2 rounded-xl bg-red-500"
          onPress={handleLogout}
        >
          <Text className="font-bold text-white">Logout</Text>
        </TouchableOpacity>
      </View>
      
      {themes.length === 0 && !loading && (
        <View className="p-4 rounded-xl items-center" style={{ backgroundColor: '#fef3c7' }}>
          <Text className="text-amber-800 mb-2 text-center">No themes found. You need to seed the initial default themes from the backend.</Text>
        </View>
      )}

      <TouchableOpacity
        className="px-4 py-3 rounded-xl flex-row justify-center items-center"
        style={{ backgroundColor: theme?.highlight_color || '#3B82F6', marginTop: 10 }}
        onPress={handleSeedDefaults}
      >
        <Text className="font-bold text-white text-base">✨ Seed 10 Professional Themes</Text>
      </TouchableOpacity>
    </View>
  );

  const renderThemeItem = ({ item }: { item: Theme }) => (
    <View
      className="p-4 mb-4 rounded-2xl flex-row items-center justify-between"
      style={{
        backgroundColor: item.bg_color || '#ffffff',
        borderWidth: 2,
        borderColor: item.is_active ? item.highlight_color : "transparent",
        shadowColor: item.highlight_color || '#000',
        shadowOpacity: item.is_active ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: item.is_active ? 8 : 2,
      }}
    >
      <View className="flex-row items-center flex-1">
        {/* The "Color Plate" representation */}
        <View
          className="w-14 h-14 rounded-full mr-4 border-2 shadow-sm"
          style={{ backgroundColor: item.highlight_color || '#ccc', borderColor: item.text_color || '#000' }}
        />
        <View className="flex-1">
          <Text className="text-xl font-bold" style={{ color: item.text_color || '#000' }}>
            {item.name}
          </Text>
          <Text className="text-xs mt-1 font-medium" style={{ color: item.text_color ? item.text_color + "cc" : '#666' }}>
            Bg: {item.bg_color}
          </Text>
          <Text className="text-xs font-medium" style={{ color: item.text_color ? item.text_color + "cc" : '#666' }}>
            Accent: {item.highlight_color}
          </Text>
        </View>
      </View>

      {item.is_active ? (
        <View className="px-4 py-2 rounded-xl" style={{ backgroundColor: (item.highlight_color || '#000') + "22" }}>
          <Text className="font-bold" style={{ color: item.highlight_color || '#000' }}>Active</Text>
        </View>
      ) : (
        <TouchableOpacity
          className="px-5 py-2 rounded-xl"
          style={{ backgroundColor: item.highlight_color || '#3B82F6' }}
          onPress={() => handleActivateTheme(item.id)}
        >
          <Text className="font-bold text-white">Apply</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 px-4" style={{ backgroundColor: theme?.bg_color || '#F3F4F6' }}>
      {loading ? (
        <ActivityIndicator size="large" color={theme?.highlight_color || '#3B82F6'} className="flex-1" />
      ) : (
        <FlatList
          data={themes}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={renderThemeItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={theme?.highlight_color || '#3B82F6'} 
            />
          }
        />
      )}
    </View>
  );
}