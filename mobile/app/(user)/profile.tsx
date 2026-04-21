import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { userApi } from "@/services/api";

export default function UserProfile() {
  const { user, logout, refreshUser } = useAuth();
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await userApi.updateMe({ name, email: email || undefined });
      await refreshUser();
      setEditing(false);
      Alert.alert("Updated", "Profile updated successfully");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Update failed");
    } finally { setSaving(false); }
  };

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View className="flex-row items-center py-3" style={{ borderBottomWidth: 1, borderBottomColor: "#232E4A" }}>
      <View className="w-9 h-9 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: theme.highlight_color + "22" }}>
        <Ionicons name={icon as any} size={18} color={theme.highlight_color} />
      </View>
      <View className="flex-1">
        <Text className="text-xs mb-0.5" style={{ color: theme.text_color + "77" }}>{label}</Text>
        <Text className="font-medium" style={{ color: theme.text_color }}>{value || "—"}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg_color }}>
      {/* Header */}
      <View className="px-6 pt-14 pb-8 items-center" style={{ backgroundColor: "#1A2240" }}>
        <View className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
          style={{ backgroundColor: theme.highlight_color + "33" }}>
          <Text className="text-4xl font-bold" style={{ color: theme.highlight_color }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <Text className="text-2xl font-bold" style={{ color: theme.text_color }}>{user?.name}</Text>
        <View className="flex-row items-center mt-2 px-4 py-1.5 rounded-full"
          style={{ backgroundColor: user?.role === "admin" ? "#6C63FF22" : "#27AE6022" }}>
          <Ionicons name={user?.role === "admin" ? "shield-checkmark" : "person"} size={14}
            color={user?.role === "admin" ? "#6C63FF" : "#27AE60"} />
          <Text className="text-xs font-bold ml-1 capitalize"
            style={{ color: user?.role === "admin" ? "#6C63FF" : "#27AE60" }}>{user?.role}</Text>
        </View>
      </View>

      <View className="px-4 pt-4">
        {/* Profile Info Card */}
        <View className="rounded-2xl px-4 mb-4" style={{ backgroundColor: "#1A2240" }}>
          <InfoRow icon="person-outline" label="Full Name" value={user?.name || ""} />
          <InfoRow icon="call-outline" label="Phone" value={user?.phone || ""} />
          <InfoRow icon="mail-outline" label="Email" value={user?.email || ""} />
          <InfoRow icon="shield-outline" label="Account Status" value={user?.is_active ? "Active" : "Inactive"} />
        </View>

        {/* Edit Profile */}
        {!editing ? (
          <TouchableOpacity
            className="rounded-2xl p-4 flex-row items-center justify-center mb-4"
            style={{ backgroundColor: theme.highlight_color + "22", borderWidth: 1, borderColor: theme.highlight_color + "55" }}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create-outline" size={18} color={theme.highlight_color} />
            <Text className="font-bold ml-2" style={{ color: theme.highlight_color }}>Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: "#1A2240" }}>
            <Text className="font-bold text-base mb-4" style={{ color: theme.text_color }}>Edit Profile</Text>
            <View className="mb-4">
              <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Full Name</Text>
              <TextInput
                className="rounded-xl px-4 h-12 text-sm"
                style={{ backgroundColor: "#232E4A", color: theme.text_color }}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={theme.text_color + "44"}
              />
            </View>
            <View className="mb-6">
              <Text className="text-sm mb-2" style={{ color: theme.text_color + "BB" }}>Email</Text>
              <TextInput
                className="rounded-xl px-4 h-12 text-sm"
                style={{ backgroundColor: "#232E4A", color: theme.text_color }}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email"
                placeholderTextColor={theme.text_color + "44"}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: "#232E4A" }}
                onPress={() => { setEditing(false); setName(user?.name || ""); setEmail(user?.email || ""); }}>
                <Text style={{ color: theme.text_color }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: theme.highlight_color }}
                onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          className="rounded-2xl p-4 flex-row items-center justify-center mb-8"
          style={{ backgroundColor: "#E74C3C22", borderWidth: 1, borderColor: "#E74C3C44" }}
          onPress={() => Alert.alert("Logout", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: logout },
          ])}
        >
          <Ionicons name="log-out-outline" size={18} color="#E74C3C" />
          <Text className="font-bold ml-2" style={{ color: "#E74C3C" }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
