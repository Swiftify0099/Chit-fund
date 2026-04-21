import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function AdminLayout() {
  const { theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#1A2240", borderTopColor: "#232E4A", height: 64, paddingBottom: 8 },
        tabBarActiveTintColor: theme.highlight_color,
        tabBarInactiveTintColor: "#8892B0",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="users"     options={{ title: "Users",     tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="loans"     options={{ title: "Loans",     tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="banners"   options={{ title: "Banners",   tabBarIcon: ({ color, size }) => <Ionicons name="image-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="settings"  options={{ title: "Settings",  tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
