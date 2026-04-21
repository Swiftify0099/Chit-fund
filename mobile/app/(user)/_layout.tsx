import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function UserLayout() {
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
      <Tabs.Screen name="dashboard" options={{ title: "Home",     tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="loans"     options={{ title: "Loans",    tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="emi"       options={{ title: "EMI",      tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile"   options={{ title: "Profile",  tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
