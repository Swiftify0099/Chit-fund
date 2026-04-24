import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView, ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter phone and password");
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), password);
      // Navigation handled by _layout.tsx
    } catch (err: any) {
      let msg = `Unexpected Error: ${err.message || "Unknown error"}`;
      if (err.message === "Network Error" || err.code === "ECONNABORTED") {
        msg = "Network Error: Could not connect to the backend. Please check your BASE_URL in api.ts.";
      } else if (err?.response?.headers?.["content-type"]?.includes("text/html")) {
        msg = "GitHub Codespaces is blocking the request. Please go to the 'Ports' tab and set Port 8000 to 'Public'.";
      } else if (err?.response?.data?.detail) {
        msg = typeof err.response.data.detail === "string" 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      }
      Alert.alert("Login Failed", `${msg}\n\nURL Attempted:\n${err?.config?.baseURL || "Unknown URL"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg_color }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-12">
            <View
              className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
              style={{ backgroundColor: theme.highlight_color + "33" }}
            >
              <Ionicons name="wallet" size={48} color={theme.highlight_color} />
            </View>
            <Text
              className="text-4xl font-bold mb-2"
              style={{ color: theme.text_color, fontWeight: theme.font_bold ? "800" : "700" }}
            >
              {theme.title || "Chit Fund"}
            </Text>
            <Text className="text-base" style={{ color: theme.text_color + "AA" }}>
              {theme.subtitle || "Digital Bishi & Credit Platform"}
            </Text>
          </View>

          {/* Login Card */}
          <View
            className="rounded-3xl p-6"
            style={{ backgroundColor: "#1A2240", shadowColor: theme.shadow_color || theme.highlight_color, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}
          >
            <Text className="text-xl font-bold mb-6" style={{ color: theme.text_color }}>
              Sign In
            </Text>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Phone Number</Text>
              <View
                className="flex-row items-center rounded-xl px-4 h-14"
                style={{ backgroundColor: "#232E4A" }}
              >
                <Ionicons name="call-outline" size={18} color={theme.highlight_color} />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  style={{ color: theme.text_color }}
                  placeholder="Enter phone number"
                  placeholderTextColor={theme.text_color + "55"}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Password</Text>
              <View
                className="flex-row items-center rounded-xl px-4 h-14"
                style={{ backgroundColor: "#232E4A" }}
              >
                <Ionicons name="lock-closed-outline" size={18} color={theme.highlight_color} />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  style={{ color: theme.text_color }}
                  placeholder="Enter password"
                  placeholderTextColor={theme.text_color + "55"}
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={theme.text_color + "77"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="rounded-xl h-14 items-center justify-center"
              style={{ backgroundColor: theme.highlight_color }}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-center text-xs mt-8" style={{ color: theme.text_color + "55" }}>
            Digital Bishi v1.0 • Secure Login
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
