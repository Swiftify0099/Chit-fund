import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/hooks/useNotifications";
import { View } from "react-native";
import "../global.css";

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  useNotifications(isAuthenticated);
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuth) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuth) {
      if (user?.role === "admin") router.replace("/(admin)/dashboard");
      else router.replace("/(user)/dashboard");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <View style={{ flex: 1, backgroundColor: theme?.bg_color || "#0F1629" }}>
      <StatusBar style="light" backgroundColor={theme?.bg_color || "#0F1629"} />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(user)" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </AuthProvider>
  );
}
